// Testes da agenda de visitas. Rode com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horariosDoDia, diasComHorarios, horarioDisponivel, erroDaConfig, agoraSP, type VisitaCfg, type Contexto } from './visitas.ts';

const cfg: VisitaCfg = { diasSemana: [6], horaIni: '09:00', horaFim: '12:00', duracaoMin: 60, antecedenciaH: 24, horizonteDias: 30 };
// Quarta-feira, 11/11/2026, 10:00
const ctx = (extra: Partial<Contexto> = {}): Contexto => ({ agora: { data: '2026-11-11', min: 600 }, bloqueios: new Set(), ocupados: new Set(), emReserva: () => false, ...extra });

test('horários do dia: de hora em hora, o último termina na hora final', () => {
  assert.deepEqual(horariosDoDia(cfg), ['09:00', '10:00', '11:00']);
  assert.deepEqual(horariosDoDia({ ...cfg, duracaoMin: 90 }), ['09:00', '10:30']); // 10:30 + 90 min = 12:00, cabe
  assert.deepEqual(horariosDoDia({ ...cfg, duracaoMin: 120 }), ['09:00']);
  assert.deepEqual(horariosDoDia({ ...cfg, duracaoMin: 0 }), []);
});

test('só aparecem os dias da semana configurados, dentro do período', () => {
  const dias = diasComHorarios(cfg, ctx());
  assert.deepEqual(dias.map((d) => d.data), ['2026-11-14', '2026-11-21', '2026-11-28', '2026-12-05']); // 12/12 passa dos 30 dias
  assert.ok(dias.every((d) => new Date(d.data + 'T12:00:00Z').getUTCDay() === 6));
});

test('antecedência: horário que começa antes de 24 h a partir de agora não aparece', () => {
  // Agora é sexta 13/11 às 10:30; sábado 09:00 fica a menos de 24 h
  const dias = diasComHorarios(cfg, ctx({ agora: { data: '2026-11-13', min: 630 } }));
  const sab = dias.find((d) => d.data === '2026-11-14');
  assert.deepEqual(sab?.horas.map((h) => h.hora), ['11:00']);
  const mais = diasComHorarios(cfg, ctx({ agora: { data: '2026-11-13', min: 700 } }));
  assert.equal(mais.find((d) => d.data === '2026-11-14'), undefined);
});

test('dia bloqueado e dia com o sítio alugado não aparecem', () => {
  const dias = diasComHorarios(cfg, ctx({ bloqueios: new Set(['2026-11-21']), emReserva: (d) => d === '2026-11-28' }));
  assert.ok(!dias.some((d) => d.data === '2026-11-21' || d.data === '2026-11-28'));
  assert.ok(dias.some((d) => d.data === '2026-11-14'));
});

test('horário ocupado aparece como não livre e não pode ser escolhido', () => {
  const c = ctx({ ocupados: new Set(['2026-11-14|10:00']) });
  const sab = diasComHorarios(cfg, c).find((d) => d.data === '2026-11-14')!;
  assert.deepEqual(sab.horas, [{ hora: '09:00', livre: true }, { hora: '10:00', livre: false }, { hora: '11:00', livre: true }]);
  assert.equal(horarioDisponivel(cfg, c, '2026-11-14', '10:00'), false);
  assert.equal(horarioDisponivel(cfg, c, '2026-11-14', '11:00'), true);
  assert.equal(horarioDisponivel(cfg, c, '2026-11-14', '13:00'), false); // fora do expediente
  assert.equal(horarioDisponivel(cfg, c, '2026-11-15', '09:00'), false); // domingo, não é dia de visita
});

test('configuração: aceita a certa e recusa a errada', () => {
  assert.equal(erroDaConfig(cfg), null);
  assert.ok(erroDaConfig({ ...cfg, horaFim: '08:00' }));
  assert.ok(erroDaConfig({ ...cfg, horaIni: '9h' }));
  assert.ok(erroDaConfig({ ...cfg, diasSemana: [7] }));
  assert.ok(erroDaConfig({ ...cfg, duracaoMin: 5 }));
  assert.ok(erroDaConfig({ ...cfg, horizonteDias: 0 }));
});

test('agora em Brasília: 2026-11-11T13:00Z é 10:00 do mesmo dia', () => {
  assert.deepEqual(agoraSP(new Date('2026-11-11T13:00:00Z')), { data: '2026-11-11', min: 600 });
  assert.deepEqual(agoraSP(new Date('2026-11-11T02:30:00Z')), { data: '2026-11-10', min: 23 * 60 + 30 });
});
