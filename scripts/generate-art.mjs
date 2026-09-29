// Genera le illustrazioni AI dello stile "Illustrata" leggendo art/prompts.json.
// Uso:
//   OPENAI_API_KEY=... npm run art                 (provider predefinito: OpenAI gpt-image-1)
//   ART_PROVIDER=stability STABILITY_API_KEY=... npm run art
//   npm run art -- brace-c0 marea-l0               (solo alcune carte)
//   npm run art -- --force                         (rigenera anche quelle esistenti)
// Le immagini finiscono in src/assets/art/<id>.png e il gioco le include automaticamente al build.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const cfg = JSON.parse(readFileSync(new URL('../art/prompts.json', import.meta.url), 'utf8'));
const outDir = new URL('../src/assets/art/', import.meta.url); mkdirSync(outDir, { recursive: true });
const args = process.argv.slice(2), force = args.includes('--force'), only = args.filter(a => !a.startsWith('--'));
const provider = process.env.ART_PROVIDER ?? 'openai';

async function openai(prompt) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('Manca OPENAI_API_KEY');
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1', prompt, size: '1536x1024', n: 1 }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  const j = await r.json(); return Buffer.from(j.data[0].b64_json, 'base64');
}
async function stability(prompt, negative) {
  const key = process.env.STABILITY_API_KEY; if (!key) throw new Error('Manca STABILITY_API_KEY');
  const fd = new FormData(); fd.append('prompt', prompt); fd.append('negative_prompt', negative); fd.append('aspect_ratio', '5:4'); fd.append('output_format', 'png');
  const r = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', { method: 'POST', headers: { Authorization: `Bearer ${key}`, Accept: 'image/*' }, body: fd });
  if (!r.ok) throw new Error(`Stability ${r.status}: ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

const ids = only.length ? only : Object.keys(cfg.cards);
let done = 0;
for (const id of ids) {
  const subject = cfg.cards[id]; if (!subject) { console.warn(`Nessun prompt per ${id}`); continue; }
  const file = new URL(`${id}.png`, outDir);
  if (existsSync(file) && !force) { console.log(`= ${id} (già presente)`); continue; }
  const prompt = `${cfg.style}. Subject: ${subject}.` + (provider === 'openai' ? ` Avoid: ${cfg.negative}.` : '');
  try {
    const img = provider === 'stability' ? await stability(prompt, cfg.negative) : await openai(prompt);
    writeFileSync(file, img); done++; console.log(`+ ${id}`);
  } catch (e) { console.error(`! ${id}: ${e.message}`); }
}
console.log(`Generate ${done} illustrazioni. Ora esegui npm run build.`);
