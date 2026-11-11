'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, CalendarCheck, CalendarClock, CircleCheck, CircleX, Clock, Footprints, MessageCircle, Wallet, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminData } from '@/lib/agenda';
import { brl, dia } from '@/lib/agenda';
import { LISTA_TIPOS, TIPOS, quandoSP, type Notificacao, type TipoNotificacao } from '@/lib/notificacoes';
import { desligarPush, estadoAtual, ligarPush, type EstadoPush } from '@/lib/push-cliente';
import type { Chamar } from './tipos';
import { botao, botaoPri } from './ui';

const ICONE = { reserva: CalendarCheck, visita: Footprints, relogio: Clock, dinheiro: Wallet, chegada: CalendarClock, ok: CircleCheck, cancela: CircleX } as const;

// "agora", "há 5 min", "há 3 h", "ontem 14:30", "09/11 às 14:30"
function tempo(iso: string, agoraIso: string) {
  const ms = new Date(agoraIso).getTime() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.floor(min / 60)} h`;
  return quandoSP(iso);
}

const soDigitos = (t: unknown) => String(t ?? '').replace(/\D/g, '');
function linkZap(n: Notificacao) {
  const d = soDigitos(n.dados.whatsapp);
  if (d.length < 10) return null;
  const nome = String(n.dados.nome ?? '');
  let texto = `Olá, ${nome}! Aqui é do Sítio Shalom Xerém.`;
  if (n.ref_tipo === 'reserva' && n.dados.entrada && n.dados.saida) texto += ` Sobre a sua reserva de ${dia(String(n.dados.entrada))} a ${dia(String(n.dados.saida))}:`;
  if (n.ref_tipo === 'visita') texto += ' Sobre a sua visita ao sítio:';
  return `https://wa.me/${d.length > 11 && d.startsWith('55') ? d : '55' + d}?text=${encodeURIComponent(texto)}`;
}

