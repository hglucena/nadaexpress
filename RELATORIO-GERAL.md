# Relatório Geral — NadaExpress

Projeto final da disciplina de Programação com Agentes. Um *dopamine site*: e-commerce que simula toda a experiência de compra sem nenhuma transação real.

---

## Fase 0 — Preparação

| Atividade | Status | Detalhes |
|---|---|---|
| Scaffold Vite + React + Tailwind v4 | ✅ | `@theme` em `src/index.css`, sem `tailwind.config.js` |
| Fontes: Anton (display) + Archivo Narrow Variable (corpo) | ✅ | Via `@fontsource-variable/archivo-narrow` e `@fontsource/anton` |
| Paleta visual: laranja, vermelho, amarelo, rosa, fundo bege | ✅ | Tokens CSS em `@theme`, cores nomeadas em português |
| Roteador com 6 rotas base | ✅ | `/`, `/produto/:id`, `/carrinho`, `/checkout`, `/pedido/:id`, placeholder |
| `.gitignore` com `.env` blindado | ✅ | `.env` e `.env.*` excluídos, exceto `.env.example` |

## Fase 1 — Casca do e-commerce

| Atividade | Status | Detalhes |
|---|---|---|
| Home com grade de produtos | ✅ | Cards em 2 colunas (mobile) / 5 colunas (desktop), busca, banners, categorias com ícones |
| 24 produtos mock escritos à mão | ✅ | Nomes estilo AliExpress com 15+ palavras-chave empilhadas |
| Página de produto (detalhe) | ✅ | Galeria, preço, contador regressivo, variação, frete, avaliações, reviews |
| Carrinho, checkout e confirmação | ✅ | Zustand + persist em localStorage, cupons, resumo de pedido |
| Carrinho: bug de duplo clique no stepper | ✅ Corrigido | Mudança de `atualizarQuantidade(linha, item.qtd + 1)` para `incrementarQuantidade()` calculando dentro do updater do Zustand |

## Fase 2 — Catálogo infinito com LLM

| Atividade | Status | Detalhes |
|---|---|---|
| API `/api/gerar-produtos` | ✅ | Vercel-compatible, Zod validation, rate limit por IP, timeout 45s |
| API `/api/gerar-reviews` | ✅ | 8 arquétipos de review, cache no cliente por produto |
| Migração Gemini → DeepSeek | ✅ | Provedor único (`deepseek-v4-flash`) pros 3 endpoints, cliente em `src/lib/deepseek.js` |
| Dev server local | ✅ | `scripts/dev-api-server.js` — substitui `vercel dev` (que exige login) |
| Scroll infinito na home | ✅ | Buffer de 2 páginas, IntersectionObserver, cache de sessão |
| Fallback offline (120 produtos, 400 reviews) | ✅ | Dataset estático em `src/data/fallback/`, flag `MODO_OFFLINE` |
| Catálogo integrado | ✅ | `src/lib/catalogo.js` resolve mock → offline → extras da sessão |
| Bug: timeout de 10s insuficiente | ✅ Corrigido | Subido para 20s — chamadas legítimas levam 9-10s |
| Bug: `responseSchema` não força `minItems` | ✅ Corrigido | Adicionado `minItems`/`maxItems` no schema |
| Cota do Gemini free tier: 20 req/dia | ✅ Resolvido | Migrado pro DeepSeek (pago por uso, sem teto diário) |
| Bug: sem schema no provedor, JSON quebrava | ✅ Corrigido | Temperatura 1.1 → 0.85, `z.coerce` nos numéricos, contagem conferida em código |
| Bug: raciocínio consumia o orçamento de tokens | ✅ Corrigido | `reasoning_effort: 'none'` — antes devolvia `content` vazio e forçava retry (60s, 2x custo) |
| Bug: reviews nunca tiveram `minItems` | ✅ Corrigido | "Exatamente 8" valia só no texto do prompt; agora `ajustarQuantidade()` confere |

