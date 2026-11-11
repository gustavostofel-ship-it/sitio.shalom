import { NextResponse } from 'next/server';
import { cotar, dia, brl, dataReal } from '@/lib/agenda';
import { lerJson } from '@/lib/corpo';
import { limparCache } from '@/lib/cache-curto';
import { fichaValida } from '@/lib/token-form';
import { segredo } from '@/lib/admin-auth';
import { carregarAgenda } from '@/lib/agenda-server';
import { db } from '@/lib/db';
import { avisar } from '@/lib/aviso';
import { notificar } from '@/lib/notificar';
import { avisoReservaNova } from '@/lib/notificacoes';
import { ipDoPedido, resumoIp } from '@/lib/ip';
import { dentroDoLimite } from '@/lib/limite';
import { whatsappNormalizado } from '@/lib/telefone';
import { TERMOS_VERSAO } from '@/lib/site-data';

export const dynamic = 'force-dynamic';

// Limites contra pedidos falsos (cada pedido segura as datas sem pagamento):
// por origem (IP), por WhatsApp e no total de pedidos do site aguardando sinal.
const POR_IP = Number(process.env.LIMITE_RESERVAS_IP ?? 3);
const NO_TOTAL = Number(process.env.LIMITE_RESERVAS_ABERTAS ?? 12);

const PUBLICOS = ['Até 50 pessoas', '50 a 100 pessoas', '100 a 150 pessoas'];
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const falha = (erro: string, status: number) => NextResponse.json({ erro }, { status });

export async function POST(req: Request) {
  const b = await lerJson(req);
  if (!b) return falha('Pedido inválido.', 400);
  // Campo escondido que gente de verdade não vê e robô preenche, e tempo mínimo no formulário.
  if (txt(b.site, 200) || !fichaValida(b.tk, segredo())) return falha('Não foi possível enviar. Atualize a página e tente de novo.', 400);
  const ip = ipDoPedido(req);
  if (!dentroDoLimite('reservar:' + ip, 8, 10 * 60e3)) return falha('Muitas tentativas. Espere alguns minutos ou fale com a gente pelo WhatsApp.', 429);

  const entrada = txt(b.entrada, 10),
    saida = txt(b.saida, 10),
    nome = txt(b.nome, 80),
    igreja = txt(b.igreja, 80),
    whats = whatsappNormalizado(txt(b.whatsapp, 25)),
    publico = PUBLICOS.includes(String(b.publico)) ? String(b.publico) : null;
  if (!dataReal(entrada) || !dataReal(saida)) return falha('Pedido inválido.', 400);
  if (nome.length < 2) return falha('Informe seu nome.', 422);
  if (!whats) return falha('Informe um WhatsApp de celular válido, com DDD.', 422);
  if (b.aceite !== true) return falha('Para reservar, aceite a Política de Privacidade e os Termos de reserva.', 422);

  try {
    const pool = db();
    const origem = resumoIp(ip);
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
      const deste = await cli.query("select count(*) as n from agenda_reservas where ip_hash = $1 and status = 'aguardando_sinal' and segura_ate > now()", [origem]);
      const total = await cli.query("select count(*) as n from agenda_reservas where origem = 'site' and status = 'aguardando_sinal' and segura_ate > now()");
      if (deste.rows[0].n >= POR_IP || total.rows[0].n >= NO_TOTAL) {
        await cli.query('rollback');
        return falha('Há muitos pedidos aguardando confirmação. Fale com a gente pelo WhatsApp para garantir a sua data.', 429);
      }
      const r = await cli.query(
        'insert into agenda_reservas (entrada, saida, total, sinal, segura_ate, nome, igreja, whatsapp, publico, ip_hash, aceite_em, aceite_versao) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),$11) returning id',
        [entrada, saida, c.total, c.sinal, seguraAte, nome, igreja || null, whats, publico, origem, TERMOS_VERSAO]
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
    await notificar(avisoReservaNova({ id, nome, igreja: igreja || null, whatsapp: whats, entrada, saida, total: c.total, sinal: c.sinal, pago: 0, segura_ate: seguraAte.toISOString() }));
    await avisar(
      `🔔 Nova reserva aguardando sinal (nº ${id})\n${igreja || 'Sem igreja'} · ${nome}\nWhatsApp: ${whats}\n${dia(entrada)} a ${dia(saida)} · ${brl(c.total)} (sinal ${brl(c.sinal)})`
    );
    limparCache();
    return NextResponse.json({ id, total: c.total, sinal: c.sinal, seguraAte: seguraAte.toISOString() });
  } catch (e) {
    console.error('reservar:', e);
    return falha('Não foi possível registrar agora. Fale com a gente pelo WhatsApp.', 503);
  }
}
