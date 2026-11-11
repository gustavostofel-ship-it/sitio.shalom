'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Send, ShieldCheck, CheckCircle2, MessageSquare, Coffee, Phone, Clock } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';
import { DIAS_CURTOS, dataBr, diaSemanaDe } from '@/lib/visitas';

interface DiaLivre {
  data: string;
  horas: string[];
}
interface Feito {
  id: number;
  data: string | null;
  hora: string | null;
}

const FORMATOS = ['Fim de Semana Fechado (Sexta a Domingo)', 'Dia Específico / Day Use (A negociar)', 'Feriado Prolongado / Outro período'];
const PUBLICOS = ['Até 50 pessoas', '50 a 100 pessoas', '100 a 150 pessoas'];
const campo =
  'w-full px-3.5 py-2.5 rounded-lg border border-stone-300 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] outline-hidden text-base sm:text-sm';
const rotulo = 'block text-sm font-semibold text-stone-700 mb-1.5';

const mascara = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11);
  return n.length > 6 ? `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}` : n.length > 2 ? `(${n.slice(0, 2)}) ${n.slice(2)}` : n;
};

// Calendário dos dias com visita disponível. Fica de fora (cinza) o que não dá para escolher: dias passados,
// fechados pelo sítio, com o sítio alugado ou sem horário livre. Quem decide os dias é o administrador, no painel.
function CalendarioVisita({ dias, dia, aoEscolher }: { dias: DiaLivre[]; dia: string; aoEscolher: (d: string) => void }) {
  const livres = new Set(dias.map((d) => d.data));
  const t0 = +dias[0].data.slice(0, 4) * 12 + +dias[0].data.slice(5, 7) - 1;
  const t1 = +dias[dias.length - 1].data.slice(0, 4) * 12 + +dias[dias.length - 1].data.slice(5, 7) - 1;
  const [t, setT] = useState(t0);
  const y = Math.floor(t / 12);
  const m = t % 12;
  const primeiro = new Date(Date.UTC(y, m, 1));
  const total = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const titulo = primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const celulas: React.ReactNode[] = [];
  for (let i = 0; i < primeiro.getUTCDay(); i++) celulas.push(<div key={'v' + i} />);
  for (let i = 1; i <= total; i++) {
    const d = new Date(Date.UTC(y, m, i)).toISOString().slice(0, 10);
    const livre = livres.has(d);
    const escolhido = dia === d;
    celulas.push(
      <button
        key={d}
        type="button"
        disabled={!livre}
        onClick={() => aoEscolher(d)}
        aria-pressed={escolhido}
        aria-label={`${DIAS_CURTOS[diaSemanaDe(d)]} ${dataBr(d)} ${livre ? 'disponível' : 'indisponível'}`}
        className={`aspect-square min-h-10 rounded-lg border text-sm transition-colors flex items-center justify-center ${
          escolhido
            ? 'border-[#1B4332] bg-[#1B4332] font-bold text-white'
            : livre
              ? 'border-emerald-400 bg-emerald-50 font-bold text-slate-900 hover:bg-emerald-100 cursor-pointer'
              : 'border-stone-200 bg-stone-100 text-stone-400 cursor-default'
        }`}
      >
        {i}
      </button>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setT(t - 1)} disabled={t <= t0} aria-label="Mês anterior" className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40">
          ‹
        </button>
        <span className="text-sm font-bold text-stone-800 first-letter:uppercase">{titulo}</span>
        <button type="button" onClick={() => setT(t + 1)} disabled={t >= t1} aria-label="Próximo mês" className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((x) => (
          <div key={x} className="pb-1 text-center text-xs font-semibold text-stone-600">
            {x}
          </div>
        ))}
        {celulas}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
        <span><i className="mr-1 inline-block h-3 w-3 rounded-sm border border-emerald-400 bg-emerald-50 align-[-2px]" />Disponível</span>
        <span><i className="mr-1 inline-block h-3 w-3 rounded-sm border border-stone-200 bg-stone-100 align-[-2px]" />Indisponível</span>
      </div>
    </div>
  );
}

