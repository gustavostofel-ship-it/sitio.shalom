'use client';

import React, { useEffect, useState } from 'react';
import { Globe, PenLine, Search } from 'lucide-react';
import { add, br, brl, diff, dia, dow, pagamento, paraAgenda, segura, statusDia, type AdminData, type Reserva } from '@/lib/agenda';
import { CURVAS, PilulaReserva, botaoPri, botao, campo } from './ui';

// Reserva que vence sem sinal conta como expirada, mesmo antes de o servidor atualizar o status.
export const statusReal = (r: Reserva, agora: string) => (r.status === 'aguardando_sinal' && !segura(r, agora) ? 'expirada' : r.status);

const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '');

interface ResumoProps {
  dados: AdminData;
  abrir: (id: number) => void;
  confirmar: (id: number) => void;
  irParaDatas: (a: string, b: string) => void;
  irParaCalendario: () => void;
}

export function Resumo({ dados, abrir, confirmar, irParaDatas, irParaCalendario }: ResumoProps) {
  const { agora, hoje, cfg } = dados;
  const ag = paraAgenda(dados);
  const ativas = dados.reservas.filter((r) => segura(r, agora));
  const espera = ativas.filter((r) => r.status === 'aguardando_sinal');
  const futuras = ativas.filter((r) => r.saida >= hoje);
  const noSitio = ativas.find((r) => r.entrada <= hoje && r.saida >= hoje);
  const proxima = ativas.filter((r) => r.entrada > hoje).sort((a, b) => (a.entrada < b.entrada ? -1 : 1))[0];
  const destaque = noSitio ?? proxima;

  // Os 8 próximos fins de semana (sexta a domingo), o que mais importa para quem aluga o sítio.
  const desdeSexta = (dow(hoje) + 2) % 7;
  const primeiraSexta = desdeSexta === 1 || desdeSexta === 2 ? add(hoje, -desdeSexta) : add(hoje, (5 - dow(hoje) + 7) % 7);
  const fins = Array.from({ length: 8 }, (_, i) => {
    const a = add(primeiraSexta, i * 7), b = add(a, 2);
    const r = ativas.find((x) => !(b < x.entrada || a > x.saida));
    const dias = [a, add(a, 1), b].map((d) => statusDia(d, ag));
    const estado = r ? r.status : dias.every((s) => s === 'livre') ? 'livre' : dias.includes('passado') ? 'passado' : 'fechado';
    return { a, b, estado, r };
  });

  const meses = Array.from({ length: 6 }, (_, i) => {
    const t = +hoje.slice(0, 4) * 12 + +hoje.slice(5, 7) - 1 + i;
    const y = Math.floor(t / 12), m = t % 12, n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let c = 0, w = 0;
    for (let k = 1; k <= n; k++) {
      const d = new Date(Date.UTC(y, m, k)).toISOString().slice(0, 10);
      const r = ativas.find((x) => d >= x.entrada && d <= x.saida);
      if (r) r.status === 'confirmada' ? c++ : w++;
    }
    return { rot: new Date(Date.UTC(y, m, 1)).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', ''), c: (c / n) * 100, w: (w / n) * 100 };
  });
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const confirmadasFuturas = futuras.filter((r) => r.status === 'confirmada');
  const saldos = confirmadasFuturas.filter((r) => r.pago < r.total).sort((a, b) => (a.entrada < b.entrada ? -1 : 1));
  const situacao: [string, string | number][] = [
    ['Pedidos aguardando sinal', espera.length],
    ['Sinais a receber', brl(espera.reduce((s, r) => s + r.sinal, 0))],
    ['Já recebido', brl(confirmadasFuturas.reduce((s, r) => s + r.pago, 0))],
    ['Saldo a receber', brl(confirmadasFuturas.reduce((s, r) => s + (r.total - r.pago), 0))],
    ['Reservas futuras', futuras.length],
  ];
  const textoPag = (r: Reserva) =>
    r.status !== 'confirmada' ? `Aguardando sinal de ${brl(r.sinal)}` : pagamento(r) === 'quitada' ? 'Quitada' : r.pago <= 0 ? 'Confirmada, sem pagamento registrado' : `Recebido ${brl(r.pago)} de ${brl(r.total)}`;
  const quando = destaque
    ? noSitio
      ? `Saem ${diff(hoje, noSitio.saida) === 1 ? 'hoje' : `em ${diff(hoje, noSitio.saida) - 1} dias`}`
      : diff(hoje, destaque.entrada) - 1 === 1
        ? 'Chegam amanhã'
        : `Chegam em ${diff(hoje, destaque.entrada) - 1} dias`
    : '';

  return (
    <div className="space-y-10">
      <div className="grid gap-5 lg:grid-cols-12">
        <section
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1B4332] to-[#0F291E] p-6 text-[#F3EFE6] sm:p-8 lg:col-span-7"
          style={{ backgroundImage: `${CURVAS}, linear-gradient(135deg,#1B4332,#0F291E)`, backgroundPosition: 'right -60px bottom -80px, 0 0', backgroundRepeat: 'no-repeat' }}
        >
          <p className="text-sm font-medium text-amber-300">{noSitio ? 'No sítio agora' : 'Próxima chegada'}</p>
          {destaque ? (
            <>
              <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-[34px]">{destaque.igreja || destaque.nome}</h2>
              <p className="mt-2 text-[15px] text-[#CFE0D2]">
                {dia(destaque.entrada)} a {dia(destaque.saida)}, {diff(destaque.entrada, destaque.saida)} dias
              </p>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{quando}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#CFE0D2]">
                    <i className={`h-2 w-2 rounded-full ${destaque.status === 'confirmada' && pagamento(destaque) !== 'pendente' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {textoPag(destaque)}
                  </p>
                </div>
                <button onClick={() => abrir(destaque.id)} className="rounded-md bg-[#D97706] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B86205] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
                  Abrir reserva
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-3 font-serif text-3xl leading-tight">Nenhuma reserva à vista</h2>
              <p className="mt-2 max-w-sm text-[15px] text-[#CFE0D2]">Quando alguém reservar pelo site, a próxima chegada aparece aqui.</p>
              <button onClick={irParaCalendario} className="mt-8 rounded-md bg-[#D97706] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B86205] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
                Ver o calendário
              </button>
            </>
          )}
        </section>

        <section className="rounded-xl border border-[#D2CAB8] bg-white p-6 lg:col-span-5">
          <h2 className="font-serif text-xl text-[#14301F]">Situação</h2>
          <dl className="mt-3 divide-y divide-[#EEE9DF]">
            {situacao.map(([rot, v]) => (
              <div key={rot} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-sm text-stone-600">{rot}</dt>
                <dd className="text-lg font-semibold tabular-nums text-[#1F2937]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl text-[#14301F]">Próximos fins de semana</h2>
          <p className="text-sm text-stone-600">Toque num fim de semana para ver as datas ou mudar a disponibilidade.</p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible xl:grid-cols-8">
          {fins.map((f) => {
            const visual =
              f.estado === 'confirmada' ? 'border-[#1B4332] bg-[#1B4332] text-[#F3EFE6]'
              : f.estado === 'aguardando_sinal' ? 'border-[#E9B454] bg-[#FBEBC8] text-[#6B3A04]'
              : f.estado === 'livre' ? 'border-[#B9D3BD] bg-white text-[#14301F] hover:border-[#1B4332]'
              : 'border-[#D2CAB8] bg-[#E8E2D4] text-stone-600';
            const nome = f.estado === 'confirmada' ? 'Reservado' : f.estado === 'aguardando_sinal' ? 'Aguardando sinal' : f.estado === 'livre' ? 'Livre' : f.estado === 'passado' ? 'Já passou' : 'Fechado';
            return (
              <button key={f.a} onClick={() => irParaDatas(f.a, f.b)} className={`min-w-[104px] shrink-0 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] lg:min-w-0 ${visual}`}>
                <span className="block whitespace-nowrap text-lg font-semibold tabular-nums">{f.a.slice(8)} a {f.b.slice(8)}</span>
                <span className="block text-xs opacity-80">{new Date(f.a + 'T12:00:00Z').toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}</span>
                <span className="mt-2 block text-xs font-medium">{nome}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="font-serif text-xl text-[#14301F]">Precisam de ação</h2>
          <p className="mt-1 text-sm text-stone-600">Pedidos que seguram uma data até o sinal de {cfg.sinalPct}% chegar.</p>
          {espera.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-[#BDB4A1] p-5 text-sm text-stone-600">Nenhum pedido esperando sinal. Quando alguém reservar pelo site, ele aparece aqui para você confirmar.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#D2CAB8] border-y border-[#D2CAB8]">
              {espera.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <button onClick={() => abrir(r.id)} className="text-left font-semibold text-[#14301F] hover:underline">{r.igreja || r.nome}</button>
                    <p className="text-sm text-stone-600">{dia(r.entrada)} a {dia(r.saida)}</p>
                    <p className="text-xs text-[#8A4B04]">Data segurada até {hora(r.segura_ate)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums">Sinal {brl(r.sinal)}</span>
                    <button onClick={() => confirmar(r.id)} className={botaoPri}>Confirmar sinal</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-10 font-serif text-xl text-[#14301F]">Saldos a receber</h2>
          <p className="mt-1 text-sm text-stone-600">Reservas confirmadas que ainda não foram quitadas.</p>
          {saldos.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-[#BDB4A1] p-5 text-sm text-stone-600">Nenhum saldo pendente nas reservas confirmadas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#D2CAB8] border-y border-[#D2CAB8]">
              {saldos.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <button onClick={() => abrir(r.id)} className="text-left font-semibold text-[#14301F] hover:underline">{r.igreja || r.nome}</button>
                    <p className="text-sm text-stone-600">{dia(r.entrada)} a {dia(r.saida)}</p>
                    <p className="text-xs text-stone-600">Recebido {brl(r.pago)} de {brl(r.total)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums">Falta {brl(r.total - r.pago)}</span>
                    <button onClick={() => abrir(r.id)} className={botao}>Registrar pagamento</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-5">
          <h2 className="font-serif text-xl text-[#14301F]">Ocupação nos próximos meses</h2>
          <p className="mt-1 flex items-center gap-4 text-sm text-stone-600">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#1B4332]" />Confirmado</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#E9A43A]" />Aguardando sinal</span>
          </p>
          <div className="mt-5 flex items-end gap-2 sm:gap-3">
            {meses.map((m) => (
              <div key={m.rot} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-stone-700">{Math.round(m.c + m.w)}%</span>
                <div className="flex h-32 w-full max-w-[46px] flex-col justify-end overflow-hidden rounded-t-md bg-[#EFEBE3]">
                  <i className="block bg-[#E9A43A] transition-[height] duration-700 ease-out motion-reduce:transition-none" style={{ height: montado ? m.w + '%' : 0 }} />
                  <i className="block bg-[#1B4332] transition-[height] duration-700 ease-out motion-reduce:transition-none" style={{ height: montado ? m.c + '%' : 0 }} />
                </div>
                <span className="text-xs capitalize text-stone-600">{m.rot}</span>
              </div>
            ))}
          </div>
        </section>
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
  const regua: Record<string, string> = { confirmada: 'border-l-[#1B4332]', aguardando_sinal: 'border-l-[#E9A43A]', cancelada: 'border-l-[#D9847A]', expirada: 'border-l-stone-300' };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-lg bg-[#EFEBE3] p-1" role="tablist">
          {filtros.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={filtro === k} onClick={() => setFiltro(k)} className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#D97706] ${filtro === k ? 'bg-white font-semibold text-[#14301F] shadow-sm' : 'text-stone-600 hover:text-[#14301F]'}`}>
              {l}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar reservas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por igreja, nome ou WhatsApp" className={`${campo} pl-9`} />
        </label>
      </div>

      {linhas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#BDB4A1] p-6 text-sm text-stone-600">
          {dados.reservas.length === 0 ? 'Ainda não há reservas. Elas aparecem aqui assim que alguém reservar pelo site ou você criar uma pelo calendário.' : 'Nenhuma reserva neste filtro.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {linhas.map(({ r, st }) => (
            <li key={r.id}>
              <button onClick={() => abrir(r.id)} className={`grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 rounded-lg border border-l-4 border-[#D2CAB8] bg-white px-4 py-3.5 text-left transition-colors hover:bg-[#FDFCF9] focus-visible:outline-2 focus-visible:outline-[#D97706] md:grid-cols-[minmax(0,1.4fr)_minmax(168px,1fr)_minmax(0,0.9fr)_150px] ${regua[st] ?? ''}`}>
                <span className="col-span-2 min-w-0 md:col-span-1">
                  <b className="block truncate text-[#14301F]">{r.igreja || r.nome}</b>
                  <span className="flex items-center gap-1.5 truncate text-sm text-stone-600" title={r.origem === 'manual' ? 'Criada por você' : 'Pedido pelo site'}>
                    {r.origem === 'manual' ? <PenLine className="h-3.5 w-3.5 shrink-0" /> : <Globe className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{r.nome}</span>
                  </span>
                </span>
                <span>
                  <span className="block whitespace-nowrap text-sm font-medium">{dia(r.entrada)} a {dia(r.saida)}</span>
                  <span className="block text-sm text-stone-600">{diff(r.entrada, r.saida)} dias</span>
                </span>
                <span>
                  <b className="block tabular-nums">{brl(r.total)}</b>
                  <span className="block text-sm tabular-nums text-stone-600">{r.status === 'confirmada' ? `recebido ${brl(r.pago)}` : `sinal ${brl(r.sinal)}`}</span>
                </span>
                <span className="md:justify-self-end">
                  <PilulaReserva status={st} pag={pagamento(r)} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
