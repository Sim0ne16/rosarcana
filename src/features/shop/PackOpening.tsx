import { animate, AnimatePresence, motion, useAnimationControls, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BYID, RARITY, type Rarity } from '../../engine';
import { Card } from '../../cards/Card';
import { defaultArt } from '../../cards/styles';
import { flipSfx, sfx } from '../../audio/sfx';
import type { PackCard } from '../../economy/packs';
import { useProfile } from '../../profile/store';
import { Tilt } from '../../ui/Tilt';
import { CardBack } from '../battle/CardBack';
import { PackArt } from './PackArt';
import s from './opening.module.css';

type Phase = 'ready' | 'torn' | 'cards';
const RANK: Record<Rarity, number> = { c: 0, u: 1, r: 2, l: 3 };
const ARTS = ['vuoto-l0', 'brace-l0', 'marea-l0', 'radice-l0'];

function useStage() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => { const on = () => setW(window.innerWidth); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  const narrow = w < 700, cw = narrow ? Math.min(130, (w - 48) / 3) : Math.min(190, (Math.min(w, 1100) - 120) / 5), gap = narrow ? 10 : 22;
  const slots = Array.from({ length: 5 }, (_, i) => {
    if (!narrow) return { x: (i - 2) * (cw + gap), y: 0 };
    const row = i < 3 ? 0 : 1, col = row ? i - 3 : i, n = row ? 2 : 3;
    return { x: (col - (n - 1) / 2) * (cw + gap), y: (row - 0.5) * (cw * 1.4 + gap + 14) };
  });
  return { cw, slots, narrow };
}

