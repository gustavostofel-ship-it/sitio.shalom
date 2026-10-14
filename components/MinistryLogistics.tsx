'use client';

import React from 'react';
import { Church, Bed, Flame, CheckCircle2, Volume2, Sparkles, Shield, Users, Mic2 } from 'lucide-react';
import { SafeImage } from './SafeImage';

export function MinistryLogistics() {
  const pillars = [
    {
      id: 'templo',
      title: 'Templo & Ministração',
      icon: Church,
      image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80',
      tag: 'Ambiente Consagrado',
      headline: 'Cultos e louvores sem eco, com conforto térmico e presença de Deus',
      description:
        'Salão nobre com pé-direito alto, estrutura de madeira tratada e acústica projetada para evitar reverberações incômodas. Projetado especificamente para momentos de adoração intensa e pregação da Palavra.',
      features: [
        'Capacidade confortável para até 200 pessoas sentadas em cadeiras estofadas',
        'Palco amplo com púlpito, pontos de força dedicados e tomadas estabilizadas',
        'Mesa de som de 16 canais, projetor HD de alta luminosidade e telão motorizado',
        'Ar-condicionado e ventilação cruzada para cultos em qualquer estação',
        'Iluminação dimerizável e cênica quente para criar atmosfera de oração',
      ],
      highlightBadge: 'Som & Multimídia Inclusos',
    },
    {
      id: 'hospedagem',
      title: 'Hospedagem em Comunhão',
      icon: Bed,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      tag: 'Ordem & Descanso',
      headline: 'Alas setorizadas e banheiros dimensionados para alto fluxo',
      description:
        'Sabemos que a organização dos quartos e a qualidade do banho definem a paz da liderança. Nossos blocos de alojamentos são separados por sexo e contam com suporte exclusivo para pastores e convidados especiais.',
      features: [
        'Divisão em Ala Masculina e Ala Feminina com entradas e pátios independentes',
        '4 Suítes Pastorais Privativas VIP (cama de casal queen, ar-condicionado e frigobar)',
        'Colchões densidade D33 antialérgicos e beliches reforçados em madeira maciça',
        'Baterias de banheiros com duchas aquecidas por sistema solar e a gás (sem banho frio)',
        'Armários organizadores, tomadas para carregadores em cada leito e telas nas janelas',
      ],
      highlightBadge: 'Banheiros sem Filas Pós-Culto',
    },
    {
      id: 'lazer',
      title: 'Comunhão & Lazer Integrado',
      icon: Flame,
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80',
      tag: 'Conexão & Recreação',
      headline: 'Espaço vivo para amizades que duram para a eternidade',
      description:
        'A comunhão do corpo de Cristo floresce nas conversas à beira da piscina, no futebol entre irmãos e ao redor da fogueira de testemunhos. Uma propriedade com 60.000m² de ar puro e paz.',
      features: [
        'Piscina semiolímpica com deck de solário e área com degraus para Batismos nas águas',
        'Campo de Futebol Society gramado com refletores e quadra de vôlei de areia',
        'Praça da Fogueira estilo anfiteatro para luau de jovens e vigílias estreladas',
        'Salão de jogos coberto com mesas de pebolim, tênis de mesa e bilhar',
        'Gramados planos e trilhas arborizadas para gincanas, dinâmicas e momentos a sós com Deus',
      ],
      highlightBadge: 'Batismo nas Águas com Dignidade',
    },
  ];

  return (
    <section id="espaco" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Pensado para a Logística do seu Ministério
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Tudo o que a sua liderança precisa para um evento inesquecível
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Desenvolvemos cada metro quadrado do Sítio Shalom observando as reais necessidades de pastores, líderes de mocidade e coordenadores de eventos cristãos.
          </p>
        </div>

        {/* 3 Pillar Cards in Asymmetric Flow */}
        <div className="space-y-12 sm:space-y-16">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={pillar.id}
                id={pillar.id === 'templo' ? 'culto' : pillar.id === 'hospedagem' ? 'acomodacoes' : 'lazer'}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Photo Column */}
                  <div
                    className={`relative min-h-[300px] lg:min-h-[460px] lg:col-span-6 overflow-hidden ${
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
                        <span>Pilar 0{index + 1}</span>
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
                        <span>Verificado pela equipe técnica</span>
                      </div>
                      <a
                        href="#agendar"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B4332] hover:text-[#D97706] transition-colors"
                      >
                        <span>Conferir de perto na visita</span>
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
