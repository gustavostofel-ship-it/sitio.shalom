// Testes das proteções contra abuso. Rode com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipDoPedido, resumoIp } from './ip.ts';
import { dentroDoLimite, estourou, contar, zerar } from './limite.ts';
import { whatsappNormalizado } from './telefone.ts';

const req = (h: Record<string, string>) => new Request('http://x/', { headers: h });

test('IP: atrás de 1 proxy vale o último da lista, não o que o visitante inventou', () => {
  assert.equal(ipDoPedido(req({ 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }), 1), '203.0.113.9');
  assert.equal(ipDoPedido(req({ 'x-forwarded-for': '203.0.113.9' }), 1), '203.0.113.9');
});

test('IP: com 2 proxies vale o penúltimo; sem cabeçalho cai em x-real-ip ou local', () => {
  assert.equal(ipDoPedido(req({ 'x-forwarded-for': '9.9.9.9, 203.0.113.9, 10.0.0.2' }), 2), '203.0.113.9');
  assert.equal(ipDoPedido(req({ 'x-real-ip': '198.51.100.4' })), '198.51.100.4');
  assert.equal(ipDoPedido(req({})), 'local');
});

test('IP: o resumo é fixo para o mesmo IP, diferente entre IPs e não revela o IP', () => {
  assert.equal(resumoIp('1.2.3.4', 's'), resumoIp('1.2.3.4', 's'));
  assert.notEqual(resumoIp('1.2.3.4', 's'), resumoIp('1.2.3.5', 's'));
  assert.ok(!resumoIp('1.2.3.4', 's').includes('1.2.3.4'));
});

test('limite: passa até o máximo e bloqueia depois; a janela expira', () => {
  const k = 't-limite';
  zerar(k);
  assert.equal(dentroDoLimite(k, 2, 1000, 0), true);
  assert.equal(dentroDoLimite(k, 2, 1000, 1), true);
  assert.equal(dentroDoLimite(k, 2, 1000, 2), false);
  assert.equal(dentroDoLimite(k, 2, 1000, 1500), true); // janela nova
});

test('limite de senha: só conta o erro e libera depois da janela ou do acerto', () => {
  const k = 't-login';
  zerar(k);
  for (let i = 0; i < 3; i++) contar(k, 1000, 0);
  assert.equal(estourou(k, 3, 10), true);
  assert.equal(estourou(k, 3, 2000), false);
  zerar(k);
  assert.equal(estourou(k, 3, 10), false);
});

test('WhatsApp: aceita celular com DDD (com ou sem 55) e devolve só os dígitos', () => {
  assert.equal(whatsappNormalizado('(21) 98877-6655'), '21988776655');
  assert.equal(whatsappNormalizado('+55 21 98877-6655'), '21988776655');
  assert.equal(whatsappNormalizado('5521988776655'), '21988776655');
});

test('WhatsApp: recusa número falso, repetido, sem 9, DDD inexistente ou curto', () => {
  assert.equal(whatsappNormalizado('21999999999'), null); // 99999999
  assert.equal(whatsappNormalizado('21912345678'), null); // sequência
  assert.equal(whatsappNormalizado('21987654321'), null); // 87654321 descendo
  assert.equal(whatsappNormalizado('2188776655'), null); // faltou o 9
  assert.equal(whatsappNormalizado('10988776655'), null); // DDD 10 não existe
  assert.equal(whatsappNormalizado('123'), null);
  assert.equal(whatsappNormalizado(''), null);
  assert.equal(whatsappNormalizado('21387654321'), null); // não começa com 9
});
