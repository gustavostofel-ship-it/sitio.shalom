'use client';

import React from 'react';
import { Church, Bed, Flame, UtensilsCrossed, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { SUPABASE_IMAGES } from '@/lib/site-data';

export function MinistryLogistics() {
  const pillars = [
    {
      id: 'auditorio',
      title: 'Auditório de Cultos & Ministração',
      icon: Church,
      image: SUPABASE_IMAGES.auditorio,
      tag: 'Espaço Consagrado',
      headline: 'Ambiente dedicado para cultos, vigílias e louvores da igreja',
      description:
        'Auditório estruturado especialmente para momentos de adoração profunda, ministração da Palavra e oração, proporcionando paz e foco espiritual para a sua congregação.',
      features: [
        'Altar com púlpito para preletores e equipe de louvor',
        'Capacidade para até 150 pessoas',
        'Ar-condicionado',
        'Ambiente tranquilo e silencioso para oração e vigílias',
      ],
      highlightBadge: 'Ambiente de Adoração & Oração',
    },
    {
      id: 'salao',
      title: 'Área Gourmet e Salão',
      icon: UtensilsCrossed,
      image: SUPABASE_IMAGES.salao,
      tag: 'Comunhão & Refeições',
      headline: 'Área gourmet com churrasqueira, salão com mesas e cozinha para a igreja usar',
      description:
        'Área externa coberta com churrasqueira, pia e freezer, além do salão com mesas e cadeiras e da cozinha à disposição. A igreja organiza e prepara as próprias refeições.',
      features: [
        'Área externa coberta com churrasqueira, pia e freezer',
        'Salão com mesas e cadeiras',
        'Cozinha para a igreja utilizar',
        'O sítio não fornece refeições: a igreja realiza tudo',
        'Espaço para dinâmicas, encontros e palestras',
      ],
      highlightBadge: 'Confraternização & Comunhão',
    },
    {
      id: 'hospedagem',
      title: 'Hospedagem em Comunhão',
      icon: Bed,
      image: SUPABASE_IMAGES.dormitorio,
      tag: 'Descanso dos Acampantes',
      headline: 'Dormitórios separados para homens e mulheres',
      description:
        'Dormitórios com beliches, separados por homens e mulheres, para acolher os participantes do seu retiro.',
      features: [
        'Dormitórios com beliches, separados por homens e mulheres',
        'Ventiladores nos dormitórios',
        'Dormitórios com banheiro e chuveiro quente',
        'Mais de 4 banheiros espalhados pelo sítio',
      ],
      highlightBadge: 'Até 150 Pessoas',
    },
    {
      id: 'lazer',
      title: 'Área de Lazer',
      icon: Flame,
      image: SUPABASE_IMAGES.piscina,
      tag: 'Recreação Saudável',
      headline: 'Lazer e integração para jovens, famílias e crianças',
      description:
        'A comunhão do corpo de Cristo floresce nas conversas à beira da piscina, no futebol entre irmãos e nas atividades esportivas integradas.',
      features: [
        'Piscina ampla para recreação e momentos da igreja',
        'Campo de futebol gramado, para torneios e gincanas',
        'Estacionamento amplo, com bom espaço para organização',
        'Área ao ar livre para caminhadas e momentos de reflexão',
      ],
      highlightBadge: 'Lazer & Estacionamento',
    },
  ];

  return (
    <section id="espaco" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Estrutura Completa do Sítio Shalom Xerém
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Tudo o que sua congregação precisa para um evento abençoado
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Cada espaço do Sítio Shalom Xerém foi pensado para proporcionar comunhão, momentos de culto e um retiro inesquecível com 100% de exclusividade.
          </p>
        </div>

        {/* 4 Pillar Cards in Asymmetric Flow */}
        <div className="space-y-12 sm:space-y-16">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={pillar.id}
                id={pillar.id === 'auditorio' ? 'culto' : pillar.id === 'hospedagem' ? 'acomodacoes' : pillar.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Photo Column */}
                  <div
                    className={`relative min-h-[300px] lg:min-h-[440px] lg:col-span-6 overflow-hidden ${
                      isReversed ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <SafeImage
                      src={pillar.image}
                      alt={pillar.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 z-10 bg-[#1B4332]/90 backdrop-blur-md text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{pillar.highlightBadge}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 z-10 lg:hidden text-white">
                      <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">{pillar.tag}</span>
                      <h3 className="text-xl font-serif font-bold">{pillar.title}</h3>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div
                    className={`p-6 sm:p-8 lg:p-10 lg:col-span-6 flex flex-col justify-between ${
                      isReversed ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <div>
                      {/* Editorial Tag */}
                      <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2">
                        <span>{pillar.tag}</span>
                        <span>·</span>
                        <span>Espaço 0{index + 1}</span>
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                          {pillar.title}
                        </h3>
                      </div>

                      {/* Lead Headline */}
                      <p className="text-base font-semibold text-[#1B4332] mb-3">
                        {pillar.headline}
                      </p>

                      {/* Paragraph */}
                      <p className="text-sm text-stone-600 leading-relaxed mb-6">
                        {pillar.description}
                      </p>

                      {/* Bullet list */}
                      <ul className="space-y-2.5 mb-8">
                        {pillar.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-sm text-stone-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action inside card */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>Visita presencial sem compromisso</span>
                      </div>
                      <a
                        href="#agendar"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B4332] hover:text-[#D97706] transition-colors"
                      >
                        <span>Conhecer pessoalmente</span>
                        <span aria-hidden="true">&rarr;</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
