import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const utilsDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(utilsDir, '..', '..');
const projectRoot = path.resolve(siteRoot, '..');

export const envSearchPaths = [
  path.join(projectRoot, '.env'),
  path.join(siteRoot, '.env'),
];

function decodeEnvBuffer(buf: Buffer): string {
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString('utf8');
  }
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString('utf16le');
  }
  // UTF-16 LE sem BOM (Notepad do Windows)
  if (buf.length >= 4 && buf[1] === 0x00) {
    return buf.toString('utf16le');
  }
  const utf8 = buf.toString('utf8');
  if (buf.includes(0x00) && !utf8.includes('=')) {
    return buf.toString('utf16le');
  }
  return utf8;
}

function readEnvText(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return decodeEnvBuffer(fs.readFileSync(filePath));
}

export function parseEnvFile(filePath: string): Record<string, string> {
  const text = readEnvText(filePath);
  if (!text) return {};

  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) out[key] = value;
  }
  return out;
}

export function loadMistralApiKey(): string | undefined {
  if (process.env.MISTRAL_API_KEY?.trim()) {
    return process.env.MISTRAL_API_KEY.trim();
  }

  for (const envPath of envSearchPaths) {
    const vars = parseEnvFile(envPath);
    if (vars.MISTRAL_API_KEY?.trim()) {
      const key = vars.MISTRAL_API_KEY.trim();
      process.env.MISTRAL_API_KEY = key;
      return key;
    }
  }

  return undefined;
}

export function getMistralApiKey(fromAstro?: string): string | undefined {
  if (fromAstro?.trim()) return fromAstro.trim();
  return loadMistralApiKey();
}
