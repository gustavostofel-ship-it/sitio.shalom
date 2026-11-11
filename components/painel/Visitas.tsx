'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Lock, LockOpen, MessageCircle, Settings2, X } from 'lucide-react';
import { segura, type AdminData } from '@/lib/agenda';
import { SITE_INFO } from '@/lib/site-data';
import {
  DIAS_CURTOS,
  DIAS_LONGOS,
  NOME_STATUS_VISITA,
  agoraSP,
  dataBr,
  dataMais,
  diaSemanaDe,
  horaParaMin,
  horariosDoDia,
  ocupaHorario,
  type StatusVisita,
  type Visita,
} from '@/lib/visitas';
import type { Chamar } from './tipos';
import { BotaoConfirma, botao, botaoPerigo, botaoPri, campo, rotulo } from './ui';

const COR: Record<StatusVisita, [string, string]> = {
  pedida: ['bg-[#FBEBC8] text-[#6B3A04]', 'bg-[#D97706]'],
  agendada: ['bg-[#DDEBDD] text-[#1B4332]', 'bg-[#2F7A55]'],
  realizada: ['bg-[#E4DFD3] text-stone-700', 'bg-stone-500'],
  cancelada: ['bg-[#F6DAD5] text-[#8F2517]', 'bg-[#B42318]'],
  nao_compareceu: ['bg-[#EBDDD9] text-[#6F2A1F]', 'bg-[#8F2517]'],
};
function PilulaVisita({ status }: { status: StatusVisita }) {
  const [cor, ponto] = COR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${cor}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${ponto}`} />
      {NOME_STATUS_VISITA[status]}
    </span>
  );
}

const quandoTxt = (v: Pick<Visita, 'data' | 'hora'>) => (v.data && v.hora ? `${DIAS_CURTOS[diaSemanaDe(v.data)]} ${dataBr(v.data)} às ${v.hora}` : 'Horário a combinar');
const linkZap = (tel: string, texto: string) => {
  const d = tel.replace(/\D/g, '');
  return d.length >= 10 ? `https://wa.me/${d.length > 11 && d.startsWith('55') ? d : '55' + d}?text=${encodeURIComponent(texto)}` : null;
};
function textoZap(v: Visita) {
  if (!v.data || !v.hora) return `Olá, ${v.nome}! Aqui é do Sítio Shalom Xerém. Recebemos seu pedido de visita. Qual dia e horário ficam melhores para a sua comissão?`;
  if (v.status === 'pedida') return `Olá, ${v.nome}! Aqui é do Sítio Shalom Xerém. Recebemos seu pedido de visita para ${quandoTxt(v)}. Podemos confirmar?`;
  return `Olá, ${v.nome}! Confirmamos a sua visita ao Sítio Shalom Xerém em ${quandoTxt(v)}. Endereço: ${SITE_INFO.address}. Se tiver qualquer imprevisto, é só avisar por aqui.`;
}

type Aba = 'agenda' | 'aguardando' | 'historico';
type Gaveta = { t: 'visita'; id: number } | { t: 'nova'; data?: string; hora?: string } | { t: 'config' } | null;

