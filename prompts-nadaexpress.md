# NadaExpress — Roteiro de prompts para construir o projeto com agentes

Projeto final da disciplina de Programação com Agentes.
Um *dopamine site*: e-commerce que simula toda a experiência de compra sem nenhuma transação real.

---

## Como usar este documento

- **Um prompt por vez.** Não empilhe. O agente entrega, você testa no navegador, você commita, você passa pro próximo.
- **Commite entre prompts.** Sério. Quando o agente quebrar algo na etapa 19, você vai querer voltar pra 18.
- **Prioridade:** 🔴 = MVP, sem isso não tem projeto · 🟡 = é o que torna o projeto bom · ⚪ = se sobrar tempo.
- **Se você fizer só os 🔴**, tem um projeto apresentável em ~1 dia. Os 🟡 são o que tiram nota boa.
- **Quando o agente errar**, use os prompts de manutenção no final em vez de reescrever tudo.
- **Registre tudo desde o prompt 1** (custo, tentativas, falhas). Metade da nota da disciplina está aí e é impossível reconstruir depois.

**Stack sugerida:** Vite + React + Tailwind no front, funções serverless da Vercel no back, deploy na Vercel. Tudo em free tier. Se você preferir outra, troque no prompt 2 e mantenha coerente no resto.

---

## Fase 0 — Preparar o terreno

### 1. 🔴 Criar o CLAUDE.md do projeto

> Vou construir um projeto chamado NadaExpress: um clone de marketplace estilo AliExpress em que **nada é real** — nenhum produto existe, nenhum pagamento acontece, nenhuma entrega chega. É um "dopamine site", inspirado no trend sul-coreano de apps que simulam a experiência de compra pelo prazer da antecipação. É um trabalho acadêmico de crítica a dark patterns, não um produto comercial.
>
> Antes de escrever qualquer código, crie um arquivo `CLAUDE.md` na raiz com:
> - Descrição do projeto e do tom (satírico, exagerado, mas funcional de verdade)
> - Stack: Vite + React + Tailwind, funções serverless da Vercel, deploy na Vercel
> - Regras invioláveis:
>   1. Nenhuma chave de API pode aparecer em código de cliente, nunca, em nenhuma hipótese
>   2. Nenhuma foto enviada pelo usuário é gravada em disco ou banco — processa em memória e descarta
>   3. Toda chamada de LLM tem timeout e um fallback offline funcionando
>   4. O app declara em algum ponto visível que é uma simulação
> - Convenções de código: componentes funcionais, sem classe; nada de bibliotecas de UI pesadas; CSS só por Tailwind
> - Estrutura de pastas planejada
>
> Não crie mais nada além do CLAUDE.md. Me mostre o conteúdo antes de continuar.

### 2. 🔴 Scaffold

> Crie o projeto do zero seguindo o `CLAUDE.md`: Vite + React + Tailwind configurados, estrutura de pastas, um roteador simples com rotas `/`, `/produto/:id`, `/carrinho`, `/checkout`, `/pedido/:id` e uma página placeholder em cada. Configure o `.gitignore` com `.env` incluído. Rode o build pra confirmar que compila e me diga o comando pra subir o dev server. Nada de conteúdo real ainda.

### 3. 🟡 Direção visual (não pule este)

> Defina a identidade visual do NadaExpress antes de construir telas. O objetivo estético é o **marketplace asiático barato**: laranja saturado gritante, banners empilhados, badges vermelhos por toda parte, tipografia condensada, densidade visual alta, zero respiro. É deliberadamente feio — feio *com intenção*, não feio por descuido.
>
> Antes de codar, me apresente um plano curto:
> - Paleta de 5 a 6 cores com hex e nome
> - Duas fontes (uma display condensada pesada, uma de corpo estreita) — nada de Inter, nada de fonte "limpa de startup"
> - Conceito de layout em uma frase + wireframe em ASCII da home
> - O elemento-assinatura: a única coisa que faz alguém lembrar dessa tela
>
> Depois revise o próprio plano: se qualquer parte dele parecer o default que você produziria pra qualquer e-commerce, troque e me diga o que mudou. Só depois de aprovado, materialize como tokens no `tailwind.config.js` e um arquivo de estilos base.

---

## Fase 1 — A casca do e-commerce

### 4. 🔴 Home com grade de produtos

