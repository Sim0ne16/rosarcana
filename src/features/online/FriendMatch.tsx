// Sala d'attesa delle sfide tra amici: chi crea la partita riceve un codice da dettare, l'amico lo inserisce.
// Ognuno gioca con il proprio mazzo attivo. Appena i due browser si collegano parte la partita (battle/store).
import {useEffect, useRef, useState} from 'react';
import {BYID} from '../../engine';
import {deckIssues} from '../../economy/decks';
import {useProfile} from '../../profile/store';
import {useT} from '../../i18n/lang';
import {W} from '../../i18n/words';
import {Modal} from '../../ui/Modal';
import {DeckSelect} from '../decks/DeckSelect';
import {useBattle} from '../battle/store';
import {cleanCode, CODE_LEN, hostGame, joinGame, type Link, NET_V, type NetError, type Pending} from './net';
import u from '../../ui/ui.module.css';
import s from './online.module.css';

const NICK_KEY = 'rosarcana-nick';
const loadNick = () => {
    try {
        return localStorage.getItem(NICK_KEY) ?? '';
    } catch {
        return '';
    }
};
const saveNick = (n: string) => {
    try {
        localStorage.setItem(NICK_KEY, n);
    } catch { /* senza memoria locale il nome vale solo per questa sfida */
    }
};

type Phase = 'menu' | 'host';

