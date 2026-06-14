# Apresentação — Desafio Técnico Zendesk (eteg)

## Rodar local

```bash
cd vitaflex-site
npm install --strict-ssl=false
npm run dev
```

Abre em **http://localhost:4321/** — Parte 1 na raiz, sem redirect

### Variável local (chatbot)

Crie `zd/.env` na raiz do repositório:

```
MISTRAL_API_KEY=sua_chave_aqui
```

Reinicie `npm run dev` após salvar.

---

## Deploy na Vercel

### Opção A — Root Directory (recomendado)

1. [vercel.com/new](https://vercel.com/new) → importe o repositório
2. **Root Directory:** `vitaflex-site`  ← importante
3. **Environment Variable:** `MISTRAL_API_KEY` = sua chave
4. Deploy

### Opção B — Deploy pela raiz do repo (`zd/`)

Se não configurar Root Directory, o `vercel.json` na raiz já aponta para `vitaflex-site` automaticamente.

Mesma variável: `MISTRAL_API_KEY` no painel da Vercel.

---

## Páginas

| URL | Conteúdo |
|---|---|
| `/` ou `/parte-1` | Parte 1 — Fluxos e Acessos |
| `/parte-2` … `/parte-6` | Respostas do desafio |
| `/anexo` | JSONs de configuração |
| `/racional` | Racional das decisões |