> Construa a home usando os tokens de design definidos. Precisa ter: barra de busca no topo, carrossel de banners promocionais, linha de categorias com ícones, e uma grade de cards de produto em 2 colunas no mobile e 5 no desktop. Cada card mostra imagem, título truncado em 2 linhas, preço riscado, preço com desconto em vermelho, badge de porcentagem, nota em estrelas e contagem de vendidos.
>
> Por enquanto use um arquivo `src/data/mock-produtos.js` com 24 produtos fixos escritos por você — nomes bem no estilo do AliExpress, aqueles com 15 palavras-chave enfiadas no título. Placeholders coloridos no lugar das imagens. Sem backend ainda.

### 5. 🔴 Página de produto

> Crie a página de produto. Galeria de imagens com miniaturas, título completo, bloco de preço com contador regressivo de promoção, seletor de variação (cor e tamanho), bloco de frete "grátis para João Pessoa, chega em 45 a 90 dias", avaliações com estrelas e distribuição por nota, lista de reviews, e barra fixa embaixo no mobile com "Adicionar ao carrinho" e "Comprar agora". Ainda com dados do mock.

### 6. 🔴 Carrinho, checkout e confirmação

> Implemente o fluxo completo de compra com estado global (Context API ou Zustand, escolha e justifique em uma linha). Carrinho com quantidade editável, subtotal, cupons aplicados, frete. Checkout com endereço, forma de pagamento e resumo — **campos totalmente decorativos, nada é validado como dado real e nada é enviado a lugar nenhum**. Botão "Finalizar pedido" leva pra tela de confirmação com número de pedido gerado.
>
> Persista o estado em `localStorage` pra sobreviver a refresh. Não crie backend pra isso.

---

## Fase 2 — Catálogo infinito gerado por LLM

### 7. 🔴 Endpoint seguro primeiro

> Antes de qualquer chamada de LLM: crie a estrutura de funções serverless em `/api`. Um endpoint `/api/gerar-produtos` que lê a chave da variável de ambiente do servidor, valida o método, aplica rate limit simples em memória e retorna JSON. A chave **nunca** entra em código de cliente ou em variável com prefixo `VITE_`.
>
> Crie `.env.example` documentando as variáveis. Por enquanto o endpoint pode retornar dados fixos — quero validar o encanamento antes de gastar token. Confirme por onde o valor da chave passa e me mostre.

### 8. 🔴 Gerador de produtos absurdos

> Agora implemente de verdade o `/api/gerar-produtos`. Ele recebe uma categoria e uma quantidade e devolve produtos gerados por LLM.
>
> **Antes de escrever o código de integração, consulte a documentação atual da API** — nomes de modelo e formatos de requisição mudaram recentemente e eu não quero código com assinatura antiga. Me diga qual versão você consultou.
>
> O prompt de sistema deve produzir o sabor certo: títulos longos com palavras-chave empilhadas e tradução automática ruim, descrições que contradizem o título, unidades trocadas, especificações impossíveis. Exija JSON estrito com schema fixo (id, titulo, preco, precoOriginal, desconto, vendidos, nota, categoria, descricao, specs). Valide a resposta com Zod e, se falhar o parse, tente uma vez e depois caia no fallback. Sem markdown na resposta, sem preâmbulo.

### 9. 🟡 Reviews gerados

> Crie `/api/gerar-reviews` que gera avaliações pro produto. Precisa ter a mistura certa: uns 5 estrelas genéricos, alguns claramente sobre outro produto, um comentando o atraso do frete, um em português com erro de tradução, e um que dá 5 estrelas com um texto devastador. Nome de usuário parcialmente censurado tipo `j***a`. Data relativa. Cache no cliente por produto.

### 10. 🟡 Scroll infinito com prefetch

> Ligue a home ao gerador: scroll infinito que busca a próxima leva antes do usuário chegar no fim, com skeletons durante o carregamento. Mantenha um buffer de 2 páginas já geradas em memória pra que a rolagem nunca trave. Cache por sessão pra não regerar o que já foi visto. Se a API falhar ou estourar o timeout, entra o fallback sem o usuário perceber.

### 11. 🔴 Fallback offline (faça antes de precisar)

> Gere de uma vez 120 produtos e 400 reviews e salve como JSON estático no repositório. Crie uma flag `MODO_OFFLINE` que faz o app inteiro rodar sem nenhuma chamada de API, servindo esse arquivo. Precisa ser indistinguível pro usuário.
>
> Isso é o plano de contingência da apresentação. Teste desligando a rede.

---

## Fase 3 — Gamificação (o coração do projeto)

### 12. 🔴 Carteira de moedas

