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
    <span className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Menor no celular: com 112px o botão do menu saía da tela em aparelhos de 375px */}
      <Simbolo className="w-[56px] min-[360px]:w-[72px] sm:w-[112px]" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`font-serif text-lg font-bold tracking-tight sm:text-xl ${sobreEscuro ? 'text-white' : 'text-[#1B4332]'}`}>Sítio Shalom</span>
        <span className={`mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[13px] sm:tracking-[0.2em] ${sobreEscuro ? 'text-stone-300' : 'text-stone-600'}`}>{sub}</span>
      </span>
    </span>
  );
}