## Fase 3 — Gamificação (o coração do projeto)

| Atividade | Status | Detalhes |
|---|---|---|
| **Passo 12: NadaCoins** | ✅ | `useMoedasStore.js` (Zustand + persist), 1 moeda = R$ 0,10, cashback 1:2, bônus 50 na 1ª visita, contador animado com som WebAudio |
| **Passo 13: Roleta com near-miss** | ✅ | 8 fatias desiguais, jackpot probabilidade zero, near-miss 40%, easing personalizado, som + vibração, giro grátis diário + anúncio falso, ganchos de teste `window.__forcarRoleta` |
| **Passo 13: Ajuste de labels** | ✅ Corrigido | Texto vertical transbordava — raio adaptativo por comprimento do label, fontSize 9, `writingMode: vertical-rl` |
| **Passo 14: Urgência e escassez** | ✅ | `ContadorRegressivo` (já existia), `EstoqueBaixo` (1-4 estável por sessão), `PessoasVendo` (8-12, sobe sozinho), `NotificacaoFantasma` (20-40s, nomes/cidades) |
| **Passo 15: Popups e confirmshaming** | ✅ | `PopupBoasVindas` (BEMVINDO20, fechar em 6s), `PopupIntencaoSaida` (mouse topo / 90s mobile), `PopupEscolhaForcada` (2 botões = mesmo cupom, sem fechar real) |
| **Passo 16: Missão social** | ✅ | `useConviteStore` — endowed progress 80%, meta sempre móvel (+1), `MissaoSocial` com barra + Web Share API |
| **Passo 17: Mini-jogo (Caixa Misteriosa)** | ✅ | `useCaixaStore` (1/dia, distribuição 70/20/8/2), animação 3 fases (idle/shake/explosão), sons WebAudio, partículas |

## Fase 4 — Vendedor-agente e Rastreio

| Atividade | Status | Detalhes |
|---|---|---|
| **Passo 19: Chat de pechincha** | ✅ | API `/api/vendedor` com DeepSeek V4 Flash, prompt de persona detalhado, 12 fallbacks, rate limit, timeout 15s |
| **Passo 19: Ajuste de max_tokens** | ✅ | 200 → 400 tokens após respostas truncadas, prompt atualizado com instrução de não cortar frases |
| **Passo 20: Rastreio narrativo** | ✅ | `RastreioPedido.jsx` — 20 eventos (Shenzhen → nunca chega), timeline + mapa SVG, estimativa sempre empurrada, 1 evento novo por visita |

## Catálogo e Imagens

| Atividade | Status | Detalhes |
|---|---|---|
| Expansão de produtos mock | ✅ | 24 → 48 produtos, variantes de cor (preto/branco/marrom), termoBusca em inglês |
| Tentativa 1: Canvas falso | ❌ Rejeitado | 27 silhuetas por categoria. Usuário não gostou do visual |
| Tentativa 2: Lorem Flickr | ❌ Falhou | Serviço instável, imagens não carregavam |
| Tentativa 3: Pollinations.ai | ✅ | Geração IA gratuita, zero API key, `seed={id}` para determinismo |
| Banco local de imagens | ✅ | Script `baixar-imagens.mjs` — 48 PNGs em `public/imagens/`, carrega instantâneo do disco |
| `ImagemProduto.jsx` | ✅ | 3 camadas (local → Pollinations → SVG fallback), skeleton loading, fade-in |
| Layout desktop 2 colunas | ✅ | Produto: imagem sticky esquerda, compra à direita. Mobile mantido single column |

## Infraestrutura

| Atividade | Status | Detalhes |
|---|---|---|
| Config DeepSeek no opencode | ✅ | `~/.config/opencode/opencode.jsonc` com provider `deepseek` |
| `.env` com Gemini + DeepSeek | ✅ | Chaves blindadas no `.gitignore`, `.env.example` documentado |
| Dev server | ✅ | `npm run dev` (Vite 5173 + API 3001 via concurrently) |

