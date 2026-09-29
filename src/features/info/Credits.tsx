import {PageHeader} from '../../ui/PageHeader';
import u from '../../ui/ui.module.css';

/** Crediti, licenze e note legali del prototipo. */
export function Credits({back}: { back: () => void }) {
    const sec = (t: string, body: JSX.Element) => <section className={u.panel} style={{marginBottom: 14}}><h2
        style={{fontSize: 26}}>{t}</h2>{body}</section>;
    return (
        <section className={u.page}>
            <PageHeader title="Crediti e note legali"
                        sub="Rosarcana è un prototipo. Queste informazioni vanno riviste da un professionista prima di una pubblicazione commerciale.">
                <button className={u.btn} onClick={back}>← Gioca</button>
            </PageHeader>
            {sec('Illustrazioni', <>
                <p>Le illustrazioni delle carte, dei Custodi e degli ambienti sono state generate con strumenti di
                    intelligenza artificiale e selezionate dall'autore del gioco. In molti ordinamenti le immagini
                    generate interamente da AI non sono tutelate dal diritto d'autore: altri potrebbero
                    riutilizzarle.</p>
                <p>Le illustrazioni procedurali (stili Dipinta, Vetrata, Incisione) sono generate dal codice del
                    gioco.</p>
            </>)}
            {sec('Icone', <p>Le figure delle parole chiave e le icone dell'interfaccia derivano
                da <b>game-icons.net</b> (autori Lorc, Delapouite e altri), con licenza Creative Commons Attribution 3.0
                (CC BY 3.0).</p>)}
            {sec('Caratteri tipografici', <p>Grenze Gotisch e Alegreya Sans, distribuiti tramite Google Fonts con
                licenza SIL Open Font License 1.1.</p>)}
            {sec('Software', <p>React, Framer Motion, Zustand e Vite (licenza MIT); d3-delaunay (licenza ISC). Suoni
                sintetizzati dal gioco con la Web Audio API.</p>)}
            {sec('Storie e ispirazioni', <p>La lore delle carte si ispira liberamente a miti, leggende e opere di
                pubblico dominio (mitologia greca e norrena, folclore europeo, Mille e una notte, Shakespeare e altri).
                I nomi delle fonti sono citati in ogni carta alla voce "Ispirata a".</p>)}
            {sec('Marchio', <p>"Rosarcana" è un nome di lavoro. Prima di un uso commerciale va verificata la
                disponibilità del marchio nei registri pertinenti (per esempio EUIPO e UIBM) e nelle categorie dei
                videogiochi.</p>)}
            {sec('Acquisti e probabilità', <p>Le gemme in questo prototipo sono simulate e non comportano pagamenti
                reali. Le probabilità delle bustine e le garanzie sono pubblicate nel negozio.</p>)}
        </section>
    );
}
