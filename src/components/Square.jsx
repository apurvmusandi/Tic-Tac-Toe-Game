import React from 'react';

export default function Square({ value, onClick, disabled, isWinningSquare }) {
  // Neon glow effects based on the marker
  const colorClass = value === 'X' 
    ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' 
    : 'text-fuchsia-400 drop-shadow-[0_0_12px_rgba(232,121,249,0.8)]';
    
  const bgClass = isWinningSquare 
    ? 'bg-white/20 border-white/50 scale-105' 
    : 'bg-white/5 hover:bg-white/10 border-white/10';

  return (
    <button
      className={`aspect-square w-full rounded-2xl border backdrop-blur-sm flex items-center justify-center text-5xl sm:text-7xl font-black transition-all duration-300 ease-out ${bgClass} ${colorClass} ${
        !disabled && !value ? 'active:scale-95 cursor-pointer' : 'cursor-default'
      }`}
      onClick={onClick}
      disabled={disabled || value}
      aria-label={value ? `Square occupied by ${value}` : "Empty square"}
    >
      <span className="transform transition-transform duration-300 scale-in">
        {value}
      </span>
    </button>
  );
}