// Testes do catálogo e dos textos das notificações. Rode com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LISTA_TIPOS,
  TIPOS,
  avisoReservaCancelada,
  avisoReservaChegada,
  avisoReservaNova,
  avisoReservaPagamento,
  avisoReservaSaldo,
  avisoReservaVencendo,
  avisoVisitaNova,
  avisoVisitasHoje,
  dentroDaJanelaDeAvisos,
  faltaTexto,
  quandoSP,
  urlDe,
  type DadosReserva,
} from './notificacoes.ts';

const reserva: DadosReserva = {
  id: 7,
  nome: 'Claudio',
  igreja: 'Quadrangular',
  whatsapp: '21988776655',
  entrada: '2026-12-04',
  saida: '2026-12-06',
  total: 7500,
  sinal: 1500,
  pago: 0,
  segura_ate: '2026-11-12T17:30:00.000Z',
};

test('catálogo: todo tipo tem texto de quando avisa e do que fazer', () => {
  for (const t of LISTA_TIPOS) {
    assert.ok(TIPOS[t].rotulo.length > 3, t);
    assert.ok(TIPOS[t].quando.length > 10, t);
    assert.ok(TIPOS[t].fazer.length > 10, t);
  }
  assert.ok(LISTA_TIPOS.filter((t) => TIPOS[t].grupo === 'acao').length >= 8);
});

test('reserva nova: traz cliente, datas, valores, WhatsApp e o prazo em horário de Brasília', () => {
  const a = avisoReservaNova(reserva);
  assert.equal(a.tipo, 'reserva_nova');
  assert.match(a.titulo, /Quadrangular/);
  assert.match(a.corpo, /sex 04\/12 a dom 06\/12/);
  assert.match(a.corpo, /R\$\s?7\.500/);
  assert.match(a.corpo, /R\$\s?1\.500/);
  assert.match(a.corpo, /12\/11 às 14:30/); // 17:30 UTC = 14:30 em Brasília
  assert.equal(a.refTipo, 'reserva');
  assert.equal(a.refId, 7);
});

test('prazo acabando: a chave separa o aviso de 6 h do de 1 h (não repete)', () => {
  assert.equal(avisoReservaVencendo(reserva, 5.5 * 3600e3, '6h').chave, 'reserva:7:vence6h');
  assert.equal(avisoReservaVencendo(reserva, 50 * 60e3, '1h').chave, 'reserva:7:vence1h');
  assert.match(avisoReservaVencendo(reserva, 50 * 60e3, '1h').corpo, /50 minutos/);
});

test('visita: horário escolhido ou "a combinar"', () => {
  const com = avisoVisitaNova({ id: 1, nome: 'Ana', igreja: null, whatsapp: '21988776655', data: '2026-11-14', hora: '10:00' });
  assert.match(com.corpo, /sáb 14\/11 às 10:00/);
  assert.match(com.titulo, /Ana/);
  const sem = avisoVisitaNova({ id: 2, nome: 'Ana', igreja: 'Igreja X', whatsapp: '21988776655', data: null, hora: null });
  assert.match(sem.corpo, /horário a combinar/);
  assert.match(sem.titulo, /Igreja X/);
});

test('saldo e chegada: falam do valor que falta', () => {
  assert.match(avisoReservaSaldo({ ...reserva, pago: 1500 }, 3, '3d').corpo, /Falta R\$\s?6\.000/);
  assert.match(avisoReservaChegada({ ...reserva, pago: 7500 }).corpo, /Tudo pago/);
  assert.match(avisoReservaChegada(reserva).corpo, /Falta receber/);
});

test('histórico: diz quem fez, e cancelar com valor pago lembra a devolução', () => {
  assert.match(avisoReservaCancelada({ ...reserva, pago: 1500 }, 'maria@exemplo.com').corpo, /por maria/);
  assert.match(avisoReservaCancelada({ ...reserva, pago: 1500 }, null).corpo, /devolução/);
  assert.match(avisoReservaPagamento({ ...reserva, pago: 7500 }, null).titulo, /quitada/);
});

test('resumo do dia: uma chave por data', () => {
  const v = [
    { id: 1, nome: 'A', igreja: 'Igreja A', whatsapp: '1', data: '2026-11-14', hora: '09:00' },
    { id: 2, nome: 'B', igreja: null, whatsapp: '2', data: '2026-11-14', hora: '11:00' },
  ];
  const a = avisoVisitasHoje(v, '2026-11-14');
  assert.equal(a.chave, 'visitas:hoje:2026-11-14');
  assert.match(a.titulo, /2 visitas/);
  assert.match(a.corpo, /09:00 Igreja A · 11:00 B/);
});

test('tempo e janela de avisos', () => {
  assert.equal(faltaTexto(30 * 1000), '1 minuto');
  assert.equal(faltaTexto(45 * 60e3), '45 minutos');
  assert.equal(faltaTexto(61 * 60e3), '1 hora');
  assert.equal(faltaTexto(5.6 * 3600e3), '6 horas');
  assert.equal(dentroDaJanelaDeAvisos(6 * 60 + 59), false);
  assert.equal(dentroDaJanelaDeAvisos(7 * 60), true);
  assert.equal(dentroDaJanelaDeAvisos(20 * 60 + 59), true);
  assert.equal(dentroDaJanelaDeAvisos(21 * 60), false);
  assert.equal(quandoSP('2026-11-12T02:05:00Z'), '11/11 às 23:05');
});

test('endereço que o toque na notificação abre', () => {
  assert.equal(urlDe('reserva', 12), '/painel?abrir=reserva:12');
  assert.equal(urlDe('visita', 3), '/painel?abrir=visita:3');
  assert.equal(urlDe(), '/painel?aba=notif');
});
