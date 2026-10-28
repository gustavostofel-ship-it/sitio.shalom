import { db } from '@/lib/db';
import type { AgendaData, Cfg } from '@/lib/agenda';

export const hojeSP = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

// Reserva que segura datas agora: confirmada, ou aguardando sinal dentro do prazo.
export const SEGURA_SQL = "(status = 'confirmada' or (status = 'aguardando_sinal' and segura_ate > now()))";

// Linha da tabela agenda_config -> Cfg
export const cfgDeLinha = (c: Record<string, any>): Cfg => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
  base: Number(c.base),
  minDias: c.min_dias,
  extra: Number(c.extra),
  sinalPct: c.sinal_pct,
  holdHoras: c.hold_horas,
  capacidade: c.capacidade,
  maxDias: c.max_dias,
  diasPadrao: c.dias_padrao,
});

// Dados públicos do calendário. Não inclui nenhum dado pessoal.
export async function carregarAgenda(): Promise<AgendaData> {
  const p = db();
  const hoje = hojeSP();
  const [c, per, dias, rs] = await Promise.all([
    p.query('select * from agenda_config where id = 1'),
    p.query('select nome, entrada, saida, preco, bloqueado from agenda_periodos where saida >= $1 order by entrada', [hoje]),
    p.query('select data, aberto from agenda_dias where data >= $1', [hoje]),
    p.query(`select entrada, saida from agenda_reservas where saida >= $1 and ${SEGURA_SQL}`, [hoje]),
  ]);
  return {
    hoje,
    cfg: cfgDeLinha(c.rows[0]),
    periodos: per.rows,
    dias: Object.fromEntries(dias.rows.map((x) => [x.data as string, x.aberto as boolean])),
    ocupadas: rs.rows,
  };
}
