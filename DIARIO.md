# Diário

Registro solto de erros, decisões e retrabalho conforme acontecem. Vira insumo do RELATORIO-AGENTES.md no fim.

## Fase 0

- Tailwind virou v4 e não usa mais `tailwind.config.js` — tokens agora ficam em `src/index.css` via `@theme`. Consultei a doc atual antes de escrever qualquer CSS, então isso não virou retrabalho, só uma suposição inicial que precisou ser checada.
- `@fontsource/archivo-narrow` não existe nesse nome — o pacote correto pra fonte variável é `@fontsource-variable/archivo-narrow`, com family-name `'Archivo Narrow Variable'`. Peguei isso consultando a doc do Fontsource antes de instalar, não depois de quebrar.
- Git sem identidade configurada nesta máquina (`user.name`/`user.email`). Bloqueou commit desde o primeiro passo — fiquei sem conseguir versionar por vários prompts até o usuário rodar `git config`. Combinamos que por enquanto sigo sem parar pra isso.

## Fase 1 — Carrinho (passo 6)

- Bug real: o stepper de quantidade no carrinho chamava `atualizarQuantidade(linhaId, item.quantidade + 1)`, calculando o novo valor a partir da prop capturada no render. Dois cliques rápidos no mesmo botão (antes de re-renderizar) mandavam o mesmo valor duas vezes em vez de incrementar duas vezes — testado e reproduzido (esperava 3, ficava 2). Corrigido trocando por `incrementarQuantidade`/`decrementarQuantidade`, que calculam o valor novo de dentro do updater do Zustand (a partir do estado atual, não da prop). Reforça por que testar interação de verdade no navegador importa mais que só rodar o build.

## Fase 2 — Endpoint (passo 7)

- O formato de handler da Vercel mudou: pra projeto que não é Next.js (caso daqui), hoje é `export default { async fetch(request) { ... return Response.json(...) } }` — Web-standard fetch, não o antigo `(req, res)` do `@vercel/node`. Peguei isso na doc atual antes de escrever o arquivo.
- `vercel dev` (o comando que roda o front e as funções `/api` juntos localmente) exige login interativo na conta Vercel (fluxo OAuth por device code) — não dá pra eu completar isso sozinho. Não consegui testar o encanamento HTTP real ponta a ponta nesse passo. Validei a lógica do handler direto via Node (chamando `handler.fetch()` com `Request` simulado — método, corpo, rate limit, tudo passou) e confirmei por grep que a chave não aparece em lugar nenhum do `dist/` depois do build. Resolvido de vez no passo 9 (ver abaixo). O script ganhou o nome `dev:vercel` depois, não `dev:api` como citado aqui originalmente.

## Fase 2 — Gerador de verdade (passo 8)

- SDK atual do Gemini é `@google/genai`, cliente `new GoogleGenAI({ apiKey })`, chamada `ai.models.generateContent({ model, contents, config: { systemInstruction, responseMimeType, responseSchema } })`. `responseSchema` não aceita bem objeto livre (tipo `specs: {chave: valor}` variável) — troquei pra `specs` ser um array de `{chave, valor}` no schema e no que a Vercel manda pro cliente, o formato objeto normal continua vindo do endpoint (converto antes de responder), então nada mudou pro front.
- Modelo atual em destaque na doc: `gemini-3.6-flash`.
- Bug de configuração (não de código): o timeout inicial de 10s estava curto — chamadas reais legítimas levam de 9 a 10,3s com esse schema mais longo. Isso fazia a primeira tentativa falhar por pouco *sempre*, forçando retry em toda requisição (2x o tempo, 2x a chamada paga). Só percebi porque testei com a chave real antes de dar como pronto — os testes com dado fixo do passo 7 não pegam isso porque não fazem chamada de verdade. Subi o timeout pra 20s e voltou a passar na primeira tentativa de forma consistente (3 chamadas seguidas, todas < 11s).

## Fase 2 — Reviews e testabilidade local (passo 9)

