import fs from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function decodeEnvBuffer(buf) {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8');
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le');
  }
  if (buf.length >= 4 && buf[1] === 0x00) {
    return buf.toString('utf16le');
  }
  const utf8 = buf.toString('utf8');
  if (buf.includes(0x00) && !utf8.includes('=')) {
    return buf.toString('utf16le');
  }
  return utf8;
}

function readEnvText(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return decodeEnvBuffer(fs.readFileSync(filePath));
}

function bootstrapEnv() {
  const mode = process.env.NODE_ENV ?? 'development';
  const fromVite = loadEnv(mode, projectRoot, '');
  if (fromVite.MISTRAL_API_KEY?.trim()) {
    process.env.MISTRAL_API_KEY = fromVite.MISTRAL_API_KEY.trim();
    return;
  }

  const envFile = path.join(projectRoot, '.env');
  const text = readEnvText(envFile);
  if (!text) return;

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

bootstrapEnv();

export default defineConfig({
  integrations: [tailwind()],
  adapter: node({ mode: 'standalone' }),
  vite: {
    envDir: projectRoot,
  },
  env: {
    schema: {
      MISTRAL_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
