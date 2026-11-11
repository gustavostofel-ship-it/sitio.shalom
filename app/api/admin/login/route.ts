import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lerJson } from '@/lib/corpo';
import { confereSenha, hashSenha } from '@/lib/senha.mjs';
import { iniciarSessao } from '@/lib/admin-auth';
import { ipDoPedido } from '@/lib/ip';
import { contar, estourou, zerar } from '@/lib/limite';

export const dynamic = 'force-dynamic';

// Hash falso: gasta o mesmo tempo quando o e-mail não existe, para não revelar quem é administrador.
const FALSO = hashSenha('senha-que-ninguem-usa');
// Freio contra tentativa de adivinhar a senha: 8 erros por origem a cada 15 minutos,
// e 20 erros por e-mail (para quem muda de IP a cada tentativa).
const JANELA = 15 * 60e3;

export async function POST(req: Request) {
  const ip = ipDoPedido(req);
  const b = (await lerJson(req, 2048)) ?? {};
  const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120);
  const chaveIp = 'login:ip:' + ip;
  const chaveEmail = 'login:email:' + email;
  if (estourou(chaveIp, 8) || estourou(chaveEmail, 20)) return NextResponse.json({ erro: 'Muitas tentativas. Espere alguns minutos.' }, { status: 429 });
  try {
    const senha = String(b.senha ?? '').slice(0, 200);
    const r = await db().query('select senha_hash from agenda_admins where email = $1', [email]);
    const certa = confereSenha(senha, r.rows[0]?.senha_hash ?? FALSO);
    if (!r.rowCount || !certa) {
      contar(chaveIp, JANELA);
      contar(chaveEmail, JANELA);
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 401 });
    }
    zerar(chaveIp);
    zerar(chaveEmail);
    const res = NextResponse.json({ ok: true });
    await iniciarSessao(res, req, email);
    return res;
  } catch (e) {
    console.error('login:', e);
    return NextResponse.json({ erro: 'Não foi possível entrar agora.' }, { status: 503 });
  }
}
