import { db } from '@/lib/db';
import { hojeSP } from '@/lib/agenda-server';
import { notificar } from '@/lib/notificar';
import {
  avisoReservaChegada,
  avisoReservaExpirada,
  avisoReservaSaldo,
  avisoReservaVencendo,
  avisoVisitaProxima,
  avisoVisitaSemResposta,
  avisoVisitasBaixa,
  avisoVisitasHoje,
  dentroDaJanelaDeAvisos,
  type DadosReserva,
  type DadosVisita,
} from '@/lib/notificacoes';
import { agoraSP } from '@/lib/visitas';

const COLUNAS_RESERVA = 'id, nome, igreja, whatsapp, entrada, saida, total, sinal, pago, segura_ate';
const COLUNAS_VISITA = 'id, nome, igreja, whatsapp, data, hora';

async function tarefa(nome: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    console.error(`agendador (${nome}):`, e);
  }
}

// Uma volta do agendador: confere o que precisa de lembrete e avisa (cada aviso tem uma chave única,
// então rodar várias vezes nunca repete). Lembretes só saem entre 7h e 21h.
export async function rodar() {
  const p = db();
  const agora = agoraSP();
  const hoje = hojeSP();
  const naJanela = dentroDaJanelaDeAvisos(agora.min);

  // Pedidos sem sinal cujo prazo acabou: marca como vencidos (a qualquer hora)
  await tarefa('vencer', async () => {
    await p.query("update agenda_reservas set status = 'expirada' where status = 'aguardando_sinal' and segura_ate is not null and segura_ate < now()");
  });

  if (naJanela) {
    await tarefa('expirada', async () => {
      const r = await p.query(
        `select ${COLUNAS_RESERVA} from agenda_reservas r
          where status = 'expirada' and segura_ate > now() - interval '3 days'
            and not exists (select 1 from agenda_notificacoes n where n.chave = 'reserva:' || r.id || ':expirada')`
      );
      for (const d of r.rows as DadosReserva[]) await notificar(avisoReservaExpirada(d));
    });

    await tarefa('vencendo', async () => {
      const r = await p.query(
        `select ${COLUNAS_RESERVA}, extract(epoch from (segura_ate - now())) * 1000 as falta_ms
           from agenda_reservas where status = 'aguardando_sinal' and segura_ate > now() and segura_ate <= now() + interval '6 hours'`
      );
      for (const d of r.rows as (DadosReserva & { falta_ms: number })[]) {
        const falta = Number(d.falta_ms);
        await notificar(avisoReservaVencendo(d, falta, falta <= 3600e3 ? '1h' : '6h'));
      }
    });

    await tarefa('visita sem resposta', async () => {
      const r = await p.query(
        `select ${COLUNAS_VISITA}, extract(epoch from (now() - criada_em)) * 1000 as desde_ms
           from agenda_visitas where status = 'pedida' and criada_em < now() - interval '3 hours' and (data is null or data >= $1::date)`,
        [hoje]
      );
      for (const d of r.rows as (DadosVisita & { desde_ms: number })[]) await notificar(avisoVisitaSemResposta(d, Number(d.desde_ms)));
    });

    await tarefa('saldo', async () => {
      const r = await p.query(
        `select ${COLUNAS_RESERVA}, (entrada - $1::date) as dias from agenda_reservas
          where status = 'confirmada' and pago < total and entrada >= $1::date and entrada <= $1::date + 15`,
        [hoje]
      );
      for (const d of r.rows as (DadosReserva & { dias: number })[]) await notificar(avisoReservaSaldo(d, d.dias, d.dias <= 3 ? '3d' : '15d'));
    });

    await tarefa('chegada', async () => {
      const r = await p.query(`select ${COLUNAS_RESERVA} from agenda_reservas where status = 'confirmada' and entrada = $1::date + 1`, [hoje]);
      for (const d of r.rows as DadosReserva[]) await notificar(avisoReservaChegada(d));
    });

    if (agora.min >= 8 * 60) {
      await tarefa('visitas de hoje', async () => {
        const r = await p.query(`select ${COLUNAS_VISITA} from agenda_visitas where status = 'agendada' and data = $1::date and hora is not null order by hora`, [hoje]);
        if (r.rowCount) await notificar(avisoVisitasHoje(r.rows as DadosVisita[], hoje));
      });
    }

    if (agora.min >= 9 * 60) {
      await tarefa('dar baixa', async () => {
        const r = await p.query("select count(*) as n from agenda_visitas where status in ('pedida', 'agendada') and data < $1::date", [hoje]);
        const n = Number(r.rows[0].n);
        if (n > 0) await notificar(avisoVisitasBaixa(n, hoje));
      });
    }
  }

  // Visita daqui a menos de 1 hora (sem janela: já é em cima da hora)
  await tarefa('visita em 1 hora', async () => {
    const r = await p.query(
      `select ${COLUNAS_VISITA} from agenda_visitas
        where status = 'agendada' and data is not null and hora is not null
          and ((data + hora::time) at time zone 'America/Sao_Paulo') between now() and now() + interval '60 minutes'`
    );
    for (const d of r.rows as DadosVisita[]) await notificar(avisoVisitaProxima(d));
  });

  // Limpeza: histórico com mais de 180 dias (por volta das 3h)
  if (agora.min >= 180 && agora.min < 185) {
    await tarefa('limpeza', async () => {
      await p.query("delete from agenda_notificacoes where criada_em < now() - interval '180 days'");
    });
  }
}

const g = globalThis as unknown as { _agendador?: ReturnType<typeof setInterval> };

// Liga o agendador (uma vez por servidor): confere a cada minuto.
export function iniciarAgendador() {
  if (g._agendador) return;
  const volta = () => void rodar().catch((e) => console.error('agendador:', e));
  g._agendador = setInterval(volta, 60_000);
  g._agendador.unref?.();
  setTimeout(volta, 15_000).unref?.();
}
