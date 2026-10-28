'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';
import { add, brl, cotar, dia, diff, janela, periodoDe, proximas, statusDia, visivel, type AgendaData } from '@/lib/agenda';

interface Sel {
  a: string | null; // entrada
  b: string | null; // saída
  xb: boolean; // 1 dia extra antes
  xa: boolean; // 1 dia extra depois
}
const VAZIO: Sel = { a: null, b: null, xb: false, xa: false };
const PUBLICOS = ['Até 50 pessoas', '50 a 100 pessoas', '100 a 150 pessoas'];
const zap = (texto: string) => `https://wa.me/${SITE_INFO.whatsappNumber}?text=${encodeURIComponent(texto)}`;
const mascara = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11);
  return n.length > 6 ? `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}` : n.length > 2 ? `(${n.slice(0, 2)}) ${n.slice(2)}` : n;
};

export function AgendaReserva() {
  const [data, setData] = useState<AgendaData | null>(null);
  const [erro, setErro] = useState(false);
  const [mes, setMes] = useState<{ y: number; m: number } | null>(null);
  const [sel, setSel] = useState<Sel>(VAZIO);
  const [dica, setDica] = useState('');
  const [form, setForm] = useState({ nome: '', igreja: '', whatsapp: '', publico: PUBLICOS[2] });
  const [enviando, setEnviando] = useState(false);
  const [msgErro, setMsgErro] = useState('');
  const [feito, setFeito] = useState<{ id: number; total: number; sinal: number; resumo: string } | null>(null);

  const carregar = useCallback(async () => {
    try {
      const r = await fetch('/api/agenda', { cache: 'no-store' });
      if (!r.ok) throw new Error('indisponivel');
      const j: AgendaData = await r.json();
      setData(j);
      setErro(false);
      setMes((m) => m ?? { y: +j.hoje.slice(0, 4), m: +j.hoje.slice(5, 7) - 1 });
    } catch {
      setErro(true);
    }
  }, []);
  useEffect(() => {
    carregar();
    window.addEventListener('focus', carregar);
    return () => window.removeEventListener('focus', carregar);
  }, [carregar]);

  // Sem dados (banco fora do ar ou ainda não configurado): a página segue normal, só sem o calendário.
  if (!data || !mes) {
    return (
      <section id="datas" className="py-14 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1B4332]">Consulte as datas disponíveis</h2>
          {erro ? (
            <>
              <p className="mt-3 text-slate-600">Fale com a gente pelo WhatsApp para ver as datas livres. Respondemos rápido.</p>
              <a
                href={zap('Olá! Gostaria de consultar as datas disponíveis do Sítio Shalom.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Consultar pelo WhatsApp
              </a>
            </>
          ) : (
            <p className="mt-3 text-slate-500">Carregando datas…</p>
          )}
        </div>
      </section>
    );
  }

  const { cfg } = data;
  const ef = sel.a && sel.b ? { a: sel.xb ? add(sel.a, -1) : sel.a, b: sel.xa ? add(sel.b, 1) : sel.b } : null;
  const cot = ef ? cotar(ef.a, ef.b, data) : null;
  const base = sel.a && sel.b ? cotar(sel.a, sel.b, data) : null;
  const hojeMes = +data.hoje.slice(0, 4) * 12 + +data.hoje.slice(5, 7) - 1;
  const irMes = (delta: number) =>
    setMes((m) => {
      const t = (m ? m.y * 12 + m.m : hojeMes) + delta;
      return t < hojeMes || t > hojeMes + 18 ? m : { y: Math.floor(t / 12), m: t % 12 };
    });

  const tocar = (d: string) => {
    setFeito(null);
    setMsgErro('');
    if (ef && sel.xb && d === ef.a) return setSel({ ...sel, xb: false });
    if (ef && sel.xa && d === ef.b) return setSel({ ...sel, xa: false });
    if (!visivel(d, data)) return setDica('Essa data não está disponível. Toque numa data verde.');
    setDica('');
    const periodoEscolhido = sel.a && sel.b && data.periodos.some((p) => p.entrada === sel.a && p.saida === sel.b);
    const p = periodoDe(d, data);
    if (periodoEscolhido && sel.a && sel.b && d >= sel.a && d <= sel.b) return setSel(VAZIO); // desfaz o feriado
    if (p) return setSel({ a: p.entrada, b: p.saida, xb: false, xa: false });
    if (sel.a && d === sel.a) return setSel(VAZIO); // tocar na entrada desfaz tudo
    if (sel.b && d === sel.b) return setSel({ ...sel, b: null, xa: false }); // tocar na saída tira só a saída
    if (sel.a && d > sel.a) {
      if (sel.b && diff(sel.a, d) < cfg.minDias) return setDica(`O mínimo são ${cfg.minDias} dias: a saída mais cedo é ${dia(add(sel.a, cfg.minDias - 1))}.`);
      return setSel({ ...sel, b: d, xa: false });
    }
    const w = janela(d, data); // um toque marca o pacote de 3 dias
    if (w) setSel({ a: w[0], b: w[1], xb: false, xa: false });
    else {
      setSel(VAZIO);
      setDica(`Não há ${cfg.minDias} dias seguidos livres a partir desta data.`);
    }
  };

  const instrucao = dica
    ? dica
    : !sel.a
      ? '👆 Toque no dia em que sua igreja vai chegar.'
      : !sel.b
        ? `👆 Agora toque no dia da saída (mínimo ${cfg.minDias} dias). Para desfazer, toque na entrada de novo.`
        : cot && !cot.ok
          ? 'Essas datas não funcionam juntas. Toque em outra data.'
          : `✅ Pronto! Já marcamos ${diff(sel.a, sel.b)} dias. Para mudar a saída, toque em outra data. Para recomeçar, toque na entrada.`;
  const alerta = !!dica || (!!cot && !cot.ok);

  const mesJSX = (y: number, m: number) => {
    const primeiro = new Date(Date.UTC(y, m, 1));
    const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const titulo = primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const celulas = [];
    for (let i = 0; i < primeiro.getUTCDay(); i++) celulas.push(<div key={'v' + i} />);
    for (let i = 1; i <= n; i++) {
      const d = new Date(Date.UTC(y, m, i)).toISOString().slice(0, 10);
      const livre = visivel(d, data);
      const dentro = ef ? d >= ef.a && d <= ef.b : sel.a === d;
      const extraSel = !!ef && ((sel.xb && d === ef.a) || (sel.xa && d === ef.b));
      const ruim = dentro && !!cot && !cot.ok;
      const rotulo = ef ? (d === ef.a ? 'entrada' : d === ef.b ? 'saída' : '') : sel.a === d ? 'entrada' : '';
      const cor = dentro
        ? ruim
          ? 'bg-red-100 border-red-400 text-red-700'
          : extraSel
            ? 'bg-amber-700 border-amber-700 text-white'
            : 'bg-[#1B4332] border-[#1B4332] text-white'
        : livre
          ? 'bg-emerald-50 border-emerald-400 font-bold text-slate-900 hover:bg-emerald-100 cursor-pointer'
          : `bg-stone-100 border-stone-200 text-stone-400 cursor-default ${statusDia(d, data) === 'passado' ? 'opacity-50' : ''}`;
      celulas.push(
        <button
          key={d}
          type="button"
          onClick={() => tocar(d)}
          aria-label={`${dia(d)} ${livre ? 'disponível' : 'indisponível'}`}
          aria-pressed={dentro}
          className={`relative aspect-square min-h-11 rounded-lg border text-sm sm:text-base flex items-center justify-center select-none transition-colors ${cor}`}
        >
          {rotulo && <span className="absolute top-0.5 left-0 right-0 text-center text-[9px] leading-none uppercase tracking-wide">{rotulo}</span>}
          {i}
          {periodoDe(d, data) && <span className="absolute bottom-1 left-2 right-2 h-0.5 rounded bg-amber-500" />}
        </button>
      );
    }
    return (
      <div key={y + '-' + m} className="min-w-0">
        <div className="text-center font-bold first-letter:uppercase mb-2 text-slate-800">{titulo}</div>
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((x) => (
            <div key={x} className="text-center text-xs font-semibold text-slate-500 pb-1">
              {x}
            </div>
          ))}
          {celulas}
        </div>
      </div>
    );
  };
  const prox = { y: mes.y + (mes.m === 11 ? 1 : 0), m: (mes.m + 1) % 12 };

  const reservar = async () => {
    if (!ef || !cot || !cot.ok) return;
    setEnviando(true);
    setMsgErro('');
    try {
      const r = await fetch('/api/agenda/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entrada: ef.a, saida: ef.b, ...form }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsgErro(j.erro || 'Não foi possível reservar agora.');
        if (r.status === 409 || r.status === 422) await carregar();
        return;
      }
      setFeito({ id: j.id, total: j.total, sinal: j.sinal, resumo: `${dia(ef.a)} a ${dia(ef.b)}` });
      setSel(VAZIO);
      await carregar();
    } catch {
      setMsgErro('Sem conexão. Tente de novo ou fale com a gente pelo WhatsApp.');
    } finally {
      setEnviando(false);
    }
  };

  const dB = sel.a ? add(sel.a, -1) : '';
  const dA = sel.b ? add(sel.b, 1) : '';
  const podeExtras = !!base && base.ok && !base.periodo;
  const canB = podeExtras && (sel.xb || cotar(dB, sel.xa ? dA : sel.b!, data).ok);
  const canA = podeExtras && (sel.xa || cotar(sel.xb ? dB : sel.a!, dA, data).ok);
  const campo = 'w-full rounded-lg border border-stone-300 px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]';

  return (
    <section id="datas" className="py-14 sm:py-20 bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#1B4332]">Veja as datas disponíveis e reserve</h2>
          <p className="mt-2 text-slate-600">Escolha em poucos toques. Sem cadastro, sem senha.</p>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5">
            <div role="status" className={`rounded-xl border px-4 py-3 mb-4 text-[15px] ${alerta ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-emerald-50 border-emerald-400 text-slate-800'}`}>
              {instrucao}
            </div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <button type="button" onClick={() => irMes(-1)} disabled={mes.y * 12 + mes.m <= hojeMes} aria-label="Mês anterior" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              {sel.a && (
                <button type="button" onClick={() => { setSel(VAZIO); setDica(''); }} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm">
                  <X className="w-4 h-4" /> Limpar datas
                </button>
              )}
              <button type="button" onClick={() => irMes(1)} aria-label="Próximo mês" className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm">
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {mesJSX(mes.y, mes.m)}
              <div className="hidden sm:block">{mesJSX(prox.y, prox.m)}</div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-slate-500">
              <span><i className="inline-block w-3 h-3 rounded-sm border border-emerald-400 bg-emerald-50 mr-1 align-[-2px]" />Disponível</span>
              <span><i className="inline-block w-3 h-3 rounded-sm bg-stone-100 border border-stone-200 mr-1 align-[-2px]" />Indisponível</span>
              <span><i className="inline-block w-3 h-0.5 bg-amber-500 mr-1 align-middle" />Feriado (pacote fechado)</span>
            </div>
            {!sel.b && proximas(data, 3).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs text-slate-500">Atalho — fins de semana livres:</span>
                {proximas(data, 3).map((q) => (
                  <button
                    key={q.a}
                    type="button"
                    onClick={() => { setSel({ a: q.a, b: q.b, xb: false, xa: false }); setDica(''); setMes({ y: +q.a.slice(0, 4), m: +q.a.slice(5, 7) - 1 }); }}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-sm hover:border-emerald-400"
                  >
                    {dia(q.a)} a {dia(q.b)} · {brl(q.total)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 lg:sticky lg:top-24">
            {feito ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-400 p-4 text-sm text-slate-800">
                <p className="font-bold text-base">✅ Pedido nº {feito.id} registrado!</p>
                <p className="mt-1">{feito.resumo} · {brl(feito.total)}</p>
                <p className="mt-1">Seguramos a data por {cfg.holdHoras} horas. Para confirmar, combine o sinal de <b>{brl(feito.sinal)}</b> com a gente pelo WhatsApp.</p>
                <a
                  href={zap(`Olá! Fiz o pedido nº ${feito.id} no site para ${feito.resumo}. Total ${brl(feito.total)}, sinal ${brl(feito.sinal)}. Como combinamos o sinal?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-full hover:bg-[#20bd5a]"
                >
                  <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
                </a>
              </div>
            ) : !sel.a ? (
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1B4332]">Sua reserva</h3>
                <p className="mt-1 text-slate-600 text-sm">Escolha as datas no calendário para ver o valor.</p>
                <p className="mt-3 text-xs text-slate-500">
                  A partir de {brl(cfg.base)} por {cfg.minDias} dias, para até {cfg.capacidade} pessoas. Cada dia a mais: {brl(cfg.extra)}.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center rounded-xl border border-stone-200 p-3">
                  <div><span className="block text-[11px] uppercase text-slate-500">Entrada</span><b>{dia(ef ? ef.a : sel.a)}</b></div>
                  <div><span className="block text-[11px] uppercase text-slate-500">Saída</span><b>{ef ? dia(ef.b) : '—'}</b></div>
                  <button type="button" onClick={() => setSel(VAZIO)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm">Limpar</button>
                </div>
                {cot && !cot.ok && <p className="mt-3 text-sm text-red-700">{cot.erro}</p>}
                {cot && cot.ok && (
                  <>
                    {(canB || canA) && (
                      <div className="mt-4">
                        <p className="font-bold text-sm mb-2">Quer ficar mais tempo?</p>
                        {canB && (
                          <button type="button" onClick={() => setSel({ ...sel, xb: !sel.xb })} className={`flex w-full justify-between items-center gap-2 rounded-xl border px-3 py-2.5 mb-2 text-sm text-left ${sel.xb ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-300'}`}>
                            <span>{sel.xb ? '✓ ' : '+ '}Chegar 1 dia antes ({dia(dB)})</span><b>+ {brl(cfg.extra)}</b>
                          </button>
                        )}
                        {canA && (
                          <button type="button" onClick={() => setSel({ ...sel, xa: !sel.xa })} className={`flex w-full justify-between items-center gap-2 rounded-xl border px-3 py-2.5 mb-2 text-sm text-left ${sel.xa ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-stone-300'}`}>
                            <span>{sel.xa ? '✓ ' : '+ '}Sair 1 dia depois ({dia(dA)})</span><b>+ {brl(cfg.extra)}</b>
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-3 text-sm">
                      {cot.linhas.map(([nome, v]) => (
                        <div key={nome} className="flex justify-between py-0.5"><span>{nome}</span><span>{brl(v)}</span></div>
                      ))}
                      <div className="flex justify-between border-t border-stone-200 mt-1 pt-2 font-bold text-base"><span>Total ({cot.n} dias)</span><span>{brl(cot.total)}</span></div>
                      <div className="flex justify-between mt-1"><span>Sinal para segurar a data ({cfg.sinalPct}%)</span><b>{brl(cot.sinal)}</b></div>
                      <p className="text-xs text-slate-500 mt-1">Entrada à tarde, saída à tarde · até {cfg.capacidade} pessoas</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <input className={campo} placeholder="Nome do líder / pastor" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoComplete="name" />
                      <input className={campo} placeholder="Igreja / ministério" value={form.igreja} onChange={(e) => setForm({ ...form, igreja: e.target.value })} />
                      <input className={campo} placeholder="WhatsApp com DDD" inputMode="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: mascara(e.target.value) })} autoComplete="tel" />
                      <select className={campo} value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })}>
                        {PUBLICOS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    {msgErro && <p className="mt-3 text-sm text-red-700">{msgErro}</p>}
                    <button
                      type="button"
                      onClick={reservar}
                      disabled={enviando || form.nome.trim().length < 2 || form.whatsapp.replace(/\D/g, '').length < 10}
                      className="mt-4 w-full rounded-xl bg-amber-600 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? 'Enviando…' : 'Reservar esta data'}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Sem cadastro. Seguramos a data por {cfg.holdHoras} horas enquanto combinamos o sinal.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
