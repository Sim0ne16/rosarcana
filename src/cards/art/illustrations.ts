// Illustrazioni AI: ogni file in src/assets/art/<id-carta>.(webp|png|jpg) viene incluso automaticamente.
// Si generano con `npm run art` (vedi scripts/generate-art.mjs e art/prompts.json).
const files = import.meta.glob('../../assets/art/*.{webp,png,jpg}', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, string>;
export const ILLUSTRATIONS: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
    const id = path.split('/').pop()!.replace(/\.(webp|png|jpg)$/, '');
    ILLUSTRATIONS[id] = url;
}
export const hasIllustration = (id: string) => !!ILLUSTRATIONS[id];
