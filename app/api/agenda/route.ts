import { NextResponse } from 'next/server';
import { carregarAgenda } from '@/lib/agenda-server';

export const dynamic = 'force-dynamic';

// Datas e regras para o calendário da página de vendas. Não devolve dados pessoais.
export async function GET() {
  try {
    return NextResponse.json(await carregarAgenda(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('agenda:', e);
    return NextResponse.json({ erro: 'indisponivel' }, { status: 503 });
  }
}
