// Roda com: node --test lib/antiabuso.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agrupaIpv6, ipDoPedido } from './ip.ts';
import { emitirFicha, fichaValida } from './token-form.ts';
import { destinoPushPermitido } from './push-destino.ts';

const SEG = 'x'.repeat(40);

test('IPv6 do mesmo bloco /64 conta como uma origem só', () => {
  assert.equal(agrupaIpv6('2804:14d:1:2:aaaa:bbbb:cccc:dddd'), agrupaIpv6('2804:14d:1:2::1'));
  assert.notEqual(agrupaIpv6('2804:14d:1:2::1'), agrupaIpv6('2804:14d:1:3::1'));
  assert.equal(agrupaIpv6('200.1.2.3'), '200.1.2.3');
  assert.equal(agrupaIpv6('::ffff:200.1.2.3'), '200.1.2.3');
  assert.equal(agrupaIpv6('lixo:::'), 'lixo:::');
});

test('origem vem do proxy, contando de trás para frente', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
  assert.equal(ipDoPedido(req, 1), '2.2.2.2');
});

test('destino de push: só serviços de navegador de verdade', () => {
  for (const ok of ['https://web.push.apple.com/abc', 'https://fcm.googleapis.com/fcm/send/x', 'https://updates.push.services.mozilla.com/wpush/v2/x', 'https://wns2-par02p.notify.windows.com/w/?token=x'])
    assert.equal(destinoPushPermitido(ok), true, ok);
  for (const ruim of ['http://web.push.apple.com/x', 'https://localhost/x', 'https://169.254.169.254/x', 'https://evil.com/web.push.apple.com', 'https://web.push.apple.com.evil.com/x', 'https://fcm.googleapis.com:8443/x', 'lixo'])
    assert.equal(destinoPushPermitido(ruim), false, ruim);
});

test('ficha do formulário: assinada, com tempo mínimo e máximo', () => {
  const t = 1_800_000_000_000;
  const f = emitirFicha(SEG, t);
  assert.equal(fichaValida(f, SEG, t + 1000), false); // rápido demais
  assert.equal(fichaValida(f, SEG, t + 5000), true);
  assert.equal(fichaValida(f, SEG, t + 3 * 3600e3), false); // velha demais
  assert.equal(fichaValida(f, 'y'.repeat(40), t + 5000), false); // outra chave
  assert.equal(fichaValida(f.slice(0, -1) + (f.endsWith('0') ? '1' : '0'), SEG, t + 5000), false); // adulterada
  assert.equal(fichaValida(undefined, SEG), false);
});
