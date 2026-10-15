'use client';

import React, { useState } from 'react';
import { Calendar, Compass, BedDouble, Church, Waves, UtensilsCrossed, ShieldCheck, Sparkles } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { SUPABASE_IMAGES } from '@/lib/site-data';

export function Hero() {
  const [selectedPhoto, setSelectedPhoto] = useState<'auditorio' | 'salao'>('auditorio');

  const photos = {
    auditorio: {
      url: SUPABASE_IMAGES.auditorio,
      title: 'Auditório de Cultos & Ministrações',
      tag: 'Espaço de Culto & Adoração',
      caption: 'Estrutura com altar, púlpito e ambiente consagrado para vigílias e louvores',
    },
    salao: {
      url: SUPABASE_IMAGES.salao,
      title: 'Salão com Cozinha',
      tag: 'Confraternização & Refeições',
      caption: 'Salão aberto com mesas e cadeiras e cozinha para a igreja usar',
    },
  };

  const current = photos[selectedPhoto];

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-gradient-to-b from-[#091811] via-[#0F291E] to-[#122F22]">
      {/* Subtle Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-emerald-700/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area (2-Column Grid) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Trust Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Estrutura Exclusiva para Igrejas e Retiros Cristãos</span>
            </div>

            {/* Strong Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.14] text-balance">
              O Cenário Perfeito para o Próximo Nível Espiritual da Sua Igreja.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-stone-200/90 font-normal leading-relaxed max-w-2xl">
              Ambiente de paz cercado pela natureza, com auditório para cultos, salão com mesas e cadeiras, área de lazer com piscina, campo de futebol gramado, estacionamento amplo e dormitórios para até 150 pessoas.
            </p>

            {/* Dual Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#agendar"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-base font-semibold text-white bg-[#D97706] hover:bg-[#B45309] shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Calendar className="w-5 h-5 text-amber-100" />
                <span>Agendar Visita Presencial</span>
              </a>

              <a
                href="#espaco"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-base font-medium text-stone-100 bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-xs transition-all duration-200 whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
              >
                <Compass className="w-5 h-5 text-amber-300" />
                <span>Explorar a Estrutura</span>
              </a>
            </div>

            {/* Micro trust indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300/80">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                100% de Exclusividade por Igreja
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Capacidade para até 150 Pessoas
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Pacote de Fim de Semana Fechado
              </span>
            </div>
          </div>

          {/* Right Column: High-Quality Photo Showcase with Switcher */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Photo Selector Tabs */}
            <div className="w-full flex items-center justify-center sm:justify-start gap-2 mb-3 bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
              <button
                type="button"
                onClick={() => setSelectedPhoto('auditorio')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedPhoto === 'auditorio'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Church className="w-3.5 h-3.5" />
                <span>Auditório de Cultos</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhoto('salao')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedPhoto === 'salao'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Salão com Mesas</span>
              </button>
            </div>

            {/* Photo Card Container */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/25 bg-stone-900 shadow-2xl shadow-black/60 group">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11]">
                <SafeImage
                  src={current.url}
                  alt={current.title}
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/85 backdrop-blur-md border border-emerald-400/30 text-amber-300 text-xs font-semibold shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{current.tag}</span>
                  </span>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white drop-shadow-md">
                    {current.title}
                  </h3>
                  <p className="text-xs text-stone-200/90 mt-0.5 line-clamp-2 drop-shadow-sm">
                    {current.caption}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-label */}
            <p className="text-[11px] text-stone-400 mt-2 text-center">
              Fotos reais do Sítio Shalom Xerém · Alterne entre o auditório e o salão com mesas
            </p>
          </div>

        </div>
      </div>

      {/* Quick Highlights Bar (Anchored at Hero Base) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E5E0D8] rounded-xl shadow-xl p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            {/* Item 1 */}
            <div className="flex items-center gap-3.5 sm:px-3 pt-2 sm:pt-0">
              <div className="w-11 h-11 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 leading-tight">
                  Até 150 Pessoas
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Hospedagem em comunhão
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
              <div className="w-11 h-11 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
                <Church className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 leading-tight">
                  Auditório de Cultos
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Salão dedicado para vigílias e louvores
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
              <div className="w-11 h-11 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 leading-tight">
                  Piscina, Campo & Quadra
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Lazer completo e integração saudável
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center gap-3.5 sm:px-3 pt-3 sm:pt-0">
              <div className="w-11 h-11 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900 leading-tight">
                  Salão com Mesas
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Salão aberto com cozinha
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
