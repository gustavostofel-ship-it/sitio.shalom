import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { confereSenha, hashSenha } from '@/lib/senha.mjs';
import { iniciarSessao } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Hash falso: gasta o mesmo tempo quando o e-mail não existe, para não revelar quem é administrador.
const FALSO = hashSenha('senha-que-ninguem-usa');
// Freio contra tentativa de adivinhar a senha: 8 erros por IP a cada 15 minutos.
const falhas = new Map<string, { n: number; ate: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const agora = Date.now();
  const f = falhas.get(ip);
  if (f && f.ate > agora && f.n >= 8) return NextResponse.json({ erro: 'Muitas tentativas. Espere alguns minutos.' }, { status: 429 });
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120);
    const senha = String(b.senha ?? '').slice(0, 200);
    const r = await db().query('select senha_hash from agenda_admins where email = $1', [email]);
    const certa = confereSenha(senha, r.rows[0]?.senha_hash ?? FALSO);
    if (!r.rowCount || !certa) {
      falhas.set(ip, { n: f && f.ate > agora ? f.n + 1 : 1, ate: f && f.ate > agora ? f.ate : agora + 15 * 60e3 });
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 401 });
    }
    falhas.delete(ip);
    const res = NextResponse.json({ ok: true });
    iniciarSessao(res, req, email);
    return res;
  } catch (e) {
    console.error('login:', e);
    return NextResponse.json({ erro: 'Não foi possível entrar agora.' }, { status: 503 });
  }
}
