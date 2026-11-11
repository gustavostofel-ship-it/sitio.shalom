import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contextoVisitas } from '@/lib/visitas-server';
import { diasComHorarios } from '@/lib/visitas';
import { lembrar } from '@/lib/cache-curto';
import { ipDoPedido } from '@/lib/ip';
import { dentroDoLimite } from '@/lib/limite';

export const dynamic = 'force-dynamic';

async function montar() {
  const { cfg, ctx } = await contextoVisitas(db());
  const dias = diasComHorarios(cfg, ctx)
    .map((d) => ({ data: d.data, horas: d.horas.filter((h) => h.livre).map((h) => h.hora) }))
    .filter((d) => d.horas.length);
  return { dias, duracaoMin: cfg.duracaoMin };
}

// Dias e horários livres para visita, para o formulário da página de vendas. Não devolve dado pessoal.
// Guardado por 5 s em memória (limpo a cada alteração) e com limite por origem.
export async function GET(req: Request) {
  if (!dentroDoLimite('horarios:' + ipDoPedido(req), 120, 60e3)) return NextResponse.json({ erro: 'Muitas consultas. Espere um pouco.' }, { status: 429 });
  try {
    return NextResponse.json(await lembrar('horarios', 5000, montar), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('visitas/horarios:', e);
    return NextResponse.json({ erro: 'indisponivel' }, { status: 503 });
  }
}
