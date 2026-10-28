import { NextResponse } from 'next/server';
import { cotar, dia, brl } from '@/lib/agenda';
import { carregarAgenda, supabaseAdmin } from '@/lib/agenda-server';

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
    const db = supabaseAdmin();
    const agenda = await carregarAgenda();
    // O servidor recalcula tudo: o valor e a disponibilidade que vêm do navegador não valem.
    const c = cotar(entrada, saida, agenda);
    if (!c.ok) return falha(c.erro, 422);

    // Solta datas seguradas que venceram e limita pedidos abertos por WhatsApp.
    await db.from('agenda_reservas').update({ status: 'expirada' }).eq('status', 'aguardando_sinal').lt('segura_ate', new Date().toISOString());
    const abertos = await db.from('agenda_reservas').select('id', { count: 'exact', head: true }).eq('whatsapp', whats).eq('status', 'aguardando_sinal');
    if ((abertos.count ?? 0) >= 2) return falha('Você já tem pedidos aguardando confirmação. Fale com a gente pelo WhatsApp.', 429);

    const seguraAte = new Date(Date.now() + agenda.cfg.holdHoras * 3600e3).toISOString();
    const { data, error } = await db
      .from('agenda_reservas')
      .insert({ entrada, saida, total: c.total, sinal: c.sinal, segura_ate: seguraAte, nome, igreja: igreja || null, whatsapp: whats, publico })
      .select('id')
      .single();
    if (error) {
      if (error.code === '23P01') return falha('Essa data acabou de ser reservada por outra pessoa. Escolha outra.', 409);
      throw error;
    }
    await avisar(
      `🔔 Nova reserva aguardando sinal (nº ${data.id})\n${igreja || 'Sem igreja'} · ${nome}\nWhatsApp: ${whats}\n${dia(entrada)} a ${dia(saida)} · ${brl(c.total)} (sinal ${brl(c.sinal)})`
    );
    return NextResponse.json({ id: data.id, total: c.total, sinal: c.sinal, seguraAte });
  } catch (e) {
    console.error('reservar:', e);
    return falha('Não foi possível registrar agora. Fale com a gente pelo WhatsApp.', 503);
  }
}
