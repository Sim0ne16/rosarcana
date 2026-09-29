import { create } from 'zustand';
import { Confirm } from './Confirm';

/** Richiesta di conferma per un acquisto: ogni spesa di oro, gemme, polvere o gettoni passa da qui. */
interface Req { title: string; text: string; label: string; onConfirm: () => void }
const useBuy = create<{ req: Req | null }>(() => ({ req: null }));
export const askBuy = (req: Req) => useBuy.setState({ req });
export function ConfirmBuyHost() {
  const req = useBuy(s => s.req);
  return <Confirm open={!!req} title={req?.title ?? ''} text={req?.text ?? ''} confirmLabel={req?.label ?? 'Conferma'} onConfirm={() => req?.onConfirm()} onClose={() => useBuy.setState({ req: null })} />;
}
