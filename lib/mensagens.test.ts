// Roda com: node --test lib/mensagens.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { modelosReserva, type DadosMsgReserva, type MsgConfig } from './mensagens.ts';

const r: DadosMsgReserva = { id: 7, nome: 'Melq Silva', igreja: 'Quadrangular', entrada: '2026-12-23', saida: '2026-12-27', total: 10000, sinal: 2000, pago: 0, publico: '50 a 100 pessoas', segura_ate: '2026-11-12T21:05:00Z' };
const msg: MsgConfig = { pixChave: '12.345.678/0001-90', pixTitular: 'Sítio Shalom LTDA', saldoRegra: 'O saldo vence 7 dias antes da entrada.', extras: 'Tragam toalhas.' };

test('aguardando sinal: pedido recebido traz datas, valores, prazo e PIX', () => {
  const { sugerido, modelos } = modelosReserva(r, msg, 20, 150, 'aguardando_sinal');
  assert.equal(sugerido, 'pedido');
  assert.deepEqual(modelos.map((m) => m.id), ['pedido', 'lembrete']);
  const t = modelos[0].texto;
  for (const parte of ['Olá, Melq!', 'nº 7', '23/12/2026', '27/12/2026', 'R$ 10.000', 'R$ 2.000', '12.345.678/0001-90', 'Sítio Shalom LTDA', '12/11']) assert.ok(t.includes(parte), parte);
});

test('sem chave PIX cadastrada a mensagem não inventa dados', () => {
  const { modelos } = modelosReserva(r, { ...msg, pixChave: '', pixTitular: '' }, 20, 150, 'aguardando_sinal');
  assert.ok(!modelos[0].texto.includes('PIX:'));
  assert.ok(modelos[0].texto.includes('dados para o pagamento'));
});

test('confirmada: mostra saldo, regra do saldo, endereço e recado; quitada muda a mensagem', () => {
  const conf = modelosReserva({ ...r, pago: 2000 }, msg, 20, 150, 'confirmada');
  assert.equal(conf.sugerido, 'confirmada');
  assert.deepEqual(conf.modelos.map((m) => m.id), ['confirmada', 'saldo', 'chegada']);
  const t = conf.modelos[0].texto;
  for (const parte of ['Reserva confirmada', 'R$ 8.000', 'O saldo vence 7 dias antes', 'Estrada São Lourenço', 'Tragam toalhas.', 'Até 150 pessoas']) assert.ok(t.includes(parte), parte);
  const paga = modelosReserva({ ...r, pago: 10000 }, msg, 20, 150, 'confirmada');
  assert.equal(paga.sugerido, 'quitada');
  assert.deepEqual(paga.modelos.map((m) => m.id), ['quitada', 'chegada']);
});

test('cancelada e vencida têm a mensagem certa; devolução só aparece se houve valor recebido', () => {
  assert.equal(modelosReserva(r, msg, 20, 150, 'cancelada').sugerido, 'cancelada');
  assert.ok(!modelosReserva(r, msg, 20, 150, 'cancelada').modelos[0].texto.includes('devolução'));
  assert.ok(modelosReserva({ ...r, pago: 2000 }, msg, 20, 150, 'cancelada').modelos[0].texto.includes('devolução'));
  assert.equal(modelosReserva(r, msg, 20, 150, 'expirada').sugerido, 'expirada');
});
