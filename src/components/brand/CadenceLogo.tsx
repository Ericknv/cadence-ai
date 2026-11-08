import React from 'react';

interface CadenceLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const CadenceLogo: React.FC<CadenceLogoProps> = ({
  className = '',
  size = 28,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Símbolo: Anel Vítreo + Onda Senoidal + Micro-ponto */}
      <div 
        className="relative flex items-center justify-center rounded-full bg-slate-900/60 border border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Anel de refração interno */}
          <circle cx="50" cy="50" r="44" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1.5" />
          
          {/* Micro-ponto de Foco (Ápice) */}
          <circle cx="50" cy="32" r="3.5" fill="#86EFAC" className="animate-pulse" />
          <circle cx="50" cy="32" r="7" stroke="rgba(134, 239, 172, 0.3)" strokeWidth="1" />

          {/* Onda Senoidal Suave (Steady Cycle) */}
          <path
            d="M 18 58 C 30 58, 38 42, 50 42 C 62 42, 70 58, 82 58"
            stroke="url(#cadence-wave-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Preenchimento sutil sob a crista */}
          <path
            d="M 18 58 C 30 58, 38 42, 50 42 C 62 42, 70 58, 82 58 L 82 72 C 70 72, 62 66, 50 66 C 38 66, 30 72, 18 72 Z"
            fill="url(#cadence-glow-gradient)"
            opacity="0.35"
          />

          <defs>
            <linearGradient id="cadence-wave-gradient" x1="18" y1="50" x2="82" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#86EFAC" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="cadence-glow-gradient" x1="50" y1="42" x2="50" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" stopOpacity="0.6" />
              <stop offset="1" stopColor="#090B0E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold tracking-[0.18em] text-slate-100 uppercase">
            Cadence
          </span>
          <span className="font-mono text-[8px] tracking-[0.14em] text-slate-400 uppercase -mt-0.5">
            PCP Cognitivo
          </span>
        </div>
      )}
    </div>
  );
};