export function BookingSection() {
  const [form, setForm] = useState({
    nome: '',
    igreja: '',
    whatsapp: '',
    formato: FORMATOS[0],
    publico: PUBLICOS[1],
    obs: '',
  });
  const [dias, setDias] = useState<DiaLivre[] | null>(null); // null = ainda carregando
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');
  const [aceite, setAceite] = useState(false);
  const [armadilha, setArmadilha] = useState(''); // campo escondido: gente não vê, robô preenche
  const [ficha, setFicha] = useState(''); // ficha assinada pelo servidor (anti-robô)
  useEffect(() => {
    let ativo = true;
    fetch('/api/formulario', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => ativo && setFicha(String(j.ficha ?? '')))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [feito, setFeito] = useState<Feito | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch('/api/visitas/horarios', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => ativo && setDias(j.dias ?? []))
      .catch(() => ativo && setDias([]));
    return () => {
      ativo = false;
    };
  }, []);

  const horasDoDia = dias?.find((d) => d.data === dia)?.horas ?? [];
  const quando = dia && hora ? `${DIAS_CURTOS[diaSemanaDe(dia)]} ${dataBr(dia)} às ${hora}` : '';

  const mensagemZap = (id?: number) =>
    encodeURIComponent(
      `*SOLICITAÇÃO DE VISITA - SÍTIO SHALOM XERÉM*${id ? ` (nº ${id})` : ''}\n\n` +
        `👤 *Líder / Pastor:* ${form.nome}\n` +
        `⛪ *Igreja / Ministério:* ${form.igreja}\n` +
        `📱 *WhatsApp:* ${form.whatsapp}\n` +
        `📅 *Formato de Locação:* ${form.formato}\n` +
        `👥 *Público Estimado:* ${form.publico}\n` +
        `🗓️ *Visita:* ${quando || 'A combinar'}\n` +
        (form.obs ? `📝 *Observações:* ${form.obs}\n\n` : '\n') +
        `Olá! Gostaria de confirmar a visita ao sítio.`
    );
  const linkZap = (id?: number) => `https://wa.me/${SITE_INFO.whatsappNumber}?text=${mensagemZap(id)}`;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const r = await fetch('/api/visitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, data: dia, hora, aceite, site: armadilha, tk: ficha }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErro(j.erro || 'Não foi possível enviar agora.');
        if (r.status === 409) {
          // alguém pegou o horário: atualiza a lista e limpa a escolha
          setHora('');
          fetch('/api/visitas/horarios', { cache: 'no-store' }).then((x) => x.json()).then((x) => setDias(x.dias ?? [])).catch(() => {});
        }
        return;
      }
      setFeito({ id: j.id, data: j.data, hora: j.hora });
    } catch {
      setErro('Sem conexão. Tente de novo ou fale com a gente pelo WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section id="agendar" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#B45309] mb-2 block">Atendimento Direto à Liderança</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">Agende uma Visita & Consulte a Sua Data</h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Traga sua comissão organizadora para conhecer pessoalmente o auditório, o salão com mesas, a piscina, o campo e os dormitórios.
          </p>
        </div>

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Convincing Copy, Location & Perks */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#B45309] flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">Visita Presencial sem Compromisso</h3>
                  <span className="text-sm text-stone-500">Agende um café com a comissão da igreja</span>
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
                    <span className="text-sm text-stone-600">Nunca alugamos para dois ministérios simultâneos. Toda a propriedade fica reservada para seu grupo.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#1B4332] mt-0.5 shrink-0" />
                  <div>
                    <strong className="font-semibold text-stone-900 block">Modelo de Fim de Semana Fechado:</strong>
                    <span className="text-sm text-stone-600">Locação por valor fechado de sexta a domingo, ou negociação direta para dias avulsos.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-[#1B4332] text-white rounded-2xl p-6 shadow-md border border-emerald-900/40">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-amber-300" />
                <span className="text-sm font-semibold uppercase tracking-wider text-amber-200">Atendimento WhatsApp</span>
              </div>

              <p className="text-sm text-emerald-100/90 mb-4 leading-relaxed">Prefere conversar diretamente pelo WhatsApp para tirar dúvidas ou solicitar a localização para a visita?</p>

              <a
                href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20consultar%20a%20disponibilidade%20do%20Sítio%20Shalom%20Xerém%20para%20o%20retiro%20da%20minha%20igreja.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold bg-white text-stone-900 hover:bg-stone-100 transition-colors"
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
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">Agendar Visita ao Sítio</h3>
                <p className="text-sm sm:text-sm text-stone-600 mt-1">Escolha um horário livre e envie. Seu pedido fica registrado e a gente confirma pelo WhatsApp.</p>
              </div>

              {feito ? (
                <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-stone-900 mb-2">Pedido de visita enviado! (nº {feito.id})</h4>
                  <p className="text-sm text-stone-700 mb-1">
                    {feito.data && feito.hora ? (
                      <>
                        Horário pedido: <b>{DIAS_CURTOS[diaSemanaDe(feito.data)]} {dataBr(feito.data)} às {feito.hora}</b>.
                      </>
                    ) : (
                      <>Vamos combinar o melhor dia e horário com você.</>
                    )}
                  </p>
                  <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto">
                    Ele fica <b>aguardando confirmação</b>. Para agilizar, mande a mensagem pronta pelo WhatsApp:
                  </p>
                  <a
                    href={linkZap(feito.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Enviar mensagem no WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={enviar} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="v-nome" className={rotulo}>Seu Nome / Cargo Pastoral *</label>
                      <input id="v-nome" type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Pr. Carlos / Líder Ana" className={campo} autoComplete="name" />
                    </div>
                    <div>
                      <label htmlFor="v-igreja" className={rotulo}>Nome da Igreja / Ministério *</label>
                      <input id="v-igreja" type="text" required value={form.igreja} onChange={(e) => setForm({ ...form, igreja: e.target.value })} placeholder="Ex: Igreja Batista Renovada" className={campo} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="v-zap" className={rotulo}>WhatsApp com DDD (celular) *</label>
                      <input id="v-zap" type="tel" required inputMode="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: mascara(e.target.value) })} placeholder="(21) 99999-9999" className={campo} autoComplete="tel" />
                    </div>
                    <div>
                      <label htmlFor="v-formato" className={rotulo}>Formato de Locação</label>
                      <select id="v-formato" value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} className={`${campo} bg-white`}>
                        {FORMATOS.map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="v-publico" className={rotulo}>Público Estimado (Capacidade máx. 150)</label>
                    <select id="v-publico" value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })} className={`${campo} bg-white`}>
                      {PUBLICOS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Escolha do horário da visita */}
                  <div>
                    <span className={rotulo}>Dia e horário da visita (opcional)</span>
                    {dias === null ? (
                      <p className="text-sm text-stone-500">Carregando horários…</p>
                    ) : dias.length === 0 ? (
                      <p className="text-sm text-stone-600 rounded-lg bg-stone-50 border border-stone-200 px-3 py-2.5">
                        No momento não há horários livres para escolher aqui. Envie o pedido e combinamos o melhor dia pelo WhatsApp.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                        <CalendarioVisita
                          dias={dias}
                          dia={dia}
                          aoEscolher={(d) => {
                            setDia(dia === d ? '' : d);
                            setHora('');
                          }}
                        />
                        {dia && (
                          <div className="mt-3 flex flex-wrap gap-2" role="listbox" aria-label="Horários disponíveis">
                            {horasDoDia.map((h) => (
                              <button
                                key={h}
                                type="button"
                                role="option"
                                aria-selected={hora === h}
                                onClick={() => setHora(hora === h ? '' : h)}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                  hora === h ? 'border-amber-700 bg-amber-700 text-white' : 'border-stone-300 bg-white text-stone-800 hover:border-amber-600'
                                }`}
                              >
                                <Clock className="h-3.5 w-3.5" /> {h}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-sm text-stone-600">
                          {quando ? (
                            <>Visita pedida para <b>{quando}</b>.</>
                          ) : dia ? (
                            'Agora escolha o horário. Se preferir, desmarque o dia e combinamos pelo WhatsApp.'
                          ) : (
                            'Se nenhum servir, deixe em branco e combinamos pelo WhatsApp.'
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="v-obs" className={rotulo}>Observações ou dúvidas da comissão (opcional)</label>
                    <textarea
                      id="v-obs"
                      rows={3}
                      maxLength={500}
                      value={form.obs}
                      onChange={(e) => setForm({ ...form, obs: e.target.value })}
                      placeholder="Conte um pouco sobre o evento da sua igreja ou preferências de horário para a visita..."
                      className={`${campo} resize-none`}
                    />
                  </div>

                  {/* Armadilha para robôs: fora da tela e fora do teclado. Quem preenche é descartado. */}
                  <input type="text" name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />

                  <label className="flex items-start gap-2.5 text-sm text-stone-700 leading-relaxed cursor-pointer">
                    <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#1B4332]" />
                    <span>
                      Li e aceito a{' '}
                      <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline text-[#1B4332] font-semibold">Política de Privacidade</a> e os{' '}
                      <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline text-[#1B4332] font-semibold">Termos</a>, e concordo em receber contato por WhatsApp sobre esta visita.
                    </span>
                  </label>

                  {erro && (
                    <p role="alert" className="text-sm text-red-700">
                      {erro}{' '}
                      <a href={linkZap()} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                        Enviar pelo WhatsApp
                      </a>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={enviando || !aceite}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-base font-semibold text-white bg-[#B45309] hover:bg-[#92400E] shadow-md transition-all mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>{enviando ? 'Enviando…' : 'Enviar pedido de visita'}</span>
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
