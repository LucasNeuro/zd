import https from 'node:https';

const MISTRAL_HOST = 'api.mistral.ai';
const MISTRAL_PATH = '/v1/chat/completions';

function shouldSkipTlsVerify(): boolean {
  if (process.env.MISTRAL_TLS_SKIP_VERIFY === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

const devAgent = new https.Agent({ rejectUnauthorized: false });

type ChatMessage = { role: string; content: string };

export async function callMistralChat(
  apiKey: string,
  messages: ChatMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; status: number; error: string }> {
  const payload = JSON.stringify({
    model: 'mistral-small-latest',
    messages,
    temperature: 0.3,
    max_tokens: 1500,
    stream: false,
  });

  const options: https.RequestOptions = {
    hostname: MISTRAL_HOST,
    path: MISTRAL_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(payload),
    },
    agent: shouldSkipTlsVerify() ? devAgent : undefined,
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const status = res.statusCode ?? 500;
        if (status < 200 || status >= 300) {
          resolve({ ok: false, status, error: data || `HTTP ${status}` });
          return;
        }

        try {
          const json = JSON.parse(data);
          const reply = json.choices?.[0]?.message?.content ?? 'Sem resposta.';
          resolve({ ok: true, reply });
        } catch {
          resolve({ ok: false, status: 500, error: 'Resposta inválida da Mistral.' });
        }
      });
    });

    req.on('error', (err) => {
      const cause = err.cause instanceof Error ? err.cause.message : '';
      const detail = cause ? `${err.message} (${cause})` : err.message;
      resolve({ ok: false, status: 500, error: detail });
    });

    req.setTimeout(60000, () => {
      req.destroy();
      resolve({ ok: false, status: 504, error: 'Timeout ao conectar na Mistral.' });
    });

    req.write(payload);
    req.end();
  });
}
