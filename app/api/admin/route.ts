import { NextResponse } from 'next/server';
import { exigirAdmin, HttpErro } from '@/lib/admin-auth';
import { cfgDeLinha, hojeSP, supabaseAdmin } from '@/lib/agenda-server';
import { sugerirPeriodos, type AdminData } from '@/lib/agenda';

export const dynamic = 'force-dynamic';

type Db = ReturnType<typeof supabaseAdmin>;
type Corpo = Record<string, unknown>;

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const dataOk = (v: unknown): v is string => typeof v === 'string' && DATA.test(v) && !Number.isNaN(Date.parse(v));
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return v !== '' && v !== null && Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const invalido = (m: string) => new HttpErro(400, m);
const ok = (extra: object = {}) => NextResponse.json({ ok: true, ...extra });

function erro(e: unknown) {
  if (e instanceof HttpErro) return NextResponse.json({ erro: e.message }, { status: e.status });
  if ((e as { code?: string })?.code === '23P01') return NextResponse.json({ erro: 'Outra reserva já ocupa essas datas.' }, { status: 409 });
  console.error('admin:', e);
  return NextResponse.json({ erro: 'Não foi possível concluir agora. Tente de novo.' }, { status: 500 });
}

async function carregar(db: Db): Promise<AdminData> {
  const [c, p, d, r] = await Promise.all([
    db.from('agenda_config').select('*').eq('id', 1).single(),
    db.from('agenda_periodos').select('*').order('entrada'),
    db.from('agenda_dias').select('data, aberto, motivo'),
    db.from('agenda_reservas').select('*').order('entrada'),
  ]);
  for (const x of [c, p, d, r]) if (x.error) throw x.error;
  return {
    hoje: hojeSP(),
    agora: new Date().toISOString(),
    cfg: cfgDeLinha(c.data!),
    periodos: (p.data ?? []).map((x) => ({ ...x, preco: Number(x.preco) })),
    dias: Object.fromEntries((d.data ?? []).map((x) => [x.data as string, { aberto: x.aberto as boolean, motivo: x.motivo as string | null }])),
    reservas: (r.data ?? []).map((x) => ({ ...x, total: Number(x.total), sinal: Number(x.sinal) })),
  };
}

