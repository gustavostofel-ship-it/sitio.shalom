// Símbolo da marca (arco, sol e colinas). Cores e regras: docs/marca/manual-de-marca.html
export function Simbolo({ sobreEscuro = false, className = 'h-10 w-10' }: { sobreEscuro?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M8 60V30a24 24 0 0 1 48 0V60Z" fill={sobreEscuro ? '#FAF8F5' : '#1B4332'} />
      <circle cx="32" cy="35" r="9" fill="#D97706" />
      <path d="M8 60V50C17 43 25 46 32 49C40 45 48 43 56 49V60Z" fill={sobreEscuro ? '#1B4332' : '#FAF8F5'} />
    </svg>
  );
}

export function Logo({ sobreEscuro = false, sub = 'Xerém · Retiros & Eventos', className = '' }: { sobreEscuro?: boolean; sub?: string; className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Simbolo sobreEscuro={sobreEscuro} className="h-10 w-10" />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl font-bold tracking-tight ${sobreEscuro ? 'text-white' : 'text-[#1B4332]'}`}>Sítio Shalom</span>
        <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${sobreEscuro ? 'text-stone-300' : 'text-stone-600'}`}>{sub}</span>
      </span>
    </span>
  );
}