> Implemente a moeda virtual "NadaCoins": saldo persistente, histórico de ganhos, e um contador animado no header que sobe dígito a dígito com som quando você ganha. A moeda dá desconto no checkout — desconto num produto que nunca vai chegar. Isso é intencional, é a piada central; não conserte.

### 13. 🔴 Roleta com near-miss

> Construa a roleta diária de cupons. Requisitos:
> - 8 fatias, prêmios visivelmente desbalanceados (o cupom grande ocupa uma fatia fina e chamativa)
> - O resultado é decidido **antes** da animação, no código, e a animação é construída pra chegar nele
> - Implemente **near-miss**: em ~40% dos giros a roleta desacelera passando raspando pelo prêmio grande e para na fatia vizinha. Essa é a mecânica principal, capriche no easing
> - Som de tique acelerando e desacelerando, vibração via `navigator.vibrate()` no celular
> - "Você tem 1 giro grátis por dia" — mas sempre aparece um jeito de ganhar mais um
>
> Documente no código, em comentário, que essa é uma mecânica de caça-níquel e por que ela funciona.

### 14. 🔴 Urgência e escassez

> Crie componentes reutilizáveis pra camada de pressão psicológica:
> - `<ContadorRegressivo>` que zera e silenciosamente reseta pra 4h
> - `<EstoqueBaixo>` com número aleatório entre 1 e 4, estável por sessão
> - `<PessoasVendo>` que começa em 8 e sobe sozinho enquanto a pessoa lê
> - `<NotificacaoFantasma>` no canto: "alguém em João Pessoa acabou de comprar isso", com nomes e cidades gerados, aparecendo a cada 20 a 40 segundos
>
> Cada componente recebe uma prop `padrao` com o nome do dark pattern que ele implementa. Vou usar isso no prompt 18.

### 15. 🟡 Popups e confirmshaming

> Implemente a camada de interrupção:
> - Popup de boas-vindas com cupom, botão de fechar minúsculo que só aparece depois de 4 segundos
> - Detecção de intenção de saída (mouse subindo pro topo no desktop, botão voltar no mobile) que dispara um popup com desconto maior
> - Confirmshaming em todo lugar: a recusa sempre é "Não, prefiro pagar o preço cheio", "Não quero economizar", em cinza pequeno
> - Um popup que só fecha depois de escolher entre duas opções que dão no mesmo
>
> Todos com a prop `padrao` preenchida.

### 16. 🟡 Missão social

> Crie a mecânica de convite: uma barra de progresso que já começa em 80% preenchida ("você está quase lá!") e pede 3 amigos pra completar. Gerar link de convite é permitido; o progresso nunca completa de verdade — sempre falta um. Deixe explícito em comentário que isso combina *endowed progress effect* com *forced action*.

### 17. ⚪ Mini-jogo extra

> Adicione um dos dois, o que couber melhor no tempo: uma caixa misteriosa diária com animação de abertura e prêmio quase sempre decepcionante, ou um joguinho de regar uma plantinha que promete um cupom grande quando florescer e leva 30 dias pra florescer. Mesma exigência: som, animação caprichada, e o prêmio real é pequeno.

### 18. 🟡 Modo raio-x — a tese do projeto

> Implemente um botão flutuante "modo raio-x". Quando ativado, todo elemento que carrega a prop `padrao` ganha uma borda tracejada vermelha e um rótulo clicável. Ao clicar, abre um painel com: nome do padrão, a categoria correspondente na taxonomia de Mathur et al. (2019) — Sneaking, Urgency, Misdirection, Social Proof, Scarcity, Obstruction ou Forced Action — uma explicação de 2 frases de por que funciona, e onde isso aparece em apps reais.
>
> Crie também uma página `/auditoria` que lista todos os padrões implementados no app, agrupados por categoria, com link pra onde cada um aparece. Essa página é o argumento acadêmico do trabalho inteiro; capriche.

---

## Fase 4 — Vendedor-agente

### 19. 🟡 Chat de pechincha

> Na página de produto, adicione um botão "Falar com o vendedor" que abre um chat com um agente. O vendedor tem personalidade fixa: entusiasmado demais, português traduzido por máquina, chama o cliente de "amigo", oferece descontos que ele mesmo inventa, alega prejuízo em toda proposta e sempre fecha negócio no final.
>
> O desconto que ele conceder deve valer de verdade no carrinho. Limite a 12 mensagens por conversa. Endpoint `/api/vendedor`, streaming da resposta, histórico enviado a cada chamada, timeout com fallback pra respostas pré-escritas.

