'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, ExternalLink, LayoutGrid, Lock, LockOpen, LogOut, Menu, MessageCircle, SlidersHorizontal, Undo2, Users, X } from 'lucide-react';
import { brl, br, diff, faixa, pagamento, paraAgenda, segura, statusDia, type AdminData, type AgendaData, type Reserva } from '@/lib/agenda';
import { Calendario, hojeComoMes, mesesDe, type Mes } from './Calendario';
import { ListaReservas, Resumo, statusReal } from './Visoes';
import { Regras } from './Regras';
import { Admins } from './Admins';
import { CURVAS, PilulaReserva, botao, botaoPerigo, botaoPri, campo, iniciais, rotulo } from './ui';
import type { Chamar, Gaveta, Resposta } from './tipos';

type Aba = 'resumo' | 'cal' | 'rsv' | 'cfg' | 'adm';
const NAV = [
  { k: 'resumo', rot: 'Resumo', Ic: LayoutGrid },
  { k: 'cal', rot: 'Calendário', Ic: CalendarDays },
  { k: 'rsv', rot: 'Reservas', Ic: BookOpen },
  { k: 'cfg', rot: 'Regras e preços', Ic: SlidersHorizontal },
  { k: 'adm', rot: 'Administradores', Ic: Users },
] as const;

const Marca = ({ claro = false }: { claro?: boolean }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B4332] font-serif text-lg font-bold text-amber-100 ring-1 ring-amber-200/25">S</span>
    <div className="leading-tight">
      <p className={`font-serif text-[17px] ${claro ? 'text-[#14301F]' : 'text-[#F3EFE6]'}`}>Sítio Shalom</p>
      <p className={`text-xs ${claro ? 'text-stone-600' : 'text-[#9DB8A5]'}`}>Painel do administrador</p>
    </div>
  </div>
);

