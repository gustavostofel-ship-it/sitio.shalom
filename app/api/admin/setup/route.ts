import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashSenha } from '@/lib/senha.mjs';
import { iniciarSessao } from '@/lib/admin-auth';
import { emailValido } from '@/lib/sessao';

export const dynamic = 'force-dynamic';

// O painel pergunta se ainda não existe nenhum administrador (primeiro acesso).
export async function GET() {
  try {
    const r = await db().query('select count(*) as n from agenda_admins');
    return NextResponse.json({ precisa: r.rows[0].n === 0 });
  } catch {
    return NextResponse.json({ precisa: false });
  }
}

// Cria o PRIMEIRO administrador. Só funciona enquanto a tabela está vazia: depois disso, é recusado.
export async function POST(req: Request) {
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = String(b.email ?? '').trim().toLowerCase().slice(0, 120);
    const senha = String(b.senha ?? '').slice(0, 200);
    if (!emailValido(email)) return NextResponse.json({ erro: 'Informe um e-mail válido.' }, { status: 400 });
    if (senha.length < 10) return NextResponse.json({ erro: 'A senha precisa ter pelo menos 10 caracteres.' }, { status: 400 });
    // Um único comando: só insere se não existir nenhum administrador (sem brecha de corrida).
    const r = await db().query('insert into agenda_admins (email, senha_hash) select $1, $2 where not exists (select 1 from agenda_admins)', [email, hashSenha(senha)]);
    if (!r.rowCount) return NextResponse.json({ erro: 'Já existe um administrador. Entre com o seu login.' }, { status: 403 });
    const res = NextResponse.json({ ok: true });
    iniciarSessao(res, req, email); // já entra logado
    return res;
  } catch (e) {
    console.error('setup:', e);
    return NextResponse.json({ erro: 'Não foi possível criar agora.' }, { status: 503 });
  }
}
