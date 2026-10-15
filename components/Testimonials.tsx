'use client';

import React from 'react';
import { ShieldCheck, Users, Calendar, HeartHandshake, Church, Sparkles } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function Testimonials() {
  const differentials = [
    {
      icon: ShieldCheck,
      title: '100% de Exclusividade',
      subtitle: 'Uma única igreja por data',
      description:
        'Nunca dividimos o sítio com outros grupos. No período do seu retiro, todos os espaços (auditório, salão, piscina, campo e alojamentos) são de uso 100% exclusivo da sua congregação.',
    },
    {
      icon: Users,
      title: 'Capacidade até 150 Pessoas',
      subtitle: 'Hospedagem em comunhão',
      description:
        'Estrutura para receber até 150 pessoas, com dormitórios com beliches separados para homens e mulheres.',
    },
    {
      icon: Calendar,
      title: 'Valor Fechado de Fim de Semana',
      subtitle: 'Pacote completo e sem surpresas',
      description:
        'Trabalhamos com modelo de valor fechado para o fim de semana (geralmente sexta a domingo). E se a sua igreja precisar de apenas um dia específico, negociamos diretamente com você.',
    },
    {
      icon: Church,
      title: 'Auditório Dedicado para Cultos',
      subtitle: 'Foco espiritual garantido',
      description:
        'Um espaço separado e preparado com altar e púlpito para que sua liderança possa realizar cultos, vigílias e louvores sem interferências externas.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Garantias e Transparência
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Por que escolher o Sítio Shalom
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Uma propriedade preparada para receber a sua igreja.
          </p>
        </div>

        {/* 4 Trust Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {differentials.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B4332] border border-emerald-100 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-[#D97706] font-semibold uppercase tracking-wider block mb-1">
                    {item.subtitle}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug mb-3">
                    {item.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invitation Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B4332] to-[#0F291E] text-white p-8 sm:p-10 text-center max-w-4xl mx-auto shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-xs">
            <HeartHandshake className="w-4 h-4" />
            <span>Visita Presencial sem Compromisso</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
            Venha Conhecer Pessoalmente com Sua Liderança
          </h3>
          <p className="text-stone-200 text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            Nada substitui caminhar pelos espaços, conferir o auditório, o salão, a piscina e os dormitórios. Agende uma visita para conversarmos sobre a melhor data para a sua igreja.
          </p>
          <a
            href="#agendar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] shadow-lg transition-all active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Visita com a Comissão</span>
          </a>
        </div>

      </div>
    </section>
  );
}
