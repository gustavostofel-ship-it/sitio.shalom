'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { add, brl, cotar, dia, diff, janela, periodoDe, proximas, statusDia, visivel, type AgendaData } from '@/lib/agenda';
import type { Chamar } from './tipos';
import { CampoReais, botao, botaoPri, campo, rotulo } from './ui';

interface Sel {
  a: string | null; // entrada
  b: string | null; // saída
  xb: boolean; // 1 dia extra antes
  xa: boolean; // 1 dia extra depois
}
const VAZIO: Sel = { a: null, b: null, xb: false, xa: false };

const mascara = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11);
  return n.length > 6 ? `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}` : n.length > 2 ? `(${n.slice(0, 2)}) ${n.slice(2)}` : n;
};

// Nova reserva feita pelo administrador. Segue as MESMAS regras do site para o cliente: só dias disponíveis,
// pacote de dias seguidos, feriado como pacote fechado, 1 dia extra antes/depois e preço calculado pelas regras.
export function NovaReserva({ ag, chamar, fechar, inicio }: { ag: AgendaData; chamar: Chamar; fechar: () => void; inicio?: string }) {
  const { cfg } = ag;
  const [sel, setSel] = useState<Sel>(() => {
    const w = inicio && visivel(inicio, ag) ? janela(inicio, ag) : null;
    const p = inicio && visivel(inicio, ag) ? periodoDe(inicio, ag) : undefined;
    return p ? { a: p.entrada, b: p.saida, xb: false, xa: false } : w ? { a: w[0], b: w[1], xb: false, xa: false } : VAZIO;
  });
  const [dica, setDica] = useState('');
  const [mes, setMes] = useState(() => {
    const ref = sel.a ?? inicio ?? ag.hoje;
    return { y: +ref.slice(0, 4), m: +ref.slice(5, 7) - 1 };
  });
  const [f, setF] = useState({ igreja: '', nome: '', whats: '', total: '', recebido: '' });
  const [salvando, setSalvando] = useState(false);
  // Reserva especial: o administrador pode fechar menos dias (até 1 dia) e usar qualquer dia ainda livre, fora das regras do site.
  const [especial, setEspecial] = useState(false);
  const ocupado = (d: string) => {
    const s = statusDia(d, ag);
    return s === 'reservado' || s === 'passado';
  };

  const ef = sel.a && sel.b ? { a: sel.xb ? add(sel.a, -1) : sel.a, b: sel.xa ? add(sel.b, 1) : sel.b } : null;
  const cot = !especial && ef ? cotar(ef.a, ef.b, ag) : null;
  const base = !especial && sel.a && sel.b ? cotar(sel.a, sel.b, ag) : null;
  const nDias = ef ? diff(ef.a, ef.b) : 0;
  const temOcupado = especial && !!ef && Array.from({ length: nDias }, (_, i) => add(ef.a, i)).some(ocupado);
  const periodoExato = ef ? ag.periodos.find((p) => p.entrada === ef.a && p.saida === ef.b) : undefined;
  const sugerido = especial ? (periodoExato ? periodoExato.preco : nDias >= cfg.minDias ? cfg.base + (nDias - cfg.minDias) * cfg.extra : 0) : cot && cot.ok ? cot.total : 0;
  const pronto = especial ? !!ef && !temOcupado : !!cot && cot.ok;
  const hojeMes = +ag.hoje.slice(0, 4) * 12 + +ag.hoje.slice(5, 7) - 1;
  const irMes = (delta: number) =>
    setMes((m) => {
      const t = m.y * 12 + m.m + delta;
      return t < hojeMes || t > hojeMes + 24 ? m : { y: Math.floor(t / 12), m: t % 12 };
    });

  const tocarEspecial = (d: string) => {
    if (ocupado(d)) return setDica('Esse dia já passou ou já tem reserva.');
    setDica('');
    if (!sel.a || !sel.b) return setSel({ a: d, b: d, xb: false, xa: false }); // um toque = 1 dia
    if (d === sel.a) return setSel(VAZIO);
    if (d > sel.a) return setSel({ a: sel.a, b: d, xb: false, xa: false });
    setSel({ a: d, b: d, xb: false, xa: false });
  };
  const alternarEspecial = (v: boolean) => {
    setEspecial(v);
    setSel(VAZIO);
    setDica('');
    setF({ ...f, total: '' });
  };

  const tocar = (d: string) => {
    if (especial) return tocarEspecial(d);
    if (ef && sel.xb && d === ef.a) return setSel({ ...sel, xb: false });
    if (ef && sel.xa && d === ef.b) return setSel({ ...sel, xa: false });
    if (!visivel(d, ag)) return setDica('Essa data não está disponível. Escolha uma data verde.');
    setDica('');
    const periodoEscolhido = sel.a && sel.b && ag.periodos.some((p) => p.entrada === sel.a && p.saida === sel.b);
    const p = periodoDe(d, ag);
    if (periodoEscolhido && sel.a && sel.b && d >= sel.a && d <= sel.b) return setSel(VAZIO);
    if (p) return setSel({ a: p.entrada, b: p.saida, xb: false, xa: false });
    if (sel.a && d === sel.a) return setSel(VAZIO);
    if (sel.b && d === sel.b) return setSel({ ...sel, b: null, xa: false });
    if (sel.a && d > sel.a) {
      if (sel.b && diff(sel.a, d) < cfg.minDias) return setDica(`O mínimo são ${cfg.minDias} dias: a saída mais cedo é ${dia(add(sel.a, cfg.minDias - 1))}.`);
      return setSel({ ...sel, b: d, xa: false });
    }
    const w = janela(d, ag); // um toque marca o pacote de dias
    if (w) setSel({ a: w[0], b: w[1], xb: false, xa: false });
    else {
      setSel(VAZIO);
      setDica(`Não há ${cfg.minDias} dias seguidos livres a partir desta data.`);
    }
  };

  const instrucao = dica
    ? dica
    : especial
      ? !sel.a
        ? 'Reserva especial: toque num dia (vale 1 dia). Toque em outro dia depois dele para ampliar.'
        : temOcupado
          ? 'Há um dia com reserva no meio. Escolha outro período.'
          : `${nDias} ${nDias > 1 ? 'dias marcados' : 'dia marcado'}. Toque em outra data para ampliar ou no primeiro dia para recomeçar.`
      : !sel.a
      ? 'Toque no dia de chegada.'
      : !sel.b
        ? `Agora toque no dia da saída (mínimo ${cfg.minDias} dias).`
        : cot && !cot.ok
          ? 'Essas datas não funcionam juntas. Escolha outras.'
          : `${diff(sel.a, sel.b)} dias marcados. Toque em outra data para mudar a saída, ou na entrada para recomeçar.`;
  const alerta = !!dica || (!!cot && !cot.ok) || temOcupado;

  const dB = sel.a ? add(sel.a, -1) : '';
  const dA = sel.b ? add(sel.b, 1) : '';
  const podeExtras = !!base && base.ok && !base.periodo;
  const canB = podeExtras && (sel.xb || cotar(dB, sel.xa ? dA : sel.b!, ag).ok);
  const canA = podeExtras && (sel.xa || cotar(sel.xb ? dB : sel.a!, dA, ag).ok);

  const primeiro = new Date(Date.UTC(mes.y, mes.m, 1));
  const n = new Date(Date.UTC(mes.y, mes.m + 1, 0)).getUTCDate();
  const titulo = primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const celulas: React.ReactNode[] = [];
  for (let i = 0; i < primeiro.getUTCDay(); i++) celulas.push(<div key={'v' + i} />);
  for (let i = 1; i <= n; i++) {
    const d = new Date(Date.UTC(mes.y, mes.m, i)).toISOString().slice(0, 10);
    const livre = especial ? !ocupado(d) : visivel(d, ag);
    const dentro = ef ? d >= ef.a && d <= ef.b : sel.a === d;
    const extraSel = !!ef && ((sel.xb && d === ef.a) || (sel.xa && d === ef.b));
    const ruim = dentro && !!cot && !cot.ok;
    const marca = ef ? (d === ef.a ? 'entrada' : d === ef.b ? 'saída' : '') : sel.a === d ? 'entrada' : '';
    const cor = dentro
      ? ruim
        ? 'bg-red-100 border-red-400 text-red-700'
        : extraSel
          ? 'bg-amber-700 border-amber-700 text-white'
          : 'bg-[#1B4332] border-[#1B4332] text-white'
      : livre
        ? 'bg-[#DDEBDA] border-[#9DBFA2] font-semibold text-[#14301F] hover:border-[#1B4332] cursor-pointer'
        : `bg-[#E6E0D2] border-[#D2CAB8] text-stone-600 cursor-default ${statusDia(d, ag) === 'passado' ? 'opacity-60' : ''}`;
    celulas.push(
      <button
        key={d}
        type="button"
        onClick={() => tocar(d)}
        aria-label={`${dia(d)} ${livre ? 'disponível' : 'indisponível'}`}
        aria-pressed={dentro}
        className={`relative flex aspect-square min-h-10 select-none items-center justify-center rounded-md border text-sm transition-colors ${cor}`}
      >
        {marca && <span className="absolute left-0 right-0 top-0.5 text-center text-[8px] uppercase leading-none tracking-wide">{marca}</span>}
        {i}
        {periodoDe(d, ag) && <span className="absolute bottom-1 left-2 right-2 h-0.5 rounded bg-amber-500" />}
      </button>
    );
  }

  const totalNum = f.total !== '' ? +f.total : sugerido;
  const sinalNum = Math.round((totalNum * cfg.sinalPct) / 100);
  const criar = async (status: 'confirmada' | 'aguardando_sinal') => {
    if (!ef || !pronto || totalNum <= 0) return;
    setSalvando(true);
    const r = await chamar('reserva.criar', {
      entrada: ef.a,
      saida: ef.b,
      total: totalNum,
      nome: f.nome,
      igreja: f.igreja,
      whatsapp: f.whats,
      status,
      ...(status === 'confirmada' ? { pago: f.recebido } : {}),
    });
    setSalvando(false);
    if (r.ok) fechar();
  };
  const atalhos = !sel.b && !especial ? proximas(ag, 3) : [];

  return (
    <div>
      <h2 className="pr-10 font-serif text-2xl text-[#14301F]">Nova reserva</h2>
      <p className="mt-1 text-sm text-stone-600">Para quem fechou por telefone ou WhatsApp. Por padrão segue as mesmas regras do site: só datas disponíveis e preço pelas regras.</p>
      <label className={`mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm ${especial ? 'border-amber-500 bg-amber-50' : 'border-[#D2CAB8] bg-white'}`}>
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#B45F05]" checked={especial} onChange={(e) => alternarEspecial(e.target.checked)} />
        <span>
          <b>Reserva especial</b> (fora das regras do site)
          <span className="block text-xs text-stone-600">Permite fechar menos de {cfg.minDias} dias, até 1 dia só, e usar qualquer dia ainda livre. Você informa o valor.</span>
        </span>
      </label>

      <div role="status" className={`mt-4 rounded-lg border px-3 py-2.5 text-sm ${alerta ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-[#9DBFA2] bg-[#F1F6F0] text-[#14301F]'}`}>
        {instrucao}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" onClick={() => irMes(-1)} disabled={mes.y * 12 + mes.m <= hojeMes} aria-label="Mês anterior" className={botao}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-serif text-lg text-[#14301F] first-letter:uppercase">{titulo}</p>
        <button type="button" onClick={() => irMes(1)} aria-label="Próximo mês" className={botao}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((x) => (
          <div key={x} className="pb-1 text-center text-xs font-medium text-stone-600">
            {x}
          </div>
        ))}
        {celulas}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
        <span><i className="mr-1 inline-block h-3 w-3 rounded-sm border border-[#9DBFA2] bg-[#DDEBDA] align-[-2px]" />Disponível</span>
        <span><i className="mr-1 inline-block h-3 w-3 rounded-sm border border-[#D2CAB8] bg-[#E6E0D2] align-[-2px]" />Indisponível</span>
        {!especial && <span><i className="mr-1 inline-block h-0.5 w-3 bg-amber-500 align-middle" />Feriado (pacote fechado)</span>}
      </div>
      {atalhos.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-600">Atalho, fins de semana livres:</span>
          {atalhos.map((q) => (
            <button
              key={q.a}
              type="button"
              onClick={() => {
                setSel({ a: q.a, b: q.b, xb: false, xa: false });
                setDica('');
                setMes({ y: +q.a.slice(0, 4), m: +q.a.slice(5, 7) - 1 });
              }}
              className="rounded-full border border-[#BDB4A1] bg-white px-3 py-1.5 text-xs hover:border-[#1B4332]"
            >
              {dia(q.a)} a {dia(q.b)} · {brl(q.total)}
            </button>
          ))}
        </div>
      )}

      {sel.a && (
        <div className="mt-5 rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-4">
          <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <div><span className="block text-[11px] uppercase text-stone-600">Entrada</span><b>{dia(ef ? ef.a : sel.a)}</b></div>
            <div><span className="block text-[11px] uppercase text-stone-600">Saída</span><b>{ef ? dia(ef.b) : '—'}</b></div>
            <button type="button" onClick={() => { setSel(VAZIO); setDica(''); }} className={botao}><X className="h-4 w-4" /> Limpar</button>
          </div>
          {cot && !cot.ok && <p className="mt-3 text-sm text-red-700">{cot.erro}</p>}
          {pronto && (
            <>
              {(canB || canA) && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold">Dia extra</p>
                  {canB && (
                    <button type="button" onClick={() => setSel({ ...sel, xb: !sel.xb })} className={`mb-2 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm ${sel.xb ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-[#BDB4A1] bg-white'}`}>
                      <span>{sel.xb ? '✓ ' : '+ '}Chegar 1 dia antes ({dia(dB)})</span><b>+ {brl(cfg.extra)}</b>
                    </button>
                  )}
                  {canA && (
                    <button type="button" onClick={() => setSel({ ...sel, xa: !sel.xa })} className={`mb-2 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm ${sel.xa ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-[#BDB4A1] bg-white'}`}>
                      <span>{sel.xa ? '✓ ' : '+ '}Sair 1 dia depois ({dia(dA)})</span><b>+ {brl(cfg.extra)}</b>
                    </button>
                  )}
                </div>
              )}
              <div className="mt-3 text-sm">
                {cot && cot.ok ? (
                  <>
                    {cot.linhas.map(([nome, v]) => (
                      <div key={nome} className="flex justify-between py-0.5"><span>{nome}</span><span>{brl(v)}</span></div>
                    ))}
                    <div className="mt-1 flex justify-between border-t border-[#D2CAB8] pt-2 text-base font-bold"><span>Total pelas regras ({cot.n} dias)</span><span>{brl(cot.total)}</span></div>
                  </>
                ) : (
                  <p className="text-stone-700">
                    Reserva especial de <b>{nDias} {nDias > 1 ? 'dias' : 'dia'}</b>.{' '}
                    {sugerido > 0 ? `Valor sugerido pelas regras: ${brl(sugerido)}.` : `Menos de ${cfg.minDias} dias não tem preço nas regras: informe o valor combinado abaixo.`}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <input className={campo} placeholder="Igreja ou ministério" value={f.igreja} onChange={(e) => setF({ ...f, igreja: e.target.value })} />
                <input className={campo} placeholder="Responsável" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} autoComplete="off" />
                <input className={campo} placeholder="WhatsApp com DDD" inputMode="tel" value={f.whats} onChange={(e) => setF({ ...f, whats: mascara(e.target.value) })} autoComplete="off" />
                <label className={rotulo}>
                  {especial ? 'Total combinado (R$)' : 'Total (R$), já calculado pelas regras. Mude só se combinou outro valor'}
                  <CampoReais className={`${campo} mt-1`} placeholder="R$ 0" value={String(f.total !== '' ? f.total : sugerido > 0 ? sugerido : '')} onChange={(v) => setF({ ...f, total: v })} />
                </label>
                <label className={rotulo}>
                  Já recebido (R$), se criar como confirmada
                  <CampoReais className={`${campo} mt-1`} placeholder={`Vazio = sinal (${brl(sinalNum)})`} value={f.recebido} onChange={(v) => setF({ ...f, recebido: v })} />
                </label>
              </div>
              <div className="mt-4 grid gap-2">
                <button disabled={salvando || totalNum <= 0} className={botaoPri} onClick={() => criar('confirmada')}>Criar como confirmada</button>
                <button disabled={salvando || totalNum <= 0} className={botao} onClick={() => criar('aguardando_sinal')}>Criar aguardando sinal</button>
              </div>
              <p className="mt-2 text-xs text-stone-600">Aguardando sinal segura a data por {cfg.holdHoras} horas.</p>
            </>
          )}
        </div>
      )}
      {!sel.a && <p className="mt-4 text-sm text-stone-600">A partir de {brl(cfg.base)} por {cfg.minDias} dias. Cada dia a mais: {brl(cfg.extra)}.</p>}
    </div>
  );
}
