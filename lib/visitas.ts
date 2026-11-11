// Regras da agenda de visitas ao sítio. Sem dependências: roda no navegador e no servidor.
// Datas são "AAAA-MM-DD" e horas são "HH:MM", sempre no horário de Brasília.

export interface VisitaCfg {
  diasSemana: number[]; // 0 = domingo
  horaIni: string;
  horaFim: string;
  duracaoMin: number;
  antecedenciaH: number; // quantas horas antes ainda dá para marcar
  horizonteDias: number; // até quantos dias à frente aparecem horários
}

export type StatusVisita = 'pedida' | 'agendada' | 'realizada' | 'cancelada' | 'nao_compareceu';

export interface Visita {
  id: number;
  nome: string;
  igreja: string | null;
  whatsapp: string;
  publico: string | null;
  formato: string | null;
  obs: string | null;
  data: string | null;
  hora: string | null;
  status: StatusVisita;
  origem: string;
  nota_interna: string | null;
  criada_em: string;
  atualizada_em: string;
}

export interface DiaVisita {
  data: string;
  horas: { hora: string; livre: boolean }[];
}

export const NOME_STATUS_VISITA: Record<StatusVisita, string> = {
  pedida: 'Aguardando confirmação',
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  nao_compareceu: 'Não compareceu',
};

// Visita que ocupa um horário na agenda.
export const ocupaHorario = (s: StatusVisita) => s === 'pedida' || s === 'agendada';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
export const horaValida = (h: unknown): h is string => typeof h === 'string' && HORA.test(h);
export const horaParaMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
export const minParaHora = (m: number) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

const dataParaDias = (s: string) => Math.floor(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5);
const somaDias = (s: string, n: number) => new Date((dataParaDias(s) + n) * 864e5).toISOString().slice(0, 10);
const diaDaSemana = (s: string) => new Date(dataParaDias(s) * 864e5).getUTCDay();

// Agora, em Brasília: data e minutos desde a meia-noite.
export function agoraSP(d = new Date()): { data: string; min: number } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(d)
      .map((x) => [x.type, x.value])
  );
  return { data: `${p.year}-${p.month}-${p.day}`, min: (+p.hour % 24) * 60 + +p.minute };
}

// Horários de um dia de visita, conforme a configuração (ex.: 09:00, 10:00 ... 15:00).
export function horariosDoDia(cfg: VisitaCfg): string[] {
  const out: string[] = [];
  const fim = horaParaMin(cfg.horaFim);
  for (let m = horaParaMin(cfg.horaIni); cfg.duracaoMin > 0 && m + cfg.duracaoMin <= fim; m += cfg.duracaoMin) out.push(minParaHora(m));
  return out;
}

export interface Contexto {
  agora: { data: string; min: number };
  bloqueios: Set<string>; // datas fechadas para visita
  ocupados: Set<string>; // "AAAA-MM-DD|HH:MM" com visita pedida ou agendada
  emReserva: (data: string) => boolean; // o sítio está alugado nesse dia
}

// Dias e horários que o cliente pode escolher (ocupados aparecem com livre = false).
export function diasComHorarios(cfg: VisitaCfg, c: Contexto): DiaVisita[] {
  const horas = horariosDoDia(cfg);
  const limite = dataParaDias(c.agora.data) * 1440 + c.agora.min + cfg.antecedenciaH * 60;
  const dias: DiaVisita[] = [];
  for (let i = 0; i <= cfg.horizonteDias; i++) {
    const data = somaDias(c.agora.data, i);
    if (!cfg.diasSemana.includes(diaDaSemana(data)) || c.bloqueios.has(data) || c.emReserva(data)) continue;
    const doDia = horas
      .filter((h) => dataParaDias(data) * 1440 + horaParaMin(h) >= limite)
      .map((hora) => ({ hora, livre: !c.ocupados.has(`${data}|${hora}`) }));
    if (doDia.length) dias.push({ data, horas: doDia });
  }
  return dias;
}

// O horário escolhido existe, está livre e dentro das regras?
export function horarioDisponivel(cfg: VisitaCfg, c: Contexto, data: string, hora: string): boolean {
  return diasComHorarios(cfg, c).some((d) => d.data === data && d.horas.some((h) => h.hora === hora && h.livre));
}

// Confere uma configuração enviada pelo painel. Devolve a mensagem do problema, ou null se está tudo certo.
export function erroDaConfig(c: Partial<VisitaCfg>): string | null {
  if (!Array.isArray(c.diasSemana) || !c.diasSemana.every((x) => Number.isInteger(x) && x >= 0 && x <= 6)) return 'Dias da semana inválidos.';
  if (!horaValida(c.horaIni) || !horaValida(c.horaFim)) return 'Informe as horas no formato 09:00.';
  if (horaParaMin(c.horaFim) <= horaParaMin(c.horaIni)) return 'A hora final precisa ser depois da inicial.';
  if (!Number.isInteger(c.duracaoMin) || c.duracaoMin! < 15 || c.duracaoMin! > 480) return 'A duração vai de 15 minutos a 8 horas.';
  if (!Number.isInteger(c.antecedenciaH) || c.antecedenciaH! < 0 || c.antecedenciaH! > 720) return 'Antecedência inválida.';
  if (!Number.isInteger(c.horizonteDias) || c.horizonteDias! < 1 || c.horizonteDias! > 365) return 'O período mostrado vai de 1 a 365 dias.';
  return null;
}

export const dataBr = (s: string) => s.slice(8, 10) + '/' + s.slice(5, 7);
export const DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const DIAS_LONGOS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const diaSemanaDe = diaDaSemana;
export const dataMais = somaDias;
