import type {ReactNode} from 'react';
import u from './ui.module.css';

/** Intestazione uniforme per tutte le sezioni. */
export function PageHeader({title, sub, children}: { title: string; sub?: ReactNode; children?: ReactNode }) {
    return (
        <header className={u.pageHead}>
            <div><h1 className={u.title}>{title}</h1>{sub && <p>{sub}</p>}</div>
            {children && <div className={u.row}>{children}</div>}
        </header>
    );
}
