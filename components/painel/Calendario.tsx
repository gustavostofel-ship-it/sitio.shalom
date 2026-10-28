'use client';

import React, { useEffect, useRef, useState } from 'react';
import { periodoDe, segura, statusDia, visivel, type AdminData, type AgendaData } from '@/lib/agenda';

export interface Mes {
  y: number;
  m: number;
}
interface Props {
  dados: AdminData;
  ag: AgendaData;
  meses: Mes[];
  compacto: boolean;
  sel: { a: string; b: string } | null;
  aoSelecionar: (a: string, b: string) => void;
}

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function Calendario({ dados, ag, meses, compacto, sel, aoSelecionar }: Props) {
  // Arrastar com o mouse seleciona vários dias; um toque seleciona um dia.
  const [arrasto, setArrasto] = useState<{ a: string; b: string } | null>(null);
  const ref = useRef(arrasto);
  ref.current = arrasto;
  useEffect(() => {
    const solta = () => {
      const x = ref.current;
      if (!x) return;
      setArrasto(null);
      aoSelecionar(x.a < x.b ? x.a : x.b, x.a < x.b ? x.b : x.a);
    };
    window.addEventListener('mouseup', solta);
    return () => window.removeEventListener('mouseup', solta);
  }, [aoSelecionar]);

  const ativa = dados.reservas.filter((r) => segura(r, dados.agora));
  const faixaSel = arrasto ? [arrasto.a, arrasto.b].sort() : sel ? [sel.a, sel.b] : null;

  const mes = ({ y, m }: Mes) => {
    const primeiro = new Date(Date.UTC(y, m, 1));
    const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const titulo = primeiro.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const cel: React.ReactNode[] = [];
    for (let i = 0; i < primeiro.getUTCDay(); i++) cel.push(<div key={'v' + i} />);
    for (let i = 1; i <= n; i++) {
      const d = new Date(Date.UTC(y, m, i)).toISOString().slice(0, 10);
      const st = statusDia(d, ag);
      const r = ativa.find((x) => d >= x.entrada && d <= x.saida);
      const oculto = st === 'livre' && !visivel(d, ag);
      const motivo = dados.dias[d]?.motivo;
      const noSel = !!faixaSel && d >= faixaSel[0] && d <= faixaSel[1];
      const per = periodoDe(d, ag);
      const fundo = r
        ? compacto
          ? r.status === 'confirmada'
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'bg-amber-400 border-amber-400 text-slate-900'
          : 'bg-white border-stone-200'
        : st === 'livre'
          ? oculto
            ? 'bg-emerald-50 border-dashed border-amber-500'
            : 'bg-emerald-50 border-emerald-300'
          : st === 'passado'
            ? 'bg-stone-50 border-stone-100 text-stone-300'
            : 'bg-stone-100 border-stone-200 text-stone-400';
      const inicio = !!r && (d === r.entrada || i === 1 || (new Date(d + 'T00:00:00Z').getUTCDay() === 0));
      cel.push(
        <div
          key={d}
          data-dia={d}
          onMouseDown={(e) => {
            e.preventDefault();
            setArrasto({ a: d, b: d });
          }}
          onMouseEnter={() => arrasto && setArrasto({ a: arrasto.a, b: d })}
          title={[per?.nome, r?.igreja, motivo, oculto ? 'Aberto, mas oculto para o cliente (menos de 3 dias seguidos)' : ''].filter(Boolean).join(' · ')}
          className={`relative overflow-hidden rounded-lg border cursor-pointer select-none ${compacto ? 'aspect-square' : 'min-h-[92px]'} ${fundo} ${noSel ? 'outline outline-2 -outline-offset-2 outline-[#1B4332]' : ''}`}
        >
          <span className={`absolute ${compacto ? 'top-0.5 left-1 text-[11px]' : 'top-1 left-1.5 text-[13px]'}`}>{i}</span>
          {r && !compacto && (
            <div
              className={`absolute -left-px -right-px bottom-1.5 h-[22px] px-1.5 text-[11px] leading-[22px] truncate ${r.status === 'confirmada' ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-slate-900'} ${d === r.entrada ? 'ml-1 rounded-l-full' : ''} ${d === r.saida ? 'mr-1 rounded-r-full' : ''}`}
            >
              {inicio ? r.igreja || r.nome : ''}
            </div>
          )}
          {!r && !compacto && motivo && st === 'fechado' && <span className="absolute left-1.5 bottom-1 text-[11px] text-stone-500 truncate max-w-full pr-1">🔒 {motivo}</span>}
          {!r && !compacto && oculto && <span className="absolute left-1.5 bottom-1 text-[11px] text-amber-700">oculto</span>}
          {per && <span className="absolute bottom-0.5 left-1 right-1 h-0.5 rounded bg-amber-500" />}
        </div>
      );
    }
    return (
      <div key={y + '-' + m} className="min-w-0">
        <div className={`text-center font-bold first-letter:uppercase mb-1.5 ${compacto ? 'text-xs' : 'text-base'}`}>{titulo}</div>
        <div className="grid grid-cols-7 gap-1">
          {SEMANA.map((x) => (
            <div key={x} className="text-center text-[11px] text-stone-500">{x}</div>
          ))}
          {cel}
        </div>
      </div>
    );
  };

  return (
    <div className={meses.length === 1 ? '' : meses.length === 3 ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4 grid-cols-2 lg:grid-cols-4'}>
      {meses.map(mes)}
    </div>
  );
}

export const mesesDe = (ini: Mes, qtd: number): Mes[] =>
  Array.from({ length: qtd }, (_, i) => {
    const t = ini.y * 12 + ini.m + i;
    return { y: Math.floor(t / 12), m: t % 12 };
  });
export const hojeComoMes = (hoje: string): Mes => ({ y: +hoje.slice(0, 4), m: +hoje.slice(5, 7) - 1 });
