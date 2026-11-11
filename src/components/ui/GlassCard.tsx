import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'sage' | 'lavender' | 'amber' | 'peach' | 'sky';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'sage' 
}) => {
  const glowStyles = {
    sage: 'before:bg-gradient-to-br before:from-[#86EFAC]/10 before:to-transparent',
    lavender: 'before:bg-gradient-to-br before:from-[#BDB4FE]/10 before:to-transparent',
    amber: 'before:bg-gradient-to-br before:from-[#FDBA74]/10 before:to-transparent',
    peach: 'before:bg-gradient-to-br before:from-[#FDBA74]/10 before:to-transparent',
    sky: 'before:bg-gradient-to-br before:from-[#7DD3FC]/10 before:to-transparent',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/[0.03] backdrop-blur-2xl
        border border-white/[0.08]
        shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        before:absolute before:inset-0 before:pointer-events-none before:opacity-50
        ${glowStyles[glowColor]}
        transition-all duration-300 ease-out
        hover:border-white/[0.15] hover:bg-white/[0.05]
        ${className}
      `}
    >
      {/* Borda de luz perimetral superior */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
};
