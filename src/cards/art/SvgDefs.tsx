// Gradienti e tratteggi condivisi da tutte le illustrazioni procedurali.
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="vgLight" cx="50%" cy="6%" r="100%"><stop offset="0" stopColor="#fff6d8" stopOpacity=".42" /><stop offset=".45" stopColor="#fff" stopOpacity=".05" /><stop offset="1" stopColor="#000" stopOpacity=".42" /></radialGradient>
        <linearGradient id="vgShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".2" /><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".38" /></linearGradient>
        <radialGradient id="vgLightR" cx="40%" cy="30%" r="75%"><stop offset="0" stopColor="#fff" stopOpacity=".3" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".3" /></radialGradient>
        <radialGradient id="paperTone" cx="50%" cy="45%" r="75%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#5a3a14" stopOpacity=".28" /></radialGradient>
        <pattern id="hatchFine" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="1.6" stroke="#2a2118" strokeWidth=".35" opacity=".55" /></pattern>
        <pattern id="hatchIcon" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><line x1="0" y1="0" x2="0" y2="34" stroke="#2a2118" strokeWidth="7" opacity=".38" /></pattern>
        {/* Statistiche e rarità */}
        <linearGradient id="gemCost" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe6ff" /><stop offset=".35" stopColor="#4d8ae0" /><stop offset="1" stopColor="#10286a" /></linearGradient>
        <radialGradient id="gemAtk" cx="38%" cy="30%" r="80%"><stop offset="0" stopColor="#fff0c0" /><stop offset=".4" stopColor="#e39b2f" /><stop offset="1" stopColor="#6d3606" /></radialGradient>
        <radialGradient id="gemHp" cx="38%" cy="28%" r="85%"><stop offset="0" stopColor="#ffc0c0" /><stop offset=".45" stopColor="#c8323a" /><stop offset="1" stopColor="#5b0a10" /></radialGradient>
        <linearGradient id="rar-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6e3dc" /><stop offset="1" stopColor="#7a766c" /></linearGradient>
        <linearGradient id="rar-u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b8f5d6" /><stop offset="1" stopColor="#1f7a50" /></linearGradient>
        <linearGradient id="rar-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8e2ff" /><stop offset="1" stopColor="#2458b8" /></linearGradient>
        <linearGradient id="rar-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1b0" /><stop offset=".5" stopColor="#f2a52a" /><stop offset="1" stopColor="#9a4f06" /></linearGradient>
        {/* Stile Dipinta */}
        <filter id="pBrush" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="2" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="2.8" xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id="pGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id="pCanvas" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.3 0.8" numOctaves="2" seed="3" /><feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.09  0 0 0 0 0.06  0.9 0 0 0 -0.35" /></filter>
        <linearGradient id="pFigLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".32" /><stop offset=".45" stopColor="#fff" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
        <radialGradient id="pVignette" cx="50%" cy="45%" r="70%"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" /></radialGradient>
      </defs>
    </svg>
  );
}
