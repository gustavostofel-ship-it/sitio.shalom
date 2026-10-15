'use client';

import React from 'react';
import { Calendar, Compass, BedDouble, Church, Waves, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { SUPABASE_IMAGES } from '@/lib/site-data';

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-28 pb-12 overflow-hidden bg-[#0F291E]">
      {/* Background Photography with Warm Scrim */}
      <div className="absolute inset-0 z-0">
        <SafeImage
          src={SUPABASE_IMAGES.vistaDoAlto}
          alt="Paisagem verdejante e serena do Sítio Shalom ao entardecer"
          fill
          priority
          className="object-cover object-center scale-105 transform motion-safe:animate-pulse-slow"
        />
        {/* Measured Scrim for WCAG AA 4.5:1 Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F291E] via-[#0F291E]/75 to-[#0F291E]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,41,30,0.5)_100%)]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-10">
        <div className="max-w-3xl">
          {/* Top Trust Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium backdrop-blur-md mb-6 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Estrutura Exclusiva para Igrejas e Ministérios</span>
          </div>

          {/* Strong Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-6 drop-shadow-sm text-balance">
            O Cenário Perfeito para o Próximo Nível Espiritual da Sua Igreja.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-stone-200/95 font-normal leading-relaxed mb-8 max-w-2xl drop-shadow-xs">
            Ambiente consagrado, cercado pela exuberante natureza da serra, com estrutura completa para cultos, vigílias, ministrações, lazer sadio e hospedagem confortável para até 150 pessoas.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-stone-300/80">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              100% de Exclusividade por Igreja
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Acesso 100% Asfaltado para Ônibus
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Gerador de Emergência Próprio
            </span>
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
                  Dormitórios divididos em alas e suítes pastorais
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
                  Salão de Cultos Amplo
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Climatizado para 200 pessoas com ótima acústica
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
                  Piscina & Campo Society
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Área para batismos nas águas e lazer sadio
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
                  Cozinha & Refeitório
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Estrutura industrial completa para até 160 sentados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
