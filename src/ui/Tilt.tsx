import {motion, useMotionTemplate, useMotionValue, useSpring, useTransform} from 'framer-motion';
import type {ReactNode} from 'react';
import s from './tilt.module.css';

/** Inclinazione 3D che segue il puntatore, con riflesso di luce. */
export function Tilt({children, max = 14, className, glare = true}: {
    children: ReactNode;
    max?: number;
    className?: string;
    glare?: boolean
}) {
    const x = useMotionValue(0.5), y = useMotionValue(0.5);
    const rx = useSpring(useTransform(y, [0, 1], [max, -max]), {stiffness: 220, damping: 18});
    const ry = useSpring(useTransform(x, [0, 1], [-max, max]), {stiffness: 220, damping: 18});
    const gx = useTransform(x, v => `${v * 100}%`), gy = useTransform(y, v => `${v * 100}%`);
    const bg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,245,220,.38), transparent 55%)`;
    return (
        <motion.div className={`${s.tilt} ${className ?? ''}`} style={{rotateX: rx, rotateY: ry}}
                    onPointerMove={e => {
                        const r = e.currentTarget.getBoundingClientRect();
                        x.set((e.clientX - r.left) / r.width);
                        y.set((e.clientY - r.top) / r.height);
                    }}
                    onPointerLeave={() => {
                        x.set(0.5);
                        y.set(0.5);
                    }}>
            {children}
            {glare && <motion.div className={s.glare} style={{background: bg}} aria-hidden="true"/>}
        </motion.div>
    );
}
