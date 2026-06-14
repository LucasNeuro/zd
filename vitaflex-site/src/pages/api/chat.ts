import type { APIRoute } from 'astro';
import { MISTRAL_API_KEY } from 'astro:env/server';
import { getKnowledgeBase } from '../../utils/docs';
import { getMistralApiKey } from '../../utils/env';
import { callMistralChat } from '../../utils/mistral';

export const prerender = false;

const SYSTEM_PROMPT = `Você é o assistente de apresentação do Desafio Técnico Zendesk — VitaFlex (saúde corporativa B2B), candidatura eteg (Analista de Negócios).

PÚBLICO: avaliador técnico que quer entender decisões, racional e implementação proposta.

REGRAS:
- Responda APENAS com base no conteúdo fornecido abaixo (Partes 1–6, Anexo JSONs, Racional).
- Seja claro, estruturado e objetivo. Use listas curtas quando ajudar.
- Cite a seção relevante (ex.: "Parte 2", "Racional", "Anexo") quando aplicável.
- Se a pergunta for sobre a página atual, priorize o contexto dessa parte.
- Se a informação não estiver no material, diga explicitamente e sugira onde o avaliador pode olhar.
- Responda sempre em português brasileiro.
- Máximo ~8 frases por resposta, salvo se pedirem detalhamento.

CONTEÚDO DO DESAFIO:
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = getMistralApiKey(MISTRAL_API_KEY);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'MISTRAL_API_KEY não configurada. Adicione a chave em zd/.env na raiz do projeto.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await request.json();
    const message = body?.message?.trim();
    const history = Array.isArray(body?.history) ? body.history : [];
    const pageLabel = typeof body?.pageLabel === 'string' ? body.pageLabel : null;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Mensagem vazia' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const knowledge = getKnowledgeBase();
    const pageHint = pageLabel
      ? `\n\nO avaliador está vendo agora: ${pageLabel}. Priorize essa seção se a pergunta for genérica ou relacionada à página atual.`
      : '';

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + knowledge + pageHint },
      ...history.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const result = await callMistralChat(apiKey, messages);

    if (!result.ok) {
      const friendly =
        result.error.includes('unable to verify') || result.error.includes('certificate')
          ? 'Erro de certificado SSL ao conectar na Mistral. Em dev local isso já está contornado — reinicie o servidor (npm run dev).'
          : result.status === 401
            ? 'Chave Mistral inválida. Gere uma nova em console.mistral.ai e atualize zd/.env.'
            : `Mistral API: ${result.error.slice(0, 200)}`;

      return new Response(JSON.stringify({ error: friendly }), {
        status: result.status === 401 ? 502 : result.status >= 500 ? 500 : 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply: result.reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro interno';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
