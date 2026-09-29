// Estrae dal pacchetto @iconify-json/game-icons solo le icone usate dalle carte
// e genera src/cards/art/icons.generated.ts. Icone: game-icons.net, licenza CC BY 3.0.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const set = JSON.parse(readFileSync(require.resolve('@iconify-json/game-icons/icons.json'), 'utf8'));
const map = JSON.parse(readFileSync(new URL('../art/icon-map.json', import.meta.url), 'utf8'));
const out = {};
for (const [card, icon] of Object.entries(map)) {
  const body = set.icons[icon]?.body;
  if (!body) throw new Error(`Icona mancante: ${icon} per ${card}`);
  out[card] = [...body.matchAll(/d="([^"]+)"/g)].map(m => m[1]).join(' ');
}
writeFileSync(new URL('../src/cards/art/icons.generated.ts', import.meta.url),
  `// File generato da scripts/extract-icons.mjs: non modificare a mano.\n// Icone di game-icons.net (Lorc, Delapouite e altri), licenza CC BY 3.0.\nexport const ICONS: Record<string, string> = ${JSON.stringify(out)};\n`);
console.log(`Estratte ${Object.keys(out).length} icone.`);
