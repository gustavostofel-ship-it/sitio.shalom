'use client';

import React from 'react';
import { Quote, Star, ShieldCheck, Users, Calendar, Building2 } from 'lucide-react';
import { TESTIMONIALS, SITE_INFO } from '@/lib/site-data';
import { SafeImage } from './SafeImage';

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Prova Social & Depoimentos Reais
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            A Confiança de Pastores e Líderes que Já Viveram Essa Experiência
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Mais de uma década recebendo congregações evangélicas de todas as denominações com respeito, dedicação e zelo.
          </p>
        </div>

        {/* Quantified Rigor Trust Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
          <div className="text-center p-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1B4332] tabular-nums">
              +12
            </span>
            <span className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mt-1">
              Anos de História
            </span>
            <p className="text-xs text-stone-600 mt-0.5">Exclusivo para ministérios</p>
          </div>
          <div className="text-center p-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1B4332] tabular-nums">
              +480
            </span>
            <span className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mt-1">
              Retiros Realizados
            </span>
            <p className="text-xs text-stone-600 mt-0.5">Jovens, casais e igrejas</p>
          </div>
          <div className="text-center p-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1B4332] tabular-nums">
              100%
            </span>
            <span className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mt-1">
              Exclusividade por Data
            </span>
            <p className="text-xs text-stone-600 mt-0.5">Nunca dividimos o espaço</p>
          </div>
          <div className="text-center p-2">
            <span className="text-3xl sm:text-4xl font-serif font-bold text-[#1B4332] tabular-nums">
              150
            </span>
            <span className="block text-xs uppercase tracking-wider text-stone-500 font-semibold mt-1">
              Capacidade em Leitos
            </span>
            <p className="text-xs text-stone-600 mt-0.5">Alas masculinas e femininas</p>
          </div>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div>
                {/* Header Stars + Quote Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-stone-200" />
                </div>

                {/* Event Context badge text */}
                <div className="text-xs text-[#D97706] font-semibold mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.event} ({t.attendees} participantes)</span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-stone-700 text-sm leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-emerald-100">
                  <SafeImage
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900 leading-tight">
                    {t.name}
                  </h4>
                  <p className="text-xs text-[#1B4332] font-medium">
                    {t.role}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {t.church} · {t.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