### 20. 🟡 Rastreio narrativo

> A tela de pedido mostra um rastreamento que evolui sozinho e nunca chega. Gere uma saga: o pacote sai de um galpão em Shenzhen, passa por lugares improváveis, fica parado dias num centro de distribuição, é visto em outro estado, volta. Cada evento com data, hora e local, escritos em português truncado de sistema logístico.
>
> Mapa estático com a rota desenhada. Um evento novo a cada visita. Estimativa de entrega que sempre empurra mais uma semana pra frente.

---

## Fase 5 — O produto no seu quarto

### 21. 🟡 Captura da foto

> Na página de produto, botão "Ver no meu quarto". Abre a câmera com `<input type="file" accept="image/*" capture="environment">` — nada de getUserMedia. Depois de capturar: redimensiona pra no máximo 1024px no maior lado via canvas, comprime pra JPEG qualidade 0.8, mostra preview com opção de refazer.
>
> Nenhum upload ainda, só o preview local. Confirme que nada sai do dispositivo nesta etapa.

### 22. 🟡 Endpoint de geração de imagem

> Crie `/api/ver-no-quarto`: recebe a foto em base64 e o produto, chama o modelo de geração de imagem e devolve a imagem composta.
>
> **Consulte a documentação atual antes de codar** — os nomes dos modelos de imagem mudaram e código com nome antigo dá erro que parece problema de autenticação. Me diga qual modelo escolheu e o custo por imagem.
>
> Requisitos: a foto é processada em memória e descartada, nunca gravada; limite de 1 geração por sessão; timeout de 30 segundos; log só de metadados (duração, custo estimado), nunca da imagem.

### 23. 🟡 Expectativa versus realidade

> Faça o endpoint gerar duas versões em paralelo:
> - **Expectativa**: o produto colocado no ambiente da foto respeitando a iluminação e a perspectiva, bonito, na proporção anunciada, qualidade de catálogo
> - **Realidade**: o mesmo produto no mesmo lugar, mas visivelmente menor que o anunciado, cor errada, plástico brilhante barato, torto
>
> Apresente com um slider de antes/depois arrastável. A expectativa aparece primeiro; a realidade se revela quando a pessoa arrasta. Essa é a melhor tela do app inteiro.

### 24. 🟡 A espera é a feature

> A geração leva de 5 a 15 segundos. Não esconda com um spinner. Construa uma tela de espera teatral: "separando seu pedido", "embalando", "saindo para entrega", com barra de progresso que avança em saltos, para nos 87% por um tempo, e mensagens que mudam. A antecipação é o produto; trate a espera como parte da experiência, não como falha.
>
> Se a API falhar, cai numa das imagens pré-geradas sem avisar o usuário.

### 25. 🔴 Kit de emergência da apresentação

> Gere e salve no repositório 4 resultados completos de "ver no meu quarto" (expectativa e realidade) usando fotos de ambiente genéricas. Crie um atalho de teclado secreto que força o app a usar esses resultados em vez de chamar a API.
>
> Isso é pra quando a rede da sala não funcionar ou a API cair no meio da demo. Teste o atalho com a rede desligada.

---

## Fase 6 — Fechamento

### 26. 🟡 Medidor de consciência

> Crie a tela `/minha-sessao`, acessível pelo menu e oferecida automaticamente depois de 10 minutos de uso. Mostra: quanto a pessoa "gastou", quantos giros deu, quantos cupons ganhou e não usou, quantos popups fechou, quanto tempo ficou no app, e quantos minutos passou olhando produtos que não existem.
>
> Tom: seco, sem julgamento, sem piada. O contraste entre o app inteiro gritando e essa tela sussurrando é o que faz ela funcionar.

### 27. 🟡 Telemetria

> Instrumente eventos anônimos: giro de roleta, popup exibido e fechado, produto visitado, item adicionado, checkout iniciado e finalizado, duração de sessão, uso do modo raio-x. Sem identificar ninguém, sem cookie de tracking, tudo agregado.
>
> Crie `/dashboard` com gráficos desses dados — vou soltar o app pra turma usar por uma semana e preciso apresentar os números. Aviso na primeira visita de que métricas anônimas de uso são coletadas.

### 28. 🔴 Passada de qualidade

