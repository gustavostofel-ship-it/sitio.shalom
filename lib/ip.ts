import { createHash } from 'node:crypto';

// Origem do pedido. Atrás de um proxy (Easypanel/Traefik) o cabeçalho x-forwarded-for traz uma lista:
// o que o visitante mandou vem primeiro e cada proxy acrescenta, no fim, quem ele viu.
// Por isso o IP confiável é contado de trás para frente (PROXY_HOPS = quantos proxies há na frente do site).
// Pegar o primeiro da lista, como antes, deixava qualquer um fingir ser outro IP.
export function ipDoPedido(req: Request, saltos = Number(process.env.PROXY_HOPS ?? 1)): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const lista = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (lista.length) return agrupaIpv6(lista[Math.max(0, lista.length - Math.max(1, saltos))]);
  }
  return agrupaIpv6(req.headers.get('x-real-ip')?.trim() || 'local');
}

// Uma casa/operadora recebe um bloco IPv6 inteiro (/64, bilhões de endereços). Contar cada endereço
// separado deixaria um robô driblar o limite: aqui todos os endereços do mesmo bloco viram um só.
export function agrupaIpv6(ip: string): string {
  if (!ip.includes(':')) return ip;
  const v4 = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4) return v4[1];
  const [sem] = ip.split('%'); // remove zona (fe80::1%eth0)
  const duplo = sem.split('::');
  if (duplo.length > 2) return ip;
  const esq = duplo[0] ? duplo[0].split(':') : [];
  const dir = duplo.length === 2 && duplo[1] ? duplo[1].split(':') : [];
  const faltam = 8 - esq.length - dir.length;
  if (duplo.length === 1 ? esq.length !== 8 : faltam < 0) return ip;
  const todos = duplo.length === 1 ? esq : [...esq, ...Array(faltam).fill('0'), ...dir];
  if (!todos.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return ip;
  return todos.slice(0, 4).map((g) => g.toLowerCase().padStart(4, '0')).join(':') + '::/64';
}

// O banco guarda só um resumo do IP (não dá para voltar ao IP), apenas para limitar abuso.
export function resumoIp(ip: string, segredo = process.env.SESSION_SECRET ?? '') {
  return createHash('sha256').update(segredo + '|' + ip).digest('hex').slice(0, 32);
}