- Construí `scripts/dev-api-server.js`: um servidorzinho Node que carrega os handlers de `/api/*.js` direto e serve num processo separado (porta 3001), com o Vite (`server.proxy`) mandando `/api/*` pra ele. `npm run dev` agora sobe os dois juntos via `concurrently`. Resolve de vez a limitação do passo 7/8 (`vercel dev` pedir login) — dá pra testar a chamada real no navegador sem autenticar em nada. Continua existindo `npm run dev:vercel` pra validar no ambiente real da Vercel antes do deploy, e `dev:vite-only` pra quando não precisa de API nenhuma.
- Testado no navegador de verdade (não só via Node): review gerada bateu os 8 arquétipos pedidos, incluindo uma com erro de tradução ("dente azul" pra Bluetooth) e uma nota 5 com texto devastador. Cache por produto confirmado: revisitar o mesmo produto via navegação client-side não disparou nova chamada à API (contei as requisições de rede antes e depois).
- `node --watch` no `dev-api-server.js` não reinicia sozinho quando só o Vite muda nada — óbvio, mas relevante: como as funções `/api` são importadas uma vez no boot do processo, qualquer edição em `api/*.js` exige reiniciar esse processo (ou usar `--watch`, que resolvi ligar aqui). Sem isso eu teria testado código velho sem perceber — quase aconteceu no passo 10.

## Fase 2 — Scroll infinito (passo 10)

