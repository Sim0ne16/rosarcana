import {memo} from 'react';
import {AI_FRAMED, type ArtStyle} from '../styles';
import {ART_DEFS} from './defs';
import {engraving} from './engraving';
import {ILLUSTRATIONS} from './illustrations';
import {painting} from './paint';
import {stainedGlass} from './stainedGlass';

// Le illustrazioni procedurali diventano immagini (data URI) generate una volta sola:
// il browser le rasterizza e le compone come bitmap, così le animazioni restano fluide.
const cache = new Map<string, string>();

function artUri(id: string, style: ArtStyle, arch: boolean) {
    const key = `${id}|${style}|${arch}`;
    let u = cache.get(key);
    if (!u) {
        const inner = style === 'incisione' ? engraving(id) : style === 'dipinta' ? painting(id) : stainedGlass(id, {arch});
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" width="400" height="320"><defs>${ART_DEFS}</defs>${inner}</svg>`;
        u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        cache.set(key, u);
    }
    return u;
}

const IMG = {width: '100%', height: '100%', objectFit: 'cover', display: 'block'} as const;

/** Illustrazione di una carta nello stile scelto. Se manca l'immagine AI, ripiega sulla pittura procedurale. */
export const CardArt = memo(function CardArt({id, style, arch = true}: {
    id: string;
    style: ArtStyle;
    arch?: boolean
}) {
    const ai = AI_FRAMED.includes(style);
    if (ai && ILLUSTRATIONS[id]) return <img src={ILLUSTRATIONS[id]} alt="" draggable={false} style={IMG}/>;
    return <img src={artUri(id, ai ? 'dipinta' : style, arch)} alt="" draggable={false} style={IMG} decoding="async"/>;
});
export const Rose = memo(function Rose({svg, className}: { svg: string; className?: string }) {
    return <span className={className} style={{display: 'block', lineHeight: 0}}
                 dangerouslySetInnerHTML={{__html: svg}}/>;
});
