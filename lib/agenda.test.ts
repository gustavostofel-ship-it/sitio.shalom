// Roda com: node --test lib/agenda.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cotar, janela, visivel, statusDia, proximas, pascoa, sugerirPeriodos, pagamento, type AgendaData } from './agenda.ts';

const base = (): AgendaData => ({
  hoje: '2026-10-28',
  cfg: { base: 7500, minDias: 3, extra: 1500, sinalPct: 20, holdHoras: 24, capacidade: 150, maxDias: 7, diasPadrao: [0, 5, 6] },
  periodos: [
    { nome: 'Carnaval 2027', entrada: '2027-02-05', saida: '2027-02-10', preco: 25000, bloqueado: false },
    { nome: 'Natal 2026', entrada: '2026-12-24', saida: '2026-12-26', preco: 0, bloqueado: true },
  ],
  dias: {},
  ocupadas: [{ entrada: '2026-11-20', saida: '2026-11-22' }],
});
const total = (a: string, b: string, x = base()) => {
  const c = cotar(a, b, x);
  return c.ok ? c.total : c.erro;
};

test('sexta a domingo = R$ 7.500, sinal de 20%', () => {
  const c = cotar('2026-11-06', '2026-11-08', base());
  assert.ok(c.ok && c.total === 7500 && c.sinal === 1500);
});
test('dia extra custa R$ 1.500, vale 1 antes e 1 depois', () => {
  assert.equal(total('2026-11-05', '2026-11-08'), 9000); // quinta a domingo
  assert.equal(total('2026-11-06', '2026-11-09'), 9000); // sexta a segunda
  assert.equal(total('2026-11-05', '2026-11-09'), 10500); // quinta a segunda
  assert.match(String(total('2026-11-04', '2026-11-08')), /no máximo 1 dia/); // 2 dias antes
});
test('menos de 3 dias não passa pelo site', () => {
  assert.match(String(total('2026-11-06', '2026-11-07')), /mínimo/);
});
test('período especial é pacote fechado: nem menos, nem mais dias', () => {
  assert.equal(total('2027-02-05', '2027-02-10'), 25000);
  assert.match(String(total('2027-02-06', '2027-02-10')), /inteiro/);
  assert.match(String(total('2027-02-04', '2027-02-10')), /inteiro/);
});
test('dia reservado, bloqueado e passado não são escolhidos', () => {
  assert.match(String(total('2026-11-20', '2026-11-22')), /reservadas por outra pessoa/);
  assert.equal(statusDia('2026-12-25', base()), 'fechado'); // Natal bloqueado
  assert.equal(statusDia('2026-10-20', base()), 'passado');
});
test('dias soltos (menos de 3 seguidos) ficam ocultos para o cliente', () => {
  const x = base();
  x.dias = { '2026-11-01': false, '2026-11-02': true, '2026-11-03': true }; // seg e ter abertas, dom e qua fechados
  assert.equal(visivel('2026-11-02', x), false);
  x.dias['2026-11-04'] = true; // seg, ter, qua
  assert.equal(visivel('2026-11-02', x), true);
});
test('um toque marca 3 dias; no fim do bloco ajusta para o bloco inteiro', () => {
  const x = base();
  assert.deepEqual(janela('2026-11-06', x), ['2026-11-06', '2026-11-08']);
  assert.deepEqual(janela('2026-11-07', x), ['2026-11-06', '2026-11-08']);
  assert.deepEqual(janela('2026-11-08', x), ['2026-11-06', '2026-11-08']);
  assert.equal(janela('2026-11-10', x), null); // terça fechada
});
test('teto de dias fora de período especial', () => {
  const x = base();
  for (let d = 9; d <= 18; d++) x.dias['2026-11-' + String(d).padStart(2, '0')] = true;
  assert.match(String(total('2026-11-09', '2026-11-18', x)), /mais de 7 dias/);
});
test('atalhos sugerem pacotes livres', () => {
  const p = proximas(base(), 3);
  assert.equal(p.length, 3);
  assert.ok(p.every((q) => q.total === 7500));
});
test('data que acabou de ser reservada por outra pessoa dá mensagem clara', () => {
  assert.match(String(total('2026-11-20', '2026-11-22')), /reservadas por outra pessoa/);
});
test('feriados do ano são calculados pela Páscoa', () => {
  assert.equal(pascoa(2027), '2027-03-28');
  const x = base();
  const carnaval = sugerirPeriodos(2027, x.cfg).find((q) => q.nome.startsWith('Carnaval'))!;
  assert.deepEqual([carnaval.entrada, carnaval.saida, carnaval.preco], ['2027-02-05', '2027-02-10', 25000]);
  const sem = sugerirPeriodos(2027, x.cfg).find((q) => q.nome.startsWith('Semana Santa'))!;
  assert.deepEqual([sem.entrada, sem.saida], ['2027-03-25', '2027-03-28']);
  const cc = sugerirPeriodos(2027, x.cfg).find((q) => q.nome.startsWith('Corpus'))!;
  assert.deepEqual([cc.entrada, cc.saida, cc.preco], ['2027-05-26', '2027-05-30', 10500]);
  const ny = sugerirPeriodos(2026, x.cfg).find((q) => q.nome.startsWith('Ano Novo'))!;
  assert.deepEqual([ny.entrada, ny.saida], ['2026-12-30', '2027-01-03']);
  assert.equal(sugerirPeriodos(2026, x.cfg).find((q) => q.nome.startsWith('Natal'))!.bloqueado, true);
});
test('pagamento: pendente, parcial, sinal e quitada', () => {
  const r = { total: 7500, sinal: 1500 };
  assert.equal(pagamento({ ...r, pago: 0 }), 'pendente');
  assert.equal(pagamento({ ...r, pago: 500 }), 'parcial');
  assert.equal(pagamento({ ...r, pago: 1500 }), 'sinal');
  assert.equal(pagamento({ ...r, pago: 4000 }), 'sinal');
  assert.equal(pagamento({ ...r, pago: 7500 }), 'quitada');
});
