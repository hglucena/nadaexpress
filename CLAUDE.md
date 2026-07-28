# CLAUDE.md

## O que é

NadaExpress é um clone de marketplace estilo AliExpress em que nada é real: nenhum produto existe, nenhum pagamento acontece, nenhuma entrega chega. É um "dopamine site" — a mecânica de compra (rolar o feed, ganhar cupom, girar roleta, ver o preço "cair") fica preservada inteira, só o produto final nunca chega.

Trabalho final da disciplina de Programação com Agentes. O objetivo é crítica a dark patterns de e-commerce: o app implementa cada padrão manipulativo de verdade e depois expõe qual é qual, num modo de auditoria. Não é um produto comercial e não deve virar um.

## Tom

Satírico e exagerado na superfície, funcional de verdade por baixo. Contador regressivo, "só restam 2 unidades", roleta com near-miss — cada mecânica tem que se comportar como se comportaria num app de produção. O exagero está na intensidade e na quantidade, nunca na qualidade da implementação. Referência estética: AliExpress, Shein, Temu. Densidade visual alta, urgência o tempo todo, brain-rot de propósito.

## Stack

- Vite + React
- Tailwind para estilo, sem biblioteca de componentes
- Funções serverless da Vercel para tudo que envolve chave de API
- Deploy na Vercel

## Regras invioláveis

1. Nenhuma chave de API aparece em código de cliente, nunca, em nenhuma hipótese. Chamada a LLM ou a modelo de geração de imagem passa por `/api/*`, nunca direto do browser.
2. Nenhuma foto enviada pelo usuário é gravada em disco ou banco. Processa em memória, só pelo tempo da requisição, e descarta.
3. Toda chamada de LLM tem timeout e cai num fallback offline funcionando. Provedor externo lento ou fora do ar não pode travar o app nem mostrar erro cru pro usuário.
4. O app declara em algum ponto visível que é uma simulação — sem transação real, sem produto real, sem entrega real.

## Convenções de código

- Componentes funcionais, sem classe
- Sem biblioteca de UI pesada (nada de MUI, Chakra, Ant) — Tailwind resolve
- CSS só por classe do Tailwind, sem arquivo `.css` separado por componente
- Rotas, nomes de componente e conteúdo em português, seguindo o resto do projeto

## Estrutura de pastas planejada

```
nadaexpress/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── router.jsx
│   ├── pages/             # Home, Produto, Carrinho, Checkout, Pedido, Auditoria, MinhaSessao, Dashboard
│   ├── components/
│   │   ├── produto/        # card, galeria, avaliações
│   │   ├── pressao/         # ContadorRegressivo, EstoqueBaixo, PessoasVendo, NotificacaoFantasma
│   │   ├── gamificacao/     # roleta, carteira de moedas, missão social, mini-jogo
│   │   ├── raiox/           # overlay e painel do modo raio-x
│   │   └── ui/               # botão, input, badge — genéricos
│   ├── store/                 # useCarrinhoStore, usePedidosStore — zustand + persist
│   ├── hooks/                 # useReviews e outros hooks que chamam /api
│   ├── data/
│   │   ├── mock-produtos.js
│   │   ├── mock-reviews.js
│   │   └── fallback/         # produtos, reviews e imagens estáticas do modo offline (item 11)
│   ├── lib/                  # formatação, schemas Zod, utils
│   └── styles/
├── api/
│   ├── gerar-produtos.js
│   ├── gerar-reviews.js
│   ├── vendedor.js
│   └── ver-no-quarto.js
├── scripts/
│   └── dev-api-server.js     # substituto local de `vercel dev`, ver seção "Rodando local"
├── public/
├── .env.example
└── CLAUDE.md
```

## Rodando local

