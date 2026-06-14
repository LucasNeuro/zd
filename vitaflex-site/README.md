# Apresentação — Desafio Técnico Zendesk (eteg)

## Rodar

```bash
cd vitaflex-site
npm install --strict-ssl=false
npm run dev
```

O `.env` fica na **raiz do projeto** (`zd/.env`), não dentro de `vitaflex-site/`.

Abre em **http://localhost:4321** → redireciona para **Parte 1**

## Páginas

| URL | Conteúdo |
|---|---|
| `/parte-1` … `/parte-6` | Respostas do desafio |
| `/anexo` | JSONs de configuração |
| `/racional` | Racional das decisões |

## Variáveis de ambiente (`.env`)

Arquivo na **raiz** do repositório: `zd/.env` (ao lado das pastas `docs/`, `vitaflex-site/`).

| Variável | Obrigatória | Descrição |
|---|---|---|
| `MISTRAL_API_KEY` | Não* | Chave da API Mistral para o chatbot flutuante |

\* Sem a chave, o site funciona; só o chatbot avisa que falta configuração.

**Setup:** copie `zd/.env.example` → `zd/.env`, cole a chave e reinicie `npm run dev`.
