import { createClient } from '@supabase/supabase-js';
import type { AgendaData } from '@/lib/agenda';

// Só no servidor: usa a chave service_role, que nunca vai para o navegador.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase não configurado');
  return createClient(url, key, { auth: { persistSession: false } });
}

export const hojeSP = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

export async function carregarAgenda(): Promise<AgendaData> {
  const db = supabaseAdmin();
  const hoje = hojeSP();
  const agora = new Date().toISOString();
  const [c, p, d, r] = await Promise.all([
    db.from('agenda_config').select('*').eq('id', 1).single(),
    db.from('agenda_periodos').select('nome, entrada, saida, preco, bloqueado').gte('saida', hoje).order('entrada'),
    db.from('agenda_dias').select('data, aberto').gte('data', hoje),
    db
      .from('agenda_reservas')
      .select('entrada, saida')
      .gte('saida', hoje)
      .or(`status.eq.confirmada,and(status.eq.aguardando_sinal,segura_ate.gt.${agora})`),
  ]);
  for (const x of [c, p, d, r]) if (x.error) throw new Error(x.error.message);
  const cfg = c.data!;
  return {
    hoje,
    cfg: {
      base: Number(cfg.base),
      minDias: cfg.min_dias,
      extra: Number(cfg.extra),
      sinalPct: cfg.sinal_pct,
      holdHoras: cfg.hold_horas,
      capacidade: cfg.capacidade,
      maxDias: cfg.max_dias,
      diasPadrao: cfg.dias_padrao,
    },
    periodos: (p.data ?? []).map((x) => ({ ...x, preco: Number(x.preco) })),
    dias: Object.fromEntries((d.data ?? []).map((x) => [x.data as string, x.aberto as boolean])),
    ocupadas: r.data ?? [],
  };
}
