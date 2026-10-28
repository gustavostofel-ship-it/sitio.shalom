import { NextResponse } from 'next/server';
import { cotar, dia, brl } from '@/lib/agenda';
import { carregarAgenda } from '@/lib/agenda-server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PUBLICOS = ['Até 50 pessoas', '50 a 100 pessoas', '100 a 150 pessoas'];
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const falha = (erro: string, status: number) => NextResponse.json({ erro }, { status });

// Aviso opcional no Telegram (só se TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID existirem).
async function avisar(texto: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN,
    chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: texto }),
    });
  } catch (e) {
    console.error('telegram:', e);
  }
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return falha('Pedido inválido.', 400);
  }
  const entrada = txt(b.entrada, 10),
    saida = txt(b.saida, 10),
    nome = txt(b.nome, 80),
    igreja = txt(b.igreja, 80),
    whats = txt(b.whatsapp, 20).replace(/\D/g, ''),
    publico = PUBLICOS.includes(String(b.publico)) ? String(b.publico) : null;
  if (!DATA.test(entrada) || !DATA.test(saida)) return falha('Pedido inválido.', 400);
  if (nome.length < 2) return falha('Informe seu nome.', 422);
  if (whats.length < 10 || whats.length > 13) return falha('Informe um WhatsApp válido, com DDD.', 422);

  try {
    const pool = db();
    const agenda = await carregarAgenda();
    // O servidor recalcula tudo: o valor e a disponibilidade que vêm do navegador não valem.
    const c = cotar(entrada, saida, agenda);
    if (!c.ok) return falha(c.erro, 422);

    // Um pedido por vez na hora de gravar: sem isso, pedidos simultâneos para a mesma data
    // derrubam uns aos outros com erro de impasse (deadlock) em vez de uma resposta clara.
    const seguraAte = new Date(Date.now() + agenda.cfg.holdHoras * 3600e3);
    let id: number;
    const cli = await pool.connect();
    try {
      await cli.query('begin');
      await cli.query('select pg_advisory_xact_lock(7001)');
      // Solta datas seguradas que venceram e limita pedidos abertos por WhatsApp.
      await cli.query("update agenda_reservas set status = 'expirada' where status = 'aguardando_sinal' and segura_ate < now()");
      const abertos = await cli.query("select count(*) as n from agenda_reservas where whatsapp = $1 and status = 'aguardando_sinal'", [whats]);
      if (abertos.rows[0].n >= 2) {
        await cli.query('rollback');
        return falha('Você já tem pedidos aguardando confirmação. Fale com a gente pelo WhatsApp.', 429);
      }
      const r = await cli.query(
        'insert into agenda_reservas (entrada, saida, total, sinal, segura_ate, nome, igreja, whatsapp, publico) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id',
        [entrada, saida, c.total, c.sinal, seguraAte, nome, igreja || null, whats, publico]
      );
      await cli.query('commit');
      id = r.rows[0].id;
    } catch (e) {
      await cli.query('rollback').catch(() => {});
      // 23P01: o banco impede duas reservas ativas no mesmo dia.
      if ((e as { code?: string }).code === '23P01') return falha('Essa data acabou de ser reservada por outra pessoa. Escolha outra.', 409);
      throw e;
    } finally {
      cli.release();
    }
    await avisar(
      `🔔 Nova reserva aguardando sinal (nº ${id})\n${igreja || 'Sem igreja'} · ${nome}\nWhatsApp: ${whats}\n${dia(entrada)} a ${dia(saida)} · ${brl(c.total)} (sinal ${brl(c.sinal)})`
    );
    return NextResponse.json({ id, total: c.total, sinal: c.sinal, seguraAte: seguraAte.toISOString() });
  } catch (e) {
    console.error('reservar:', e);
    return falha('Não foi possível registrar agora. Fale com a gente pelo WhatsApp.', 503);
  }
}
