'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { brl, br, diff, faixa, paraAgenda, segura, statusDia, type AdminData, type AgendaData, type Reserva } from '@/lib/agenda';
import { Calendario, hojeComoMes, mesesDe, type Mes } from './Calendario';
import { ListaReservas, Pilula, Resumo, statusReal } from './Visoes';
import { Regras } from './Regras';
import type { Chamar, Gaveta, Resposta } from './tipos';

type Aba = 'resumo' | 'cal' | 'rsv' | 'cfg';
const campo = 'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm';
const botao = 'rounded-lg border border-stone-300 px-3 py-2 text-sm hover:border-emerald-500';

function Login({ aoEntrar }: { aoEntrar: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setErro('');
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) aoEntrar();
      else setErro(j.erro || 'Não foi possível entrar.');
    } catch {
      setErro('Sem conexão. Tente de novo.');
    }
    setOcupado(false);
  };
  return (
    <form onSubmit={entrar} className="max-w-sm mx-auto mt-16 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <h1 className="font-serif text-2xl font-bold text-[#1B4332]">Painel do administrador</h1>
      <p className="text-sm text-stone-500 mt-1 mb-4">Sítio Shalom Xerém · área interna</p>
      <label className="text-xs text-stone-500">E-mail<input type="email" required autoComplete="username" className={campo} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="text-xs text-stone-500 block mt-3">Senha<input type="password" required autoComplete="current-password" className={campo} value={senha} onChange={(e) => setSenha(e.target.value)} /></label>
      {erro && <p className="text-sm text-red-700 mt-3">{erro}</p>}
      <button disabled={ocupado} className="mt-4 w-full rounded-xl bg-[#1B4332] text-white py-2.5 font-bold disabled:opacity-60">{ocupado ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}

// Preço sugerido para um intervalo, pelas regras do site (o dono pode mudar o valor).
function sugestao(a: string, b: string, ag: AgendaData) {
  const p = ag.periodos.find((x) => x.entrada === a && x.saida === b);
  if (p) return p.preco;
  return ag.cfg.base + Math.max(0, diff(a, b) - ag.cfg.minDias) * ag.cfg.extra;
}
const linkZap = (tel: string) => {
  const d = tel.replace(/\D/g, '');
  return d.length >= 10 ? `https://wa.me/${d.length > 11 && d.startsWith('55') ? d : '55' + d}` : null;
};

function GavetaReserva({ r, dados, chamar, fechar }: { r: Reserva; dados: AdminData; chamar: Chamar; fechar: () => void }) {
  const st = statusReal(r, dados.agora);
  const zap = linkZap(r.whatsapp);
  const linha = (k: string, v: React.ReactNode) => (
    <>
      <span className="text-stone-500">{k}</span>
      <span>{v}</span>
    </>
  );
  return (
    <div>
      <h3 className="font-serif text-xl font-bold">{r.igreja || r.nome}</h3>
      <div className="mt-1"><Pilula status={st} /></div>
      <div className="grid grid-cols-[110px_1fr] gap-y-1.5 text-sm mt-4">
        {linha('Responsável', r.nome)}
        {linha('WhatsApp', r.whatsapp)}
        {linha('Público', r.publico || '—')}
        {linha('Datas', `${br(r.entrada)} → ${br(r.saida)} (${diff(r.entrada, r.saida)} dias)`)}
        {linha('Total', <b>{brl(r.total)}</b>)}
        {linha(`Sinal`, brl(r.sinal))}
        {linha('Origem', r.origem === 'manual' ? 'Criada por você' : 'Pedido pelo site')}
        {st === 'aguardando_sinal' && linha('Data segurada até', r.segura_ate ? new Date(r.segura_ate).toLocaleString('pt-BR') : '—')}
      </div>
      <div className="grid gap-2 mt-5">
        {st === 'aguardando_sinal' && <button className="rounded-lg bg-[#1B4332] text-white px-3 py-2.5 text-sm" onClick={() => chamar('reserva.status', { id: r.id, status: 'confirmada' })}>✅ Confirmar sinal recebido</button>}
        {zap && <a className={`${botao} text-center`} href={zap} target="_blank" rel="noopener noreferrer">💬 Chamar no WhatsApp</a>}
        {(st === 'cancelada' || st === 'expirada') && <button className={botao} onClick={() => chamar('reserva.status', { id: r.id, status: 'aguardando_sinal' })}>Reativar (se as datas estiverem livres)</button>}
        {st === 'confirmada' && <button className={botao} onClick={() => chamar('reserva.status', { id: r.id, status: 'aguardando_sinal' })}>Voltar para aguardando sinal</button>}
        {(st === 'aguardando_sinal' || st === 'confirmada') && (
          <button className={`${botao} text-red-700`} onClick={() => confirm('Cancelar esta reserva e liberar as datas?') && chamar('reserva.status', { id: r.id, status: 'cancelada' }).then(fechar)}>Cancelar reserva e liberar as datas</button>
        )}
      </div>
    </div>
  );
}

function GavetaDias({ ini, dados, ag, chamar, fechar }: { ini: { a: string; b: string }; dados: AdminData; ag: AgendaData; chamar: Chamar; fechar: () => void }) {
  const [a, setA] = useState(ini.a);
  const [b, setB] = useState(ini.b);
  const [motivo, setMotivo] = useState('');
  const [m, setM] = useState({ igreja: '', nome: '', whats: '', total: '', status: 'confirmada' });
  const dias = a && b && b >= a && diff(a, b) <= 400 ? faixa(a, b) : [];
  const c = { livre: 0, fechado: 0, reservado: 0, passado: 0 };
  dias.forEach((d) => {
    const s = statusDia(d, ag);
    c[s === 'padrao' ? 'fechado' : s]++;
  });
  const podeReservar = dias.length > 0 && c.reservado === 0 && c.passado === 0;
  const total = m.total === '' ? (dias.length ? sugestao(a, b, ag) : 0) : +m.total;
  const agir = (modo: 'fechar' | 'abrir' | 'padrao') => chamar('dias', { datas: dias, modo, motivo });
  return (
    <div>
      <h3 className="font-serif text-xl font-bold">{a === b ? br(a) : `${br(a)} → ${br(b)}`}</h3>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <label className="text-xs text-stone-500">De<input type="date" className={campo} value={a} onChange={(e) => { setA(e.target.value); if (b < e.target.value) setB(e.target.value); }} /></label>
        <label className="text-xs text-stone-500">Até<input type="date" className={campo} value={b} min={a} onChange={(e) => setB(e.target.value)} /></label>
      </div>
      <p className="text-xs text-stone-500 mt-2">
        {dias.length} dia(s) · {c.livre} livres · {c.fechado} fechados{c.reservado ? ` · ${c.reservado} com reserva` : ''}{c.passado ? ` · ${c.passado} passados` : ''}
      </p>
      <label className="text-xs text-stone-500 block mt-3">Motivo (só você vê)<input className={campo} value={motivo} maxLength={80} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: manutenção, família, férias" /></label>
      <div className="grid gap-2 mt-3">
        <button disabled={!dias.length} className={`${botao} text-red-700`} onClick={() => agir('fechar')}>🔒 Fechar para o cliente</button>
        <button disabled={!dias.length} className={botao} onClick={() => agir('abrir')}>🟢 Abrir para o cliente</button>
        <button disabled={!dias.length} className={botao} onClick={() => agir('padrao')}>↩ Voltar ao padrão</button>
      </div>
      <p className="text-xs text-stone-500 mt-2">Dias passados ou com reserva são mantidos. Dias abertos soltos (menos de {dados.cfg.minDias} seguidos) ficam ocultos para o cliente.</p>
      <hr className="my-5 border-stone-200" />
      <h4 className="font-bold">Criar reserva manual</h4>
      <p className="text-xs text-stone-500 mb-2">Para quem fechou por telefone ou WhatsApp.</p>
      {podeReservar ? (
        <div className="space-y-2">
          <input className={campo} placeholder="Igreja / ministério" value={m.igreja} onChange={(e) => setM({ ...m, igreja: e.target.value })} />
          <input className={campo} placeholder="Responsável" value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} />
          <input className={campo} placeholder="WhatsApp" value={m.whats} onChange={(e) => setM({ ...m, whats: e.target.value })} />
          <label className="text-xs text-stone-500 block">Total (R$) — sugerido pelas regras<input type="number" min={0} step={500} className={campo} value={m.total === '' ? total : m.total} onChange={(e) => setM({ ...m, total: e.target.value })} /></label>
          <div className="grid gap-2">
            <button className="rounded-lg bg-[#1B4332] text-white px-3 py-2.5 text-sm" onClick={() => chamar('reserva.criar', { entrada: a, saida: b, total, nome: m.nome, igreja: m.igreja, whatsapp: m.whats, status: 'confirmada' }).then((r) => r.ok && fechar())}>Criar como confirmada</button>
            <button className={botao} onClick={() => chamar('reserva.criar', { entrada: a, saida: b, total, nome: m.nome, igreja: m.igreja, whatsapp: m.whats, status: 'aguardando_sinal' }).then((r) => r.ok && fechar())}>Criar aguardando sinal</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-red-700">Há dias com reserva ou já passados nesta seleção. Escolha só dias livres ou fechados.</p>
      )}
    </div>
  );
}

export function Painel() {
  const [sessao, setSessao] = useState<'carregando' | 'fora' | 'dentro'>('carregando');
  const [dados, setDados] = useState<AdminData | null>(null);
  const [aviso, setAviso] = useState('');
  const [aba, setAba] = useState<Aba>('resumo');
  const [gaveta, setGaveta] = useState<Gaveta>(null);
  const [toast, setToast] = useState('');
  const [ini, setIni] = useState<Mes | null>(null);
  const [modo, setModo] = useState<1 | 3 | 12>(1);
  const [selCal, setSelCal] = useState<{ a: string; b: string } | null>(null);

  const avisar = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(''), 3500);
  };

  // O login fica num cookie seguro (HttpOnly); o navegador o envia sozinho a cada chamada.
  const carregar = useCallback(async () => {
    try {
      const r = await fetch('/api/admin', { cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) {
        setSessao('fora');
        setDados(null);
        return;
      }
      setSessao('dentro');
      if (r.ok) {
        setDados(j);
        setAviso('');
        setIni((m) => m ?? hojeComoMes(j.hoje));
      } else {
        setDados(null);
        setAviso(j.erro || 'Não foi possível carregar o painel.');
      }
    } catch {
      setSessao('dentro');
      setAviso('Sem conexão com o servidor.');
    }
  }, []);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const chamar: Chamar = async (acao, corpo = {}) => {
    try {
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao, ...corpo }) });
      const j: Resposta = await r.json().catch(() => ({}));
      if (!r.ok) {
        avisar(j.erro || 'Não foi possível concluir.');
        if (r.status === 401) setSessao('fora');
        return { erro: j.erro || 'erro' };
      }
      await carregar();
      avisar(
        acao === 'dias' ? `${j.alterados} dia(s) atualizados${j.ignorados ? ` · ${j.ignorados} mantidos (reserva ou passado)` : ''}.` :
        acao === 'sugerir' ? (j.criados ? `${j.criados} período(s) sugerido(s). Confira datas e preços.` : 'Esses períodos já existem.') :
        'Salvo ✔'
      );
      return j;
    } catch {
      avisar('Sem conexão. Tente de novo.');
      return { erro: 'sem conexão' };
    }
  };

  const ag = useMemo(() => (dados ? paraAgenda(dados) : null), [dados]);
  const fechar = useCallback(() => {
    setGaveta(null);
    setSelCal(null);
  }, []);
  const abrirReserva = (id: number) => setGaveta({ tipo: 'reserva', id });
  const confirmar = (id: number) => chamar('reserva.status', { id, status: 'confirmada' });

  const aoSelecionar = useCallback(
    (a: string, b: string) => {
      if (!dados) return;
      const ids = new Set(faixa(a, b).map((d) => dados.reservas.find((r) => segura(r, dados.agora) && d >= r.entrada && d <= r.saida)?.id));
      const [um] = [...ids];
      setSelCal({ a, b });
      setGaveta(ids.size === 1 && um !== undefined ? { tipo: 'reserva', id: um } : { tipo: 'dias', a, b });
    },
    [dados]
  );

  if (sessao === 'carregando') return <p className="p-8 text-stone-500">Carregando…</p>;
  if (sessao === 'fora') return <main className="min-h-screen bg-[#FAF8F5] px-4"><Login aoEntrar={carregar} /></main>;

  const sair = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setSessao('fora');
    setDados(null);
  };
  if (!dados || !ag || !ini) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-4">
        <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <p className="text-stone-700">{aviso || 'Carregando painel…'}</p>
          {aviso && <button onClick={sair} className={`${botao} mt-4`}>Sair</button>}
        </div>
      </main>
    );
  }

  const meses = mesesDe(ini, modo);
  const mover = (d: number) => {
    const t = ini.y * 12 + ini.m + d * modo;
    setIni({ y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 });
  };
  const abas: [Aba, string][] = [['resumo', 'Resumo'], ['cal', 'Calendário'], ['rsv', 'Reservas'], ['cfg', 'Regras e preços']];
  const reservaAberta = gaveta?.tipo === 'reserva' ? dados.reservas.find((r) => r.id === gaveta.id) : undefined;
  const rotuloMes = (m: Mes) => new Date(Date.UTC(m.y, m.m, 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-slate-800">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1B4332]">Painel do administrador · Sítio Shalom</h1>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className={botao}>Ver o site</a>
            <button onClick={sair} className={botao}>Sair</button>
          </div>
        </div>
        <div className="flex gap-1 border-b border-stone-200 mb-4 overflow-x-auto">
          {abas.map(([k, l]) => (
            <button key={k} onClick={() => { setAba(k); fechar(); }} className={`px-4 py-2.5 font-semibold whitespace-nowrap border-b-[3px] ${aba === k ? 'text-[#1B4332] border-[#1B4332]' : 'text-stone-500 border-transparent'}`}>{l}</button>
          ))}
        </div>

        {aba === 'resumo' && <Resumo dados={dados} abrir={abrirReserva} confirmar={confirmar} />}
        {aba === 'cal' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <button className={botao} onClick={() => mover(-1)}>◀</button>
                <b className="min-w-[150px] text-center first-letter:uppercase">{modo === 1 ? rotuloMes(ini) : `${rotuloMes(ini)} – ${rotuloMes(meses[meses.length - 1])}`}</b>
                <button className={botao} onClick={() => mover(1)}>▶</button>
                <button className={botao} onClick={() => setIni(hojeComoMes(dados.hoje))}>Hoje</button>
              </div>
              <div className="inline-flex rounded-lg border border-stone-300 overflow-hidden">
                {([1, 3, 12] as const).map((n) => (
                  <button key={n} onClick={() => setModo(n)} className={`px-3 py-2 text-sm ${modo === n ? 'bg-[#1B4332] text-white' : 'bg-white'}`}>{n === 1 ? '1 mês' : `${n} meses`}</button>
                ))}
              </div>
            </div>
            <Calendario dados={dados} ag={ag} meses={meses} compacto={modo !== 1} sel={selCal} aoSelecionar={aoSelecionar} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-stone-500">
              <span><i className="inline-block w-3 h-3 rounded-sm bg-emerald-600 mr-1 align-[-2px]" />Confirmada</span>
              <span><i className="inline-block w-3 h-3 rounded-sm bg-amber-400 mr-1 align-[-2px]" />Aguardando sinal</span>
              <span><i className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-300 mr-1 align-[-2px]" />Livre</span>
              <span><i className="inline-block w-3 h-3 rounded-sm bg-stone-100 border border-stone-200 mr-1 align-[-2px]" />Fechado</span>
              <span><i className="inline-block w-3 h-3 rounded-sm bg-emerald-50 border border-dashed border-amber-500 mr-1 align-[-2px]" />Aberto, mas oculto do cliente (menos de {dados.cfg.minDias} dias seguidos)</span>
              <span><i className="inline-block w-3 h-0.5 bg-amber-500 mr-1 align-middle" />Período especial</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">Clique num dia ou <b>arraste</b> para selecionar vários. A gaveta mostra a reserva ou deixa você fechar, abrir ou criar uma reserva.</p>
          </div>
        )}
        {aba === 'rsv' && <ListaReservas dados={dados} abrir={abrirReserva} />}
        {aba === 'cfg' && <Regras dados={dados} chamar={chamar} />}
      </div>

      {gaveta && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={fechar} />
          <aside className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl p-5 overflow-y-auto">
            <button onClick={fechar} className={`${botao} float-right`} aria-label="Fechar">✕</button>
            {gaveta.tipo === 'reserva' && reservaAberta && <GavetaReserva r={reservaAberta} dados={dados} chamar={chamar} fechar={fechar} />}
            {gaveta.tipo === 'dias' && <GavetaDias key={gaveta.a + gaveta.b} ini={gaveta} dados={dados} ag={ag} chamar={chamar} fechar={fechar} />}
          </aside>
        </>
      )}
      {toast && <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">{toast}</div>}
    </main>
  );
}