// Primeiro acesso (nenhum administrador ainda): cria o primeiro. Depois: login normal.
function Login({ aoEntrar, primeiro }: { aoEntrar: () => void; primeiro: boolean }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senha2, setSenha2] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    if (primeiro && senha !== senha2) return setErro('As senhas não são iguais.');
    setOcupado(true);
    try {
      const r = await fetch(primeiro ? '/api/admin/setup' : '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) aoEntrar();
      else setErro(j.erro || 'Não foi possível entrar.');
    } catch {
      setErro('Sem conexão. Tente de novo.');
    }
    setOcupado(false);
  };
  return (
    <main className="grid min-h-screen bg-[#F6F3EC] lg:grid-cols-[5fr_6fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden p-12 text-[#F3EFE6] lg:flex" style={{ backgroundColor: '#0F291E', backgroundImage: CURVAS, backgroundRepeat: 'no-repeat', backgroundPosition: 'right -120px bottom -120px', backgroundSize: '520px' }}>
        <Marca />
        <div>
          <h2 className="max-w-md font-serif text-[40px] leading-[1.15]">Datas, preços e reservas do sítio, num só lugar.</h2>
          <p className="mt-4 max-w-sm text-[#CFE0D2]">Área interna de quem cuida do Sítio Shalom Xerém.</p>
        </div>
        <p className="text-sm text-[#9DB8A5]">Xerém, Duque de Caxias</p>
      </aside>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={entrar} className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Marca claro /></div>
          <h1 className="font-serif text-3xl text-[#14301F]">{primeiro ? 'Criar o primeiro administrador' : 'Entrar no painel'}</h1>
          <p className="mb-7 mt-2 text-sm text-stone-600">{primeiro ? 'Ainda não existe nenhum login. Crie o seu para começar.' : 'Use o e-mail e a senha do seu acesso.'}</p>
          <label className={rotulo}>
            E-mail
            <input type="email" required autoComplete="username" className={`${campo} mt-1 py-2.5`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className={`${rotulo} mt-4`}>
            {primeiro ? 'Senha (mínimo 10 caracteres)' : 'Senha'}
            <input type="password" required minLength={primeiro ? 10 : undefined} autoComplete={primeiro ? 'new-password' : 'current-password'} className={`${campo} mt-1 py-2.5`} value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          {primeiro && (
            <label className={`${rotulo} mt-4`}>
              Repita a senha
              <input type="password" required autoComplete="new-password" className={`${campo} mt-1 py-2.5`} value={senha2} onChange={(e) => setSenha2(e.target.value)} />
            </label>
          )}
          {erro && <p role="alert" className="mt-4 text-sm text-[#B42318]">{erro}</p>}
          <button disabled={ocupado} className={`${botaoPri} mt-6 w-full py-3`}>{ocupado ? 'Aguarde…' : primeiro ? 'Criar e entrar' : 'Entrar'}</button>
        </form>
      </section>
    </main>
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

// Quanto já foi recebido de uma reserva: sinal, parte ou tudo.
function BlocoPagamento({ r, st, chamar }: { r: Reserva; st: string; chamar: Chamar }) {
  const [valor, setValor] = useState(String(r.pago));
  const falta = Math.max(0, r.total - r.pago);
  const pct = r.total > 0 ? Math.min(100, (r.pago / r.total) * 100) : 0;
  const salvar = (v: number) => chamar('reserva.pago', { id: r.id, pago: v });
  return (
    <div className="mt-6 rounded-lg border border-[#D2CAB8] bg-[#F6F3EC] p-4">
      <h3 className="font-serif text-lg text-[#14301F]">Pagamento</h3>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#DDD6C6]" role="img" aria-label={`Recebido ${brl(r.pago)} de ${brl(r.total)}`}>
        <i className="block h-full bg-[#1B4332]" style={{ width: pct + '%' }} />
      </div>
      <p className="mt-2 flex flex-wrap justify-between gap-x-4 text-sm">
        <span>Recebido <b className="tabular-nums">{brl(r.pago)}</b> de {brl(r.total)}</span>
        <span className="font-semibold tabular-nums">{falta > 0 ? `Falta ${brl(falta)}` : 'Tudo recebido'}</span>
      </p>
      {st === 'confirmada' ? (
        <div className="mt-4">
          <label className={rotulo}>
            Total já recebido (R$)
            <input type="number" inputMode="decimal" min={0} max={r.total} step={100} className={`${campo} mt-1`} value={valor} onChange={(e) => setValor(e.target.value)} />
          </label>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button className={botaoPri} onClick={() => salvar(+valor)}>Salvar valor recebido</button>
            <button className={botao} onClick={() => salvar(r.total)} disabled={r.pago >= r.total}>Marcar como quitada</button>
          </div>
          {r.pago < r.sinal && (
            <button className={`${botao} mt-2 w-full`} onClick={() => salvar(r.sinal)}>Sinal recebido ({brl(r.sinal)})</button>
          )}
        </div>
      ) : st === 'aguardando_sinal' ? (
        <p className="mt-3 text-sm text-stone-600">Confirme o sinal para começar a registrar pagamentos.</p>
      ) : r.pago > 0 ? (
        <p className="mt-3 text-sm text-stone-600">Esta reserva não está ativa e {brl(r.pago)} já tinham sido recebidos. Combine a devolução com o cliente.</p>
      ) : null}
    </div>
  );
}

function GavetaReserva({ r, dados, chamar, fechar }: { r: Reserva; dados: AdminData; chamar: Chamar; fechar: () => void }) {
  const st = statusReal(r, dados.agora);
  const zap = linkZap(r.whatsapp);
  const linha = (k: string, v: React.ReactNode) => (
    <>
      <dt className="text-stone-600">{k}</dt>
      <dd className="text-[#1F2937]">{v}</dd>
    </>
  );
  return (
    <div>
      <h2 className="pr-10 font-serif text-2xl leading-tight text-[#14301F]">{r.igreja || r.nome}</h2>
      <div className="mt-2"><PilulaReserva status={st} pag={pagamento(r)} /></div>
      <dl className="mt-6 grid grid-cols-[112px_1fr] gap-y-2.5 text-sm">
        {linha('Responsável', r.nome)}
        {linha('WhatsApp', r.whatsapp)}
        {linha('Público', r.publico || '—')}
        {linha('Datas', `${br(r.entrada)} a ${br(r.saida)} (${diff(r.entrada, r.saida)} dias)`)}
        {linha('Total', <b className="tabular-nums">{brl(r.total)}</b>)}
        {linha('Sinal', <span className="tabular-nums">{brl(r.sinal)}</span>)}
        {linha('Origem', r.origem === 'manual' ? 'Criada por você' : 'Pedido pelo site')}
        {st === 'aguardando_sinal' && linha('Data segurada até', r.segura_ate ? new Date(r.segura_ate).toLocaleString('pt-BR') : '—')}
      </dl>
      <BlocoPagamento r={r} st={st} chamar={chamar} />
      <div className="mt-6 grid gap-2">
        {st === 'aguardando_sinal' && (
          <button className={botaoPri} onClick={() => chamar('reserva.status', { id: r.id, status: 'confirmada' })}>
            <Check className="h-4 w-4" /> Confirmar sinal recebido
          </button>
        )}
        {zap && (
          <a className={botao} href={zap} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        )}
        {(st === 'cancelada' || st === 'expirada') && <button className={botao} onClick={() => chamar('reserva.status', { id: r.id, status: 'aguardando_sinal' })}>Reativar, se as datas estiverem livres</button>}
        {st === 'confirmada' && <button className={botao} onClick={() => confirm('Voltar para aguardando sinal zera o valor já recebido. Continuar?') && chamar('reserva.status', { id: r.id, status: 'aguardando_sinal' })}>Voltar para aguardando sinal</button>}
        {(st === 'aguardando_sinal' || st === 'confirmada') && (
          <button className={botaoPerigo} onClick={() => confirm('Cancelar esta reserva e liberar as datas?') && chamar('reserva.status', { id: r.id, status: 'cancelada' }).then(fechar)}>Cancelar reserva e liberar as datas</button>
        )}
      </div>
    </div>
  );
}

function GavetaDias({ ini, dados, ag, chamar, fechar }: { ini: { a: string; b: string }; dados: AdminData; ag: AgendaData; chamar: Chamar; fechar: () => void }) {
  const [a, setA] = useState(ini.a);
  const [b, setB] = useState(ini.b);
  const [motivo, setMotivo] = useState('');
  const [m, setM] = useState({ igreja: '', nome: '', whats: '', total: '', recebido: '' });
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
      <h2 className="pr-10 font-serif text-2xl text-[#14301F]">{a === b ? br(a) : `${br(a)} a ${br(b)}`}</h2>
      <p className="mt-1 text-sm text-stone-600">
        {dias.length} dia(s): {c.livre} livres, {c.fechado} fechados{c.reservado ? `, ${c.reservado} com reserva` : ''}{c.passado ? `, ${c.passado} passados` : ''}.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className={rotulo}>De<input type="date" className={`${campo} mt-1`} value={a} onChange={(e) => { setA(e.target.value); if (b < e.target.value) setB(e.target.value); }} /></label>
        <label className={rotulo}>Até<input type="date" className={`${campo} mt-1`} value={b} min={a} onChange={(e) => setB(e.target.value)} /></label>
      </div>

      <h3 className="mt-8 font-serif text-lg text-[#14301F]">Disponibilidade para o cliente</h3>
      <label className={`${rotulo} mt-3`}>
        Motivo (só você vê)
        <input className={`${campo} mt-1`} value={motivo} maxLength={80} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: manutenção, família, férias" />
      </label>
      <div className="mt-3 grid gap-2">
        <button disabled={!dias.length} className={botaoPerigo} onClick={() => agir('fechar')}><Lock className="h-4 w-4" /> Fechar para o cliente</button>
        <button disabled={!dias.length} className={botao} onClick={() => agir('abrir')}><LockOpen className="h-4 w-4" /> Abrir para o cliente</button>
        <button disabled={!dias.length} className={botao} onClick={() => agir('padrao')}><Undo2 className="h-4 w-4" /> Voltar ao padrão</button>
      </div>
      <p className="mt-3 text-sm text-stone-600">Dias passados ou com reserva são mantidos. Dias abertos soltos (menos de {dados.cfg.minDias} seguidos) ficam ocultos para o cliente.</p>

      <h3 className="mt-8 font-serif text-lg text-[#14301F]">Criar reserva manual</h3>
      <p className="mt-1 text-sm text-stone-600">Para quem fechou por telefone ou WhatsApp.</p>
      {podeReservar ? (
        <div className="mt-3 space-y-3">
          <input className={campo} placeholder="Igreja ou ministério" value={m.igreja} onChange={(e) => setM({ ...m, igreja: e.target.value })} />
          <input className={campo} placeholder="Responsável" value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} />
          <input className={campo} placeholder="WhatsApp" value={m.whats} onChange={(e) => setM({ ...m, whats: e.target.value })} />
          <label className={rotulo}>Total (R$), sugerido pelas regras<input type="number" min={0} step={500} className={`${campo} mt-1`} value={m.total === '' ? total : m.total} onChange={(e) => setM({ ...m, total: e.target.value })} /></label>
          <label className={rotulo}>
            Já recebido (R$), se criar como confirmada
            <input type="number" inputMode="decimal" min={0} step={100} className={`${campo} mt-1`} placeholder={`Vazio = sinal (${brl(Math.round((total * dados.cfg.sinalPct) / 100))})`} value={m.recebido} onChange={(e) => setM({ ...m, recebido: e.target.value })} />
          </label>
          <div className="grid gap-2 pt-1">
            <button className={botaoPri} onClick={() => chamar('reserva.criar', { entrada: a, saida: b, total, nome: m.nome, igreja: m.igreja, whatsapp: m.whats, status: 'confirmada', pago: m.recebido }).then((r) => r.ok && fechar())}>Criar como confirmada</button>
            <button className={botao} onClick={() => chamar('reserva.criar', { entrada: a, saida: b, total, nome: m.nome, igreja: m.igreja, whatsapp: m.whats, status: 'aguardando_sinal' }).then((r) => r.ok && fechar())}>Criar aguardando sinal</button>
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-[#F6DAD5] p-3 text-sm text-[#8F2517]">Há dias com reserva ou já passados nesta seleção. Escolha só dias livres ou fechados.</p>
      )}
    </div>
  );
}

export function Painel() {
  const [sessao, setSessao] = useState<'carregando' | 'fora' | 'dentro'>('carregando');
  const [primeiro, setPrimeiro] = useState(false);
  const [dados, setDados] = useState<AdminData | null>(null);
  const [aviso, setAviso] = useState('');
  const [aba, setAba] = useState<Aba>('resumo');
  const [gaveta, setGaveta] = useState<Gaveta>(null);
  const [toast, setToast] = useState('');
  const [ini, setIni] = useState<Mes | null>(null);
  const [modo, setModo] = useState<1 | 3 | 12>(1);
  const [selCal, setSelCal] = useState<{ a: string; b: string } | null>(null);
  const [menu, setMenu] = useState(false);

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
        const st = await fetch('/api/admin/setup', { cache: 'no-store' }).then((x) => x.json()).catch(() => ({}));
        setPrimeiro(!!st.precisa);
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
        acao === 'dias' ? `${j.alterados} dia(s) atualizados${j.ignorados ? `, ${j.ignorados} mantidos (reserva ou passado)` : ''}.` :
        acao === 'sugerir' ? (j.criados ? `${j.criados} período(s) sugerido(s). Confira datas e preços.` : 'Esses períodos já existem.') :
        'Salvo.'
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
  const irParaDatas = (a: string, b: string) => {
    setAba('cal');
    setModo(1);
    setIni({ y: +a.slice(0, 4), m: +a.slice(5, 7) - 1 });
    aoSelecionar(a, b);
  };

  if (sessao === 'carregando') return <main className="min-h-screen bg-[#F6F3EC] p-10 text-stone-600">Carregando…</main>;
  if (sessao === 'fora') return <Login aoEntrar={carregar} primeiro={primeiro} />;

  const sair = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setSessao('fora');
    setDados(null);
  };
  if (!dados || !ag || !ini) {
    return (
      <main className="min-h-screen bg-[#F6F3EC] px-4">
        <div className="mx-auto mt-24 max-w-md rounded-xl border border-[#D2CAB8] bg-white p-7 text-center">
          <p className="text-stone-700">{aviso || 'Carregando painel…'}</p>
          {aviso && <button onClick={sair} className={`${botao} mt-5`}>Sair</button>}
        </div>
      </main>
    );
  }

  const meses = mesesDe(ini, modo);
  const mover = (d: number) => {
    const t = ini.y * 12 + ini.m + d * modo;
    setIni({ y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 });
  };
  const reservaAberta = gaveta?.tipo === 'reserva' ? dados.reservas.find((r) => r.id === gaveta.id) : undefined;
  const rotuloMes = (m: Mes) => new Date(Date.UTC(m.y, m.m, 1)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dataLonga = new Date(dados.hoje + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const pendentes = dados.reservas.filter((r) => statusReal(r, dados.agora) === 'aguardando_sinal').length;
  const titulo = NAV.find((n) => n.k === aba)!.rot;

  const lateral = (fecharMenu?: () => void) => {
    const fixa = !fecharMenu; // barra fixa do computador (a do celular é uma janela sobre o fundo escuro)
    return (
    <div className="flex h-full flex-col bg-[#0F291E] text-[#E7EFE6]" style={{ backgroundImage: CURVAS, backgroundRepeat: 'no-repeat', backgroundPosition: 'left -110px bottom -110px', backgroundSize: '420px' }}>
      <div className="px-6 pb-9 pt-7"><Marca /></div>
      <nav className="flex-1 pl-4" aria-label="Seções do painel">
        {NAV.map(({ k, rot, Ic }) => {
          const ativo = aba === k;
          return (
            <button
              key={k}
              onClick={() => { setAba(k); fechar(); fecharMenu?.(); }}
              aria-current={ativo ? 'page' : undefined}
              className={`relative mb-1.5 flex w-full items-center gap-3 rounded-l-xl py-3 pl-4 pr-5 text-left text-[15px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-300 ${ativo ? `bg-[#F6F3EC] font-semibold text-[#14301F] ${fixa ? '' : 'mr-4 rounded-r-xl'}` : 'text-[#CFE0D2] hover:bg-white/[0.06] hover:text-white'}`}
            >
              {ativo && fixa && (
                <>
                  <span aria-hidden className="absolute -top-5 right-0 h-5 w-5 rounded-br-[20px] shadow-[10px_10px_0_10px_#F6F3EC]" />
                  <span aria-hidden className="absolute -bottom-5 right-0 h-5 w-5 rounded-tr-[20px] shadow-[10px_-10px_0_10px_#F6F3EC]" />
                </>
              )}
              <Ic className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{rot}</span>
              {k === 'rsv' && pendentes > 0 && <span className="rounded-full bg-[#D97706] px-2 py-0.5 text-xs font-semibold text-white" title="Pedidos aguardando sinal">{pendentes}</span>}
            </button>
          );
        })}
      </nav>
      <div className="m-4 rounded-lg bg-black/25 p-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-[#14301F]">{iniciais(dados.eu)}</span>
          <div className="min-w-0">
            <p className="truncate text-sm text-[#F3EFE6]">{dados.eu}</p>
            <p className="text-xs text-[#9DB8A5]">Administrador</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-2 py-2 text-xs text-[#E7EFE6] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300">
            <ExternalLink className="h-3.5 w-3.5" /> Ver o site
          </a>
          <button onClick={sair} className="flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-2 py-2 text-xs text-[#E7EFE6] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>
    </div>
  );
  };

  const icone = 'inline-flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-[#BDB4A1] bg-white text-stone-700 transition-colors hover:border-[#1B4332] hover:text-[#1B4332] focus-visible:outline-2 focus-visible:outline-[#D97706]';

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#1F2937]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">{lateral()}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-[#0F291E] px-4 py-3 lg:hidden">
        <Marca />
        <button onClick={() => setMenu(true)} aria-label="Abrir o menu" className="rounded-md p-2 text-[#F3EFE6] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"><Menu className="h-6 w-6" /></button>
      </header>
      {menu && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMenu(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-[272px] lg:hidden">
            <button onClick={() => setMenu(false)} aria-label="Fechar o menu" className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-[#CFE0D2] hover:bg-white/10"><X className="h-5 w-5" /></button>
            {lateral(() => setMenu(false))}
          </aside>
        </>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
          <header className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <h1 className="font-serif text-3xl leading-tight text-[#14301F] sm:text-4xl">{titulo}</h1>
            <p className="pb-1 text-sm text-stone-600 first-letter:uppercase">{dataLonga}</p>
          </header>

          {aba === 'resumo' && <Resumo dados={dados} abrir={abrirReserva} confirmar={confirmar} irParaDatas={irParaDatas} irParaCalendario={() => setAba('cal')} />}
          {aba === 'cal' && (
            <section className="rounded-xl border border-[#D2CAB8] bg-white p-3 shadow-[0_1px_2px_rgba(20,48,31,0.08)] sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button className={icone} onClick={() => mover(-1)} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></button>
                  <button className={icone} onClick={() => mover(1)} aria-label="Próximo mês"><ChevronRight className="h-4 w-4" /></button>
                  <p className="ml-2 min-w-[160px] font-serif text-xl text-[#14301F] first-letter:uppercase">{modo === 1 ? rotuloMes(ini) : `${rotuloMes(ini)} a ${rotuloMes(meses[meses.length - 1])}`}</p>
                  <button className={`${botao} ml-1`} onClick={() => setIni(hojeComoMes(dados.hoje))}>Hoje</button>
                </div>
                <div className="inline-flex rounded-lg bg-[#EFEBE3] p-1" role="tablist" aria-label="Quantos meses mostrar">
                  {([1, 3, 12] as const).map((n) => (
                    <button key={n} role="tab" aria-selected={modo === n} onClick={() => setModo(n)} className={`rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#D97706] ${modo === n ? 'bg-white font-semibold text-[#14301F] shadow-sm' : 'text-stone-600 hover:text-[#14301F]'}`}>{n === 1 ? '1 mês' : `${n} meses`}</button>
                  ))}
                </div>
              </div>
              <Calendario dados={dados} ag={ag} meses={meses} compacto={modo !== 1} sel={selCal} aoSelecionar={aoSelecionar} />
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#EEE9DF] pt-4 text-sm text-stone-600">
                <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#1B4332]" />Confirmada</span>
                <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#E9A43A]" />Aguardando sinal</span>
                <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border border-[#B3CDB6] bg-[#E3EFE1]" />Livre</span>
                <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border border-[#D2CAB8] bg-[#EFEBE3]" />Fechado</span>
                <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm border border-dashed border-[#D97706] bg-[#F1F6F0]" />Aberto, mas oculto do cliente (menos de {dados.cfg.minDias} dias seguidos)</span>
                <span className="flex items-center gap-2"><i className="h-0.5 w-3 bg-[#D97706]" />Período especial</span>
              </div>
              <p className="mt-3 text-sm text-stone-600">Clique num dia ou arraste para selecionar vários. A gaveta mostra a reserva ou deixa você fechar, abrir ou criar uma reserva.</p>
            </section>
          )}
          {aba === 'rsv' && <ListaReservas dados={dados} abrir={abrirReserva} />}
          {aba === 'cfg' && <Regras dados={dados} chamar={chamar} />}
          {aba === 'adm' && <Admins dados={dados} chamar={chamar} />}
        </div>
      </main>

      {gaveta && (
        <>
          <div className="fixed inset-0 z-40 bg-[#0F291E]/40" onClick={fechar} />
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] overflow-y-auto bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:p-6" role="dialog" aria-modal="true">
            <button onClick={fechar} aria-label="Fechar" className="absolute right-4 top-4 rounded-md p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-[#D97706]"><X className="h-5 w-5" /></button>
            {gaveta.tipo === 'reserva' && reservaAberta && <GavetaReserva key={`${reservaAberta.id}-${reservaAberta.status}-${reservaAberta.pago}`} r={reservaAberta} dados={dados} chamar={chamar} fechar={fechar} />}
            {gaveta.tipo === 'dias' && <GavetaDias key={gaveta.a + gaveta.b} ini={gaveta} dados={dados} ag={ag} chamar={chamar} fechar={fechar} />}
          </aside>
        </>
      )}
      {toast && <div role="status" className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-[60] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg bg-[#0F291E] px-4 py-3 text-sm text-[#F3EFE6] shadow-lg">{toast}</div>}
    </div>
  );
}
