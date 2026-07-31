# NadaExpress

Um clone de marketplace estilo AliExpress em que **nada é real** — nenhum produto existe, nenhum pagamento acontece, nenhuma entrega chega.

É um trabalho acadêmico de crítica a dark patterns de e-commerce: o app implementa cada padrão manipulativo de verdade e depois o expõe em modo de auditoria.

---

## ⚠️ Aviso

**Este é um site de simulação.** Nenhuma transação financeira ocorre. Nenhum produto é real. Nenhuma entrega é feita. Os pagamentos são decorativos e não processam valores reais. Este projeto existe exclusivamente para fins acadêmicos de estudo de dark patterns em interfaces digitais.

---

## Stack

- **Frontend**: Vite + React 19 + React Router 7
- **Estilo**: Tailwind CSS v4 (tokens via `@theme`, sem config.js)
- **Estado**: Zustand com middleware `persist` (localStorage)
- **Fontes**: Anton (display) + Archivo Narrow Variable (corpo)
- **API/Backend**: Funções serverless compatíveis com Vercel
- **LLMs**: DeepSeek V4 Flash — catálogo, reviews e vendedor-agente
- **Imagens**: Pollinations.ai (pré-geradas em `public/imagens/`)
- **Deploy**: Vercel

---

## Como rodar local

```bash
# instalar dependências
npm install

# configurar variáveis de ambiente (copie .env.example → .env)
cp .env.example .env
# Preencha DEEPSEEK_API_KEY (opcional: sem ela o app roda pelo dataset offline)

# rodar (Vite + API server)
npm run dev

# ou só o frontend (sem API)
npm run dev:vite-only
```

O app abre em `http://localhost:5173`. A API local roda em `http://localhost:3001`.

### Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Vite (5173) + API server (3001) via concurrently |
| `npm run dev:vite-only` | Apenas o frontend Vite |
| `npm run dev:vercel` | Vercel dev (exige login) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Oxlint |
| `node scripts/baixar-imagens.mjs` | Baixa imagens do Pollinations para `public/imagens/` |

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DEEPSEEK_API_KEY` | Chave da API do DeepSeek — catálogo, reviews e vendedor-agente |

Sem a chave o app funciona inteiro pelo dataset offline (120 produtos, 400 reviews):
os endpoints respondem 200 com `fonte: "fallback-sem-chave"` em vez de erro.

---

## Arquitetura

```
nadaexpress/
├── api/                     # Funções serverless (Vercel-compatible)
│   ├── vendedor.js          # Chat de pechincha (DeepSeek)
│   ├── gerar-produtos.js    # Catálogo (DeepSeek)
│   └── gerar-reviews.js     # Reviews (DeepSeek)
├── scripts/
│   ├── dev-api-server.js    # Servidor API local (substituto do vercel dev)
│   └── baixar-imagens.mjs   # Download de imagens do Pollinations
├── public/
│   └── imagens/             # 48 PNGs pré-gerados (1 por produto)
├── src/
│   ├── pages/               # 9 páginas (Home, Produto, Carrinho, etc.)
│   ├── components/
│   │   ├── produto/         # Cards, galeria, avaliações, chat
│   │   ├── pressao/         # Dark patterns: contador, estoque, notificações
│   │   ├── gamificacao/     # Roleta, moedas, missão, caixa misteriosa
│   │   ├── carrinho/        # Carrinho, checkout
│   │   ├── home/            # Barra busca, banners, grade
│   │   ├── pedido/          # Rastreio narrativo
│   │   └── ui/              # Componentes base (ImagemProduto)
│   ├── store/               # 6 stores Zustand (carrinho, moedas, roleta, etc.)
│   ├── hooks/               # useProdutosInfinitos, useReviews
│   ├── data/                # Mock (48 produtos) + Fallback offline (120)
│   └── lib/                 # Utilitários, formatos, aleatoriedade, som
└── dist/                    # Build de produção
```

---

## Dark patterns implementados

O projeto implementa ~12 padrões da taxonomia de Mathur et al. (2019):

| Padrão | Categoria |
|---|---|
| Urgência falsa (contador regressivo) | Urgency |
| Escassez falsa (estoque baixo) | Scarcity |
| Prova social (pessoas vendo, notificações fantasma) | Social Proof |
| Ação forçada (roleta, popups) | Forced Action |
| Obstrução (popups com fechar atrasado) | Obstruction |
| Confirmshaming (recusas humilhantes) | Sneaking |
| Endowed progress (missão social 80%) | Misdirection |
| Reforço intermitente (roleta, caixa misteriosa) | Forced Action |
| Sneaking (rastreio narrativo que nunca chega) | Sneaking |

---

## Licença

Projeto acadêmico. Uso proibido para fins comerciais.
