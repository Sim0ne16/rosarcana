// Rettangolo interno (foro) di ogni cornice illustrata, in frazioni dell'immagine: [sinistra, alto, destra, basso].
// La carta occupa esattamente il foro e la cornice le fa da bordo all'esterno.
export const FRAME_HOLES: Record<string, [number, number, number, number]> = {
    "maestria-1": [0.0821, 0.0599, 0.9196, 0.9401],
    "maestria-2": [0.1393, 0.0982, 0.8589, 0.8992],
    "maestria-3": [0.1357, 0.0944, 0.8661, 0.9082],
    "maestria-4": [0.1125, 0.0816, 0.8875, 0.9196],
    "maestria-5": [0.0911, 0.0753, 0.9107, 0.9273],
    "maestria-6": [0.1107, 0.0842, 0.8875, 0.9209],
    "corallo": [0.1196, 0.1008, 0.875, 0.9018],
    "fornace": [0.1321, 0.0995, 0.8679, 0.9018],
    "notte": [0.0839, 0.0612, 0.9571, 0.9401],
    "radici": [0.1196, 0.0778, 0.8929, 0.9247],
    "reliquia": [0.1357, 0.0893, 0.8661, 0.9094],
    "rosone": [0.0911, 0.0676, 0.9107, 0.9324]
};