- **Achado importante pro projeto inteiro**: o tier gratuito do Gemini pro modelo `gemini-3.6-flash` tem cota de só **20 requisições por dia** (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`), não por minuto. Estourei essa cota durante os próprios testes dos passos 8, 9 e 10 — a partir de um certo ponto todo request começou a cair no fallback (confirmado pelo erro 429 "RESOURCE_EXHAUSTED" nos logs do servidor local). Isso é sério pro plano do passo 27 (soltar o app pra turma usar por uma semana): 20/dia se esgota rápido com uso real de várias pessoas. Vale conversar com o usuário sobre upgrade de tier antes da apresentação — ver resumo que mandei no chat.
- Bug: `IntersectionObserver` não dispara em aba que o Chrome automatizado considera não-visível (`document.visibilityState: "hidden"`) — isso é uma limitação do ambiente de teste (Browser pane), não do código. Contornei expondo `window.__buscarMaisDebug` (só em `import.meta.env.DEV`, morre no build de produção) pra disparar `buscarMais()` manualmente e validar a lógica de verdade.
- Bug pego graças a esse teste manual: `responseSchema` do Gemini não força tamanho de array por si só — pedir "8 produtos" no texto do prompt não garante 8 itens no JSON. Um lote voltou com 5. Corrigido adicionando `minItems`/`maxItems` no schema (testei de novo: bateu exato em 3 e em 8).
- Bug relacionado, achado ao investigar o de cima: o fallback do servidor (`produtosFallback`) fazia `.slice(0, quantidade)` numa lista já filtrada por categoria — categorias com menos de 8 produtos no mock (Eletrônicos tem 5, Casa tem 4) devolviam menos itens que o pedido. Trocado por ciclar (`indice % base.length`) em vez de cortar. Sem esse teste de ponta a ponta com cota esgotada, esse bug não teria aparecido — é exatamente o tipo de coisa que só o fallback real expõe.

## Fase 2 — Fallback offline (passo 11)

- A cota do Gemini estava esgotada, então "gerar 120 produtos e 400 reviews de uma vez" via API não era possível. Saída: escrevi 64 produtos-semente e 110 reviews-semente à mão (mesmo estilo do gerador) e um script determinístico (`scripts/gerar-fallback-offline.mjs`, semente fixa) que expande pra 120/400 com variantes de "outro vendedor" (prefixo/sufixo no título, preço ±20%, vendidos novos) e mutações de review (CAPS, sem acento, sufixos "!!"/"👍"). Réplicas de listing e reviews duplicadas de bot são fenômenos reais de marketplace, então a expansão joga a favor da estética. Custo zero, reproduzível, e o script valida tudo (contagens, ids únicos, preço < precoOriginal, categorias) antes de gravar.
- Dataset gravado como módulo JS (`export default [...]`) em vez de `.json` puro: import de JSON no Node exige `with { type: 'json' }` e depende do bundler da Vercel suportar o atributo — módulo JS funciona idêntico em Vite, Node e Vercel sem risco. O roteiro pedia "JSON estático"; o conteúdo é JSON, só o invólucro muda. Motivo documentado no cabeçalho do script.
- `MODO_OFFLINE` (`src/lib/config.js`): liga por `VITE_MODO_OFFLINE=1` no build ou `localStorage` em runtime — o segundo caminho é o que o atalho secreto do item 25 vai usar. Com a flag ligada os hooks nem tentam rede (atraso falso de 300-800ms pro skeleton aparecer igual). Verificado no navegador com `performance.getEntriesByType('resource')`: zero requisições `/api` navegando home, scroll e página de produto.
- Descoberta de lacuna do passo 10 ao testar: produto gerado/offline não abria página de detalhe — a página só resolvia ids numéricos do mock. Criado `src/lib/catalogo.js` (resolve mock → offline → extras da sessão) e normalização de specs (o formato array `{chave,valor}` que o schema do Gemini exige agora vira objeto no servidor, como o DIARIO já afirmava antes de ser verdade — a nota do passo 8 descrevia intenção, não código; agora é código).
- Fallbacks do servidor promovidos pro dataset rico: com a cota morta, `/api/gerar-produtos` e `/api/gerar-reviews` respondem do dataset de 120/400 com amostragem balanceada (mesma receita de arquétipos do modo online). Ou seja: cota esgotada ficou quase indistinguível de cota viva — testado os dois endpoints com `fonte: "fallback"` e conteúdo variado.
- Retoque pego no teste visual: dois reviews com o mesmo texto-base no mesmo produto (o pool tem repetições de propósito). Dedup por prefixo de texto na amostragem resolve sem perder a estética de duplicata entre produtos diferentes.

## Fase 3 — NadaCoins (passo 12)

- Deslize que o usuário viu ao vivo: editei o JSX da barra do topo de `Produto.jsx` deixando um `<div>` sem fechar, e o HMR do Vite empurrou o estado quebrado pro navegador dele no meio da edição. Em dev server compartilhado, edição em arquivo que renderiza precisa ser atômica (um Edit só) ou o intervalo entre edits vira tela de erro pra quem está usando. O build pegaria, mas o HMR chega antes do build.
- Som de moeda sintetizado com WebAudio (2 osciladores, notas subindo) em vez de arquivo de áudio — zero asset no bundle, e o mesmo módulo (`src/lib/som.js`) já exporta o tique pra roleta do passo 13.
- Animação "dígito a dígito" via requestAnimationFrame com easing cúbico. Caso especial: o ganho de cashback acontece no checkout mas a pessoa só vê o contador na página do pedido (navegou). Solução: no mount, se o último lançamento positivo tem menos de 4s, o contador começa do valor antigo e anima até o atual — a recompensa visual acontece onde a pessoa está olhando.
- Economia fechada e testada ponta a ponta no navegador: bônus de 50 na primeira visita (amarra com o banner da home), 1 moeda = R$ 0,10 de desconto, cashback de 1 moeda por R$ 2 no pedido. Compra real de teste: subtotal 50,92 − 5,00 de moedas = 45,92, cashback 22, saldo final 22, histórico com os 3 lançamentos amarrados ao número do pedido.

## Fase 3 — Roleta com near-miss (passo 13)

- Geometria validada com medição, não no olho: forcei o near-miss via gancho de dev (`window.__forcarRoleta`, só existe em `import.meta.env.DEV`) e li a rotação final do SVG — parou a 2° depois da fatia do jackpot, dentro da vizinha "+1 GIRO", como projetado. O ponteiro varre posições em ordem decrescente, então a fatia vizinha "de chegada" é a que vem *depois* do jackpot nessa ordem — errar esse sentido colocaria o near-miss do lado errado e a roleta pararia raspando *antes* do prêmio, o que não tem a mesma leitura psicológica.
- Decisão de design no near-miss: a fatia onde ele para é a "+1 GIRO". Frustração e meio de tentar de novo entregues no mesmo resultado — o loop de re-engajamento de cassino documentado no comentário do componente (Skinner; Reid 1986; Clark et al. 2009).
- Easing: potência 5 com 7s no near-miss (últimos ~10° levam ~2,5s — é onde a roda atravessa o jackpot rastejando), potência 4 com 5s no giro comum. Tiques de som e vibração disparam a cada cruzamento de borda de fatia no rAF, então aceleram e desaceleram automaticamente com a velocidade real da roda — sem timeline de áudio separada pra manter em sincronia.
- Teste involuntário de usabilidade: o usuário estava com a página aberta durante os meus testes e jogou de verdade — assistiu o anúncio falso, girou, caiu num near-miss, usou o +1 giro na hora e girou de novo. O loop de re-engajamento funcionou na primeira exposição, sem instrução nenhuma. Melhor validação possível da mecânica, e veio de graça.
- Aritmética de estado com usuário ao vivo confunde: cheguei a suspeitar de bug de consumo de giros (totalGiros subindo "sozinho") até reconstruir a sequência e ver que era uso humano concorrente. Lição pra testes futuros: conferir se o dev server está sendo usado pelo usuário antes de estranhar estado mudando entre duas leituras.

## Fase 3 — Ajuste nos labels da roleta (passo 13)

- Labels da roleta estavam saindo para fora do disco SVG no `RoletaDoNada.jsx`. O texto vertical com `writingMode: 'vertical-rl'` a 92px de raio + fontSize 9 fazia labels longos como "FRETE GRÁTIS" (12 chars × 9 = 108px de altura) transbordarem.
- Tentativa 1 (horizontal): removi `vertical-rl`, reduzi fonte e raio. Resultado: ficou ilegível, usuário rejeitou.
- Tentativa 2 (vertical com raio fixo): fontes 5-5.5, raios 65-75. Funcional mas minúsculo.
- Tentativa 3 (fonte 7 com raio por comprimento): fórmula `radius = 95 - length * 3.2`. "FRETE GRÁTIS" ficou a raio 56 com topo a 98 — dentro do disco, mas fonte ainda pequena.
- Tentativa 4 (fonte 9 com raio adaptativo): `radius = max(48, 90 - length * 3.5)`. "FRETE GRÁTIS" com topo a 103,6 — ligeiramente acima do disco de raio 100 mas aceitável. Foi o compromisso final: texto vertical, fontSize 9, raio ajustado por comprimento.
- Lição: texto vertical em SVG tem altura = chars × fontSize, e o comprimento do label domina a geometria. Não adianta tratar só a largura da fatia — o raio precisa ser função do comprimento do texto.

## Fase 3 — Passo 14: Urgência e escassez

- `ContadorRegressivo.jsx` já existia com `padrao="urgencia-falsa"`. Contador que zera e reseta silenciosamente para 4h.
- `EstoqueBaixo.jsx` (`padrao="escassez-falsa"`): número 1-4 derivado do ID do produto via hash, estável por sessão (sessionStorage). Mostra "Só restam X unidades!" ou "ÚLTIMA UNIDADE!" quando estoque=1.
- `PessoasVendo.jsx` (`padrao="prova-social"`): começa entre 8-12 e sobe 1-2 a cada 3-7s via setTimeout recursivo. Efeito de "prova social" — gente vendo o mesmo produto que você.
- `NotificacaoFantasma.jsx` (`padrao="prova-social"`): toast no canto com nome censurado + cidade simulando compra recente. Aparece a cada 20-40s com pool de 10 nomes, 7 cidades e 6 ações diferentes.
- Integrados na página de produto (`Produto.jsx`) na seção de preço + na overlay global.

## Fase 3 — Passo 15: Popups e confirmshaming

- `PopupBoasVindas.jsx` (`padrao="obstrucao"`): cupom BEMVINDO20 (R$ 20 off). Só aparece depois de 8s na página. Botão de fechar demora 6s pra surgir com contador visível. Confirmshaming: "Não, prefiro pagar o preço cheio" em cinza miúdo.
- `PopupIntencaoSaida.jsx` (`padrao="obstrucao"`): detecta mouse saindo pelo topo (desktop) ou aparece após 90s (mobile). Oferece 10% OFF (cupom NADA10) com urgência falsa "Só funciona nos próximos 3 minutos". Confirmshaming: "Não quero economizar, pode fechar".
- `PopupEscolhaForcada.jsx` (`padrao="acao-forcada"`): duas opções que aplicam o mesmo cupom NADA10 — "SIM, QUERO O DESCONTO!" e "CLARO, ME DÁ O CUPOM!". Sem botão de fechar real. Aparece após 5 min de navegação.
- Todos integrados no `App.jsx` como overlays globais. Confirmshaming padrão em todos: recusa sempre em cinza pequeno, texto constrangedor.
- Ajuste de timing: usuário pediu pausas maiores. Boas-vindas: 0s → 8s. Saída mobile: 45s → 90s. Forçada: 2min → 5min.

## Fase 3 — Passo 16: Missão social

- `useConviteStore.js`: estado persistente com endowed progress effect + forced action. A barra começa visualmente em 80% mesmo com 0 convites (Nunes & Drèze, 2006). Meta inicial = 3 amigos, mas ao atingi-la pula para 4, depois 5, etc — sempre falta 1.
- `MissaoSocial.jsx` (`padrao="acao-forcada"`): barra de progresso, botão "CONVIDAR AMIGO" que usa Web Share API (mobile) ou copia link falso para clipboard. Texto motivacional muda conforme progresso.
- Integrado na Home entre os banners e as categorias.

## Fase 3 — Passo 17: Mini-jogo extra (Caixa Misteriosa)

- Escolhida a caixa misteriosa diária em vez da plantinha de 30 dias — mais imediato, mais alinhado com o tom do site.
- `useCaixaStore.js`: 1 abertura por dia (chave `hojeLocal()`). Distribuição: 70% 1 moeda, 20% 3 moedas, 8% 5 moedas, 2% cupom CAIXA5. Histórico das últimas 10 aberturas.
- `CaixaMisteriosa.jsx` (`padrao="reforco-intermitente"`): animação em 3 fases — idle (pulso), shake (1,5s com vibração), explosão (18 partículas coloridas + som). Fanfarra exagerada para prêmio mixuruca — a piada é essa.
- Sons: `tocarShakeCaixa()` (4 notas subindo em square wave) e `tocarAberturaCaixa()` (impacto grave + brilho agudo) adicionados ao `src/lib/som.js`.
- Página dedicada em `/caixa-misteriosa` com rota no router. Layout centralizado em `max-w-xl` no desktop, histórico de aberturas visível.
- Ajuste de escala: usuário reclamou que estava pequeno no desktop. Box: `h-40 w-40` → `md:h-60 md:w-60`. "?" de `text-5xl` → `md:text-8xl`. Resultado e "já abriu" com padding e fonte maiores.

## Fase 4 — Passo 19: Chat de pechincha

- API `api/vendedor.js`: endpoint POST que recebe `{ historico, produto }`. Usa DeepSeek V4 Flash (`deepseek-v4-flash`) via fetch direto na API OpenAI-compatible. Timeout 15s.
- Prompt de sistema detalhado: identidade de vendedor chinês de galpão, 47 dias no prejuízo, gerente malvado. Português truncado de tradutor automático, chama de "amigo", preço cai a cada mensagem, cupom VENDEDOR15 na 6ª troca.
- 12 respostas fallback pré-escritas (estilo "Amigo!! Produto qualidade superior!!"). Rate limit: 10 req/IP/min.
- `ChatVendedor.jsx` (`padrao="acao-forcada"`): chat fullscreen com header laranja, bolhas estilo mensagem, efeito de digitação caractere por caractere (20ms ± variação). Limite de 12 mensagens, cupom aplicado no carrinho via Zustand.
- Botão "💬 FALAR COM O VENDEDOR" na página de produto, abaixo das specs.
- Integração com DeepSeek: chave `DEEPSEEK_API_KEY` no `.env`. Troca de modelo só exige mudar o campo `model` na requisição fetch.
- Ajuste: `max_tokens` aumentado de 200 → 400 após usuário reportar respostas truncadas. Prompt atualizado com seção "LIMITE DA MENSAGEM" instruindo a LLM a nunca cortar frase no meio.

## Fase 4 — Passo 20: Rastreio narrativo

- `RastreioPedido.jsx` (`padrao="sneaking"`): substitui o placeholder "Seu pedido saiu do galpão..." na página de confirmação.
- 20 eventos pré-escritos formando uma saga: Shenzhen → Guangzhou → Curitiba (aduaneira) → São Paulo → Recife (desvio) → Cajamar → Fortaleza → Belém (extravio) → Manaus → Brasília → Goiânia → Salvador → Vitória → Porto Alegre → Cuiabá → Curitiba. O pacote nunca chega.
- Timeline vertical com bolinhas, linha conectando, eventos com data/hora/local/descrição. Último evento pulsando em laranja.
- Estimativa de entrega sempre empurrada: `7 + (eventosVisiveis * 5) + hash % 14` dias à frente. Um evento novo a cada visita (sessionStorage conta visitas).
- Mapa SVG simplificado com rota em linha pontilhada e pontos.
- Texto em português truncado de sistema logístico real ("DESVIO DE ROTA — inconsistência no CEP de origem", "EXTRAVIO TEMPORÁRIO — Objeto localizado em unidade de logística reversa").
- Integrado em `Pedido.jsx` no lugar do texto placeholder.

## Expansão de catálogo e imagens

- `mock-produtos.js`: expandido de 24 para **48 produtos**. Adicionadas variantes de cor (Fone Preto → Fone Branco, Abajur Preto → Abajur Branco, Coleira Preta → Coleira Marrom, Camiseta Preta → Camiseta Branca). Cada produto ganhou campo `termoBusca` com termo genérico em inglês para busca de imagem.
- **Tentativa 1 — Canvas falso**: função `gerarImagemProduto()` desenhava silhuetas por categoria (9 categorias × 3 variações = 27 estilos) com Canvas 400×400. Tinha fundo gradiente, sombra, badge de desconto, marca d'água e grão. Usuário não gostou do visual ("ficou tosco").
- **Tentativa 2 — Lorem Flickr**: fotos reais Creative Commons via `loremflickr.com/{termo}?lock={id}`. Zero API key. Mas as imagens não carregaram direito (timeout, serviço instável). Revertido.
- **Tentativa 3 — Pollinations.ai**: `image.pollinations.ai/prompt/{termo}?seed={id}`. Geração IA gratuita, sem API key. Solução definitiva.
- **Solução final — banco local**: script `scripts/baixar-imagens.mjs` baixa 1 imagem por produto (48 PNGs) e salva em `public/imagens/{id}.png`. Roda uma vez com `node scripts/baixar-imagens.mjs` — o script pula arquivos já existentes, então pode ser retomado.
- `ImagemProduto.jsx`: componente com 3 camadas — (1) local `public/imagens/{id}.png`, (2) Pollinations remoto, (3) SVG fallback. Skeleton animado enquanto carrega. Fade-in ao concluir.
- Galeria (`Galeria.jsx`) simplificada de 4 miniaturas para 1 imagem única por produto — usuário notou que as 4 eram variações mínimas com Pollinations.
- IDs sanitizados com `safeId()` para evitar quebras com caracteres como `#` (produtos do scroll infinito).
- Lição principal: **pré-gerar assets offline sempre**. Gerar na hora via API externa é frágil (lento, instável, custo). O script local resolveu de vez.

## Layout e usabilidade

- Página de produto em **duas colunas no desktop** (`md:flex`): imagem sticky à esquerda, informações de compra à direita. Botão "Comprar agora" visível sem scroll. Mobile mantido em coluna única.
- Ajuste de timings nos popups a pedido do usuário (ver passo 15).
- Ajuste de escala na Caixa Misteriosa para desktop (ver passo 17).
- Vendedor: max_tokens aumentado e prompt ajustado para evitar truncamento.

## Configuração do ambiente

- DeepSeek configurado como provider do opencode (`~/.config/opencode/opencode.jsonc`).
- `DEEPSEEK_API_KEY` adicionado ao `.env` para o endpoint do vendedor. Formato: `provider.deepseek.options.apiKey`.
- `.env.example` atualizado com ambas as chaves (Gemini + DeepSeek).
- Servidor local: `npm run dev` sobe Vite + API (porta 3001) via concurrently. `npm run dev:vite-only` sobe só o front.
