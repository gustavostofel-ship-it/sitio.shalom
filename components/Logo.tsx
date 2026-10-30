import { useId } from 'react';

// Símbolo da marca: janela em arco com a paisagem do sítio (sol, serra, colinas e árvore).
// Cores e regras: docs/marca/manual-de-marca.html
export function Simbolo({ sobreEscuro = false, className = 'h-10 w-10' }: { sobreEscuro?: boolean; className?: string }) {
  const id = useId();
  const arco = 'M6 62V30a26 26 0 0 1 52 0V62Z';
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d={arco} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width="64" height="64" fill="#1B4332" />
        <circle cx="41" cy="25" r="7" fill="#D97706" />
        <path d="M6 47 19 32l9 9 12-12 18 20v13H6Z" fill="#2D6A4F" />
        <path d="M6 53C18 45 30 51 42 47c8-3 12-1 16 1v14H6Z" fill="#40916C" />
        <circle cx="17" cy="45" r="4.6" fill="#14301F" />
        <rect x="16.4" y="47" width="1.3" height="5" fill="#14301F" />
        <path d="M6 58c14-4 28 2 52-3v7H6Z" fill="#FAF8F5" />
      </g>
      <path d={arco} fill="none" stroke={sobreEscuro ? '#FAF8F5' : '#1B4332'} strokeWidth="2" />
    </svg>
  );
}

export function Logo({ sobreEscuro = false, sub = 'Xerém · Retiros & Eventos', className = '' }: { sobreEscuro?: boolean; sub?: string; className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Simbolo sobreEscuro={sobreEscuro} className="h-11 w-11" />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl font-bold tracking-tight ${sobreEscuro ? 'text-white' : 'text-[#1B4332]'}`}>Sítio Shalom</span>
        <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${sobreEscuro ? 'text-stone-300' : 'text-stone-600'}`}>{sub}</span>
      </span>
    </span>
  );
}
