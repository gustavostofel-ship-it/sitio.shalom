'use client';

import React from 'react';
import { Coffee, CalendarCheck2, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

export function ReservationJourney() {
  const steps = [
    {
      number: '01',
      title: 'Agende uma Visita Presencial',
      icon: Coffee,
      badge: 'Sem Compromisso',
      description:
        'Traga a comissão organizadora da igreja para conhecer o auditório de cultos, o salão com mesas, a piscina, o campo de futebol e os dormitórios.',
      perks: [
        'Apresentação de todas as instalações do sítio',
        'Avaliação dos espaços para o cronograma da sua igreja',
        'Conversa direta para esclarecer todas as dúvidas',
      ],
    },
    {
      number: '02',
      title: 'Definição da Data & Valor Fechado',
      icon: CalendarCheck2,
      badge: 'Exclusividade Total',
      description:
        'Trabalhamos com pacote de valor fechado para o fim de semana (ou negociação de dia avulso). A data fica 100% reservada para a sua congregação.',
      perks: [
        'Exclusividade total: nunca alugamos para dois grupos simultâneos',
        'Valor fechado para o período sem surpresas',
        'Flexibilidade para negociar dias avulsos sob consulta',
      ],
    },
    {
      number: '03',
      title: 'Realize um Retiro Abençoado',
      icon: HeartHandshake,
      badge: 'Foco Espiritual',
      description:
        'Com a propriedade reservada exclusivamente para a sua congregação, sua liderança tem liberdade total para focar nos cultos, comunhão e vidas.',
      perks: [
        'Auditório de cultos e salão com mesas à disposição',
        'Piscina, campo de futebol e quadra para lazer sadio',
        'Dormitórios separados (homens e mulheres) para até 150 pessoas',
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#1B4332] text-white relative overflow-hidden">
      {/* Decorative subtle texture/glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2 block">
            Processo Transparente e Sem Estresse
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight text-balance">
            A Jornada da Reserva em 3 Passos Simples
          </h2>
          <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed text-balance">
            Sabemos a responsabilidade que recai sobre o organizador. Por isso, simplificamos toda a burocracia para que o processo seja leve desde o primeiro contato.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#163828]/90 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 relative group"
              >
                <div>
                  {/* Top indicator row */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-serif font-bold text-amber-300 tabular-nums">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200 bg-emerald-900/80 px-2.5 py-1 rounded-md border border-emerald-700/40">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-200/90 leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Bullet perks */}
                  <ul className="space-y-2 mb-8 border-t border-emerald-900/80 pt-4">
                    {step.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-emerald-100/85">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step Footer action */}
                <div className="pt-2">
                  <a
                    href="#agendar"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <span>Começar pelo Passo {step.number}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner CTA in Journey */}
        <div className="mt-14 bg-gradient-to-r from-amber-600 to-[#D97706] rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl text-center sm:text-left">
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Quer consultar as datas disponíveis para este ano?
            </h4>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              Feriados prolongados e finais de semana costumam fechar com 6 a 12 meses de antecedência.
            </p>
          </div>
          <a
            href="#agendar"
            className="px-6 py-3.5 rounded-lg text-sm font-bold text-stone-900 bg-white hover:bg-stone-100 transition-all shadow-md whitespace-nowrap shrink-0"
          >
            Consultar Disponibilidade de Data
          </a>
        </div>
      </div>
    </section>
  );
}
