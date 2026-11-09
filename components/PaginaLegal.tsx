import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { SITE_INFO } from '@/lib/site-data';

// Moldura das páginas de texto (Privacidade e Termos).
export function PaginaLegal({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2937]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Voltar para a página inicial">
            <Logo />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B4332] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="font-serif text-3xl font-bold text-[#1B4332] sm:text-4xl">{titulo}</h1>
        <p className="mt-2 text-sm text-stone-600">Última atualização: {atualizado}</p>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-stone-700 [&_a]:text-[#1B4332] [&_a]:underline [&_h2]:mb-2 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:space-y-1">
          {children}
        </div>
        <p className="mt-12 border-t border-stone-200 pt-6 text-sm text-stone-600">
          Dúvidas? Fale com a gente pelo WhatsApp{' '}
          <a href={`https://wa.me/${SITE_INFO.whatsappNumber}`} className="font-semibold text-[#1B4332] underline" target="_blank" rel="noopener noreferrer">
            {SITE_INFO.displayPhone}
          </a>
          .
        </p>
      </main>
    </div>
  );
}
