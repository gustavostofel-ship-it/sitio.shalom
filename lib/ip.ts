import { createHash } from 'node:crypto';

// Origem do pedido. Atrás de um proxy (Easypanel/Traefik) o cabeçalho x-forwarded-for traz uma lista:
// o que o visitante mandou vem primeiro e cada proxy acrescenta, no fim, quem ele viu.
// Por isso o IP confiável é contado de trás para frente (PROXY_HOPS = quantos proxies há na frente do site).
// Pegar o primeiro da lista, como antes, deixava qualquer um fingir ser outro IP.
export function ipDoPedido(req: Request, saltos = Number(process.env.PROXY_HOPS ?? 1)): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const lista = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (lista.length) return lista[Math.max(0, lista.length - Math.max(1, saltos))];
  }
  return req.headers.get('x-real-ip')?.trim() || 'local';
}

// O banco guarda só um resumo do IP (não dá para voltar ao IP), apenas para limitar abuso.
export function resumoIp(ip: string, segredo = process.env.SESSION_SECRET ?? '') {
  return createHash('sha256').update(segredo + '|' + ip).digest('hex').slice(0, 32);
}
