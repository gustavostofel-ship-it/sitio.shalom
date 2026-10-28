import { NextResponse } from 'next/server';
import type { Pool } from 'pg';
import { exigirAdmin, HttpErro } from '@/lib/admin-auth';
import { hashSenha } from '@/lib/senha.mjs';
import { emailValido } from '@/lib/sessao';
import { SEGURA_SQL, cfgDeLinha, hojeSP } from '@/lib/agenda-server';
import { sugerirPeriodos, type AdminData } from '@/lib/agenda';

export const dynamic = 'force-dynamic';

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
  if (['23P01', '40P01'].includes((e as { code?: string })?.code ?? '')) return NextResponse.json({ erro: 'Outra reserva já ocupa essas datas.' }, { status: 409 });
  console.error('admin:', e);
  return NextResponse.json({ erro: 'Não foi possível concluir agora. Tente de novo.' }, { status: 500 });
}

async function carregar(p: Pool, eu: string): Promise<AdminData> {
  const [c, per, d, r, adm] = await Promise.all([
    p.query('select * from agenda_config where id = 1'),
    p.query('select id, nome, entrada, saida, preco, bloqueado from agenda_periodos order by entrada'),
    p.query('select data, aberto, motivo from agenda_dias'),
    p.query('select * from agenda_reservas order by entrada'),
    p.query('select email, criado_em from agenda_admins order by criado_em'),
  ]);
  return {
    hoje: hojeSP(),
    agora: new Date().toISOString(),
    cfg: cfgDeLinha(c.rows[0]),
    periodos: per.rows,
    dias: Object.fromEntries(d.rows.map((x) => [x.data as string, { aberto: x.aberto as boolean, motivo: x.motivo as string | null }])),
    reservas: r.rows,
    admins: adm.rows,
    eu,
  };
}

