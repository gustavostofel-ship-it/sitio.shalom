'use client';

import React, { useState } from 'react';
import { CalendarHeart, Users2, Flame, Droplets, ArrowRight, Check } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { SITE_INFO, SUPABASE_IMAGES } from '@/lib/site-data';

interface EventTypeData {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ElementType;
  badge: string;
  image: string;
  description: string;
  capacityRecommendation: string;
  keyMoments: string[];
  includedHighlights: string[];
}

export function EventTypes() {
  const eventTypes: EventTypeData[] = [
    {
      id: 'retiros-gerais',
      name: 'Retiros Espirituais da Igreja',
      shortLabel: 'Retiros Espirituais',
      icon: Flame,
      badge: 'Fim de Semana Fechado',
      image: SUPABASE_IMAGES.auditorio,
      description:
        'O refúgio que a sua igreja precisa para se afastar das distrações e mergulhar em oração, adoração e comunhão com 100% de exclusividade da propriedade.',
      capacityRecommendation: 'Atende até 150 participantes.',
      keyMoments: [
        'Cultos e ministrações no Auditório com foco espiritual',
        'Refeições e momentos de comunhão no salão com mesas',
        'Momentos de oração, reflexão e comunhão entre as famílias',
      ],
      includedHighlights: [
        'Exclusividade total para o grupo durante o período',
        'Auditório com altar, púlpito e ar-condicionado',
        'Uso completo das áreas de lazer e convivência',
      ],
    },
    {
      id: 'jovens',
      name: 'Acampamentos de Jovens & Adolescentes',
      shortLabel: 'Acampamentos de Jovens',
      icon: Users2,
      badge: 'Energia & Adoração',
      image: SUPABASE_IMAGES.campo,
      description:
        'A estrutura ideal para a juventude: espaço aberto para esportes e gincanas, campo de futebol gramado, quadra e momentos marcantes de louvor e oração no auditório.',
      capacityRecommendation: 'Hospedagem para até 150 jovens.',
      keyMoments: [
        'Torneios no campo de futebol gramado e jogos na quadra',
        'Momentos na piscina com integração de toda a mocidade',
        'Cultos de louvor e vigílias abençoadas no auditório',
      ],
      includedHighlights: [
        'Campo de futebol gramado e quadras esportivas',
        'Piscina ampla para recreação saudável',
        'Dormitórios com beliches, separados por homens e mulheres',
      ],
    },
    {
      id: 'casais',
      name: 'Encontros de Casais & Famílias',
      shortLabel: 'Encontros de Casais',
      icon: CalendarHeart,
      badge: 'Comunhão & Paz',
      image: SUPABASE_IMAGES.salao,
      description:
        'Uma atmosfera acolhedora e intimista cercada de verde, ideal para restauração de matrimônios, palestras edificantes e jantares de comunhão.',
      capacityRecommendation: 'Salão com mesas e cadeiras com ótima capacidade para acomodar os casais.',
      keyMoments: [
        'Palestras e dinâmicas realizadas no salão e no auditório',
        'Almoços e jantares de comunhão no salão de eventos',
        'Momentos de descanso e caminhada em ambiente tranquilo',
      ],
      includedHighlights: [
        'Salão aberto com mesas, cadeiras e cozinha',
        'Ambiente tranquilo e isolado para concentração',
        'Privacidade total para a programação do seu ministério',
      ],
    },
    {
      id: 'congressos',
      name: 'Imersões de Liderança, Congressos & Day Use',
      shortLabel: 'Liderança & Day Use',
      icon: Droplets,
      badge: 'Formato Flexível',
      image: SUPABASE_IMAGES.piscina,
      description:
        'Estrutura preparada para treinamentos de líderes, reuniões ministeriais de planejamento ou eventos de um único dia (negociados diretamente).',
      capacityRecommendation: 'Opções de fim de semana completo com pernoite ou dia específico sob consulta.',
      keyMoments: [
        'Reuniões e planejamentos no auditório',
        'Momentos de almoço comunitário no salão',
        'Confraternização nas áreas de lazer e piscina',
      ],
      includedHighlights: [
        'Possibilidade de negociar dia avulso conforme a necessidade',
        'Uso das instalações de culto, alimentação e lazer',
        'Atendimento direto com a administração do Sítio Shalom Xerém',
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const currentEvent = eventTypes[activeTab];

  return (
    <section id="eventos" className="py-20 sm:py-28 bg-[#F4F1EA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Retiros e Encontros Cristãos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Formatos Adaptados para Cada Ministério
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Seja para a igreja inteira, a juventude ou os casais: o Sítio Shalom Xerém oferece o ambiente certo com valor fechado de fim de semana ou formatos sob consulta.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {eventTypes.map((event, idx) => {
            const Icon = event.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1B4332] text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                <span>{event.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left Col: Photo */}
            <div className="relative min-h-[300px] lg:min-h-[460px] lg:col-span-6 overflow-hidden">
              <SafeImage
                src={currentEvent.image}
                alt={currentEvent.name}
                fill
                className="object-cover object-center"
              />
              <div className="absolute top-4 left-4 z-10 bg-[#1B4332]/90 backdrop-blur-md text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm">
                {currentEvent.badge}
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="p-6 sm:p-10 lg:col-span-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-1 block">
                  {currentEvent.shortLabel}
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3">
                  {currentEvent.name}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  {currentEvent.description}
                </p>

                {/* Capacity Note */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-stone-700 mb-6">
                  <strong>Capacidade recomendada:</strong> {currentEvent.capacityRecommendation}
                </div>

                {/* Key Moments */}
                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Destaques da Programação:
                  </h4>
                  {currentEvent.keyMoments.map((moment, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                      <span>{moment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                <a
                  href="#agendar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143627] transition-all"
                >
                  <span>Solicitar Disponibilidade</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
