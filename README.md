# Bolsinha — Doces da Maria

Site + painel admin para vender na bolsinha do escritório.

- **Clientes:** `seusite.com` — vitrine, PIX por item, valor livre
- **Maria (admin):** `seusite.com/admin` — itens, fotos, preços, acabou/disponível

## Local

```bash
npm install
npm run db:setup
npm run dev
```

- Site: http://localhost:3001  
- Admin: http://localhost:3001/admin  
- Senha: `maria123` (`.env` → `ADMIN_PASSWORD`)

## Deploy grátis

### Opção A — Cloudflare Workers (recomendado para você)

O projeto já está configurado com **OpenNext** (`wrangler.jsonc`, `open-next.config.ts`).

**Não use upload manual de pasta** — o Cloudflare faz o build no servidor (Linux).

#### 1. Banco Turso (obrigatório no Cloudflare)

1. Conta em [turso.tech](https://turso.tech) → crie um banco
2. Copie `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`
3. Rode migrações no seu PC:

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npx prisma migrate deploy
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
```

#### 2. GitHub

```bash
git add .
git commit -m "deploy cloudflare"
git push
```

#### 3. Cloudflare Dashboard

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Conecte o repositório GitHub
3. Configuração de build:

| Campo | Valor |
|-------|--------|
| Build command | `npm install && npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |

4. Variáveis de ambiente (Settings → Variables):

| Variável | Obrigatório |
|----------|-------------|
| `TURSO_DATABASE_URL` | Sim |
| `TURSO_AUTH_TOKEN` | Sim |
| `AUTH_SECRET` | Sim (string longa aleatória) |
| `ADMIN_PASSWORD` | Sim |
| `BLOB_READ_WRITE_TOKEN` | Sim (fotos no admin) |
| `NEXT_PUBLIC_SITE_URL` | Sim (`https://bolsinha.seudominio.workers.dev`) |

5. Deploy automático a cada push.

#### Local (opcional)

```bash
npm run dev      # desenvolvimento normal (porta 3001)
npm run preview  # testa como fica no Workers (precisa WSL no Windows)
npm run deploy   # build + deploy via CLI (precisa wrangler login)
```

---

### Opção B — Vercel + Turso

### 1. Banco Turso (grátis)

1. Crie conta em [turso.tech](https://turso.tech)
2. Crie um banco e copie URL + token
3. Rode migrações no Turso:

```bash
# .env temporário com credenciais Turso
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
npx prisma migrate deploy
```

### 2. Vercel

1. Suba o repo no GitHub
2. Importe no [vercel.com](https://vercel.com)
3. Variáveis de ambiente:

| Variável | Valor |
|----------|--------|
| `TURSO_DATABASE_URL` | URL do Turso |
| `TURSO_AUTH_TOKEN` | Token do Turso |
| `AUTH_SECRET` | String longa aleatória |
| `ADMIN_PASSWORD` | Senha da Maria |
| `NEXT_PUBLIC_SITE_URL` | `https://seu-projeto.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob (Storage → Blob) |

4. Deploy

### 3. Fotos em produção

Localmente as fotos vão para `public/uploads/`. Na Vercel, configure **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`) — senão uploads não persistem.

## Maria no dia a dia

1. Abre `seusite.com/admin` no celular
2. **Adicionar ao início** (PWA) — vira atalho como app
3. Marca item **Acabou** / **Disponível**
4. Sobe foto do produto (salva o item antes, se for novo)
5. Baixa **cartão PNG** e prende na bolsinha

## Scripts

```bash
npm run dev          # porta 3001
npm run build        # build Next.js
npm run preview      # preview no runtime Cloudflare
npm run deploy       # deploy Cloudflare Workers
npm run db:migrate   # migrações
npm run db:seed      # dados iniciais
```
