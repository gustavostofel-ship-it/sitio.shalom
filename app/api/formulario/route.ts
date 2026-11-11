import { NextResponse } from 'next/server';
import { segredo } from '@/lib/admin-auth';
import { emitirFicha } from '@/lib/token-form';
import { ipDoPedido } from '@/lib/ip';
import { dentroDoLimite } from '@/lib/limite';

export const dynamic = 'force-dynamic';

// Entrega a ficha assinada que o formulário envia junto do pedido (anti-robô).
export async function GET(req: Request) {
  if (!dentroDoLimite('ficha:' + ipDoPedido(req), 60, 10 * 60e3)) return NextResponse.json({ erro: 'Muitas tentativas.' }, { status: 429 });
  try {
    return NextResponse.json({ ficha: emitirFicha(segredo()) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ erro: 'Indisponível.' }, { status: 503 });
  }
}
