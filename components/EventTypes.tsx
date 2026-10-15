'use client';

import React, { useState } from 'react';
import { CalendarHeart, Users2, Flame, Droplets, Clock, ArrowRight, Check } from 'lucide-react';
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
      id: 'carnaval-semana-santa',
      name: 'Retiros Espirituais (Carnaval & Semana Santa)',
      shortLabel: 'Retiros Espirituais',
      icon: Flame,
      badge: 'Maior Procura do Ano',
      image: SUPABASE_IMAGES.salao,
      description:
        'O refúgio sagrado que sua igreja precisa para se afastar das distrações do mundo e mergulhar em oração, jejum e renovo no Espírito Santo durante os feriados prolongados.',
      capacityRecommendation: 'Ideal para 70 a 150 participantes (bloqueio exclusivo de 3 a 4 diárias).',
      keyMoments: [
        'Vigílias noturnas e madrugadas de clamor no Salão Nobre com acústica perfeita',
        'Momentos de silêncio e devocional individual no mirante e trilha da oração',
        'Batismos solenes na piscina ampla no último dia de retiro',
        'Ceia do Senhor e banquete de comunhão no refeitório',
      ],
      includedHighlights: [
        'Exclusividade 100% da chácara durante todo o feriado',
        'Gerador de emergência dedicado para os cultos',
        'Pensão completa ou uso livre da cozinha industrial',
      ],
    },
    {
      id: 'jovens',
      name: 'Acampamentos de Jovens e Adolescentes',
      shortLabel: 'Acampamentos de Jovens',
      icon: Users2,
      badge: 'Energia & Adoração',
      image: SUPABASE_IMAGES.campo,
      description:
        'A estrutura robusta que a juventude precisa para queimar por Jesus: espaço aberto para gincanas épicas, som de alta performance para louvor jovem e noites memoráveis na fogueira.',
      capacityRecommendation: 'Suporta com tranquilidade até 150 jovens em alas masculina e feminina.',
      keyMoments: [
        'Gincanas radicais nos gramados e torneios de futebol society e vôlei',
        'Cultos de louvor intensos com bateria e guitarras sem problemas de vizinhança',
        'Luau na Praça da Fogueira com violão, marshmallow e compartilhamento de testemunhos',
        'Tarde de piscina integrada com som ambiente e dinâmicas aquáticas',
      ],
      includedHighlights: [
        'Camas firmes com colchões densos e banheiros de alta pressão',
        'Área de fogueira com lenha fornecida pelo sítio',
        'Salão de jogos coberto com pebolim e tênis de mesa',
      ],
    },
    {
      id: 'casais',
      name: 'Encontros de Casais e Famílias',
      shortLabel: 'Encontros de Casais',
      icon: CalendarHeart,
      badge: 'Conforto & Intimidade',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      description:
        'Uma atmosfera acolhedora e intimista cercada de verde, desenhada para proporcionar restauração de matrimônios, palestras edificantes e jantares românticos à luz de velas.',
      capacityRecommendation: 'Configuração personalizada para até 45 casais ou famílias completas.',
      keyMoments: [
        'Jantar romântico temático montado no salão com iluminação suave e velas',
        'Palestras e ministrações com acústica intimista e climatização aconchegante',
        'Passeios matinais a dois pelos jardins e áreas de contemplação da serra',
        'Renovação de votos de casamento com registros fotográficos impecáveis',
      ],
      includedHighlights: [
        'Suítes privativas climatizadas com camas queen size',
        'Possibilidade de serviço de buffet requintado com garçons',
        'Espaço infantil seguro para monitoria das crianças durante as palestras',
      ],
    },
    {
      id: 'congressos',
      name: 'Congressos de Liderança, Louvor & Batismos',
      shortLabel: 'Congressos & Batismos',
      icon: Droplets,
      badge: 'Foco Ministerial',
      image: SUPABASE_IMAGES.piscina,
      description:
        'Infraestrutura ponta a ponta para imersões de liderança, treinamentos de obreiros, imersões de bandas de louvor e celebrações históricas de batismos nas águas.',
      capacityRecommendation: 'Opções de Day Use para até 200 pessoas ou retiro com pernoite para 150.',
      keyMoments: [
        'Batismo nas águas com ampla rampa e degraus de acesso na piscina central',
        'Workshops e treinamentos de liderança com projeção multimídia e sonorização',
        'Ensaios técnicos de bandas e ministérios de louvor no salão nobre',
        'Almoço comemorativo de confraternização no refeitório',
      ],
      includedHighlights: [
        'Vestiários amplos para troca de roupas pós-batismo',
        'Microfones sem fio e tela motorizada para apresentações',
        'Estacionamento interno com manobra fácil para vans e ônibus',
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState<string>('carnaval-semana-santa');
  const currentEvent = eventTypes.find((e) => e.id === activeTab) || eventTypes[0];

  return (
    <section id="eventos" className="py-20 sm:py-28 bg-[#F5F1EB] relative border-y border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Versatilidade Para Cada Ministério
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Tipos de Eventos que Recebemos
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Seja um acampamento vibrante com a juventude ou um retiro de oração silencioso, adaptamos os ambientes para o propósito específico da sua liderança.
          </p>
        </div>

        {/* Interactive Segmented Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 sm:mb-12 no-scrollbar gap-2">
          <div className="inline-flex p-1.5 bg-stone-200/80 rounded-xl max-w-full">
            {eventTypes.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                    isActive
                      ? 'bg-[#1B4332] text-amber-100 shadow-sm'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md p-6 sm:p-10 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Details */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-semibold mb-4">
                <span>{currentEvent.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3">
                {currentEvent.name}
              </h3>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
                {currentEvent.description}
              </p>

              {/* Recommendation pill */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-lg mb-6">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{currentEvent.capacityRecommendation}</span>
              </div>

              {/* Key Moments */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-3">
                  Momentos Inesquecíveis Deste Formato:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentEvent.keyMoments.map((moment, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 shrink-0" />
                      <span>{moment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Highlights */}
              <div className="pt-4 border-t border-stone-100 mb-6">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2.5">
                  Diferenciais Inclusos:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentEvent.includedHighlights.map((hl, hIdx) => (
                    <span
                      key={hIdx}
                      className="inline-flex items-center gap-1.5 text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-md font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {hl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <a
                href="#agendar"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] transition-colors shadow-xs"
              >
                <span>Consultar Datas Disponíveis para {currentEvent.shortLabel}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </a>
            </div>

            {/* Right Column: Visual Photo Card */}
            <div className="lg:col-span-5">
              <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden shadow-inner border border-stone-200">
                <SafeImage
                  src={currentEvent.image}
                  alt={currentEvent.name}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Sítio Shalom
                  </span>
                  <p className="text-sm font-serif font-medium mt-1 text-stone-200">
                    Ambiente consagrado para o agir de Deus na sua congregação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
