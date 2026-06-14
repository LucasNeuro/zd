import fs from 'node:fs';
import path from 'node:path';

const src = path.join('vitaflex-site', '.vercel', 'output');
const dest = path.join('.vercel', 'output');

if (!fs.existsSync(src)) {
  console.error('Build output não encontrado em vitaflex-site/.vercel/output');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });

console.log('Copiado vitaflex-site/.vercel/output → .vercel/output');
