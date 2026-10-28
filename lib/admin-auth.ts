import { supabaseAdmin } from '@/lib/agenda-server';

export class HttpErro extends Error {
  constructor(
    public status: number,
    mensagem: string
  ) {
    super(mensagem);
  }
}

// Só entra no painel quem fez login no Supabase Auth E está na tabela agenda_admins.
// Sem isso, qualquer pessoa com conta (ou se o cadastro público estiver ligado) entraria.
export async function exigirAdmin(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpErro(401, 'Faça login para continuar.');
  const db = supabaseAdmin();
  const { data, error } = await db.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) throw new HttpErro(401, 'Sua sessão expirou. Entre de novo.');
  const { data: adm } = await db.from('agenda_admins').select('email').eq('email', email).maybeSingle();
  if (!adm) throw new HttpErro(403, 'Este usuário não tem acesso ao painel.');
  return db;
}
