import { NextResponse } from 'next/server';
import { COOKIE, lerCookie, lerSessao } from '@/lib/sessao';
import { segredo } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sair de verdade: além de apagar o cookie, sobe a "versão" da sessão no banco, então um cookie
// copiado antes do "sair" também deixa de funcionar.
export async function POST(req: Request) {
  try {
    const s = lerSessao(lerCookie(req.headers.get('cookie'), COOKIE), segredo());
    if (s) await db().query('update agenda_admins set sessao_versao = sessao_versao + 1 where email = $1 and sessao_versao = $2', [s.email, s.versao]);
  } catch (e) {
    console.error('logout:', e);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
