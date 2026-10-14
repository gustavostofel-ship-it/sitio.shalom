'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Phone, Mail, Clock, Send, ShieldCheck, CheckCircle2, MessageSquare, Coffee, Car, Navigation } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function BookingSection() {
  const [formData, setFormData] = useState({
    leaderName: '',
    churchName: '',
    whatsapp: '',
    eventType: 'Retiro Espiritual (Carnaval / Semana Santa)',
    attendeesRange: '50 a 100 pessoas',
    targetDate: '',
    cateringOption: 'pensao-completa',
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
      `*SOLICITAÇÃO DE VISITA E ORÇAMENTO - SÍTIO SHALOM*\n\n` +
      `👤 *Líder / Pastor:* ${formData.leaderName}\n` +
      `⛪ *Igreja / Ministério:* ${formData.churchName}\n` +
      `📱 *WhatsApp:* ${formData.whatsapp}\n` +
      `🎯 *Tipo de Evento:* ${formData.eventType}\n` +
      `👥 *Público Estimado:* ${formData.attendeesRange}\n` +
      `📅 *Mês / Data Pretendida:* ${formData.targetDate || 'A combinar'}\n` +
      `🍽️ *Opção de Alimentação:* ${formData.cateringOption === 'pensao-completa' ? 'Pensão Completa' : 'Locação Seca (Cozinha própria)'}\n` +
      (formData.notes ? `📝 *Observações:* ${formData.notes}\n\n` : '\n') +
      `Gostaria de agendar a visita presencial da comissão e receber a proposta detalhada!`
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
            Atendimento Exclusivo para Liderança
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Agende uma Visita Técnica & Solicite um Orçamento
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Traga sua comissão organizadora para conhecer cada detalhe do espaço sem compromisso. Teremos prazer em tomar um café e orar juntos pelo seu evento.
          </p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Convincing Copy, Location, Map & Perks */}
          <div className="lg:col-span-5 space-y-6">
            {/* Invitation Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">
                    Café de Boas-Vindas à Liderança
                  </h3>
                  <span className="text-xs text-stone-500">Visita guiada sem qualquer custo</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed mb-6">
                Pastores e coordenadores de eventos sabem que fotos não substituem o sentimento de pisar no local. Venha sentir a paz do sítio, testar o som do templo e ver a limpeza dos dormitórios com seus próprios olhos.
              </p>

              <div className="space-y-3 border-t border-stone-100 pt-5 text-sm text-stone-700">
                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Acesso 100% Pavimentado:</strong>
                    <span className="text-xs text-stone-600">Rodovia asfaltada até o portão principal, preparada para ônibus rodoviários.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Proximidade Estratégica:</strong>
                    <span className="text-xs text-stone-600">{SITE_INFO.travelTime} (Região Metropolitana).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Exclusividade Contratual:</strong>
                    <span className="text-xs text-stone-600">Nunca alugamos para duas igrejas simultaneamente. O sítio é todo seu.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stylized Map Card */}
            <div className="bg-[#1B4332] text-white rounded-2xl p-6 shadow-md border border-emerald-900/40 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                      Localização
                    </span>
                  </div>
                  <span className="text-[11px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">
                    Portaria 24 Horas
                  </span>
                </div>

                <p className="text-sm font-serif font-medium text-white mb-1">
                  {SITE_INFO.address}
                </p>
                <p className="text-xs text-emerald-100/80 mb-5">
                  Fácil acesso pelo Rodoanel e principais rodovias estaduais.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>Abrir no Google Maps</span>
                  </a>

                  <a
                    href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20receber%20a%20localização%20e%20rota%20do%20Sítio%20Shalom%20para%20visita.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-900/90 text-emerald-100 hover:bg-emerald-900 border border-emerald-600/40 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pedir Rota no WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Smart Conversion Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl p-6 sm:p-10 relative">
              {/* Form Title */}
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  Solicitar Orçamento ou Agendar Visita
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Preencha as informações preliminares. Nossa equipe gera a proposta formatada e você já inicia o contato com nosso coordenador.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-stone-900 mb-2">
                    Solicitação Encaminhada com Sucesso!
                  </h4>
                  <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
                    Sua mensagem já foi pré-formatada para o nosso WhatsApp. Se a janela não tiver aberto automaticamente, clique no botão abaixo para conversar com nosso plantão de retiros:
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${SITE_INFO.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white bg-[#D97706] hover:bg-[#B45309] transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir Conversa no WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-3 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 underline"
                    >
                      Enviar Nova Solicitação
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Leader Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Nome do Líder / Pastor *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pr. André Santos"
                        value={formData.leaderName}
                        onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>

                    {/* Church Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Igreja / Ministério *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Igreja Batista Renovada"
                        value={formData.churchName}
                        onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        WhatsApp com DDD *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 98765-4321"
                        value={formData.whatsapp}
                        onChange={handlePhoneChange}
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-stone-400 ${
                          phoneError ? 'border-red-500 bg-red-50/30' : 'border-stone-300'
                        }`}
                      />
                      {phoneError && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{phoneError}</p>
                      )}
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Tipo de Evento *
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      >
                        <option value="Retiro Espiritual (Carnaval / Semana Santa)">Retiro Espiritual (Carnaval / Semana Santa)</option>
                        <option value="Acampamento de Jovens / Adolescentes">Acampamento de Jovens / Adolescentes</option>
                        <option value="Encontro de Casais / Famílias">Encontro de Casais / Famílias</option>
                        <option value="Congresso de Louvor / Obreiros">Congresso de Louvor / Obreiros</option>
                        <option value="Batismo nas Águas (Day Use)">Batismo nas Águas (Day Use)</option>
                        <option value="Outro Evento Ministerial">Outro Evento Ministerial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Estimated Attendees */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Estimativa de Pessoas *
                      </label>
                      <select
                        value={formData.attendeesRange}
                        onChange={(e) => setFormData({ ...formData, attendeesRange: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
                      >
                        <option value="Até 50 pessoas">Até 50 pessoas</option>
                        <option value="50 a 80 pessoas">50 a 80 pessoas</option>
                        <option value="80 a 120 pessoas">80 a 120 pessoas</option>
                        <option value="120 a 150 pessoas (Capacidade Máxima)">120 a 150 pessoas (Capacidade Máxima)</option>
                      </select>
                    </div>

                    {/* Target Date / Month */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Mês ou Data Pretendida *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Carnaval 2027 ou Outubro 2026"
                        required
                        value={formData.targetDate}
                        onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  {/* Catering mode options */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      Preferência de Alimentação:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.cateringOption === 'pensao-completa'
                            ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332]'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="catering"
                          checked={formData.cateringOption === 'pensao-completa'}
                          onChange={() => setFormData({ ...formData, cateringOption: 'pensao-completa' })}
                          className="mt-0.5 accent-[#1B4332]"
                        />
                        <div>
                          <span className="block text-xs font-bold text-stone-900">Pensão Completa</span>
                          <span className="text-[11px] text-stone-500">4 refeições diárias preparadas no sítio</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.cateringOption === 'locacao-seca'
                            ? 'border-[#1B4332] bg-emerald-50/50 text-[#1B4332]'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="catering"
                          checked={formData.cateringOption === 'locacao-seca'}
                          onChange={() => setFormData({ ...formData, cateringOption: 'locacao-seca' })}
                          className="mt-0.5 accent-[#1B4332]"
                        />
                        <div>
                          <span className="block text-xs font-bold text-stone-900">Locação Seca</span>
                          <span className="text-[11px] text-stone-500">Igreja traz cozinheiras e suprimentos</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Observações ou Dúvidas Adicionais (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Precisamos de sala de apoio para crianças, teremos preletor convidado..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all placeholder:text-stone-400"
                    />
                  </div>

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg text-base font-bold text-white bg-[#D97706] hover:bg-[#B45309] shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <Send className="w-5 h-5 text-amber-100" />
                      <span>Solicitar Orçamento & Agendar Visita via WhatsApp</span>
                    </button>
                    <p className="text-[11px] text-center text-stone-500 mt-2.5">
                      🔒 Seus dados serão utilizados exclusivamente para formalizar a proposta da sua igreja. Sem spam.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
