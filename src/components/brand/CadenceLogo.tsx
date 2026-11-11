import React from 'react';

interface CadenceLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  /** Texto secundário abaixo da marca (ex.: "Hub Cognitivo"). */
  subtitle?: string;
}

export const CadenceLogo: React.FC<CadenceLogoProps> = ({
  className = '',
  size = 28,
  showText = true,
  subtitle = 'Hub Cognitivo',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Moldura vítrea + anel de glow */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="absolute -inset-1 rounded-full bg-emerald-400/20 blur-md" aria-hidden="true" />
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0E1319] border border-[#88C0A8]/40 ring-1 ring-white/10 shadow-[0_0_18px_rgba(136,192,168,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <img
            src="/cadence-logo.png"
            alt="Cadence AI"
            width={size}
            height={size}
            draggable={false}
            className="w-full h-full object-cover scale-[1.04]"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-sm font-bold tracking-tight text-slate-100">
            Cadence<span className="text-[#88C0A8]"> AI</span>
          </span>
          {subtitle && (
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500 mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
