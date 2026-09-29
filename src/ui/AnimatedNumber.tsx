import {animate, motion, useMotionValue, useTransform} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';

/** Numero che scorre fino al nuovo valore e pulsa quando cambia. */
export function AnimatedNumber({value}: { value: number }) {
    const mv = useMotionValue(value), text = useTransform(mv, v => Math.round(v).toLocaleString('it-IT'));
    const prev = useRef(value), [pulse, setPulse] = useState(0);
    useEffect(() => {
        if (prev.current === value) return;
        const c = animate(mv, value, {duration: 0.8, ease: [0.2, 0.8, 0.2, 1]});
        setPulse(p => p + 1);
        prev.current = value;
        return () => c.stop();
    }, [value, mv]);
    return <motion.span key={pulse} initial={{scale: pulse ? 1.25 : 1}} animate={{scale: 1}}
                        transition={{type: 'spring', stiffness: 400, damping: 14}}
                        style={{display: 'inline-block'}}>{text}</motion.span>;
}
