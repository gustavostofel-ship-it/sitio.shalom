import { db } from '@/lib/db';
import type { NextResponse } from 'next/server';
import { COOKIE, DURACAO, assinar, lerCookie, verificar } from '@/lib/sessao';

export class HttpErro extends Error {
  constructor(
    public status: number,
    mensagem: string
  ) {
    super(mensagem);
  }
}

export function segredo() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET ausente ou com menos de 32 caracteres.');
  return s;
}

// Só entra no painel quem tem sessão válida (cookie assinado) E continua na tabela agenda_admins.
export async function exigirAdmin(req: Request) {
  const email = verificar(lerCookie(req.headers.get('cookie'), COOKIE), segredo());
  if (!email) throw new HttpErro(401, 'Faça login para continuar.');
  const pool = db();
  const r = await pool.query('select 1 from agenda_admins where email = $1', [email]);
  // Acesso removido (ou cookie antigo): a sessão deixa de valer e o painel volta para a tela de login.
  if (!r.rowCount) throw new HttpErro(401, 'Este acesso não vale mais. Entre de novo.');
  return { pool, email };
}

export const https = (req: Request) => new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

// Grava o login num cookie seguro (HttpOnly) na resposta.
export function iniciarSessao(res: NextResponse, req: Request, email: string) {
  res.cookies.set(COOKIE, assinar(email, segredo()), { httpOnly: true, sameSite: 'strict', path: '/', maxAge: DURACAO, secure: https(req) });
}
