import { headers } from 'next/headers';

// Endereço público do site (https://seudominio.com.br), sem barra no fim.
// Em produção defina SITE_URL: assim o endereço não depende do que vem no pedido.
// Sem SITE_URL, usa o endereço pelo qual o visitante chegou (serve para testar no computador).
export async function siteUrl(): Promise<string> {
  const fixo = process.env.SITE_URL?.trim();
  if (fixo) return fixo.replace(/\/+$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (/^(localhost|127\.)/.test(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}
