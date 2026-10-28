'use client';

import React, { useState } from 'react';
import { br, brl, diff, segura, type AdminData, type Reserva } from '@/lib/agenda';

const PILULA: Record<string, string> = {
  aguardando_sinal: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-red-100 text-red-800',
  expirada: 'bg-stone-200 text-stone-600',
};
const ROTULO: Record<string, string> = { aguardando_sinal: 'aguardando sinal', confirmada: 'confirmada', cancelada: 'cancelada', expirada: 'expirada' };
export const Pilula = ({ status }: { status: string }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${PILULA[status] ?? ''}`}>{ROTULO[status] ?? status}</span>
);

// Reserva que vence sem sinal conta como expirada, mesmo antes de o servidor atualizar o status.
export const statusReal = (r: Reserva, agora: string) => (r.status === 'aguardando_sinal' && !segura(r, agora) ? 'expirada' : r.status);

export function Resumo({ dados, abrir, confirmar }: { dados: AdminData; abrir: (id: number) => void; confirmar: (id: number) => void }) {
  const { agora, hoje, cfg } = dados;
  const ativas = dados.reservas.filter((r) => segura(r, agora));
  const espera = ativas.filter((r) => r.status === 'aguardando_sinal');
  const futuras = ativas.filter((r) => r.saida >= hoje);
  const proximas = ativas.filter((r) => r.entrada >= hoje).sort((a, b) => (a.entrada < b.entrada ? -1 : 1)).slice(0, 5);
  const kpis: [string, string | number][] = [
    ['Aguardando sinal', espera.length],
    ['Sinais a receber', brl(espera.reduce((s, r) => s + r.sinal, 0))],
    ['Receita confirmada futura', brl(futuras.filter((r) => r.status === 'confirmada').reduce((s, r) => s + r.total, 0))],
    ['Reservas futuras', futuras.length],
  ];
  const meses = Array.from({ length: 6 }, (_, i) => {
    const t = +hoje.slice(0, 4) * 12 + +hoje.slice(5, 7) - 1 + i;
    const y = Math.floor(t / 12), m = t % 12, n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let c = 0, w = 0;
    for (let k = 1; k <= n; k++) {
      const d = new Date(Date.UTC(y, m, k)).toISOString().slice(0, 10);
      const r = ativas.find((x) => d >= x.entrada && d <= x.saida);
      if (r) r.status === 'confirmada' ? c++ : w++;
    }
    return { rot: new Date(Date.UTC(y, m, 1)).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }), c: (c / n) * 100, w: (w / n) * 100 };
  });
  const card = 'bg-white rounded-2xl border border-stone-200 p-4';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(([l, v]) => (
          <div key={l} className={card}>
            <div className="text-2xl font-serif font-bold text-[#1B4332]">{v}</div>
            <div className="text-xs text-stone-500">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className={card}>
          <h3 className="font-bold">Precisam de ação</h3>
          <p className="text-xs text-stone-500 mb-2">Pedidos aguardando o sinal de {cfg.sinalPct}%.</p>
          {espera.length === 0 && <p className="text-sm text-stone-500">Nada pendente 🎉</p>}
          {espera.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-stone-100 last:border-0 text-sm">
              <div>
                <b>{r.igreja || r.nome}</b>
                <div className="text-xs text-stone-500">{br(r.entrada)} a {br(r.saida)} · sinal {brl(r.sinal)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => confirmar(r.id)} className="rounded-lg bg-[#1B4332] text-white px-3 py-1.5 text-xs">Confirmar sinal</button>
                <button onClick={() => abrir(r.id)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs">Ver</button>
              </div>
            </div>
          ))}
        </div>
        <div className={card}>
          <h3 className="font-bold">Próximas chegadas</h3>
          <p className="text-xs text-stone-500 mb-2">Reservas a partir de hoje.</p>
          {proximas.length === 0 && <p className="text-sm text-stone-500">Nenhuma reserva futura.</p>}
          {proximas.map((r) => (
            <button key={r.id} onClick={() => abrir(r.id)} className="flex w-full items-center justify-between gap-2 py-2 border-b border-stone-100 last:border-0 text-sm text-left">
              <span>
                <b>{r.igreja || r.nome}</b>
                <span className="block text-xs text-stone-500">{br(r.entrada)} a {br(r.saida)} · {brl(r.total)}</span>
              </span>
              <Pilula status={r.status} />
            </button>
          ))}
        </div>
        <div className={`${card} md:col-span-2`}>
          <h3 className="font-bold">Ocupação nos próximos meses</h3>
          <p className="text-xs text-stone-500 mb-3"><i className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600 mr-1" />confirmado <i className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mx-1 ml-3" />aguardando sinal</p>
          <div className="space-y-2">
            {meses.map((x) => (
              <div key={x.rot} className="grid grid-cols-[64px_1fr_40px] items-center gap-2 text-xs">
                <span className="capitalize">{x.rot}</span>
                <div className="flex h-3.5 rounded-full bg-stone-100 overflow-hidden">
                  <i className="bg-emerald-600" style={{ width: x.c + '%' }} />
                  <i className="bg-amber-400" style={{ width: x.w + '%' }} />
                </div>
                <b>{Math.round(x.c + x.w)}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListaReservas({ dados, abrir }: { dados: AdminData; abrir: (id: number) => void }) {
  const [filtro, setFiltro] = useState('todas');
  const [busca, setBusca] = useState('');
  const t = busca.toLowerCase();
  const linhas = dados.reservas
    .map((r) => ({ r, st: statusReal(r, dados.agora) }))
    .filter(({ r, st }) => (filtro === 'todas' || st === filtro) && (!t || `${r.nome} ${r.igreja ?? ''} ${r.whatsapp}`.toLowerCase().includes(t)))
    .sort((a, b) => (a.r.entrada < b.r.entrada ? -1 : 1));
  const filtros: [string, string][] = [['todas', 'Todas'], ['aguardando_sinal', 'Aguardando sinal'], ['confirmada', 'Confirmadas'], ['cancelada', 'Canceladas'], ['expirada', 'Expiradas']];
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <div className="flex flex-wrap gap-2 mb-3">
        {filtros.map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} className={`rounded-full border px-3 py-1 text-sm ${filtro === k ? 'bg-[#1B4332] text-white border-[#1B4332]' : 'border-stone-300'}`}>{l}</button>
        ))}
      </div>
      <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, igreja ou WhatsApp" className="w-full rounded-lg border border-stone-300 px-3 py-2 mb-3 text-sm" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500 text-xs">
              <th className="py-2">Cliente</th><th>Datas</th><th>Total</th><th>Sinal</th><th>Origem</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ r, st }) => (
              <tr key={r.id} onClick={() => abrir(r.id)} className="border-t border-stone-100 cursor-pointer hover:bg-stone-50">
                <td className="py-2"><b>{r.igreja || r.nome}</b><div className="text-xs text-stone-500">{r.nome}</div></td>
                <td>{br(r.entrada)} a {br(r.saida)}<div className="text-xs text-stone-500">{diff(r.entrada, r.saida)} dias</div></td>
                <td>{brl(r.total)}</td>
                <td>{brl(r.sinal)}</td>
                <td>{r.origem === 'manual' ? '✍️ Manual' : '🌐 Site'}</td>
                <td><Pilula status={st} /></td>
              </tr>
            ))}
            {linhas.length === 0 && <tr><td colSpan={6} className="py-4 text-stone-500">Nenhuma reserva.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
