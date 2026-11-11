import { createHmac, timingSafeEqual } from 'node:crypto';

// "Ficha" do formulário emitida pelo SERVIDOR quando a página abre. Substitui o tempo medido pelo
// navegador (que um robô podia falsificar): o relógio é do servidor e a ficha é assinada (vale de 3 segundos a 2 horas depois de emitida).
const MIN_MS = 3000;
const MAX_MS = 2 * 3600e3;

const assinatura = (ts: string, segredo: string) => createHmac('sha256', segredo).update('form|' + ts).digest('hex').slice(0, 32);

export const emitirFicha = (segredo: string, agora = Date.now()) => {
  const ts = String(agora);
  return ts + '.' + assinatura(ts, segredo);
};

export function fichaValida(ficha: unknown, segredo: string, agora = Date.now()): boolean {
  if (typeof ficha !== 'string' || ficha.length > 80) return false;
  const [ts, sig] = ficha.split('.');
  if (!ts || !sig || !/^\d{10,15}$/.test(ts)) return false;
  const esperado = Buffer.from(assinatura(ts, segredo));
  const recebido = Buffer.from(sig);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return false;
  const idade = agora - Number(ts);
  return idade >= MIN_MS && idade <= MAX_MS;
}
