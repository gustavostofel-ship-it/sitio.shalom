// Roda com: node --test lib/antiabuso.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agrupaIpv6, ipDoPedido } from './ip.ts';
import { emitirFicha, fichaValida } from './token-form.ts';

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