> Revise o app inteiro: funciona em tela de 360px, tem foco visível de teclado em todo controle interativo, respeita `prefers-reduced-motion` desativando as animações mais agressivas, imagens com dimensão reservada pra não pular layout, e nenhum erro no console. Rode um Lighthouse e me traga o resultado.
>
> Ironia consciente: um app sobre dark patterns tem que ser acessível.

### 29. 🔴 Deploy

> Faça o deploy na Vercel: variáveis de ambiente configuradas no painel, build de produção passando, rotas da API funcionando em produção. Confirme que a chave não aparece no bundle do cliente — me mostre como você verificou. Me devolva a URL pública.

---

## Fase 7 — Os entregáveis da disciplina

### 30. 🔴 Relatório de construção por agentes

> Vasculhe o histórico do git e gere `RELATORIO-AGENTES.md` com: número de commits e linhas por fase, quais etapas exigiram mais idas e vindas, onde o código gerado teve que ser corrigido à mão, quais erros se repetiram, e uma estimativa de custo em tokens. Seja específico e honesto sobre as falhas — a parte dos erros é a mais interessante academicamente. Não maquie.

### 31. 🟡 Mapeamento acadêmico

> Gere `DARK-PATTERNS.md`: uma tabela com cada mecânica implementada, o arquivo onde ela vive, a categoria correspondente na taxonomia de Mathur et al. (2019), e uma referência a onde o padrão aparece num app real. Inclua a citação completa do paper e um parágrafo de introdução explicando a taxonomia. Esse arquivo é o que separa "fiz um app de piada" de "fiz um trabalho".

### 32. 🔴 README e roteiro de demo

> Escreva o `README.md`: o que é, por que existe, como rodar local, variáveis necessárias, arquitetura em um diagrama simples, e um aviso claro e destacado de que é uma simulação sem transações reais.
>
> Depois escreva `DEMO.md`: um roteiro de 5 minutos de apresentação, com a ordem exata de telas, o que dizer em cada uma, onde está o clímax (o slider expectativa/realidade), e o plano B pra cada coisa que pode falhar ao vivo.

### 33. ⚪ Comparação entre agentes

> Escolha uma feature de complexidade média já pronta (sugiro a roleta com near-miss). Descreva ela num prompt neutro e peça a implementação a outro modelo, do zero, em branch separado. Compare: tempo até funcionar, número de intervenções manuais, linhas geradas, bugs encontrados, custo. Gere `COMPARACAO.md` com a metodologia e os resultados numa tabela.
>
> Se você fizer isso, entrega duas coisas de uma vez: o app e um estudo comparativo de agentes.

---

## Prompts de manutenção (use quando travar)

**Quando quebrar algo que funcionava:**
> Isso funcionava no commit anterior e parou. Antes de mexer em qualquer arquivo, faça o diff dos últimos commits, identifique a mudança específica que causou a regressão e me explique a causa. Só depois proponha a correção — a mínima possível, sem refatorar nada em volta.

**Quando insistir num erro de API:**
> Você já tentou duas vezes e não funcionou. Pare de tentar variações. Vá na documentação oficial atual, me diga qual é a assinatura correta hoje e o que exatamente está diferente do que você escreveu. Não escreva código nesta resposta.

**Quando o arquivo virar um monstro:**
> Este componente passou de 300 linhas. Quebre em partes menores mantendo o comportamento idêntico, sem mudar nenhuma classe de estilo e sem alterar a API pública dos componentes. Confirme que a tela continua igual antes e depois.

**Quando você perder o fio:**
> Faça um inventário do que está implementado e funcionando, do que está pela metade e do que ainda não existe, comparando com o `CLAUDE.md`. Só a lista, sem escrever código.

**Antes de dormir:**
> Atualize o `CLAUDE.md` com o estado atual: o que foi feito hoje, decisões que tomamos e o porquê, e o que está pendente. Escreva pra alguém que vai continuar amanhã sem nenhum contexto desta conversa.

---

## Cinco regras que valem mais que qualquer prompt

1. **Commit a cada prompt que funciona.** Não negocie isso.
2. **O fallback offline (11) e o kit de emergência (25) vêm antes do polimento.** Demo que quebra ao vivo apaga três dias de trabalho.
3. **Peça pro agente consultar a doc atual toda vez que envolver API de modelo.** É onde ele mais alucina, com folga.
4. **Anote os erros na hora que acontecem**, num arquivo `DIARIO.md` solto. Você não vai lembrar na semana da entrega, e é isso que vira o relatório.
5. **Corte features antes de cortar acabamento.** Cinco telas caprichadas ganham de doze pela metade — inclusive na nota.
