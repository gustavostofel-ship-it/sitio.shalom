// Brasão da marca: janela em arco com a casa, a serra, o sol e a palmeira do sítio.
// Imagem em public/brand/brasao.webp (fundo transparente). A logo completa está em public/brand/logo-completa.jpg.
// O brasão é mais largo do que alto (proporção 1312x672): a largura é dada pela classe `w-*`.
export function Simbolo({ className = 'w-20' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/brasao.webp" width={320} height={164} alt="" aria-hidden="true" className={`h-auto shrink-0 ${className}`} />
  );
}

export function Logo({ sobreEscuro = false, sub = 'Xerém · Retiros & Eventos', className = '' }: { sobreEscuro?: boolean; sub?: string; className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Simbolo className="w-[112px]" />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-xl font-bold tracking-tight ${sobreEscuro ? 'text-white' : 'text-[#1B4332]'}`}>Sítio Shalom</span>
        <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${sobreEscuro ? 'text-stone-300' : 'text-stone-600'}`}>{sub}</span>
      </span>
    </span>
  );
}
