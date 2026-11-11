'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Compass, BedDouble, Church, Waves, UtensilsCrossed, ShieldCheck, Play, Volume2, VolumeX } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { FOTOS, VIDEO_HOME } from '@/lib/site-data';

export function Hero() {
  const [pronto, setPronto] = useState(false); // a página já desenhou: pode montar o vídeo
  const [automatico, setAutomatico] = useState(true); // false = economia de dados ou pouco movimento: espera o clique
  const [apareceu, setApareceu] = useState(false); // o primeiro quadro já chegou
  const [mudo, setMudo] = useState(true);
  const [erro, setErro] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  // Monta o vídeo só depois que a página já renderizou, para não travar o celular.
  // Com "economia de dados" ligada no aparelho, ou "reduzir movimento", ele só toca se a pessoa clicar.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const economia = !!conexao?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setAutomatico(!economia);
      setPronto(true);
    }, 300);
    return () => window.clearTimeout(t);
  }, []);

  const tocar = () => {
    setAutomatico(true);
    video.current?.play().catch(() => setErro(true));
  };

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
          <div className="lg:col-span-6 space-y-6">
            {/* Top Trust Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 text-sm sm:text-sm font-medium backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Estrutura Exclusiva para Igrejas e Retiros Cristãos</span>
            </div>

            {/* Strong Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.14] text-balance">
              Um lugar de paz e comunhão para o retiro ou evento da sua igreja.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-stone-200/90 font-normal leading-relaxed max-w-2xl">
              Ambiente de paz cercado pela natureza, com auditório para cultos, salão com mesas e cadeiras, área de lazer com piscina, campo de futebol gramado, estacionamento amplo e dormitórios para até 150 pessoas.
            </p>

            {/* Dual Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a
                href="#agendar"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-base font-semibold text-white bg-[#B45309] hover:bg-[#92400E] shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
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
            <div className="pt-2 flex flex-wrap items-center gap-4 text-sm text-stone-300/80">
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

          {/* Right Column: Vídeo institucional */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/25 bg-stone-900 shadow-2xl shadow-black/60">
              <div className="relative w-full aspect-video">
                {/* Enquanto o vídeo não chega (ou se falhar), aparece uma foto do sítio */}
                <SafeImage
                  src={FOTOS.campo}
                  alt="Vista do Sítio Shalom Xerém"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className={`object-cover transition-opacity duration-500 ${apareceu && !erro ? 'opacity-0' : 'opacity-100'}`}
                />
                {pronto && !erro && (
                  <video
                    ref={video}
                    src={`${VIDEO_HOME.url}#t=0.1`}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${apareceu ? 'opacity-100' : 'opacity-0'}`}
                    autoPlay={automatico}
                    muted={mudo}
                    loop
                    playsInline
                    preload={automatico ? 'auto' : 'metadata'}
                    aria-label="Vídeo institucional do Sítio Shalom Xerém"
                    onLoadedData={() => setApareceu(true)}
                    onError={() => setErro(true)}
                  />
                )}
                {pronto && !erro && !automatico && (
                  <button
                    type="button"
                    onClick={tocar}
                    className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors focus-visible:outline-2 focus-visible:outline-amber-300"
                    aria-label="Assistir ao vídeo"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#1B4332] shadow-lg">
                      <Play className="h-7 w-7 translate-x-0.5" />
                    </span>
                  </button>
                )}
                {pronto && !erro && automatico && apareceu && (
                  <button
                    type="button"
                    onClick={() => setMudo((m) => !m)}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-xs hover:bg-black/70 transition-colors focus-visible:outline-2 focus-visible:outline-amber-300"
                    aria-label={mudo ? 'Ativar o som do vídeo' : 'Desativar o som do vídeo'}
                  >
                    {mudo ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </div>
            <p className="text-[13px] text-stone-400 mt-2 text-center">
              Conheça o Sítio Shalom Xerém
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
                <p className="text-sm text-stone-600 mt-0.5">
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
                <p className="text-sm text-stone-600 mt-0.5">
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
                <p className="text-sm text-stone-600 mt-0.5">
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
                <p className="text-sm text-stone-600 mt-0.5">
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
