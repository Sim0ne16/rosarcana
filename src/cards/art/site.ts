// Immagini del sito (ambienti, casate, custodi, avversari): ogni file in src/assets/site/<nome>.webp viene incluso al build.
const files = import.meta.glob('../../assets/site/*.{webp,png,jpg}', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, string>;
const SITE: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) SITE[path.split('/').pop()!.replace(/\.(webp|png|jpg)$/, '')] = url;
export const siteImg = (name: string): string | undefined => SITE[name];