export function Visitas({ dados, chamar, abrirId, aoAbrir }: { dados: AdminData; chamar: Chamar; abrirId?: number | null; aoAbrir?: () => void }) {
  const [aba, setAba] = useState<Aba>('agenda');
  // Vindo de uma notificação: já abre a visita
  const [gaveta, setGaveta] = useState<Gaveta>(() => (abrirId ? { t: 'visita', id: abrirId } : null));
  // Também vale com a aba Visitas já aberta: tocar noutra notificação de visita abre aquela visita.
  useEffect(() => {
    if (!abrirId) return;
    const t = setTimeout(() => {
      setGaveta({ t: 'visita', id: abrirId });
      aoAbrir?.();
    }, 0);
    return () => clearTimeout(t);
  }, [abrirId, aoAbrir]);
  // Tecla Esc fecha a gaveta aberta
  const gavetaAberta = !!gaveta;
  useEffect(() => {
    if (!gavetaAberta) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setGaveta(null);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [gavetaAberta]);
  const hoje = dados.hoje;
  const ativas = dados.visitas.filter((v) => ocupaHorario(v.status));
  const aguardando = ativas.filter((v) => v.status === 'pedida' || !v.data);
  const daHoje = ativas.filter((v) => v.data === hoje);
  const prox7 = ativas.filter((v) => v.data && v.data > hoje && v.data <= dataMais(hoje, 7));
  const paraDarBaixa = ativas.filter((v) => v.data && v.data < hoje);
  const historico = dados.visitas.filter((v) => !ocupaHorario(v.status)).sort((a, b) => (b.data ?? '').localeCompare(a.data ?? '') || b.id - a.id);

  // Os próximos dias de visita, com cada horário livre ou ocupado.
  const dias = useMemo(() => {
    const cfg = dados.visitaCfg;
    const agora = agoraSP(new Date(dados.agora));
    const bloq = new Map(dados.visitaBloqueios.map((b) => [b.data, b.motivo]));
    const porData = new Map<string, Visita[]>();
    for (const v of dados.visitas) if (ocupaHorario(v.status) && v.data && v.data >= dados.hoje) porData.set(v.data, [...(porData.get(v.data) ?? []), v]);
    const reservas = dados.reservas.filter((r) => segura(r, dados.agora));
    const fechadasPorDia = new Map<string, Set<string>>();
    for (const f of dados.visitaHorasFechadas) fechadasPorDia.set(f.data, new Set([...(fechadasPorDia.get(f.data) ?? []), f.hora]));
    const out: { data: string; vs: Visita[]; ehDia: boolean; bloqueado: boolean; motivo: string | null; alugado: boolean; horas: string[]; fechadas: Set<string>; passou: (h: string) => boolean }[] = [];
    for (let i = 0; i <= 42; i++) {
      const data = dataMais(dados.hoje, i);
      const vs = porData.get(data) ?? [];
      const ehDia = cfg.diasSemana.includes(diaSemanaDe(data));
      if (!ehDia && !vs.length && !bloq.has(data)) continue;
      out.push({
        data,
        vs,
        ehDia,
        bloqueado: bloq.has(data),
        motivo: bloq.get(data) ?? null,
        alugado: reservas.some((r) => data >= r.entrada && data <= r.saida),
        horas: horariosDoDia(cfg, diaSemanaDe(data)), // cada dia da semana pode ter o seu horário
        fechadas: fechadasPorDia.get(data) ?? new Set<string>(),
        passou: (h) => data === agora.data && horaParaMin(h) <= agora.min,
      });
    }
    return out;
  }, [dados]);

  const stat = (rot: string, n: number, sub?: string, destaque = false) => (
    <div className={`rounded-xl border p-4 ${destaque && n > 0 ? 'border-[#E9A43A] bg-[#FFF8E8]' : 'border-[#D2CAB8] bg-white'}`}>
      <p className="text-sm text-stone-600">{rot}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums text-[#14301F]">{n}</p>
      {sub && <p className="mt-0.5 text-xs text-stone-600">{sub}</p>}
    </div>
  );

  const linha = (v: Visita, mostrarData = false) => (
    <button key={v.id} onClick={() => setGaveta({ t: 'visita', id: v.id })} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 rounded-lg border border-[#D2CAB8] bg-white px-3.5 py-3 text-left transition-colors hover:bg-[#FDFCF9] focus-visible:outline-2 focus-visible:outline-[#D97706]">
      <span className="w-[74px] text-sm font-semibold tabular-nums text-[#14301F]">{mostrarData ? (v.data ? `${dataBr(v.data)} ${v.hora ?? ''}` : 'A combinar') : (v.hora ?? 'A combinar')}</span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#14301F]">{v.igreja || v.nome}</span>
        <span className="block truncate text-xs text-stone-600">{v.igreja ? `${v.nome} · ` : ''}{v.publico ?? ''}</span>
      </span>
      <PilulaVisita status={v.status} />
    </button>
  );

  const abas: [Aba, string, number | null][] = [
    ['agenda', 'Agenda', null],
    ['aguardando', 'Aguardando confirmação', aguardando.length],
    ['historico', 'Histórico', null],
  ];
  const aberta = gaveta?.t === 'visita' ? dados.visitas.find((v) => v.id === gaveta.id) : undefined;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stat('Hoje', daHoje.length, daHoje.length ? daHoje.map((v) => v.hora ?? '').filter(Boolean).join(' · ') : 'Nenhuma visita')}
        {stat('Próximos 7 dias', prox7.length)}
        {stat('Aguardando confirmação', aguardando.length, 'Pedidos do site e sem horário', true)}
        {stat('Para dar baixa', paraDarBaixa.length, 'Já passaram: marque se aconteceu', true)}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap rounded-lg bg-[#EFEBE3] p-1" role="tablist" aria-label="Seções de visitas">
          {abas.map(([k, rot, n]) => (
            <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)} className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#D97706] ${aba === k ? 'bg-white font-semibold text-[#14301F] shadow-sm' : 'text-stone-600 hover:text-[#14301F]'}`}>
              {rot}{n ? <span className="ml-1.5 rounded-full bg-[#D97706] px-1.5 py-0.5 text-xs font-semibold text-white">{n}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={botao} onClick={() => setGaveta({ t: 'config' })}><Settings2 className="h-4 w-4" /> Horários e dias fechados</button>
          <button className={botaoPri} onClick={() => setGaveta({ t: 'nova' })}><CalendarPlus className="h-4 w-4" /> Nova visita</button>
        </div>
      </div>

      <div className="mt-5">
        {aba === 'agenda' && (
          <div className="space-y-5">
            {paraDarBaixa.length > 0 && (
              <section className="rounded-xl border border-[#E9A43A] bg-[#FFF8E8] p-4">
                <h2 className="font-serif text-lg text-[#14301F]">Para dar baixa</h2>
                <p className="mb-3 text-sm text-stone-700">Essas visitas já passaram. Abra cada uma e marque se foi realizada, se a pessoa não compareceu ou se foi cancelada.</p>
                <div className="space-y-2">{paraDarBaixa.map((v) => linha(v, true))}</div>
              </section>
            )}
            {dias.length === 0 && <p className="rounded-xl border border-[#D2CAB8] bg-white p-6 text-stone-600">Nenhum dia de visita configurado. Toque em <b>Horários e dias fechados</b> para escolher os dias da semana.</p>}
            {dias.map((d) => {
              const livres = d.ehDia && !d.bloqueado && !d.alugado ? d.horas.filter((h) => !d.passou(h) && !d.vs.some((v) => v.hora === h) && !d.fechadas.has(h)) : [];
              const extras = d.vs.filter((v) => !v.hora || !d.horas.includes(v.hora));
              return (
                <section key={d.data} className="rounded-xl border border-[#D2CAB8] bg-white p-4 shadow-[0_1px_2px_rgba(20,48,31,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-serif text-lg text-[#14301F]">{DIAS_LONGOS[diaSemanaDe(d.data)]}, {dataBr(d.data)}{d.data === hoje ? ' (hoje)' : ''}</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {d.bloqueado ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFEBE3] px-2.5 py-1 text-xs font-medium text-stone-700"><Lock className="h-3 w-3" /> Fechado{d.motivo ? `: ${d.motivo}` : ''}</span>
                      ) : d.alugado ? (
                        <span className="rounded-full bg-[#DDEBDD] px-2.5 py-1 text-xs font-medium text-[#1B4332]">Sítio alugado nesse dia</span>
                      ) : d.ehDia ? (
                        <span className="text-xs text-stone-600">{d.vs.length} {d.vs.length === 1 ? 'visita' : 'visitas'} · {livres.length} {livres.length === 1 ? 'horário livre' : 'horários livres'}</span>
                      ) : (
                        <span className="text-xs text-stone-600">Fora dos dias de visita</span>
                      )}
                      {d.bloqueado ? (
                        <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] underline" onClick={() => chamar('visita.bloqueio', { data: d.data, remover: true })}><LockOpen className="h-3 w-3" /> Reabrir</button>
                      ) : d.ehDia ? (
                        <BotaoConfirma compacto className="text-xs font-semibold text-[#B42318] underline" rotulo="Fechar este dia" pergunta="Fechar este dia para novas visitas? As já marcadas continuam na agenda." confirmaRotulo="Sim, fechar" onConfirma={() => chamar('visita.bloqueio', { data: d.data })} />
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {d.ehDia && !d.bloqueado && !d.alugado
                      ? d.horas.map((h) => {
                          const v = d.vs.filter((x) => x.hora === h);
                          if (v.length) return <div key={h} className="space-y-2">{v.map((x) => linha(x))}</div>;
                          if (d.passou(h)) return null;
                          // Horário fechado só para esta data: o cliente não vê, mas dá para reabrir
                          if (d.fechadas.has(h))
                            return (
                              <div key={h} className="flex items-center gap-3 rounded-lg border border-[#D2CAB8] bg-[#EFEBE3] px-3.5 py-2.5 text-sm text-stone-700">
                                <span className="w-[74px] font-semibold tabular-nums">{h}</span>
                                <span className="flex flex-1 items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Fechado para o cliente</span>
                                <button className="text-xs font-semibold text-[#1B4332] underline" onClick={() => chamar('visita.horario', { data: d.data, hora: h, remover: true })}>Reabrir</button>
                              </div>
                            );
                          return (
                            <div key={h} className="flex items-stretch gap-2">
                              <button onClick={() => setGaveta({ t: 'nova', data: d.data, hora: h })} className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-x-3 rounded-lg border border-dashed border-[#B3CDB6] bg-[#F1F6F0] px-3.5 py-2.5 text-left text-sm text-[#1B4332] transition-colors hover:bg-[#E3EFE1] focus-visible:outline-2 focus-visible:outline-[#D97706]">
                                <span className="w-[74px] font-semibold tabular-nums">{h}</span>
                                <span>Livre · tocar para marcar uma visita</span>
                              </button>
                              <button
                                title="Fechar só este horário"
                                aria-label={`Fechar o horário das ${h}`}
                                className="shrink-0 rounded-lg border border-[#D2CAB8] bg-white px-3 text-xs font-semibold text-[#B42318] hover:border-[#B42318] focus-visible:outline-2 focus-visible:outline-[#D97706]"
                                onClick={() => chamar('visita.horario', { data: d.data, hora: h })}
                              >
                                Fechar
                              </button>
                            </div>
                          );
                        })
                      : null}
                    {(d.ehDia && !d.bloqueado && !d.alugado ? extras : d.vs).map((x) => linha(x))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {aba === 'aguardando' && (
          <div className="space-y-2">
            {aguardando.length === 0 && <p className="rounded-xl border border-[#D2CAB8] bg-white p-6 text-stone-600">Nenhuma visita aguardando confirmação.</p>}
            {aguardando.map((v) => linha(v, true))}
          </div>
        )}

        {aba === 'historico' && (
          <div className="space-y-2">
            {historico.length === 0 && <p className="rounded-xl border border-[#D2CAB8] bg-white p-6 text-stone-600">Ainda não há visitas realizadas ou canceladas.</p>}
            {historico.map((v) => linha(v, true))}
          </div>
        )}
      </div>

      {gaveta && (
        <>
          <div className="fixed inset-0 z-40 bg-[#0F291E]/40" onClick={() => setGaveta(null)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] overflow-y-auto bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-label="Detalhes da visita">
            <button onClick={() => setGaveta(null)} aria-label="Fechar" className="absolute right-4 top-4 rounded-md p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-[#D97706]"><X className="h-5 w-5" /></button>
            {gaveta.t === 'visita' && aberta && <GavetaVisita key={`${aberta.id}-${aberta.atualizada_em}`} v={aberta} chamar={chamar} fechar={() => setGaveta(null)} />}
            {gaveta.t === 'nova' && <GavetaNova key={`${gaveta.data}-${gaveta.hora}`} data={gaveta.data} hora={gaveta.hora} chamar={chamar} fechar={() => setGaveta(null)} />}
            {gaveta.t === 'config' && <GavetaConfig dados={dados} chamar={chamar} />}
          </aside>
        </>
      )}
    </div>
  );
}

function GavetaVisita({ v, chamar, fechar }: { v: Visita; chamar: Chamar; fechar: () => void }) {
  const [nota, setNota] = useState(v.nota_interna ?? '');
  const [data, setData] = useState(v.data ?? '');
  const [hora, setHora] = useState(v.hora ?? '');
  const ativa = ocupaHorario(v.status);
  const zap = linkZap(v.whatsapp, textoZap(v));
  const linhaInfo = (k: string, val: React.ReactNode) => (
    <>
      <dt className="text-stone-600">{k}</dt>
      <dd className="text-[#1F2937]">{val}</dd>
    </>
  );
  const mudar = (status: StatusVisita) => chamar('visita.status', { id: v.id, status });
  return (
    <div>
      <h2 className="pr-10 font-serif text-2xl leading-tight text-[#14301F]">{v.igreja || v.nome}</h2>
      <div className="mt-2"><PilulaVisita status={v.status} /></div>
      <dl className="mt-6 grid grid-cols-[112px_1fr] gap-y-2.5 text-sm">
        {linhaInfo('Visita', <b>{quandoTxt(v)}</b>)}
        {linhaInfo('Responsável', v.nome)}
        {linhaInfo('WhatsApp', v.whatsapp)}
        {v.publico && linhaInfo('Público', v.publico)}
        {v.formato && linhaInfo('Formato', v.formato)}
        {v.obs && linhaInfo('Observações', <span className="whitespace-pre-wrap">{v.obs}</span>)}
        {linhaInfo('Origem', v.origem === 'manual' ? 'Criada por você' : 'Pedido pelo site')}
      </dl>

      <div className="mt-6 grid gap-2">
        {v.status === 'pedida' && (
          <button
            className={botaoPri}
            onClick={() => {
              const l = linkZap(v.whatsapp, textoZap({ ...v, status: 'agendada' }));
              if (l && v.data && v.hora) window.open(l, '_blank', 'noopener');
              mudar('agendada');
            }}
          >
            {v.data && v.hora ? 'Confirmar visita e avisar no WhatsApp' : 'Confirmar visita'}
          </button>
        )}
        {zap && (
          <a className={botao} href={zap} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        )}
        {v.status === 'agendada' && (
          <div className="grid grid-cols-2 gap-2">
            <button className={botaoPri} onClick={() => mudar('realizada')}>Foi realizada</button>
            <button className={botao} onClick={() => mudar('nao_compareceu')}>Não compareceu</button>
          </div>
        )}
        {!ativa && <button className={botao} onClick={() => mudar('pedida')}>Reativar (volta para aguardando)</button>}
        {ativa && (
          <BotaoConfirma className={botaoPerigo} rotulo="Cancelar visita" pergunta="Cancelar esta visita e liberar o horário?" confirmaRotulo="Sim, cancelar" onConfirma={() => mudar('cancelada').then(fechar)} />
        )}
        <BotaoConfirma
          className={botaoPerigo}
          rotulo="Excluir de vez (não tem volta)"
          pergunta='Excluir esta visita para sempre? Ela some do sistema e não pode ser desfeita. Para só liberar o horário, use "Cancelar".'
          confirmaRotulo="Sim, excluir para sempre"
          onConfirma={() => chamar('visita.excluir', { id: v.id }).then(fechar)}
        />
      </div>

      <div className="mt-6 rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-4">
        <h3 className="font-serif text-lg text-[#14301F]">{ativa ? 'Marcar ou mudar o horário' : 'Horário'}</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className={rotulo}>Dia<input type="date" className={`${campo} mt-1`} value={data} onChange={(e) => setData(e.target.value)} /></label>
          <label className={rotulo}>Hora<input type="time" className={`${campo} mt-1`} value={hora} onChange={(e) => setHora(e.target.value)} /></label>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button className={botao} onClick={() => chamar('visita.mover', { id: v.id, data, hora })}>Salvar horário</button>
          <button className={botaoPri} onClick={() => chamar('visita.mover', { id: v.id, data, hora, confirmar: true })} disabled={!data || !hora}>Salvar e confirmar</button>
        </div>
        <p className="mt-2 text-xs text-stone-600">Deixe dia e hora em branco para voltar a &ldquo;a combinar&rdquo;.</p>
      </div>

      <div className="mt-6">
        <label className={rotulo}>
          Anotação interna (o cliente não vê)
          <textarea rows={3} maxLength={1000} className={`${campo} mt-1`} value={nota} onChange={(e) => setNota(e.target.value)} />
        </label>
        <button className={`${botao} mt-2`} onClick={() => chamar('visita.nota', { id: v.id, nota })}>Salvar anotação</button>
      </div>
    </div>
  );
}

function GavetaNova({ data: d0, hora: h0, chamar, fechar }: { data?: string; hora?: string; chamar: Chamar; fechar: () => void }) {
  const [f, setF] = useState({ nome: '', whatsapp: '', igreja: '', publico: '', obs: '', data: d0 ?? '', hora: h0 ?? '', confirmada: true });
  const salvar = () => chamar('visita.criar', { ...f, status: f.confirmada ? 'agendada' : 'pedida' }).then((r) => r.ok && fechar());
  return (
    <div>
      <h2 className="pr-10 font-serif text-2xl leading-tight text-[#14301F]">Nova visita</h2>
      <p className="mt-1 text-sm text-stone-600">Para quem ligou ou chamou no WhatsApp e você quer deixar marcado aqui.</p>
      <div className="mt-5 space-y-3">
        <label className={rotulo}>Nome do responsável *<input className={`${campo} mt-1`} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} autoComplete="off" /></label>
        <label className={rotulo}>WhatsApp com DDD *<input className={`${campo} mt-1`} inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} autoComplete="off" /></label>
        <label className={rotulo}>Igreja / ministério<input className={`${campo} mt-1`} value={f.igreja} onChange={(e) => setF({ ...f, igreja: e.target.value })} autoComplete="off" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className={rotulo}>Dia<input type="date" className={`${campo} mt-1`} value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></label>
          <label className={rotulo}>Hora<input type="time" className={`${campo} mt-1`} value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} /></label>
        </div>
        <label className={rotulo}>Observações<textarea rows={2} maxLength={500} className={`${campo} mt-1`} value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={f.confirmada} onChange={(e) => setF({ ...f, confirmada: e.target.checked })} className="h-4 w-4 accent-[#1B4332]" /> Já está confirmada
        </label>
      </div>
      <button className={`${botaoPri} mt-5 w-full`} onClick={salvar}>Salvar visita</button>
    </div>
  );
}

function GavetaConfig({ dados, chamar }: { dados: AdminData; chamar: Chamar }) {
  const c0 = dados.visitaCfg;
  const [c, setC] = useState({ ...c0 });
  const [dia, setDia] = useState('');
  const [motivo, setMotivo] = useState('');
  const alterna = (n: number) => setC({ ...c, diasSemana: c.diasSemana.includes(n) ? c.diasSemana.filter((x) => x !== n) : [...c.diasSemana, n].sort() });
  const opcoes = (lista: number[], sufixo: (n: number) => string) => lista.map((n) => <option key={n} value={n}>{sufixo(n)}</option>);
  return (
    <div>
      <h2 className="pr-10 font-serif text-2xl leading-tight text-[#14301F]">Horários de visita</h2>
      <p className="mt-1 text-sm text-stone-600">Define o que o cliente vê para escolher na página de vendas.</p>

      <p className={`${rotulo} mt-5`}>Dias da semana com visita</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DIAS_CURTOS.map((rot, n) => (
          <button key={n} type="button" aria-pressed={c.diasSemana.includes(n)} onClick={() => alterna(n)} className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[#D97706] ${c.diasSemana.includes(n) ? 'border-[#1B4332] bg-[#1B4332] text-white' : 'border-[#BDB4A1] bg-white text-stone-700 hover:border-[#1B4332]'}`}>
            {rot}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className={rotulo}>Primeira visita às<input type="time" className={`${campo} mt-1`} value={c.horaIni} onChange={(e) => setC({ ...c, horaIni: e.target.value })} /></label>
        <label className={rotulo}>Última termina às<input type="time" className={`${campo} mt-1`} value={c.horaFim} onChange={(e) => setC({ ...c, horaFim: e.target.value })} /></label>
        <label className={rotulo}>Duração de cada visita<select className={`${campo} mt-1`} value={c.duracaoMin} onChange={(e) => setC({ ...c, duracaoMin: +e.target.value })}>{opcoes([30, 45, 60, 90, 120], (n) => `${n} minutos`)}</select></label>
        <label className={rotulo}>Marcar com pelo menos<select className={`${campo} mt-1`} value={c.antecedenciaH} onChange={(e) => setC({ ...c, antecedenciaH: +e.target.value })}>{opcoes([0, 2, 6, 12, 24, 48, 72], (n) => (n === 0 ? 'Sem antecedência' : `${n} h de antecedência`))}</select></label>
        <label className={`${rotulo} col-span-2`}>Mostrar horários dos próximos<select className={`${campo} mt-1`} value={c.horizonteDias} onChange={(e) => setC({ ...c, horizonteDias: +e.target.value })}>{opcoes([14, 30, 45, 60, 90, 180], (n) => `${n} dias`)}</select></label>
      </div>
      {c.diasSemana.length > 0 && (
        <fieldset className="mt-5 rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-3">
          <legend className="px-1 text-sm font-semibold text-[#14301F]">Horário de cada dia da semana</legend>
          <p className="mb-2 text-xs text-stone-600">Por padrão todos usam o horário acima. Mude só o dia que for diferente (ex.: quarta só à tarde).</p>
          <ul className="space-y-2">
            {c.diasSemana.map((n) => {
              const proprio = c.horariosPorDia?.[String(n)];
              const ini = proprio?.ini ?? c.horaIni;
              const fim = proprio?.fim ?? c.horaFim;
              const muda = (novoIni: string, novoFim: string) => {
                const resto = { ...(c.horariosPorDia ?? {}) };
                if (novoIni === c.horaIni && novoFim === c.horaFim) delete resto[String(n)]; // igual ao geral: sem horário próprio
                else resto[String(n)] = { ini: novoIni, fim: novoFim };
                setC({ ...c, horariosPorDia: resto });
              };
              return (
                <li key={n} className="grid grid-cols-[64px_1fr_1fr] items-center gap-2 text-sm">
                  <span className="font-semibold text-[#14301F]">{DIAS_LONGOS[n].slice(0, 3)}</span>
                  <input type="time" aria-label={`${DIAS_LONGOS[n]}: primeira visita`} className={campo} value={ini} onChange={(e) => muda(e.target.value, fim)} />
                  <input type="time" aria-label={`${DIAS_LONGOS[n]}: última termina`} className={campo} value={fim} onChange={(e) => muda(ini, e.target.value)} />
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}
      <button className={`${botaoPri} mt-4 w-full`} onClick={() => chamar('visita.config', c)}>Salvar horários</button>

      <div className="mt-8 border-t border-[#EEE9DF] pt-5">
        <h3 className="font-serif text-lg text-[#14301F]">Dias fechados para visita</h3>
        <p className="mt-1 text-sm text-stone-600">Feriados, eventos no sítio ou qualquer dia em que não dá para receber.</p>
        <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <label className={rotulo}>Dia<input type="date" min={dados.hoje} className={`${campo} mt-1`} value={dia} onChange={(e) => setDia(e.target.value)} /></label>
          <label className={rotulo}>Motivo<input className={`${campo} mt-1`} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" maxLength={80} /></label>
          <button className={botao} disabled={!dia} onClick={() => chamar('visita.bloqueio', { data: dia, motivo }).then((r) => { if (r.ok) { setDia(''); setMotivo(''); } })}>Fechar</button>
        </div>
        <ul className="mt-3 space-y-2">
          {dados.visitaBloqueios.filter((b) => b.data >= dados.hoje).map((b) => (
            <li key={b.data} className="flex items-center justify-between gap-3 rounded-lg border border-[#D2CAB8] px-3 py-2 text-sm">
              <span><b>{DIAS_CURTOS[diaSemanaDe(b.data)]} {dataBr(b.data)}</b>{b.motivo ? ` · ${b.motivo}` : ''}</span>
              <button className="text-xs font-semibold text-[#1B4332] underline" onClick={() => chamar('visita.bloqueio', { data: b.data, remover: true })}>Reabrir</button>
            </li>
          ))}
          {dados.visitaBloqueios.filter((b) => b.data >= dados.hoje).length === 0 && <li className="text-sm text-stone-600">Nenhum dia fechado.</li>}
        </ul>
      </div>
    </div>
  );
}

// Cartão do Resumo: o que tem de visita hoje e nos próximos dias.
export function ResumoVisitas({ dados, abrir }: { dados: AdminData; abrir: () => void }) {
  const ativas = dados.visitas.filter((v) => ocupaHorario(v.status));
  const proximas = ativas
    .filter((v) => v.data && v.data >= dados.hoje)
    .sort((a, b) => (a.data! + (a.hora ?? '')).localeCompare(b.data! + (b.hora ?? '')))
    .slice(0, 4);
  const aguardando = ativas.filter((v) => v.status === 'pedida' || !v.data).length;
  return (
    <section className="mt-8 rounded-xl border border-[#D2CAB8] bg-white p-5 shadow-[0_1px_2px_rgba(20,48,31,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-[#14301F]">Visitas ao sítio</h2>
        <button className={botao} onClick={abrir}>Abrir agenda de visitas</button>
      </div>
      <p className="mt-1 text-sm text-stone-600">{aguardando > 0 ? <><b className="text-[#B45309]">{aguardando}</b> aguardando confirmação.</> : 'Nada aguardando confirmação.'}</p>
      <ul className="mt-3 space-y-2">
        {proximas.length === 0 && <li className="text-sm text-stone-600">Nenhuma visita marcada para os próximos dias.</li>}
        {proximas.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#EEE9DF] px-3 py-2 text-sm">
            <span className="min-w-0"><b className="tabular-nums">{quandoTxt(v)}</b> · <span className="truncate">{v.igreja || v.nome}</span></span>
            <PilulaVisita status={v.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
