// Senha com hash (scrypt, nativo do Node, sem biblioteca). Usado pelo site e pelo script scripts/criar-admin.mjs.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashSenha(senha) {
  const sal = randomBytes(16);
  return `scrypt$${sal.toString('base64')}$${scryptSync(senha, sal, 32).toString('base64')}`;
}

export function confereSenha(senha, guardado) {
  const [tipo, sal, hash] = String(guardado).split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const real = scryptSync(senha, Buffer.from(sal, 'base64'), esperado.length);
  return real.length === esperado.length && timingSafeEqual(real, esperado);
}
