import { NextResponse } from 'next/server';
import { carregarAgenda } from '@/lib/agenda-server';
import { lembrar } from '@/lib/cache-curto';
import { ipDoPedido } from '@/lib/ip';
import { dentroDoLimite } from '@/lib/limite';

export const dynamic = 'force-dynamic';

// Datas e regras para o calendário da página de vendas. Não devolve dados pessoais.
// Guardado por 5 s em memória (limpo a cada alteração) e com limite por origem: leitura pública barata.
export async function GET(req: Request) {
  if (!dentroDoLimite('agenda:' + ipDoPedido(req), 120, 60e3)) return NextResponse.json({ erro: 'Muitas consultas. Espere um pouco.' }, { status: 429 });
  try {
    const dados = await lembrar('agenda', 5000, carregarAgenda);
    return NextResponse.json(dados, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('agenda:', e);
    return NextResponse.json({ erro: 'indisponivel' }, { status: 503 });
  }
}
