// Endereço público do site (https://seudominio.com.br), sem barra no fim.
// Vem de SITE_URL, que no servidor entra no HTML na hora de montar o site (veja o Dockerfile): assim as páginas
// públicas não dependem de nenhum dado do pedido e podem ficar em cache (site rápido).
// Sem SITE_URL (computador de desenvolvimento), usa o endereço local.
export async function siteUrl(): Promise<string> {
  const fixo = process.env.SITE_URL?.trim();
  return (fixo || 'http://localhost:3000').replace(/\/+$/, '');
}