// Tudo o que o sistema sabe sobre o assunto do aviso, em linhas simples.
function Detalhes({ n }: { n: Notificacao }) {
  const d = n.dados as Record<string, unknown>;
  const linhas: [string, string][] = [];
  if (d.igreja) linhas.push(['Igreja', String(d.igreja)]);
  if (d.nome) linhas.push(['Responsável', String(d.nome)]);
  if (d.whatsapp) linhas.push(['WhatsApp', String(d.whatsapp)]);
  if (d.entrada && d.saida) linhas.push(['Datas', `${dia(String(d.entrada))} a ${dia(String(d.saida))}`]);
  if (typeof d.total === 'number') linhas.push(['Total', brl(d.total)]);
  if (typeof d.sinal === 'number') linhas.push(['Sinal', brl(d.sinal)]);
  if (typeof d.pago === 'number') linhas.push(['Já recebido', brl(d.pago)]);
  if (typeof d.segura_ate === 'string' && d.segura_ate) linhas.push(['Datas seguradas até', quandoSP(d.segura_ate)]);
  if (d.data && d.hora) linhas.push(['Visita', `${dia(String(d.data))} às ${String(d.hora)}`]);
  if (Array.isArray(d.visitas)) linhas.push(['Visitas', (d.visitas as { hora?: string; igreja?: string; nome?: string }[]).map((v) => `${v.hora} ${v.igreja || v.nome}`).join(' · ')]);
  if (typeof d.quantidade === 'number') linhas.push(['Quantidade', String(d.quantidade)]);
  if (n.autor) linhas.push(['Feito por', n.autor]);
  linhas.push(['Quando', quandoSP(n.criada_em)]);
  return (
    <dl className="mt-3 grid grid-cols-[130px_1fr] gap-y-1.5 text-sm">
      {linhas.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt className="text-stone-600">{k}</dt>
          <dd className="text-[#1F2937]">{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

// ---------- Avisos no celular (push) ----------
function AvisosNoCelular({ dados, chamar }: { dados: AdminData; chamar: Chamar }) {
  const [estado, setEstado] = useState<EstadoPush>('carregando');
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let ativo = true;
    estadoAtual().then((e) => ativo && setEstado(e.estado)).catch(() => ativo && setEstado('sem_suporte'));
    return () => {
      ativo = false;
    };
  }, [dados.pushAparelhos]);

  const ativar = async () => {
    setOcupado(true);
    setMsg('');
    try {
      const a = await ligarPush(dados.pushChave);
      const r = await chamar('push.assinar', { ...a, agente: navigator.userAgent.slice(0, 180) });
      if (r.ok) setEstado('ligado');
    } catch (e) {
      const permissao = (e as Error).message === 'permissao';
      setMsg(permissao ? 'Você não permitiu as notificações. Para ativar, mude a permissão nos Ajustes do aparelho e tente de novo.' : 'Não foi possível ativar agora. Tente de novo em instantes.');
      setEstado(await estadoAtual().then((x) => x.estado).catch((): EstadoPush => 'sem_suporte'));
    }
    setOcupado(false);
  };
  const desativar = async () => {
    setOcupado(true);
    const endpoint = await desligarPush().catch(() => null);
    if (endpoint) await chamar('push.cancelar', { endpoint });
    setEstado('desligado');
    setOcupado(false);
  };
  const testar = async () => {
    setOcupado(true);
    setMsg('');
    const r = await chamar('push.teste');
    setMsg(r.ok ? (Number(r.enviados) > 0 ? 'Enviamos um teste. Ele deve aparecer no aparelho em alguns segundos.' : 'Não conseguimos enviar o teste. Desative e ative de novo neste aparelho.') : String(r.erro ?? ''));
    setOcupado(false);
  };

  const passo = (n: number, texto: React.ReactNode) => (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-xs font-semibold text-white">{n}</span>
      <span>{texto}</span>
    </li>
  );

  return (
    <section className="rounded-xl border border-[#D2CAB8] bg-white p-5 shadow-[0_1px_2px_rgba(20,48,31,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-xl text-[#14301F]"><Smartphone className="h-5 w-5" /> Avisos no celular</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${dados.pushAparelhos > 0 ? 'bg-[#DDEBDD] text-[#1B4332]' : 'bg-[#EFEBE3] text-stone-700'}`}>
          {dados.pushAparelhos > 0 ? `${dados.pushAparelhos} ${dados.pushAparelhos === 1 ? 'aparelho recebendo' : 'aparelhos recebendo'}` : 'Nenhum aparelho recebendo'}
        </span>
      </div>
      <p className="mt-1 text-sm text-stone-600">Receba uma notificação no celular a cada pedido de reserva, pedido de visita, prazo acabando e outros avisos, mesmo com o painel fechado.</p>

      <div className="mt-4 text-sm text-stone-700">
        {estado === 'carregando' && <p>Verificando este aparelho…</p>}

        {estado === 'iphone_fora_do_app' && (
          <div className="rounded-lg border border-[#E9A43A] bg-[#FFF8E8] p-4">
            <p className="font-semibold text-[#14301F]">No iPhone, primeiro instale o painel na tela inicial:</p>
            <ol className="mt-3 space-y-2.5">
              {passo(1, <>Abra este endereço no <b>Safari</b> (precisa ser o Safari, e o iPhone com iOS 16.4 ou mais novo).</>)}
              {passo(2, <>Toque no botão <b>Compartilhar</b> (o quadrado com uma seta para cima, na barra de baixo).</>)}
              {passo(3, <>Role a lista e toque em <b>Adicionar à Tela de Início</b>, depois em <b>Adicionar</b>.</>)}
              {passo(4, <>Feche o Safari e abra o painel pelo <b>ícone novo</b> na tela inicial.</>)}
              {passo(5, <>Entre aqui de novo, na aba <b>Notificações</b>, e toque em <b>Ativar avisos neste aparelho</b>.</>)}
            </ol>
          </div>
        )}

        {estado === 'sem_https' && (
          <p className="rounded-lg border border-[#E9A43A] bg-[#FFF8E8] p-4">As notificações só funcionam com o endereço seguro do site (começando com <b>https://</b>). Quando o painel estiver no servidor, com o domínio, elas passam a funcionar.</p>
        )}

        {estado === 'sem_suporte' && <p className="rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-4">Este navegador não recebe notificações. No iPhone use o <b>Safari</b> (iOS 16.4 ou mais novo) com o painel instalado na tela inicial. No computador, use o Chrome ou o Edge.</p>}

        {estado === 'bloqueado' && (
          <p className="rounded-lg border border-[#E9A43A] bg-[#FFF8E8] p-4">
            As notificações estão <b>bloqueadas</b> neste aparelho. No iPhone: <b>Ajustes → Notificações → Shalom</b> e ligue <b>Permitir notificações</b>. No computador: clique no cadeado ao lado do endereço e permita as notificações.
          </p>
        )}

        {estado === 'desligado' && (
          <div>
            <button className={botaoPri} onClick={ativar} disabled={ocupado}><Bell className="h-4 w-4" /> {ocupado ? 'Ativando…' : 'Ativar avisos neste aparelho'}</button>
            <p className="mt-2 text-xs text-stone-600">O celular vai perguntar se pode enviar notificações: toque em <b>Permitir</b>.</p>
          </div>
        )}

        {estado === 'ligado' && (
          <div>
            <p className="flex items-center gap-2 font-semibold text-[#1B4332]"><CircleCheck className="h-5 w-5" /> Ativado neste aparelho</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={botao} onClick={testar} disabled={ocupado}><Bell className="h-4 w-4" /> Enviar notificação de teste</button>
              <button className={botao} onClick={desativar} disabled={ocupado}><BellOff className="h-4 w-4" /> Desativar neste aparelho</button>
            </div>
          </div>
        )}

        {msg && <p role="status" className="mt-3 text-sm text-stone-700">{msg}</p>}
      </div>
    </section>
  );
}

// ---------- Quais avisos receber ----------
function Preferencias({ dados, chamar }: { dados: AdminData; chamar: Chamar }) {
  const [aberto, setAberto] = useState(false);
  const desligados = new Set(dados.pushDesligados);
  const grupo = (g: 'acao' | 'historico', titulo: string, texto: string) => (
    <div className="mt-5 first:mt-4">
      <h3 className="font-semibold text-[#14301F]">{titulo}</h3>
      <p className="text-sm text-stone-600">{texto}</p>
      <ul className="mt-3 divide-y divide-[#EEE9DF] rounded-lg border border-[#D2CAB8]">
        {LISTA_TIPOS.filter((t) => TIPOS[t].grupo === g).map((t) => {
          const lig = !desligados.has(t);
          const Ic = ICONE[TIPOS[t].icone];
          return (
            <li key={t} className="flex items-start gap-3 p-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFEBE3] text-[#1B4332]"><Ic className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-[#14301F]">{TIPOS[t].rotulo}</p>
                <p className="mt-0.5 text-stone-600"><b className="font-medium text-stone-700">Quando avisa:</b> {TIPOS[t].quando}</p>
                <p className="mt-0.5 text-stone-600"><b className="font-medium text-stone-700">O que fazer:</b> {TIPOS[t].fazer}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={lig}
                aria-label={`Receber aviso: ${TIPOS[t].rotulo}`}
                onClick={() => chamar('notif.pref', { tipo: t, ativo: !lig })}
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] ${lig ? 'bg-[#1B4332]' : 'bg-[#BDB4A1]'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${lig ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
  return (
    <section className="rounded-xl border border-[#D2CAB8] bg-white p-5 shadow-[0_1px_2px_rgba(20,48,31,0.08)]">
      <button type="button" onClick={() => setAberto(!aberto)} className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-[#D97706]" aria-expanded={aberto}>
        <span>
          <span className="block font-serif text-xl text-[#14301F]">Quais avisos você quer receber</span>
          <span className="block text-sm text-stone-600">Ligue ou desligue cada um e veja, em cada aviso, quando ele chega e o que fazer. Vale para a sua conta, em todos os seus aparelhos.</span>
        </span>
        {aberto ? <ChevronUp className="h-5 w-5 shrink-0 text-stone-600" /> : <ChevronDown className="h-5 w-5 shrink-0 text-stone-600" />}
      </button>
      {aberto && (
        <>
          {grupo('acao', 'Avisos que pedem uma ação', 'Alguém precisa fazer alguma coisa: chamar o cliente, cobrar, confirmar.')}
          {grupo('historico', 'Avisos de registro (histórico)', 'Contam o que aconteceu no sistema e quem fez. Não pedem ação.')}
          <p className="mt-4 text-xs text-stone-600">Os avisos que você mesmo provoca (por exemplo, quando você confirma uma reserva) não chegam como notificação para você, mas ficam no histórico abaixo. Os lembretes automáticos só chegam entre 7h e 21h.</p>
        </>
      )}
    </section>
  );
}

// ---------- Histórico ----------
type Filtro = 'todas' | 'nao_lidas' | 'acao' | 'historico';

export function Notificacoes({ dados, chamar, ir }: { dados: AdminData; chamar: Chamar; ir: (refTipo: 'reserva' | 'visita', id: number) => void }) {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [aberta, setAberta] = useState<number | null>(null);
  const [mostrar, setMostrar] = useState(30);
  const lista = dados.notificacoes.filter((n) => {
    if (filtro === 'nao_lidas') return n.id > dados.notificacoesLidasAte;
    if (filtro === 'acao') return TIPOS[n.tipo as TipoNotificacao]?.grupo === 'acao';
    if (filtro === 'historico') return TIPOS[n.tipo as TipoNotificacao]?.grupo === 'historico';
    return true;
  });
  const hojeSP = dados.hoje;
  const deHoje = dados.notificacoes.filter((n) => quandoSP(n.criada_em).slice(0, 5) === hojeSP.slice(8, 10) + '/' + hojeSP.slice(5, 7)).length;

  const filtros: [Filtro, string, number | null][] = [
    ['todas', 'Todas', null],
    ['nao_lidas', 'Não lidas', dados.naoLidas],
    ['acao', 'Pedem ação', null],
    ['historico', 'Histórico', null],
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className={`rounded-xl border p-4 ${dados.naoLidas > 0 ? 'border-[#E9A43A] bg-[#FFF8E8]' : 'border-[#D2CAB8] bg-white'}`}>
          <p className="text-sm text-stone-600">Não lidas</p>
          <p className="mt-1 font-serif text-3xl tabular-nums text-[#14301F]">{dados.naoLidas}</p>
        </div>
        <div className="rounded-xl border border-[#D2CAB8] bg-white p-4">
          <p className="text-sm text-stone-600">Hoje</p>
          <p className="mt-1 font-serif text-3xl tabular-nums text-[#14301F]">{deHoje}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-[#D2CAB8] bg-white p-4 lg:col-span-1">
          <p className="text-sm text-stone-600">Aparelhos recebendo push</p>
          <p className="mt-1 font-serif text-3xl tabular-nums text-[#14301F]">{dados.pushAparelhos}</p>
        </div>
      </div>

      <AvisosNoCelular dados={dados} chamar={chamar} />
      <Preferencias dados={dados} chamar={chamar} />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap rounded-lg bg-[#EFEBE3] p-1" role="tablist" aria-label="Filtrar notificações">
            {filtros.map(([k, rot, n]) => (
              <button key={k} role="tab" aria-selected={filtro === k} onClick={() => setFiltro(k)} className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#D97706] ${filtro === k ? 'bg-white font-semibold text-[#14301F] shadow-sm' : 'text-stone-600 hover:text-[#14301F]'}`}>
                {rot}{n ? <span className="ml-1.5 rounded-full bg-[#D97706] px-1.5 py-0.5 text-xs font-semibold text-white">{n}</span> : null}
              </button>
            ))}
          </div>
          <button className={botao} disabled={dados.naoLidas === 0} onClick={() => chamar('notif.lidas')}>Marcar todas como lidas</button>
        </div>

        <ul className="mt-4 space-y-2">
          {lista.length === 0 && <li className="rounded-xl border border-[#D2CAB8] bg-white p-6 text-stone-600">Nada por aqui ainda. Quando alguém pedir uma reserva ou uma visita, ou algo precisar da sua atenção, aparece nesta lista.</li>}
          {lista.slice(0, mostrar).map((n) => {
            const info = TIPOS[n.tipo as TipoNotificacao];
            const Ic = ICONE[info?.icone ?? 'ok'];
            const naoLida = n.id > dados.notificacoesLidasAte;
            const zap = linkZap(n);
            const exp = aberta === n.id;
            return (
              <li key={n.id} className={`rounded-xl border bg-white p-4 ${naoLida ? 'border-[#E9A43A]' : 'border-[#D2CAB8]'}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${info?.grupo === 'acao' ? 'bg-[#FBEBC8] text-[#6B3A04]' : 'bg-[#EFEBE3] text-[#1B4332]'}`}><Ic className="h-[18px] w-[18px]" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {naoLida && <i className="h-2 w-2 rounded-full bg-[#D97706]" aria-label="Não lida" />}
                      <p className="font-semibold text-[#14301F]">{n.titulo}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-stone-700">{n.corpo}</p>
                    <p className="mt-1 text-xs text-stone-600">{tempo(n.criada_em, dados.agora)} · {info?.rotulo ?? n.tipo}{info?.grupo === 'acao' ? ' · pede ação' : ''}</p>
                    {exp && <Detalhes n={n} />}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {n.ref_tipo && n.ref_id && <button className={botaoPri} onClick={() => ir(n.ref_tipo!, n.ref_id!)}>Abrir {n.ref_tipo === 'reserva' ? 'a reserva' : 'a visita'}</button>}
                      {zap && <a className={botao} href={zap} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Chamar no WhatsApp</a>}
                      <button className={botao} onClick={() => setAberta(exp ? null : n.id)} aria-expanded={exp}>{exp ? 'Ocultar detalhes' : 'Ver detalhes'}</button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {lista.length > mostrar && <button className={`${botao} mt-4 w-full`} onClick={() => setMostrar(mostrar + 30)}>Ver mais</button>}
        <p className="mt-4 text-xs text-stone-600">O histórico guarda os últimos 180 dias.</p>
      </section>
    </div>
  );
}