export async function GET(req: Request) {
  try {
    return NextResponse.json(await carregar(await exigirAdmin(req)), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return erro(e);
  }
}

// Fechar, abrir ou voltar ao padrão vários dias. Dias passados e dias com reserva ativa são mantidos.
async function dias(db: Db, b: Corpo, hoje: string) {
  const datas = Array.isArray(b.datas) ? [...new Set(b.datas.filter(dataOk))].sort() : [];
  if (!datas.length || datas.length > 400) throw invalido('Escolha de 1 a 400 dias.');
  if (b.modo !== 'abrir' && b.modo !== 'fechar' && b.modo !== 'padrao') throw invalido('Ação inválida.');
  const agora = new Date().toISOString();
  const { data: rs, error } = await db
    .from('agenda_reservas')
    .select('entrada, saida')
    .gte('saida', datas[0])
    .lte('entrada', datas[datas.length - 1])
    .or(`status.eq.confirmada,and(status.eq.aguardando_sinal,segura_ate.gt.${agora})`);
  if (error) throw error;
  const validos = datas.filter((d) => d >= hoje && !(rs ?? []).some((r) => d >= r.entrada && d <= r.saida));
  if (validos.length) {
    const r =
      b.modo === 'padrao'
        ? await db.from('agenda_dias').delete().in('data', validos)
        : await db.from('agenda_dias').upsert(validos.map((data) => ({ data, aberto: b.modo === 'abrir', motivo: b.modo === 'fechar' ? str(b.motivo, 80) || null : null })));
    if (r.error) throw r.error;
  }
  return { alterados: validos.length, ignorados: datas.length - validos.length };
}

const CAMPOS: Record<string, [string, number, number]> = {
  base: ['base', 0, 1e6],
  minDias: ['min_dias', 1, 30],
  extra: ['extra', 0, 1e6],
  sinalPct: ['sinal_pct', 0, 100],
  holdHoras: ['hold_horas', 1, 720],
  capacidade: ['capacidade', 1, 2000],
  maxDias: ['max_dias', 1, 60],
};
async function cfg(db: Db, b: Corpo) {
  const u: Record<string, unknown> = {};
  for (const [k, [col, min, max]] of Object.entries(CAMPOS)) {
    if (!(k in b)) continue;
    const n = num(b[k], min, max);
    if (n === null) throw invalido(`Valor inválido em "${k}".`);
    u[col] = n;
  }
  if ('diasPadrao' in b) {
    const a = b.diasPadrao;
    if (!Array.isArray(a) || !a.every((x) => Number.isInteger(x) && x >= 0 && x <= 6)) throw invalido('Dias da semana inválidos.');
    u.dias_padrao = [...new Set(a)];
  }
  if (!Object.keys(u).length) throw invalido('Nada para salvar.');
  const { error } = await db.from('agenda_config').update(u).eq('id', 1);
  if (error) throw error;
}

async function periodo(db: Db, b: Corpo) {
  const nome = str(b.nome, 60),
    preco = num(b.preco, 0, 1e7),
    id = b.id === undefined || b.id === null ? null : num(b.id, 1, 1e12);
  if (!nome) throw invalido('Dê um nome ao período.');
  if (!dataOk(b.entrada) || !dataOk(b.saida) || b.saida < b.entrada) throw invalido('Confira as datas: a saída não pode ser antes da entrada.');
  if (preco === null) throw invalido('Preço inválido.');
  let q = db.from('agenda_periodos').select('nome').lte('entrada', b.saida).gte('saida', b.entrada);
  if (id) q = q.neq('id', id);
  const { data: choque, error: e1 } = await q.limit(1);
  if (e1) throw e1;
  if (choque?.length) throw new HttpErro(409, `Este período se sobrepõe a “${choque[0].nome}”.`);
  const linha = { nome, entrada: b.entrada, saida: b.saida, preco, bloqueado: b.bloqueado === true };
  const { error } = id ? await db.from('agenda_periodos').update(linha).eq('id', id) : await db.from('agenda_periodos').insert(linha);
  if (error) throw error;
}

async function sugerir(db: Db, b: Corpo) {
  const ano = num(b.ano, 2025, 2100);
  if (ano === null || !Number.isInteger(ano)) throw invalido('Ano inválido.');
  const [c, p] = await Promise.all([db.from('agenda_config').select('*').eq('id', 1).single(), db.from('agenda_periodos').select('nome, entrada, saida')]);
  if (c.error) throw c.error;
  if (p.error) throw p.error;
  const novos = sugerirPeriodos(ano, cfgDeLinha(c.data)).filter((s) => !(p.data ?? []).some((e) => e.nome === s.nome || !(s.saida < e.entrada || s.entrada > e.saida)));
  if (novos.length) {
    const { error } = await db.from('agenda_periodos').insert(novos);
    if (error) throw error;
  }
  return { criados: novos.length };
}

async function statusReserva(db: Db, b: Corpo) {
  const id = num(b.id, 1, 1e12);
  if (id === null) throw invalido('Reserva inválida.');
  if (b.status !== 'confirmada' && b.status !== 'cancelada' && b.status !== 'aguardando_sinal') throw invalido('Status inválido.');
  let segura_ate: string | null = null;
  if (b.status === 'aguardando_sinal') {
    const { data, error } = await db.from('agenda_config').select('hold_horas').eq('id', 1).single();
    if (error) throw error;
    segura_ate = new Date(Date.now() + data.hold_horas * 3600e3).toISOString();
  }
  const { error } = await db.from('agenda_reservas').update({ status: b.status, segura_ate }).eq('id', id);
  if (error) throw error; // 23P01 = outra reserva ocupa essas datas
}

async function criarReserva(db: Db, b: Corpo, hoje: string) {
  if (!dataOk(b.entrada) || !dataOk(b.saida) || b.saida < b.entrada) throw invalido('Confira as datas.');
  if (b.entrada < hoje) throw invalido('A entrada não pode ser no passado.');
  const total = num(b.total, 0, 1e7);
  if (total === null) throw invalido('Valor total inválido.');
  const status = b.status === 'aguardando_sinal' ? 'aguardando_sinal' : 'confirmada';
  const { data: c, error: e1 } = await db.from('agenda_config').select('sinal_pct, hold_horas').eq('id', 1).single();
  if (e1) throw e1;
  const { error } = await db.from('agenda_reservas').insert({
    entrada: b.entrada,
    saida: b.saida,
    total,
    sinal: Math.round((total * c.sinal_pct) / 100),
    status,
    segura_ate: status === 'aguardando_sinal' ? new Date(Date.now() + c.hold_horas * 3600e3).toISOString() : null,
    nome: str(b.nome, 80) || '—',
    igreja: str(b.igreja, 80) || 'Reserva manual',
    whatsapp: str(b.whatsapp, 20) || '—',
    origem: 'manual',
  });
  if (error) throw error;
}

export async function POST(req: Request) {
  try {
    const db = await exigirAdmin(req);
    const b = (await req.json().catch(() => null)) as Corpo | null;
    if (!b || typeof b.acao !== 'string') throw invalido('Pedido inválido.');
    const hoje = hojeSP();
    switch (b.acao) {
      case 'dias':
        return ok(await dias(db, b, hoje));
      case 'cfg':
        await cfg(db, b);
        return ok();
      case 'periodo':
        await periodo(db, b);
        return ok();
      case 'periodo.remover': {
        const id = num(b.id, 1, 1e12);
        if (id === null) throw invalido('Período inválido.');
        const { error } = await db.from('agenda_periodos').delete().eq('id', id);
        if (error) throw error;
        return ok();
      }
      case 'sugerir':
        return ok(await sugerir(db, b));
      case 'reserva.status':
        await statusReserva(db, b);
        return ok();
      case 'reserva.criar':
        await criarReserva(db, b, hoje);
        return ok();
      default:
        throw invalido('Ação desconhecida.');
    }
  } catch (e) {
    return erro(e);
  }
}
