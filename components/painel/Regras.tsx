'use client';

import React, { useEffect, useState } from 'react';
import { br, type AdminData } from '@/lib/agenda';
import type { Chamar } from './tipos';

const CAMPOS: [keyof Omit<AdminData['cfg'], 'diasPadrao'>, string][] = [
  ['base', 'Preço base (R$)'],
  ['minDias', 'Dias do pacote base'],
  ['extra', 'Dia extra (R$)'],
  ['sinalPct', 'Sinal (%)'],
  ['holdHoras', 'Segurar a data (horas)'],
  ['capacidade', 'Capacidade (pessoas)'],
  ['maxDias', 'Máximo de dias pelo site'],
];
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const campo = 'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';

interface Linha {
  id?: number;
  nome: string;
  entrada: string;
  saida: string;
  preco: string;
  bloqueado: boolean;
}

export function Regras({ dados, chamar }: { dados: AdminData; chamar: Chamar }) {
  const [cfg, setCfg] = useState(() => ({ ...dados.cfg }));
  const [pers, setPers] = useState<Linha[]>([]);
  const [ano, setAno] = useState(+dados.hoje.slice(0, 4));
  useEffect(() => setCfg({ ...dados.cfg }), [dados.cfg]);
  useEffect(() => setPers(dados.periodos.map((p) => ({ ...p, preco: String(p.preco) }))), [dados.periodos]);

  const salvarCfg = () => chamar('cfg', { ...cfg });
  const edita = (i: number, k: keyof Linha, v: string | boolean) => setPers((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const novo = () => setPers((l) => [...l, { nome: 'Novo período', entrada: dados.hoje, saida: dados.hoje, preco: '0', bloqueado: false }]);
  const card = 'bg-white rounded-2xl border border-stone-200 p-4';

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className={card}>
        <h3 className="font-bold">Preços e regras</h3>
        <p className="text-xs text-stone-500 mb-3">Tudo que o site usa para calcular. Salvou, o cliente já vê.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CAMPOS.map(([k, l]) => (
            <label key={k} className="text-xs text-stone-500">
              {l}
              <input type="number" min={0} className={campo} value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value === '' ? 0 : +e.target.value })} />
            </label>
          ))}
        </div>
        <h4 className="font-bold mt-5 text-sm">Dias abertos por padrão</h4>
        <p className="text-xs text-stone-500 mb-2">Dias da semana que o cliente vê como livres. Você ainda abre ou fecha qualquer dia no calendário.</p>
        <div className="flex flex-wrap gap-2">
          {SEMANA.map((n, i) => (
            <label key={n} className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={cfg.diasPadrao.includes(i)} onChange={(e) => setCfg({ ...cfg, diasPadrao: e.target.checked ? [...cfg.diasPadrao, i] : cfg.diasPadrao.filter((x) => x !== i) })} />
              {n}
            </label>
          ))}
        </div>
        <button onClick={salvarCfg} className="mt-4 rounded-xl bg-[#1B4332] text-white px-5 py-2.5 font-bold">Salvar preços e regras</button>
      </div>

      <div className={card}>
        <h3 className="font-bold">Períodos especiais</h3>
        <p className="text-xs text-stone-500 mb-3">Você define nome, datas e preço. O cliente leva o período inteiro. “Bloqueado” = ninguém reserva (ex.: Natal).</p>
        <div className="flex flex-wrap items-end gap-2 mb-3">
          <label className="text-xs text-stone-500 w-24">Ano<input type="number" className={campo} value={ano} onChange={(e) => setAno(+e.target.value)} /></label>
          <button onClick={() => chamar('sugerir', { ano })} className="rounded-lg border border-stone-300 px-3 py-2 text-sm">✨ Sugerir feriados do ano</button>
        </div>
        <p className="text-xs text-stone-500 mb-3">Carnaval, Semana Santa e Corpus Christi são calculados pela Páscoa. Confira datas e preços depois.</p>
        <div className="space-y-3">
          {pers.map((p, i) => (
            <div key={p.id ?? 'novo' + i} className="rounded-xl border border-stone-200 p-3">
              <input className={campo} value={p.nome} onChange={(e) => edita(i, 'nome', e.target.value)} />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <label className="text-xs text-stone-500 min-w-0">Entrada<input type="date" className={campo} value={p.entrada} onChange={(e) => edita(i, 'entrada', e.target.value)} /></label>
                <label className="text-xs text-stone-500 min-w-0">Saída<input type="date" className={campo} value={p.saida} onChange={(e) => edita(i, 'saida', e.target.value)} /></label>
              </div>
              <div className="flex flex-wrap items-end gap-3 mt-2">
                <label className="text-xs text-stone-500 w-32">Preço (R$)<input type="number" min={0} step={500} className={campo} value={p.preco} onChange={(e) => edita(i, 'preco', e.target.value)} /></label>
                <label className="flex items-center gap-1.5 text-sm pb-2"><input type="checkbox" checked={p.bloqueado} onChange={(e) => edita(i, 'bloqueado', e.target.checked)} />Bloqueado</label>
                <div className="ml-auto flex gap-2 pb-1">
                  <button onClick={() => chamar('periodo', { ...p, preco: +p.preco })} className="rounded-lg bg-[#1B4332] text-white px-3 py-1.5 text-sm">Salvar</button>
                  {p.id ? (
                    <button onClick={() => confirm(`Remover “${p.nome}” (${br(p.entrada)} a ${br(p.saida)})?`) && chamar('periodo.remover', { id: p.id })} className="rounded-lg border border-stone-300 text-red-700 px-3 py-1.5 text-sm">Remover</button>
                  ) : (
                    <button onClick={() => setPers((l) => l.filter((_, j) => j !== i))} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm">Descartar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {pers.length === 0 && <p className="text-sm text-stone-500">Nenhum período cadastrado.</p>}
        </div>
        <button onClick={novo} className="mt-3 rounded-lg border border-dashed border-emerald-500 text-[#1B4332] px-3 py-2 text-sm font-semibold">+ Novo período</button>
      </div>
    </div>
  );
}
