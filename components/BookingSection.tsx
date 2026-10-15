'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2, MessageSquare, Coffee } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function BookingSection() {
  const [formData, setFormData] = useState({
    leaderName: '',
    churchName: '',
    whatsapp: '',
    rentalFormat: 'Fim de Semana Fechado (Sexta a Domingo)',
    attendeesRange: '50 a 100 pessoas',
    targetDate: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Format phone number as user types (BR mask)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, whatsapp: formatted }));
    if (value.length >= 10) {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rawDigits = formData.whatsapp.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setPhoneError('Por favor, informe um WhatsApp válido com DDD (mínimo 10 dígitos).');
      return;
    }

    // Format WhatsApp message
    const message = encodeURIComponent(
      `*SOLICITAÇÃO DE VISITA E ORÇAMENTO - SÍTIO SHALOM XERÉM*\n\n` +
      `👤 *Líder / Pastor:* ${formData.leaderName}\n` +
      `⛪ *Igreja / Ministério:* ${formData.churchName}\n` +
      `📱 *WhatsApp:* ${formData.whatsapp}\n` +
      `📅 *Formato de Locação:* ${formData.rentalFormat}\n` +
      `👥 *Público Estimado:* ${formData.attendeesRange} (Capacidade máx. 150)\n` +
      `🗓️ *Data / Mês Pretendido:* ${formData.targetDate || 'A combinar'}\n` +
      (formData.notes ? `📝 *Observações:* ${formData.notes}\n\n` : '\n') +
      `Olá! Gostaria de agendar uma visita com a comissão para conhecer o sítio e consultar os valores da data.`
    );

    // Open WhatsApp in new tab
    const url = `https://wa.me/${SITE_INFO.whatsappNumber}?text=${message}`;
    window.open(url, '_blank');

    setSubmitted(true);
  };

  return (
    <section id="agendar" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Atendimento Direto à Liderança
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Agende uma Visita & Consulte a Sua Data
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Traga sua comissão organizadora para conhecer pessoalmente o auditório, o salão com mesas, a piscina, o campo e os dormitórios.
          </p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Convincing Copy, Location & Perks */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Invitation Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">
                    Visita Presencial sem Compromisso
                  </h3>
                  <span className="text-xs text-stone-500">Agende um café com a comissão da igreja</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Nada substitui o contato pessoal para sentir a tranquilidade do sítio, conferir a estrutura do auditório de cultos e ver de perto as acomodações para sua congregação.
              </p>

              <div className="space-y-3 border-t border-stone-100 pt-5 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Exclusividade Total:</strong>
                    <span className="text-xs text-stone-600">Nunca alugamos para dois ministérios simultâneos. Toda a propriedade fica reservada para seu grupo.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Modelo de Fim de Semana Fechado:</strong>
                    <span className="text-xs text-stone-600">Locação por valor fechado de sexta a domingo, ou negociação direta para dias avulsos.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-[#1B4332] text-white rounded-2xl p-6 shadow-md border border-emerald-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                  Atendimento WhatsApp
                </span>
              </div>

              <p className="text-sm text-emerald-100/90 mb-4 leading-relaxed">
                Prefere conversar diretamente pelo WhatsApp para tirar dúvidas ou solicitar a localização para a visita?
              </p>

              <a
                href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20consultar%20a%20disponibilidade%20do%20Sítio%20Shalom%20para%20o%20retiro%20da%20minha%20igreja.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-semibold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#1B4332]" />
                <span>Conversar pelo WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Right Column: Smart Conversion Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl p-6 sm:p-10 relative">
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  Consultar Disponibilidade ou Agendar Visita
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Preencha os dados abaixo. Nós preparamos a mensagem personalizada para você enviar diretamente no WhatsApp da administração.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-stone-900 mb-2">
                    Solicitação Aberta no WhatsApp!
                  </h4>
                  <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto">
                    Se a janela do WhatsApp não tiver aberto automaticamente, clique no botão abaixo para concluir o envio da sua mensagem.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#1B4332] hover:underline"
                  >
                    <span>Editar dados e enviar novamente</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Seu Nome / Cargo Pastoral *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.leaderName}
                        onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                        placeholder="Ex: Pr. Carlos / Líder Ana"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Nome da Igreja / Ministério *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.churchName}
                        onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                        placeholder="Ex: Igreja Batista Renovada"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-hidden ${
                          phoneError ? 'border-red-500 bg-red-50/30' : 'border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]'
                        }`}
                      />
                      {phoneError && <span className="text-[11px] text-red-600 mt-1 block">{phoneError}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Formato de Locação
                      </label>
                      <select
                        value={formData.rentalFormat}
                        onChange={(e) => setFormData({ ...formData, rentalFormat: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm bg-white"
                      >
                        <option value="Fim de Semana Fechado (Sexta a Domingo)">
                          Fim de Semana Fechado (Sexta a Domingo)
                        </option>
                        <option value="Dia Específico / Day Use (A negociar)">
                          Dia Específico / Day Use (A negociar)
                        </option>
                        <option value="Feriado Prolongado / Outro período">
                          Feriado Prolongado / Outro período
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Público Estimado (Capacidade máx. 150)
                      </label>
                      <select
                        value={formData.attendeesRange}
                        onChange={(e) => setFormData({ ...formData, attendeesRange: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm bg-white"
                      >
                        <option value="Até 50 pessoas">Até 50 pessoas</option>
                        <option value="50 a 100 pessoas">50 a 100 pessoas</option>
                        <option value="100 a 150 pessoas">100 a 150 pessoas (Capacidade Máx.)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Mês ou Data Pretendida
                      </label>
                      <input
                        type="text"
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        placeholder="Ex: Novembro / Feriado / Data X"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Observações ou dúvidas da comissão (opcional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Conte um pouco sobre o evento da sua igreja ou preferências de horário para a visita..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-[#D97706] hover:bg-[#B45309] shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar no WhatsApp & Consultar Data</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
