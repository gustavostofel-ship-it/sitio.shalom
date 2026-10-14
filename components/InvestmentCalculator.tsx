'use client';

import React, { useState } from 'react';
import { Calculator, Users, Clock, Check, Send, Sparkles, HelpCircle } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function InvestmentCalculator() {
  const [attendees, setAttendees] = useState<number>(90);
  const [duration, setDuration] = useState<'weekend' | 'carnaval' | 'dayuse'>('weekend');
  const [cateringMode, setCateringMode] = useState<'seca' | 'completa'>('completa');

  // Realistic estimates for illustration & budgeting assistance for church committees
  // Base daily rental reference
  const baseRatePerPersonDay = cateringMode === 'completa' ? 145 : 75;
  const daysMultiplier = duration === 'carnaval' ? 4 : duration === 'weekend' ? 2.5 : 1;
  const estimatedPerPerson = Math.round(baseRatePerPersonDay * daysMultiplier);
  const estimatedTotal = estimatedPerPerson * attendees;

  const durationLabels = {
    weekend: 'Final de Semana Padrão (Sexta 18h a Domingo 17h)',
    carnaval: 'Feriado Prolongado / Carnaval (4 Diárias Completas)',
    dayuse: 'Day Use sem Pernoite (Sábado ou Domingo - 8h às 18h)',
  };

  const handleSendToWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Fiz uma simulação de orçamento no site do Sítio Shalom:\n` +
      `• Participantes estimados: ${attendees} pessoas\n` +
      `• Formato: ${durationLabels[duration]}\n` +
      `• Alimentação: ${cateringMode === 'completa' ? 'Pensão Completa (4 refeições)' : 'Locação Seca (Usar Cozinha Industrial Própria)'}\n` +
      `• Estimativa de rateio por pessoa: aprox. R$ ${estimatedPerPerson},00\n\n` +
      `Gostaria de verificar a disponibilidade de datas e receber a proposta oficial detalhada.`
    );
    window.open(`https://wa.me/${SITE_INFO.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] relative border-t border-stone-200/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg p-6 sm:p-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1B4332] text-xs font-semibold mb-3">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>Simulador de Rateio para Liderança</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Calcule a Viabilidade do Retiro da Sua Igreja
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Ajuste o número de participantes e o formato desejado para visualizar a estimativa média de investimento por acampante.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider for Attendees */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1B4332]" />
                    <span>Número de Participantes:</span>
                  </label>
                  <span className="text-lg font-bold text-[#1B4332] font-serif tabular-nums">
                    {attendees} pessoas
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  className="w-full h-2.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332]"
                />
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>Mínimo viável (30)</span>
                  <span>Capacidade média (90)</span>
                  <span>Capacidade total (150 leitos)</span>
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="text-sm font-semibold text-stone-800 block mb-2">
                  Duração do Evento:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration('weekend')}
                    className={`p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                      duration === 'weekend'
                        ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block font-bold">Fim de Semana</span>
                    <span className="text-[11px] text-stone-500">Sexta à Domingo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('carnaval')}
                    className={`p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                      duration === 'carnaval'
                        ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block font-bold">Feriado Prolongado</span>
                    <span className="text-[11px] text-stone-500">4 Diárias (Carnaval)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('dayuse')}
                    className={`p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                      duration === 'dayuse'
                        ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block font-bold">Day Use</span>
                    <span className="text-[11px] text-stone-500">Sem pernoite (1 dia)</span>
                  </button>
                </div>
              </div>

              {/* Catering mode */}
              <div>
                <label className="text-sm font-semibold text-stone-800 block mb-2">
                  Alimentação:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCateringMode('completa')}
                    className={`p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                      cateringMode === 'completa'
                        ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block font-bold">Pensão Completa</span>
                    <span className="text-[11px] text-stone-500">Café, almoço, lanche e jantar inclusos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCateringMode('seca')}
                    className={`p-3 rounded-lg text-left text-xs font-medium border transition-all ${
                      cateringMode === 'seca'
                        ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332] font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="block font-bold">Locação Seca</span>
                    <span className="text-[11px] text-stone-500">Sua igreja usa a cozinha industrial</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#1B4332] to-[#122E22] rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block mb-1">
                  Estimativa de Rateio Médio
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs text-stone-300">aprox.</span>
                  <span className="text-4xl sm:text-5xl font-serif font-bold text-amber-300 tabular-nums">
                    R$ {estimatedPerPerson}
                  </span>
                  <span className="text-sm text-emerald-100">/ pessoa</span>
                </div>

                <p className="text-xs text-emerald-100/90 leading-relaxed mb-6">
                  {cateringMode === 'completa'
                    ? 'Inclui hospedagem completa com leitos limpos, estrutura de cultos, lazer e 4 refeições fartas diárias preparadas no local.'
                    : 'Inclui hospedagem, uso exclusivo do salão de cultos, som, lazer e livre acesso à cozinha industrial para a equipe da sua igreja.'}
                </p>

                <div className="space-y-2 border-t border-emerald-800/80 pt-4 text-xs text-emerald-100">
                  <div className="flex justify-between">
                    <span>Exclusividade do Sítio:</span>
                    <span className="font-semibold text-white">Garantida (100%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salão com Som e Projeção:</span>
                    <span className="font-semibold text-white">Incluso</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parcelamento da Igreja:</span>
                    <span className="font-semibold text-amber-300">Até a data do retiro</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-800/80">
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold text-stone-900 bg-[#D97706] hover:bg-[#B45309] text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Simulação para WhatsApp</span>
                </button>
                <p className="text-[10px] text-center text-emerald-200/70 mt-2">
                  Valores estimativos. Proposta final ajustada conforme data e pacote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
