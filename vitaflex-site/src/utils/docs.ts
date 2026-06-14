import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

export const entregaFile = 'desafio-tecnico-zendesk-vitaflex-entrega-final.md';
export const anexoFile = 'jsons-prontos-para-importar-desafio-zendesk-vitaflex.md';
export const racionalFile = 'desafio-zendesk-racional-decisoes.md';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function resolveContentDir(): string {
  const candidates = [
    path.join(siteRoot, 'content'),
    path.join(process.cwd(), 'content'),
    path.join(process.cwd(), 'dist', 'content'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, entregaFile))) return dir;
  }

  return path.join(siteRoot, 'content');
}

const contentDir = resolveContentDir();

export const partes = [
  { id: 1, slug: 'parte-1', title: 'Estruturação de Fluxos e Acessos', icon: '01' },
  { id: 2, slug: 'parte-2', title: 'Omnichannel e Automático com IA', icon: '02' },
  { id: 3, slug: 'parte-3', title: 'Base de Conhecimento e Autoatendimento', icon: '03' },
  { id: 4, slug: 'parte-4', title: 'Métricas, Painéis e Governança', icon: '04' },
  { id: 5, slug: 'parte-5', title: 'Diagnóstico de Incidentes Técnicos', icon: '05' },
  { id: 6, slug: 'parte-6', title: 'Simulação de Atendimento Ponta a Ponta', icon: '06' },
] as const;

marked.setOptions({ gfm: true, breaks: false });

marked.use({
  renderer: {
    code({ text }: { text: string }) {
      const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="flow-block"><code>${escaped}</code></pre>`;
    },
  },
});

export function loadMarkdown(filename: string): string {
  return fs.readFileSync(path.join(contentDir, filename), 'utf-8');
}

export function markdownToHtml(md: string): string {
  return marked.parse(md) as string;
}

export function loadDocumentHtml(filename: string): string {
  return markdownToHtml(loadMarkdown(filename));
}

export function getIntroHtml(): string {
  const md = loadMarkdown(entregaFile);
  const intro = md.split(/^# Parte 1 /m)[0];
  return markdownToHtml(intro);
}

export function getParteHtml(partId: number): string | null {
  const md = loadMarkdown(entregaFile);
  const sections = md.split(/(?=^# Parte \d+)/m).filter(Boolean);
  const section = sections.find((s) => s.startsWith(`# Parte ${partId} `));
  if (!section) return null;
  return markdownToHtml(section);
}

export function getRacionalHtml(): string {
  return markdownToHtml(loadMarkdown(racionalFile));
}

export function getFullPresentationHtml(): { title: string; html: string }[] {
  return [
    { title: 'Apresentação Completa', html: loadDocumentHtml(entregaFile) },
    { title: 'Anexo — Configurações Técnicas', html: loadDocumentHtml(anexoFile) },
  ];
}

/** Contexto completo para o bot Mistral */
export function getKnowledgeBase(): string {
  const files = [entregaFile, racionalFile, anexoFile];
  const parts = files.map((f) => `=== ${f} ===\n${loadMarkdown(f)}`);
  const text = parts.join('\n\n');
  // Limite seguro para contexto (~80k chars)
  return text.length > 80000 ? text.slice(0, 80000) + '\n\n[... conteúdo truncado ...]' : text;
}
