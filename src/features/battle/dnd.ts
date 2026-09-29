/** Trova la zona di rilascio sotto il puntatore (attributo data-drop), ignorando l'elemento trascinato. */
export function dropAt(x: number, y: number, exclude?: string): string | null {
    for (const el of document.elementsFromPoint(x, y)) {
        const d = (el as HTMLElement).closest?.('[data-drop]') as HTMLElement | null;
        if (d && d.dataset.drop !== exclude) return d.dataset.drop ?? null;
    }
    return null;
}

export function pointOf(e: MouseEvent | TouchEvent | PointerEvent): [number, number] {
    if ('changedTouches' in e && e.changedTouches.length) return [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const m = e as MouseEvent;
    return [m.clientX, m.clientY];
}
