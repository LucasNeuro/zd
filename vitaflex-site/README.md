# Apresentação — Desafio Técnico Zendesk (eteg)

## Rodar local

```bash
cd vitaflex-site
npm install --strict-ssl=false
npm run dev
```

Abre em **http://localhost:4321** → redireciona para **Parte 1**

### Variável local (chatbot)

Crie `zd/.env` na raiz do repositório:

```
MISTRAL_API_KEY=sua_chave_aqui
```

Reinicie `npm run dev` após salvar.

---

## Deploy na Vercel

### 1. Subir o código no GitHub

O repositório deve conter a pasta `vitaflex-site/` com o site.

### 2. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositório
3. **Root Directory:** `vitaflex-site`
4. Framework: **Astro** (detectado automaticamente)

### 3. Variável de ambiente (obrigatória para o chatbot)

Em **Settings → Environment Variables**, adicione:

| Nome | Valor | Ambientes |
|---|---|---|
| `MISTRAL_API_KEY` | sua chave em [console.mistral.ai](https://console.mistral.ai/) | Production, Preview, Development |

Clique **Deploy**.

### 4. Testar

- Site: `https://seu-projeto.vercel.app/parte-1`
- Chatbot: abra o widget e envie uma pergunta

Sem `MISTRAL_API_KEY`, o site funciona; só o chatbot avisa que falta configuração.

---

## Páginas

| URL | Conteúdo |
|---|---|
| `/parte-1` … `/parte-6` | Respostas do desafio |
| `/anexo` | JSONs de configuração |
| `/racional` | Racional das decisões |
