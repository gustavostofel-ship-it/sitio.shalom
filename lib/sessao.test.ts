// Roda com: node --test lib/sessao.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assinar, verificar, lerCookie, DURACAO } from './sessao.ts';
import { hashSenha, confereSenha } from './senha.mjs';

const segredo = 'segredo-de-teste-com-mais-de-32-caracteres!!';

test('senha: aceita a certa, recusa a errada, e cada hash é diferente', () => {
  const h = hashSenha('minha-senha');
  assert.equal(confereSenha('minha-senha', h), true);
  assert.equal(confereSenha('outra', h), false);
  assert.notEqual(hashSenha('minha-senha'), h);
  assert.equal(confereSenha('x', 'lixo'), false);
});

test('sessão: válida devolve o e-mail', () => {
  assert.equal(verificar(assinar('dono@x.com', segredo), segredo), 'dono@x.com');
});
test('sessão: adulterada, com outro segredo ou vencida é recusada', () => {
  const t = assinar('dono@x.com', segredo);
  const [corpo, sig] = t.split('.');
  const falso = Buffer.from(JSON.stringify({ e: 'invasor@x.com', x: 9999999999 })).toString('base64url');
  assert.equal(verificar(falso + '.' + sig, segredo), null);
  assert.equal(verificar(corpo + '.' + sig.slice(0, -2) + 'AA', segredo), null);
  assert.equal(verificar(t, 'outro-segredo-outro-segredo-outro-segredo'), null);
  assert.equal(verificar(t, segredo, Date.now() + (DURACAO + 60) * 1000), null);
  assert.equal(verificar(undefined, segredo), null);
  assert.equal(verificar('sem-ponto', segredo), null);
});
test('cookie: lê o valor certo entre vários', () => {
  assert.equal(lerCookie('a=1; painel=abc.def; b=2'), 'abc.def');
  assert.equal(lerCookie(null), undefined);
});