export function FriendMatch({open, onClose}: { open: boolean; onClose: () => void }) {
    const t = useT();
    const [nick, setNick] = useState(loadNick);
    const [phase, setPhase] = useState<Phase>('menu');
    const [code, setCode] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const pending = useRef<Pending | null>(null), link = useRef<Link | null>(null), started = useRef(false);

    const errText = (e: NetError | 'version' | 'left') => ({
        notfound: t('Nessuna partita con questo codice. Controlla le lettere o chiedi un codice nuovo.', 'No match with this code. Check the letters or ask for a new code.'),
        network: t('Connessione al server d\'incontro non riuscita. Controlla la rete e riprova.', 'Could not reach the matchmaking server. Check your connection and try again.'),
        browser: t('Questo browser non supporta le partite dirette (WebRTC).', 'This browser does not support direct matches (WebRTC).'),
        timeout: t('L\'amico non risponde. Controlla il codice e riprova.', 'Your friend is not answering. Check the code and try again.'),
        version: t('Tu e il tuo amico avete versioni diverse del gioco: aggiornate la pagina.', 'You and your friend have different versions of the game: reload the page.'),
        left: t('L\'amico si è scollegato prima dell\'inizio.', 'Your friend disconnected before the start.'),
        other: t('Qualcosa è andato storto con la connessione. Riprova.', 'Something went wrong with the connection. Try again.'),
    })[e];

    /** Chiude ciò che è aperto, tranne il collegamento di una partita già cominciata (ora è dello store). */
    const reset = () => {
        pending.current?.cancel();
        pending.current = null;
        if (!started.current) link.current?.close();
        link.current = null;
        setCode(null);
        setBusy(false);
    };
    useEffect(() => () => reset(), []);

    const close = () => {
        reset();
        setPhase('menu');
        setErr(null);
        onClose();
    };

    /** Il mazzo attivo se è giocabile, altrimenti un messaggio. */
    const deck = () => {
        const p = useProfile.getState(), d = p.decks.find(x => x.id === p.activeDeck);
        if (!d || deckIssues(d, p.owned).length) {
            setErr(t(W.chooseDeck));
            return null;
        }
        return d;
    };
    const name = () => {
        const n = nick.trim().slice(0, 20) || t('Sfidante', 'Challenger');
        saveNick(n);
        return n;
    };

    const host = () => {
        const d = deck();
        if (!d) return;
        const me = name();
        reset();
        setErr(null);
        setPhase('host');
        setBusy(true);
        pending.current = hostGame({
            onCode: c => {
                setCode(c);
                setBusy(false);
            },
            onLink: l => {
                link.current = l;
                l.onClose(() => {
                    if (started.current) return;
                    setErr(errText('left'));
                    reset();
                    setPhase('menu');
                });
                l.onMsg(m => {
                    if (m.t !== 'hello' || started.current) return;
                    if (m.v !== NET_V) {
                        l.send({t: 'bye', reason: 'version'});
                        setErr(errText('version'));
                        reset();
                        setPhase('menu');
                        return;
                    }
                    started.current = true;
                    useBattle.getState().startOnline({
                        link: l,
                        me: {name: me, deck: [...d.cards], custode: d.custode ?? null, deckName: d.name},
                        foe: {name: String(m.name).slice(0, 20) || t('Amico', 'Friend'), deck: m.deck.filter(id => BYID[id]).slice(0, 30), custode: m.custode ?? null}
                    });
                });
            },
            onError: e => {
                setErr(errText(e));
                reset();
                setPhase('menu');
            }
        });
    };

    const join = () => {
        const d = deck(), c = cleanCode(input);
        if (!d) return;
        if (c.length !== CODE_LEN) {
            setErr(t(`Il codice ha ${CODE_LEN} caratteri.`, `The code has ${CODE_LEN} characters.`));
            return;
        }
        const me = name();
        reset();
        setErr(null);
        setBusy(true);
        pending.current = joinGame(c, {
            onLink: l => {
                link.current = l;
                l.onClose(() => {
                    if (started.current) return;
                    setErr(errText('left'));
                    reset();
                });
                l.onMsg(m => {
                    if (m.t === 'bye') {
                        setErr(errText(m.reason === 'version' ? 'version' : 'left'));
                        reset();
                        return;
                    }
                    if (m.t !== 'start' || started.current) return;
                    started.current = true;
                    useBattle.getState().startOnline({
                        link: l,
                        me: {name: me, deck: [...d.cards], custode: d.custode ?? null, deckName: d.name},
                        foe: {name: String(m.name).slice(0, 20) || t('Amico', 'Friend'), deck: [], custode: null},
                        start: m.G
                    });
                });
                l.send({t: 'hello', v: NET_V, name: me, deck: [...d.cards], custode: d.custode ?? null});
            },
            onError: e => {
                setErr(errText(e));
                reset();
            }
        });
    };

    const copy = () => {
        if (!code) return;
        void navigator.clipboard?.writeText(code).catch(() => undefined);
    };

    return (
        <Modal open={open} onClose={close}>
            <div className={s.box}>
                <h2 className={u.title} style={{fontSize: 30}}>{t('Sfida un amico', 'Challenge a friend')}</h2>
                {phase === 'menu' && <>
                    <p className={s.blurb}>{t('Una partita diretta tra due browser, ognuno con il proprio mazzo. Niente punti né ricompense: solo l\'onore.',
                        'A direct match between two browsers, each with their own deck. No points or rewards: just honour.')}</p>
                    <label className={s.field}>
                        <span>{t('Il tuo nome', 'Your name')}</span>
                        <input value={nick} maxLength={20} placeholder={t('Sfidante', 'Challenger')} onChange={e => setNick(e.target.value)}/>
                    </label>
                    <DeckSelect/>
                    <div className={s.choices}>
                        <section className={s.choice}>
                            <h3>{t('Crea una partita', 'Create a match')}</h3>
                            <p>{t('Ricevi un codice da mandare al tuo amico.', 'Get a code to send to your friend.')}</p>
                            <button className={`${u.btn} ${u.primary}`} onClick={host}>{t('Crea', 'Create')}</button>
                        </section>
                        <section className={s.choice}>
                            <h3>{t('Hai un codice?', 'Got a code?')}</h3>
                            <label className={s.field}>
                                <input className={s.codeInput} value={input} maxLength={CODE_LEN + 2} placeholder="ABC123"
                                       aria-label={t('Codice della partita', 'Match code')} autoComplete="off" spellCheck={false}
                                       onChange={e => setInput(cleanCode(e.target.value))}
                                       onKeyDown={e => {
                                           if (e.key === 'Enter') join();
                                       }}/>
                            </label>
                            <button className={`${u.btn} ${u.primary}`} disabled={busy} onClick={join}>{busy ? t('Collegamento…', 'Connecting…') : t('Entra', 'Join')}</button>
                        </section>
                    </div>
                </>}
                {phase === 'host' && <>
                    {code ? <>
                        <p className={s.blurb}>{t('Manda questo codice al tuo amico: dovrà inserirlo in «Sfida un amico».', 'Send this code to your friend: they enter it in “Challenge a friend”.')}</p>
                        <div className={s.code}>
                            <b aria-label={t(`Codice ${code.split('').join(' ')}`, `Code ${code.split('').join(' ')}`)}>{code}</b>
                            <button className={`${u.btn} ${u.sm}`} onClick={copy}>{t('Copia', 'Copy')}</button>
                        </div>
                        <p className={s.wait} role="status">{t('In attesa del tuo amico…', 'Waiting for your friend…')}</p>
                    </> : <p className={s.wait} role="status">{t('Creo la partita…', 'Creating the match…')}</p>}
                    <div className={u.row} style={{justifyContent: 'flex-end'}}>
                        <button className={u.btn} onClick={() => {
                            reset();
                            setPhase('menu');
                        }}>{t(W.cancel)}</button>
                    </div>
                </>}
                {err && <p className={s.err} role="alert">{err}</p>}
                {phase === 'menu' && <div className={u.row} style={{justifyContent: 'flex-end'}}>
                    <button className={u.btn} onClick={close}>{t('Chiudi', 'Close')}</button>
                </div>}
            </div>
        </Modal>
    );
}
