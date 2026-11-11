import type { Pool } from 'pg';
import { db } from '@/lib/db';
import type { NextResponse } from 'next/server';
import { COOKIE, DURACAO, assinar, lerCookie, lerSessao } from '@/lib/sessao';
import { confereSenhaAsync } from '@/lib/senha.mjs';
import { contar, estourou, zerar } from '@/lib/limite';

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
  const s = lerSessao(lerCookie(req.headers.get('cookie'), COOKIE), segredo());
  if (!s) throw new HttpErro(401, 'Faça login para continuar.');
  const pool = db();
  const r = await pool.query('select sessao_versao from agenda_admins where email = $1', [s.email]);
  // Acesso removido, senha trocada ou "sair" feito: a sessão antiga deixa de valer.
  if (!r.rowCount || r.rows[0].sessao_versao !== s.versao) throw new HttpErro(401, 'Este acesso não vale mais. Entre de novo.');
  return { pool, email: s.email };
}

// Pede a senha de novo antes de mexer em acessos (criar, trocar senha, remover).
export async function confirmarSenha(pool: Pool, email: string, senha: unknown) {
  const chave = 'reauth:' + email;
  if (estourou(chave, 8)) throw new HttpErro(429, 'Muitas tentativas. Espere alguns minutos.');
  const r = await pool.query('select senha_hash from agenda_admins where email = $1', [email]);
  if (!r.rowCount || !(await confereSenhaAsync(String(senha ?? '').slice(0, 200), r.rows[0].senha_hash))) {
    contar(chave, 15 * 60e3);
    throw new HttpErro(403, 'Confirme com a SUA senha atual. A senha informada não confere.');
  }
  zerar(chave);
}

// Criar o PRIMEIRO administrador pela tela só é permitido no próprio computador (localhost, sem proxy).
// No servidor, com banco novo, qualquer visitante poderia criar o acesso antes do dono: lá o primeiro
// administrador é criado pelo script (scripts/criar-admin.mjs).
export function setupPermitido(req: Request) {
  const host = new URL(req.url).hostname;
  return ['localhost', '127.0.0.1', '[::1]'].includes(host) && !req.headers.get('x-forwarded-for') && !req.headers.get('x-forwarded-host');
}

export const https = (req: Request) => new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

// Grava o login num cookie seguro (HttpOnly) na resposta.
export async function iniciarSessao(res: NextResponse, req: Request, email: string) {
  const v = await db().query('select sessao_versao from agenda_admins where email = $1', [email]);
  res.cookies.set(COOKIE, assinar(email, segredo(), v.rows[0]?.sessao_versao ?? 1), { httpOnly: true, sameSite: 'strict', path: '/', maxAge: DURACAO, secure: https(req) });
}
