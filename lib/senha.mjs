// Senha com hash (scrypt, nativo do Node, sem biblioteca). Usado pelo site e pelo script scripts/criar-admin.mjs.
import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashSenha(senha) {
  const sal = randomBytes(16);
  return `scrypt$${sal.toString('base64')}$${scryptSync(senha, sal, 32).toString('base64')}`;
}

// Mesma conferência, mas sem travar o servidor: o cálculo roda fora do fluxo principal (login e confirmação de senha).
export async function confereSenhaAsync(senha, guardado) {
  const [tipo, sal, hash] = String(guardado).split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const real = await new Promise((resolve, reject) => scrypt(senha, Buffer.from(sal, 'base64'), esperado.length, (e, k) => (e ? reject(e) : resolve(k))));
  return real.length === esperado.length && timingSafeEqual(real, esperado);
}

export function confereSenha(senha, guardado) {
  const [tipo, sal, hash] = String(guardado).split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const real = scryptSync(senha, Buffer.from(sal, 'base64'), esperado.length);
  return real.length === esperado.length && timingSafeEqual(real, esperado);
}