---

## Desafios e lições

1. **Cota de API é o gargalo real.** O Gemini free tier tem 20 req/dia — estourou nos próprios testes. O fallback offline (passo 11) foi essencial e deveria ter vindo antes. Resolvido na migração pro DeepSeek, pago por uso: o limite virou saldo, não cota diária.

2. **Texto vertical em SVG é traiçoeiro.** A altura do texto é `chars × fontSize`, e o raio da roleta é 100 unidades. Labels de 12 caracteres precisam de raio ~55 para caber, o que os empurra perigosamente perto do centro. A fórmula `radius = 90 - length × 3.5` foi o compromisso.

3. **Geração de imagem externa é frágil.** Tentamos Canvas (bom controle, visual questionável), Lorem Flickr (instável), Pollinations (funcionou mas lento). A solução certa foi pré-gerar tudo com script e servir do disco. **Pré-gerar assets offline sempre.**

4. **Timing de popups importa mais que o conteúdo.** O usuário rejeitou os timings iniciais (0s/45s/2min) — muito agressivos. Subir para 8s/90s/5min resolveu sem perder a intenção satírica.

5. **Edição de JSX em dev server compartilhado requer atomicidade.** Um `<div>` sem fechar empurrado pelo HMR quebra a tela do usuário ao vivo. Cada edição precisa ser autocontida.

6. **O projeto acumulou 88 módulos e ~500KB de bundle JS.** O gerador de imagens Canvas original inflou o bundle consideravelmente — migrar para arquivos PNG estáticos em `public/` resolveu.

7. **Garantia de formato é do provedor até não ser mais.** O `responseSchema` do Gemini vinha segurando tipo, campo obrigatório e tamanho de array sem que isso estivesse escrito em lugar nenhum do código. O DeepSeek só tem `json_object` (JSON válido, forma livre), e trocar de provedor expôs quanta validação estava terceirizada: contagem de itens, coerção de tipo e checagem de faixa tiveram que virar código explícito. Quando a garantia mora na configuração do provedor, ela é invisível na revisão e some junto com ele.

8. **Parâmetro default do modelo pode ser o custo escondido.** O `deepseek-v4-flash` raciocina por padrão, e os tokens de raciocínio são cobrados como saída. Além do preço, com prompt longo ele às vezes gastava o orçamento inteiro pensando e devolvia resposta vazia — que aparecia como "erro intermitente da API", não como escolha de configuração. `reasoning_effort: 'none'` resolveu latência, custo e confiabilidade de uma vez.

---

## Próximos passos (não implementados)

- Passo 21-25: "Ver no meu quarto" (captura de foto + composição)
- Passo 26: Medidor de Consciência (`/minha-sessao`)
- Passo 27: Telemetria anônima + Dashboard
- Passo 28: Lighthouse e acessibilidade
- Passo 29: Deploy na Vercel
- Passo 30: Relatório de construção por agentes (RELATORIO-AGENTES.md)
- Passo 31: Mapeamento acadêmico (DARK-PATTERNS.md)
- Passo 32: README e roteiro de demo (DEMO.md)

---

## Números

| Métrica | Valor |
|---|---|
| Produtos no catálogo mock | 48 |
| Produtos no fallback offline | 120 |
| Categorias | 9 |
| Páginas | 9 (`/`, `/produto/:id`, `/carrinho`, `/checkout`, `/pedido/:id`, `/roleta`, `/caixa-misteriosa`, `/auditoria`, futuras) |
| Componentes React | ~30 |
| Stores Zustand | 6 (carrinho, pedidos, moedas, roleta, convite, caixa) |
| Endpoints API | 3 (`gerar-produtos`, `gerar-reviews`, `vendedor`) |
| Imagens locais | 48 PNGs |
| Dark patterns implementados | ~12 |
| Módulos no build | 88 |
| Bundle JS | ~500 KB (492 KB minificado) |