export async function GET(req: Request) {
  try {
    const { pool, email } = await exigirAdmin(req);
    return NextResponse.json(await carregar(pool, email), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return erro(e);
  }
}

// Fechar, abrir ou voltar ao padrão vários dias. Dias passados e dias com reserva ativa são mantidos.
async function dias(p: Pool, b: Corpo, hoje: string) {
  const datas = Array.isArray(b.datas) ? [...new Set(b.datas.filter(dataOk))].sort() : [];
  if (!datas.length || datas.length > 400) throw invalido('Escolha de 1 a 400 dias.');
  if (b.modo !== 'abrir' && b.modo !== 'fechar' && b.modo !== 'padrao') throw invalido('Ação inválida.');
  const rs = await p.query(`select entrada, saida from agenda_reservas where saida >= $1 and entrada <= $2 and ${SEGURA_SQL}`, [datas[0], datas[datas.length - 1]]);
  const validos = datas.filter((d) => d >= hoje && !rs.rows.some((r) => d >= r.entrada && d <= r.saida));
  if (validos.length) {
    if (b.modo === 'padrao') await p.query('delete from agenda_dias where data = any($1::date[])', [validos]);
    else
      await p.query(
        'insert into agenda_dias (data, aberto, motivo) select d, $2, $3 from unnest($1::date[]) as d on conflict (data) do update set aberto = excluded.aberto, motivo = excluded.motivo',
        [validos, b.modo === 'abrir', b.modo === 'fechar' ? str(b.motivo, 80) || null : null]
      );
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
async function cfg(p: Pool, b: Corpo) {
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
  const colunas = Object.keys(u); // só colunas da lista acima, nunca texto do usuário
  if (!colunas.length) throw invalido('Nada para salvar.');
  await p.query(`update agenda_config set ${colunas.map((c, i) => `${c} = $${i + 1}`).join(', ')} where id = 1`, Object.values(u));
}

async function periodo(p: Pool, b: Corpo) {
  const nome = str(b.nome, 60),
    preco = num(b.preco, 0, 1e7),
    id = b.id === undefined || b.id === null ? null : num(b.id, 1, 1e12);
  if (!nome) throw invalido('Dê um nome ao período.');
  if (!dataOk(b.entrada) || !dataOk(b.saida) || b.saida < b.entrada) throw invalido('Confira as datas: a saída não pode ser antes da entrada.');
  if (preco === null) throw invalido('Preço inválido.');
  const choque = await p.query('select nome from agenda_periodos where entrada <= $2 and saida >= $1 and ($3::bigint is null or id <> $3) limit 1', [b.entrada, b.saida, id]);
  if (choque.rowCount) throw new HttpErro(409, `Este período se sobrepõe a “${choque.rows[0].nome}”.`);
  const v = [nome, b.entrada, b.saida, preco, b.bloqueado === true];
  if (id) await p.query('update agenda_periodos set nome = $1, entrada = $2, saida = $3, preco = $4, bloqueado = $5 where id = $6', [...v, id]);
  else await p.query('insert into agenda_periodos (nome, entrada, saida, preco, bloqueado) values ($1,$2,$3,$4,$5)', v);
}

async function sugerir(p: Pool, b: Corpo, hoje: string) {
  const ano = num(b.ano, 2025, 2100);
  if (ano === null || !Number.isInteger(ano)) throw invalido('Ano inválido.');
  const [c, ex] = await Promise.all([p.query('select * from agenda_config where id = 1'), p.query('select nome, entrada, saida from agenda_periodos')]);
  const novos = sugerirPeriodos(ano, cfgDeLinha(c.rows[0])).filter((s) => s.saida >= hoje && !ex.rows.some((e) => e.nome === s.nome || !(s.saida < e.entrada || s.entrada > e.saida)));
  for (const n of novos) await p.query('insert into agenda_periodos (nome, entrada, saida, preco, bloqueado) values ($1,$2,$3,$4,$5)', [n.nome, n.entrada, n.saida, n.preco, n.bloqueado]);
  return { criados: novos.length };
}

async function statusReserva(p: Pool, b: Corpo) {
  const id = num(b.id, 1, 1e12);
  if (id === null) throw invalido('Reserva inválida.');
  if (b.status !== 'confirmada' && b.status !== 'cancelada' && b.status !== 'aguardando_sinal') throw invalido('Status inválido.');
  let segura: Date | null = null;
  if (b.status === 'aguardando_sinal') {
    const c = await p.query('select hold_horas from agenda_config where id = 1');
    segura = new Date(Date.now() + c.rows[0].hold_horas * 3600e3);
  }
  const r = await p.query('update agenda_reservas set status = $1, segura_ate = $2 where id = $3', [b.status, segura, id]);
  if (!r.rowCount) throw new HttpErro(404, 'Reserva não encontrada.');
}

async function criarReserva(p: Pool, b: Corpo, hoje: string) {
  if (!dataOk(b.entrada) || !dataOk(b.saida) || b.saida < b.entrada) throw invalido('Confira as datas.');
  if (b.entrada < hoje) throw invalido('A entrada não pode ser no passado.');
  const total = num(b.total, 0, 1e7);
  if (total === null) throw invalido('Valor total inválido.');
  const status = b.status === 'aguardando_sinal' ? 'aguardando_sinal' : 'confirmada';
  const c = (await p.query('select sinal_pct, hold_horas from agenda_config where id = 1')).rows[0];
  await p.query(
    "insert into agenda_reservas (entrada, saida, total, sinal, status, segura_ate, nome, igreja, whatsapp, origem) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'manual')",
    [
      b.entrada,
      b.saida,
      total,
      Math.round((total * c.sinal_pct) / 100),
      status,
      status === 'aguardando_sinal' ? new Date(Date.now() + c.hold_horas * 3600e3) : null,
      str(b.nome, 80) || '—',
      str(b.igreja, 80) || 'Reserva manual',
      str(b.whatsapp, 20) || '—',
    ]
  );
}

// ---------- Administradores ----------
const emailDe = (v: unknown) => String(v ?? '').trim().toLowerCase().slice(0, 120);
function senhaDe(v: unknown) {
  const s = String(v ?? '').slice(0, 200);
  if (s.length < 10) throw invalido('A senha precisa ter pelo menos 10 caracteres.');
  return s;
}

async function criarAdmin(p: Pool, b: Corpo) {
  const email = emailDe(b.email);
  if (!emailValido(email)) throw invalido('Informe um e-mail válido.');
  const r = await p.query('insert into agenda_admins (email, senha_hash) values ($1, $2) on conflict (email) do nothing', [email, hashSenha(senhaDe(b.senha))]);
  if (!r.rowCount) throw new HttpErro(409, 'Este e-mail já é administrador.');
}

async function trocarSenha(p: Pool, b: Corpo) {
  const r = await p.query('update agenda_admins set senha_hash = $1 where email = $2', [hashSenha(senhaDe(b.senha)), emailDe(b.email)]);
  if (!r.rowCount) throw new HttpErro(404, 'Administrador não encontrado.');
}

async function removerAdmin(p: Pool, b: Corpo, eu: string) {
  const email = emailDe(b.email);
  if (email === eu) throw invalido('Você não pode remover o seu próprio acesso.');
  const total = (await p.query('select count(*) as n from agenda_admins')).rows[0].n;
  if (total <= 1) throw invalido('Precisa sobrar pelo menos um administrador.');
  await p.query('delete from agenda_admins where email = $1', [email]);
}

export async function POST(req: Request) {
  try {
    const { pool: p, email: eu } = await exigirAdmin(req);
    const b = (await req.json().catch(() => null)) as Corpo | null;
    if (!b || typeof b.acao !== 'string') throw invalido('Pedido inválido.');
    const hoje = hojeSP();
    switch (b.acao) {
      case 'dias':
        return ok(await dias(p, b, hoje));
      case 'cfg':
        await cfg(p, b);
        return ok();
      case 'periodo':
        await periodo(p, b);
        return ok();
      case 'periodo.remover': {
        const id = num(b.id, 1, 1e12);
        if (id === null) throw invalido('Período inválido.');
        await p.query('delete from agenda_periodos where id = $1', [id]);
        return ok();
      }
      case 'sugerir':
        return ok(await sugerir(p, b, hoje));
      case 'reserva.status':
        await statusReserva(p, b);
        return ok();
      case 'reserva.criar':
        await criarReserva(p, b, hoje);
        return ok();
      case 'admin.criar':
        await criarAdmin(p, b);
        return ok();
      case 'admin.senha':
        await trocarSenha(p, b);
        return ok();
      case 'admin.remover':
        await removerAdmin(p, b, eu);
        return ok();
      default:
        throw invalido('Ação desconhecida.');
    }
  } catch (e) {
    return erro(e);
  }
}
