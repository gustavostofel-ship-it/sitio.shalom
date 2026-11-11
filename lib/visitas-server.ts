import type { Pool, PoolClient } from 'pg';
import { SEGURA_SQL, hojeSP } from '@/lib/agenda-server';
import { agoraSP, type Contexto, type VisitaCfg } from '@/lib/visitas';

type Consulta = Pool | PoolClient;

// Linha da tabela agenda_visita_config -> VisitaCfg
export const cfgDeLinhaVisita = (c: Record<string, any>): VisitaCfg => ({
  diasSemana: c.dias_semana,
  horaIni: c.hora_ini,
  horaFim: c.hora_fim,
  duracaoMin: c.duracao_min,
  antecedenciaH: c.antecedencia_h,
  horizonteDias: c.horizonte_dias,
  horariosPorDia: c.horarios_por_dia ?? {},
});

// Tudo o que a agenda de visitas precisa saber: regras, dias fechados, horários já usados e dias em que o sítio está alugado.
export async function contextoVisitas(p: Consulta): Promise<{ cfg: VisitaCfg; ctx: Contexto }> {
  const hoje = hojeSP();
  const [c, bl, oc, rs, hf] = await Promise.all([
    p.query('select * from agenda_visita_config where id = 1'),
    p.query('select data from agenda_visita_bloqueios where data >= $1', [hoje]),
    p.query("select data, hora from agenda_visitas where data >= $1 and hora is not null and status in ('pedida', 'agendada')", [hoje]),
    p.query(`select entrada, saida from agenda_reservas where saida >= $1 and ${SEGURA_SQL}`, [hoje]),
    p.query('select data, hora from agenda_visita_horas_fechadas where data >= $1', [hoje]),
  ]);
  const reservas: { entrada: string; saida: string }[] = rs.rows;
  return {
    cfg: cfgDeLinhaVisita(c.rows[0]),
    ctx: {
      agora: agoraSP(),
      bloqueios: new Set(bl.rows.map((x) => x.data as string)),
      ocupados: new Set(oc.rows.map((x) => `${x.data}|${x.hora}`)),
      horasFechadas: new Set(hf.rows.map((x) => `${x.data}|${x.hora}`)),
      emReserva: (d) => reservas.some((r) => d >= r.entrada && d <= r.saida),
    },
  };
}
