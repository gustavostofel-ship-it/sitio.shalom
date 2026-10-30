'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { br, type AdminData } from '@/lib/agenda';
import type { Chamar } from './tipos';
import { Secao, botao, botaoPerigo, botaoPri, campo, rotulo } from './ui';

const CAMPOS: [keyof Omit<AdminData['cfg'], 'diasPadrao'>, string][] = [
  ['base', 'Preço base (R$)'],
  ['minDias', 'Dias do pacote base'],
  ['extra', 'Dia extra (R$)'],
  ['sinalPct', 'Sinal para reservar (%)'],
  ['holdHoras', 'Segurar a data (horas)'],
  ['capacidade', 'Capacidade (pessoas)'],
  ['maxDias', 'Máximo de dias pelo site'],
];
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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

  const edita = (i: number, k: keyof Linha, v: string | boolean) => setPers((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const novo = () => setPers((l) => [...l, { nome: 'Novo período', entrada: dados.hoje, saida: dados.hoje, preco: '0', bloqueado: false }]);

  return (
    <div className="space-y-6">
      <Secao titulo="Preços e regras" texto="O que o site usa para calcular o valor e a disponibilidade. Ao salvar, o cliente já vê a mudança.">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-4">
          {CAMPOS.map(([k, l]) => (
            <label key={k} className={rotulo}>
              {l}
              <input type="number" min={0} className={`${campo} mt-1`} value={cfg[k]} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value === '' ? 0 : +e.target.value })} />
            </label>
          ))}
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-[#14301F]">Dias abertos por padrão</legend>
          <p className="mb-2 text-sm text-stone-600">Dias da semana que o cliente vê como livres. Você ainda abre ou fecha qualquer dia no calendário.</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {SEMANA.map((n, i) => {
              const on = cfg.diasPadrao.includes(i);
              return (
                <label key={n} className={`cursor-pointer select-none rounded-md border px-2.5 py-2.5 text-sm transition-colors sm:px-3.5 sm:py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#D97706] ${on ? 'border-[#1B4332] bg-[#1B4332] font-medium text-white' : 'border-[#BDB4A1] bg-white text-stone-700 hover:border-[#1B4332]'}`}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={(e) => setCfg({ ...cfg, diasPadrao: e.target.checked ? [...cfg.diasPadrao, i] : cfg.diasPadrao.filter((x) => x !== i) })} />
                  {n}
                </label>
              );
            })}
          </div>
        </fieldset>
        <button onClick={() => chamar('cfg', { ...cfg })} className={`${botaoPri} mt-6`}>Salvar preços e regras</button>
      </Secao>

      <Secao titulo="Períodos especiais" texto="Feriados e datas com pacote fechado: o cliente leva o período inteiro, pelo preço que você definir. Marque “Bloqueado” para ninguém reservar (como o Natal).">
        <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg bg-[#ECE7DA] p-4">
          <label className={`${rotulo} w-28`}>
            Ano
            <input type="number" className={`${campo} mt-1`} value={ano} onChange={(e) => setAno(+e.target.value)} />
          </label>
          <button onClick={() => chamar('sugerir', { ano })} className={botao}>
            <Sparkles className="h-4 w-4" /> Sugerir feriados do ano
          </button>
          <p className="basis-full text-sm text-stone-600 sm:basis-auto sm:flex-1">Carnaval, Semana Santa e Corpus Christi são calculados pela Páscoa. Confira datas e preços depois.</p>
        </div>

        {pers.length === 0 && <p className="text-sm text-stone-600">Nenhum período cadastrado. Use “Sugerir feriados do ano” ou crie um novo.</p>}
        <ul className="divide-y divide-[#D9D2C3]">
          {pers.map((p, i) => (
            <li key={p.id ?? 'novo' + i} className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_0.8fr] lg:items-end">
              <label className={`${rotulo} sm:col-span-2 lg:col-span-1`}>
                Nome
                <input className={`${campo} mt-1`} value={p.nome} onChange={(e) => edita(i, 'nome', e.target.value)} />
              </label>
              <label className={rotulo}>
                Entrada
                <input type="date" className={`${campo} mt-1`} value={p.entrada} onChange={(e) => edita(i, 'entrada', e.target.value)} />
              </label>
              <label className={rotulo}>
                Saída
                <input type="date" className={`${campo} mt-1`} value={p.saida} onChange={(e) => edita(i, 'saida', e.target.value)} />
              </label>
              <label className={rotulo}>
                Preço (R$)
                <input type="number" min={0} step={500} className={`${campo} mt-1`} value={p.preco} onChange={(e) => edita(i, 'preco', e.target.value)} />
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4 lg:justify-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" className="h-4 w-4 accent-[#1B4332]" checked={p.bloqueado} onChange={(e) => edita(i, 'bloqueado', e.target.checked)} />
                  Bloqueado
                </label>
                <button onClick={() => chamar('periodo', { ...p, preco: +p.preco })} className={botaoPri}>Salvar</button>
                {p.id ? (
                  <button onClick={() => confirm(`Remover “${p.nome}” (${br(p.entrada)} a ${br(p.saida)})?`) && chamar('periodo.remover', { id: p.id })} className={botaoPerigo}>Remover</button>
                ) : (
                  <button onClick={() => setPers((l) => l.filter((_, j) => j !== i))} className={botao}>Descartar</button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <button onClick={novo} className={`${botao} mt-4`}>
          <Plus className="h-4 w-4" /> Novo período
        </button>
      </Secao>
    </div>
  );
}
