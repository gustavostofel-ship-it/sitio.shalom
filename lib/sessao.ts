import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'painel';
export const DURACAO = 7 * 24 * 3600; // segundos

const hmac = (corpo: string, segredo: string) => createHmac('sha256', segredo).update(corpo).digest();

// Sessão sem estado: o cookie leva o e-mail e a validade, assinados com SESSION_SECRET.
export function assinar(email: string, segredo: string, agora = Date.now()): string {
  const corpo = Buffer.from(JSON.stringify({ e: email, x: Math.floor(agora / 1000) + DURACAO })).toString('base64url');
  return corpo + '.' + hmac(corpo, segredo).toString('base64url');
}

export function verificar(token: string | undefined, segredo: string, agora = Date.now()): string | null {
  const [corpo, assinatura] = (token ?? '').split('.');
  if (!corpo || !assinatura) return null;
  const esperado = hmac(corpo, segredo);
  const dado = Buffer.from(assinatura, 'base64url');
  if (dado.length !== esperado.length || !timingSafeEqual(dado, esperado)) return null;
  try {
    const p = JSON.parse(Buffer.from(corpo, 'base64url').toString());
    return typeof p.e === 'string' && p.x * 1000 > agora ? p.e : null;
  } catch {
    return null;
  }
}

export const lerCookie = (cabecalho: string | null, nome = COOKIE) =>
  cabecalho
    ?.split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === nome)?.[1];

// E-mail com o formato mínimo certo (algo@dominio.ext, sem espaços).
export const emailValido = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
