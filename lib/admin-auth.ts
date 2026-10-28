import { db } from '@/lib/db';
import { COOKIE, lerCookie, verificar } from '@/lib/sessao';

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
  if (!r.rowCount) throw new HttpErro(403, 'Este usuário não tem acesso ao painel.');
  return pool;
}

export const https = (req: Request) => new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
