// Cria (ou troca a senha de) um administrador do painel.
// Uso: docker compose exec app node scripts/criar-admin.mjs email@exemplo.com 'senha-com-10-ou-mais-caracteres'
import pg from 'pg';
import { hashSenha } from '../lib/senha.mjs';

const [email, senha] = process.argv.slice(2);
if (!email || !senha || senha.length < 10) {
  console.error("Uso: node scripts/criar-admin.mjs email@exemplo.com 'senha-com-10-ou-mais-caracteres'");
  process.exit(1);
}
const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();
await cliente.query(
  'insert into agenda_admins (email, senha_hash) values ($1, $2) on conflict (email) do update set senha_hash = excluded.senha_hash',
  [email.trim().toLowerCase(), hashSenha(senha)]
);
console.log('Administrador pronto:', email.trim().toLowerCase());
await cliente.end();
