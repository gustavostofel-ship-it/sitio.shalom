import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lerJson } from '@/lib/corpo';
import { limparCache } from '@/lib/cache-curto';
import { fichaValida } from '@/lib/token-form';
import { segredo } from '@/lib/admin-auth';
import { vencerVisitas } from '@/lib/agendador';
import { dataReal } from '@/lib/agenda';
import { hojeSP } from '@/lib/agenda-server';
import { avisar } from '@/lib/aviso';
import { notificar } from '@/lib/notificar';
import { avisoVisitaNova } from '@/lib/notificacoes';
import { ipDoPedido, resumoIp } from '@/lib/ip';
import { dentroDoLimite } from '@/lib/limite';
import { whatsappNormalizado } from '@/lib/telefone';
import { TERMOS_VERSAO } from '@/lib/site-data';
import { contextoVisitas } from '@/lib/visitas-server';
import { dataBr, horaValida, horarioDisponivel } from '@/lib/visitas';

export const dynamic = 'force-dynamic';

const PUBLICOS = ['Até 50 pessoas', '50 a 100 pessoas', '100 a 150 pessoas'];
const FORMATOS = ['Fim de Semana Fechado (Sexta a Domingo)', 'Dia Específico / Day Use (A negociar)', 'Feriado Prolongado / Outro período'];
const POR_IP = Number(process.env.LIMITE_VISITAS_IP ?? 3);
const NO_TOTAL = Number(process.env.LIMITE_VISITAS_ABERTAS ?? 30);
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const falha = (erro: string, status: number) => NextResponse.json({ erro }, { status });

// Pedido de visita feito pela página de vendas. Fica "aguardando confirmação" até o sítio confirmar pelo WhatsApp.
export async function POST(req: Request) {
  const b = await lerJson(req);
  if (!b) return falha('Pedido inválido.', 400);
  // Mesmas proteções do pedido de reserva: campo escondido, tempo mínimo e limite por origem.
  if (txt(b.site, 200) || !fichaValida(b.tk, segredo())) return falha('Não foi possível enviar. Atualize a página e tente de novo.', 400);
  const ip = ipDoPedido(req);
  if (!dentroDoLimite('visita:' + ip, 8, 10 * 60e3)) return falha('Muitas tentativas. Espere alguns minutos ou fale com a gente pelo WhatsApp.', 429);

  const nome = txt(b.nome, 80),
    igreja = txt(b.igreja, 80),
    obs = txt(b.obs, 500),
    whats = whatsappNormalizado(txt(b.whatsapp, 25)),
    publico = PUBLICOS.includes(String(b.publico)) ? String(b.publico) : null,
    formato = FORMATOS.includes(String(b.formato)) ? String(b.formato) : null,
    data = txt(b.data, 10),
    hora = txt(b.hora, 5);
  if (nome.length < 2) return falha('Informe seu nome.', 422);
  if (!whats) return falha('Informe um WhatsApp de celular válido, com DDD.', 422);
  if (b.aceite !== true) return falha('Para enviar, aceite a Política de Privacidade e os Termos.', 422);
  if (!!data !== !!hora) return falha('Escolha o dia e o horário, ou deixe os dois em branco para combinarmos.', 422);
  if (data && (!dataReal(data) || !horaValida(hora))) return falha('Horário inválido.', 422);

  try {
    const pool = db();
    const origem = resumoIp(ip);
    if (data) {
      const { cfg, ctx } = await contextoVisitas(pool);
      if (!horarioDisponivel(cfg, ctx, data, hora)) return falha('Esse horário não está mais disponível. Escolha outro.', 409);
    }
    await vencerVisitas(pool, hojeSP()); // pedidos velhos saem da fila antes de contar
    const abertos = await pool.query("select count(*) as n from agenda_visitas where whatsapp = $1 and status in ('pedida','agendada') and (data is null or data >= $2)", [whats, hojeSP()]);
    if (abertos.rows[0].n >= 2) return falha('Você já tem visitas aguardando. Fale com a gente pelo WhatsApp para mudar ou marcar outra.', 429);
    const deste = await pool.query("select count(*) as n from agenda_visitas where ip_hash = $1 and status = 'pedida' and criada_em > now() - interval '24 hours'", [origem]);
    const total = await pool.query("select count(*) as n from agenda_visitas where origem = 'site' and status = 'pedida'");
    if (deste.rows[0].n >= POR_IP || total.rows[0].n >= NO_TOTAL) return falha('Há muitos pedidos de visita aguardando. Fale com a gente pelo WhatsApp.', 429);

    let id: number;
    try {
      const r = await pool.query(
        'insert into agenda_visitas (nome, igreja, whatsapp, publico, formato, obs, data, hora, ip_hash, aceite_em, aceite_versao) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10) returning id',
        [nome, igreja || null, whats, publico, formato, obs || null, data || null, hora || null, origem, TERMOS_VERSAO]
      );
      id = r.rows[0].id;
    } catch (e) {
      // 23505: outra pessoa pegou o mesmo horário no mesmo instante (o banco só deixa uma visita por horário)
      if ((e as { code?: string }).code === '23505') return falha('Esse horário acabou de ser escolhido por outra pessoa. Escolha outro.', 409);
      throw e;
    }
    await notificar(avisoVisitaNova({ id, nome, igreja: igreja || null, whatsapp: whats, data: data || null, hora: hora || null }));
    await avisar(`📅 Novo pedido de visita (nº ${id})\n${igreja || 'Sem igreja'} · ${nome}\nWhatsApp: ${whats}\n${data ? `${dataBr(data)} às ${hora}` : 'Horário a combinar'}`);
    limparCache();
    return NextResponse.json({ id, data: data || null, hora: hora || null });
  } catch (e) {
    console.error('visitas:', e);
    return falha('Não foi possível registrar agora. Fale com a gente pelo WhatsApp.', 503);
  }
}
