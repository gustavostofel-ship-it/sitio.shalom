import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contextoVisitas } from '@/lib/visitas-server';
import { diasComHorarios } from '@/lib/visitas';

export const dynamic = 'force-dynamic';

// Dias e horários livres para visita, para o formulário da página de vendas. Não devolve dado pessoal.
export async function GET() {
  try {
    const { cfg, ctx } = await contextoVisitas(db());
    const dias = diasComHorarios(cfg, ctx)
      .map((d) => ({ data: d.data, horas: d.horas.filter((h) => h.livre).map((h) => h.hora) }))
      .filter((d) => d.horas.length);
    return NextResponse.json({ dias, duracaoMin: cfg.duracaoMin }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('visitas/horarios:', e);
    return NextResponse.json({ erro: 'indisponivel' }, { status: 503 });
  }
}