`npm run dev` sobe Vite (5173) **e** um servidor local (`scripts/dev-api-server.js`, porta 3001) que executa as funções de `/api/*.js` de verdade, com o Vite fazendo proxy de `/api` pra ele. Existe porque `vercel dev` — o jeito oficial de rodar front e função juntos — exige login interativo na conta Vercel, e isso trava automação. `npm run dev:vercel` continua disponível pra validar no ambiente real da Vercel antes de deploy; `npm run dev:vite-only` sobe só o front, sem API nenhuma.

## Convenção: componentes de dark pattern

Todo componente de `components/pressao/`, `components/gamificacao/` e popups tem uma prop `padrao` com o slug do padrão implementado, e renderiza essa mesma string num atributo `data-padrao` no elemento raiz. É assim que o modo raio-x (item 18) vai encontrar e listar cada um: `document.querySelectorAll('[data-padrao]')`. Primeiro componente nesse padrão: `ContadorRegressivo`.

## Estado global

`zustand` com middleware `persist` (localStorage). Escolhido em vez de Context API porque o projeto vai acumular várias fatias de estado independentes (carrinho, moedas, sessão) que precisam persistir — o `persist` resolve isso sem `useEffect` manual em cada uma, e assinatura seletiva evita re-render de tudo a cada mudança. Um store por domínio: `store/useCarrinhoStore.js`, `store/usePedidosStore.js` (mais virão).

## Status

Fase 3 em andamento: NadaCoins prontas (`store/useMoedasStore.js` — 1 moeda = R$ 0,10 de desconto via `TAXA_CONVERSAO`, cashback de 1 moeda por R$ 2, bônus de 50 na primeira visita; contador animado com som em `components/gamificacao/ContadorMoedas.jsx`, presente nos headers de Home, Produto e Pedido; sons sintetizados via WebAudio em `src/lib/som.js`). Roleta pronta em `/roleta` (`components/gamificacao/RoletaDoNada.jsx` + `store/useRoletaStore.js`): 8 fatias desiguais, jackpot de probabilidade zero, resultado sorteado antes da animação, near-miss em 40% parando 2-4° depois do jackpot na fatia "+1 GIRO", tiques por cruzamento de fatia, vibração, giro grátis diário + anúncio falso (`AnuncioFalso.jsx`) que dá giro extra. Ganchos de teste só-DEV: `window.__forcarRoleta` e `window.__duracaoRoleta`.

Fase 0 completa. Fase 1 completa (home, produto, carrinho, checkout, confirmação de pedido). **Fase 2 completa**: `/api/gerar-produtos` e `/api/gerar-reviews` funcionando com Gemini (`gemini-3.6-flash`, pacote `@google/genai`, chave em `GEMINI_API_KEY`), schema Zod + `minItems`/`maxItems`, timeout 20s, retry único. Scroll infinito na home com buffer de 2 páginas e cache de sessão. Fallback em três camadas: (1) `MODO_OFFLINE` via `src/lib/config.js` — env `VITE_MODO_OFFLINE=1` ou localStorage `nadaexpress-offline` — zera as chamadas de rede e serve o dataset estático; (2) cota/API morta → servidor responde do mesmo dataset; (3) erro de rede no cliente → amostra local. Dataset offline: 120 produtos e 400 reviews em `src/data/fallback/*.js`, gerados por `scripts/gerar-fallback-offline.mjs` (sementes à mão + expansão determinística — rodar de novo reproduz igual). Produtos de qualquer origem resolvem em `/produto/:id` via `src/lib/catalogo.js`.

**Cota do Gemini free tier: 20 requisições/dia por modelo.** Estourada durante os próprios testes. Importante pro item 27 (app pra turma usar por uma semana) — considerar upgrade de tier antes da apresentação.

Tokens do Tailwind vivem em `src/index.css` via `@theme` — a v4 não usa mais `tailwind.config.js`. Fontes self-hospedadas via `@fontsource`. Erros e decisões não óbvias ficam em `DIARIO.md`. Pendente: identidade do git não configurada nesta máquina — trabalhando sem commit por enquanto, a pedido do usuário.