/** Rito d'apertura: il sigillo si incrina, la busta esplode di luce, le carte si dispongono coperte e si girano una a una. */
export function PackOpening({ onClose }: { onClose: () => void }) {
  const packs = useProfile(p => p.packs);
  const [phase, setPhase] = useState<Phase>('ready');
  const [res, setRes] = useState<PackCard[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [legendFx, setLegendFx] = useState(0);
  const [round, setRound] = useState(0);
  const screen = useAnimationControls();
  const { cw, slots } = useStage();
  const art = round === 0 ? undefined : ARTS[round % ARTS.length];
  const best: Rarity = res.reduce<Rarity>((b, x) => (RANK[x.rar] > RANK[b] ? x.rar : b), 'c');
  const glow = RARITY[best].color;

  // --- strappo: si trascina lungo la linea tratteggiata in cima alla bustina (o si tocca) ---
  const tear = useMotionValue(0), torn = useRef(false), drag = useRef<{ x0: number; w: number; left: number } | null>(null);
  const stripRot = useTransform(tear, v => -v * 14), stripY = useTransform(tear, v => -v * 10), glowW = useTransform(tear, v => `${v * 100}%`);
  const finishTear = () => {
    if (torn.current) return; torn.current = true;
    const r = useProfile.getState().openPack(); if (!r) { torn.current = false; void animate(tear, 0); return; }
    setRes(r); setFlipped(r.map(() => false)); sfx('tear'); setPhase('torn');
    void screen.start({ x: [0, -6, 5, -3, 0], transition: { duration: 0.35 } });
    setTimeout(() => { setPhase('cards'); sfx('seal'); }, 900);
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== 'ready') return; const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    drag.current = { x0: e.clientX, w: r.width, left: r.left }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || torn.current) return;
    const v = Math.max(tear.get(), Math.min(1, (e.clientX - d.left) / d.w)); tear.set(v);
    if (Math.random() < 0.25) sfx('draw');
    if (v > 0.92) { drag.current = null; finishTear(); }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current; drag.current = null; if (!d || torn.current) return;
    if (Math.abs(e.clientX - d.x0) < 8) { void animate(tear, 1, { duration: 0.45, ease: 'easeIn', onComplete: finishTear }); return; }
    if (tear.get() > 0.6) void animate(tear, 1, { duration: 0.15, onComplete: finishTear }); else void animate(tear, 0, { type: 'spring', stiffness: 300, damping: 20 });
  };
  const flip = (i: number) => {
    if (phase !== 'cards' || flipped[i]) return;
    const x = res[i]; flipSfx(x.rar);
    setFlipped(f => f.map((v, j) => (j === i ? true : v)));
    if (x.rar === 'l') { setLegendFx(n => n + 1); void screen.start({ x: [0, -14, 12, -8, 4, 0], transition: { duration: 0.55 } }); }
  };
  const flipAll = () => res.forEach((_, i) => setTimeout(() => flip(i), i * 170));
  const next = () => { torn.current = false; tear.set(0); setPhase('ready'); setRes([]); setFlipped([]); setRound(r => r + 1); };
  const all = flipped.length > 0 && flipped.every(Boolean);
  const summary = useMemo(() => ({ nuove: res.filter(x => x.isNew).length, dust: res.reduce((a, x) => a + x.dust, 0), foil: res.filter(x => x.foil).length }), [res]);

  return (
    <motion.div className={s.back} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Apertura bustina">
      <motion.div className={s.screen} animate={screen}>
        {/* raggi di luce dietro la scena, colorati come la rarità migliore della busta */}
        <AnimatePresence>
          {(phase === 'torn' || phase === 'cards') && (
            <motion.div key={'rays' + round} className={s.rays} style={{ ['--g' as string]: glow }} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: phase === 'torn' ? 1 : 0.35, scale: 1, rotate: 360 }}
              exit={{ opacity: 0 }} transition={{ opacity: { duration: 0.5 }, scale: { duration: 0.6 }, rotate: { duration: 60, repeat: Infinity, ease: 'linear' } }} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase !== 'cards' && (
            <motion.div key={'pack' + round} className={s.packWrap} initial={{ opacity: 0, y: 60, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 260, rotate: 8, transition: { duration: 0.5, ease: 'easeIn' } }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
              <h2 className={s.title}>{phase === 'ready' ? 'Strappa la bustina' : ''}</h2>
              <motion.div className={s.packBtn} role="button" tabIndex={0} aria-label="Strappa la bustina: trascina lungo la linea in alto o tocca"
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onKeyDown={e => { if (e.key === 'Enter' && phase === 'ready') void animate(tear, 1, { duration: 0.45, onComplete: finishTear }); }}
                animate={phase === 'ready' ? { y: [0, -8, 0] } : { y: 0 }} transition={phase === 'ready' ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : {}}>
                <div className={s.packLayer}><PackArt art={art} part="bottom" /></div>
                {phase === 'torn' && <motion.div className={s.spill} style={{ ['--g' as string]: glow }} initial={{ opacity: 0, scaleY: 0.2 }} animate={{ opacity: [0, 1, 0.7], scaleY: 1 }} transition={{ duration: 0.6 }} />}
                <motion.div className={s.packLayer} style={{ rotate: stripRot, y: stripY, transformOrigin: '100% 13%' }}
                  animate={phase === 'torn' ? { x: 220, y: -320, rotate: 50, opacity: 0 } : undefined} transition={{ duration: 0.6, ease: 'easeOut' }}>
                  <PackArt art={art} part="top" />
                </motion.div>
                {phase === 'ready' && <><div className={s.tearLine} /><motion.div className={s.tearGlow} style={{ width: glowW }} /><span className={s.tearHint}>✂</span></>}
              </motion.div>
              <p className={s.muted}>{phase === 'ready' ? `Trascina lungo la linea tratteggiata, oppure tocca. Te ne restano ${packs}.` : ''}</p>
              {phase === 'ready' && <button className={s.btn} onClick={onClose}>Chiudi</button>}
            </motion.div>
          )}
        </AnimatePresence>
        {phase === 'torn' && <Sparks color={glow} n={30} />}

        {phase === 'cards' && (
          <div className={s.table}>
            {res.map((x, i) => (
              <motion.div key={round + '-' + i} className={s.slot} style={{ width: cw }}
                initial={{ x: 0, y: 60, scale: 0.35, rotate: (i - 2) * 6, opacity: 0 }}
                animate={{ x: slots[i].x, y: slots[i].y, scale: 1, rotate: 0, opacity: 1 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 170, damping: 17 }}>
                {!flipped[i] && RANK[x.rar] >= 1 && <div className={`${s.aura} ${x.rar === 'l' ? s.auraLeg : ''}`} style={{ ['--g' as string]: RARITY[x.rar].color }} />}
                <motion.button className={s.cardBtn} onClick={() => flip(i)} whileHover={!flipped[i] ? { y: -10, scale: 1.04 } : undefined}
                  aria-label={flipped[i] ? `${BYID[x.id].n}, ${RARITY[x.rar].name}` : `Carta coperta ${i + 1}, tocca per girarla`}>
                  <motion.div className={s.inner} animate={{ rotateY: flipped[i] ? 180 : 0 }} transition={{ duration: 0.7, ease: [0.3, 0.7, 0.2, 1] }}>
                    <div className={s.face}><CardBack /></div>
                    <div className={`${s.face} ${s.front}`}><Card card={BYID[x.id]} look={{ art: defaultArt(x.id), effect: x.foil ? 'luce' : null, frame: null }} /></div>
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {flipped[i] && (
                    <motion.div key="beam" className={s.beam} style={{ ['--g' as string]: RARITY[x.rar].color }} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: [0, 1, 1], opacity: [0, RANK[x.rar] >= 2 ? 0.9 : 0.45, 0] }} transition={{ duration: 1.1 }} />
                  )}
                </AnimatePresence>
                {flipped[i] && (
                  <motion.span className={`${s.tag} ${x.dust ? s.dust : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    {x.dust ? `+${x.dust} polvere` : x.foil ? 'Dorata!' : x.isNew ? 'Nuova' : RARITY[x.rar].name}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>{legendFx > 0 && <LegendBurst key={legendFx} />}</AnimatePresence>

        {phase === 'cards' && (
          <motion.div className={s.footer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {!all ? (
              <><span className={s.muted}>Tocca le carte per girarle</span><button className={s.btn} onClick={flipAll}>Gira tutte</button></>
            ) : (
              <>
                <span className={s.sum}>{summary.nuove === 1 ? '1 carta nuova' : `${summary.nuove} carte nuove`}{summary.dust ? `, ${summary.dust} polvere` : ''}{summary.foil ? `, ${summary.foil} dorata` : ''}{res.some(x => x.pity) ? '. Garanzia Leggendaria attivata' : ''}</span>
                <button className={`${s.btn} ${s.primary}`} onClick={onClose}>Continua</button>
                {packs > 0 && <button className={s.btn} onClick={next}>Apri la prossima ({packs})</button>}
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Sparks({ color, n }: { color: string; n: number }) {
  const sp = useMemo(() => Array.from({ length: n }, () => ({ a: Math.random() * Math.PI * 2, d: 140 + Math.random() * 320, sz: 3 + Math.random() * 6, r: Math.random() * 360 })), [n]);
  return <div className={s.sparks} aria-hidden="true">{sp.map((p, i) => (
    <motion.i key={i} style={{ width: p.sz, height: p.sz * 1.6, background: i % 3 ? color : '#fff4d0' }} initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d + 60, opacity: 0, rotate: p.r }} transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }} />
  ))}</div>;
}
function LegendBurst() {
  return (
    <motion.div className={s.legend} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.2, times: [0, 0.1, 0.6, 1] }} aria-hidden="true">
      <motion.div className={s.legendRays} initial={{ scale: 0.5, rotate: 0 }} animate={{ scale: 1.4, rotate: 90 }} transition={{ duration: 2.2, ease: 'easeOut' }} />
      <Sparks color="#ffcf5a" n={60} />
      <motion.span className={s.legendText} initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 2, times: [0, 0.15, 0.7, 1] }}>Leggendaria!</motion.span>
    </motion.div>
  );
}
