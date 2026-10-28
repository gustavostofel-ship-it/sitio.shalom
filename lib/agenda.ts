// Regras de datas e preço do agendamento. Sem dependências: roda no navegador e no servidor.
// Datas são sempre strings "AAAA-MM-DD".

export interface Cfg {
  base: number; // preço do pacote base
  minDias: number; // dias do pacote base (e mínimo pelo site)
  extra: number; // diária extra
  sinalPct: number;
  holdHoras: number;
  capacidade: number;
  maxDias: number; // teto de dias por reserva fora de períodos especiais
  diasPadrao: number[]; // dias da semana abertos por padrão (0 = domingo)
}
export interface Periodo {
  nome: string;
  entrada: string;
  saida: string;
  preco: number;
  bloqueado: boolean;
}
export interface Faixa {
  entrada: string;
  saida: string;
}
export interface AgendaData {
  hoje: string;
  cfg: Cfg;
  periodos: Periodo[];
  dias: Record<string, boolean>; // escolha do dono para o dia: true = aberto, false = fechado
  ocupadas: Faixa[]; // reservas que seguram datas (sem dados pessoais)
}
export type Status = 'livre' | 'fechado' | 'padrao' | 'reservado' | 'passado';
export type Cotacao =
  | { ok: true; n: number; total: number; sinal: number; linhas: [string, number][]; periodo?: string }
  | { ok: false; erro: string };

const D = (s: string) => new Date(s + 'T00:00:00Z');
export const add = (s: string, n: number) => {
  const d = D(s);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const diff = (a: string, b: string) => Math.round((D(b).getTime() - D(a).getTime()) / 864e5) + 1;
export const dow = (s: string) => D(s).getUTCDay();
export const faixa = (a: string, b: string) => Array.from({ length: Math.max(0, diff(a, b)) }, (_, i) => add(a, i));
export const br = (s: string) => s.slice(8) + '/' + s.slice(5, 7);
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const dia = (s: string) => DIAS[dow(s)] + ' ' + br(s);
export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const periodoDe = (d: string, x: AgendaData) => x.periodos.find((p) => d >= p.entrada && d <= p.saida);

// Reserva ativa > escolha do dono > período especial > dias abertos por padrão
export function statusDia(d: string, x: AgendaData): Status {
  if (x.ocupadas.some((r) => d >= r.entrada && d <= r.saida)) return 'reservado';
  if (d < x.hoje) return 'passado';
  if (d in x.dias) return x.dias[d] ? 'livre' : 'fechado';
  const p = periodoDe(d, x);
  if (p) return p.bloqueado ? 'fechado' : 'livre';
  return x.cfg.diasPadrao.includes(dow(d)) ? 'livre' : 'padrao';
}

function seguidos(d: string, x: AgendaData) {
  let n = 1;
  for (let i = 1, k = add(d, -1); i < 60 && statusDia(k, x) === 'livre'; i++, k = add(k, -1)) n++;
  for (let i = 1, k = add(d, 1); i < 60 && statusDia(k, x) === 'livre'; i++, k = add(k, 1)) n++;
  return n;
}
// O cliente só vê como disponível o dia que faz parte de um bloco de no mínimo `minDias` dias seguidos
// abertos (ou de um período especial). Blocos menores ficam fechados para ele.
export const visivel = (d: string, x: AgendaData) =>
  statusDia(d, x) === 'livre' && (!!periodoDe(d, x) || seguidos(d, x) >= x.cfg.minDias);

export function cotar(a: string, b: string, x: AgendaData): Cotacao {
  const { cfg } = x;
  const erro = (e: string): Cotacao => ({ ok: false, erro: e });
  if (!a || !b || b < a) return erro('Escolha a entrada e a saída.');
  if (a > add(x.hoje, 548)) return erro('Essa data está longe demais. Fale com a gente pelo WhatsApp.');
  const dias = faixa(a, b);
  const n = dias.length;
  const st = dias.map((d) => statusDia(d, x));
  const abertos = st.map((s) => s === 'livre');
  const first = abertos.indexOf(true),
    last = abertos.lastIndexOf(true);
  if (first < 0) return erro(st.includes('reservado') ? 'Essas datas acabaram de ser reservadas por outra pessoa. Escolha outras.' : 'Inclua pelo menos um dia disponível.');
  const meio = dias.slice(first, last + 1).find((d) => statusDia(d, x) !== 'livre');
  if (meio) return erro('O dia ' + br(meio) + ' está indisponível.');
  const ext = [...dias.slice(0, first), ...dias.slice(last + 1)];
  if (first > 1 || n - 1 - last > 1) return erro('Você pode estender no máximo 1 dia antes e 1 dia depois dos dias abertos.');
  if (ext.some((d) => statusDia(d, x) !== 'padrao')) return erro('Um dos dias escolhidos não está disponível.');

  const toca = x.periodos.filter((p) => !(b < p.entrada || a > p.saida));
  if (toca.length) {
    const p = toca[0];
    if (toca.length > 1 || a !== p.entrada || b !== p.saida)
      return erro('O período “' + p.nome + '” só pode ser reservado inteiro: ' + br(p.entrada) + ' a ' + br(p.saida) + '.');
    return { ok: true, n, total: p.preco, sinal: Math.round((p.preco * cfg.sinalPct) / 100), linhas: [[p.nome + ' · ' + n + ' dias', p.preco]], periodo: p.nome };
  }
  if (n < cfg.minDias) return erro('O mínimo são ' + cfg.minDias + ' dias. Para menos dias, fale com a gente pelo WhatsApp.');
  if (n > cfg.maxDias) return erro('Para mais de ' + cfg.maxDias + ' dias, fale com a gente pelo WhatsApp.');
  const mais = n - cfg.minDias;
  const linhas: [string, number][] = [[cfg.minDias + ' dias (pacote base)', cfg.base]];
  if (mais > 0) linhas.push([mais + (mais > 1 ? ' dias extras' : ' dia extra') + ' × ' + brl(cfg.extra), mais * cfg.extra]);
  const total = cfg.base + mais * cfg.extra;
  return { ok: true, n, total, sinal: Math.round((total * cfg.sinalPct) / 100), linhas };
}

// O pacote de `minDias` dias usa só dias abertos; dias fechados entram apenas como extra (1 antes, 1 depois).
const soLivres = (a: string, b: string, x: AgendaData) => faixa(a, b).every((d) => statusDia(d, x) === 'livre');

// Pacote de `minDias` dias que contém o dia tocado, preferindo começar nele.
export function janela(d: string, x: AgendaData): [string, string] | null {
  for (let off = 0; off < x.cfg.minDias; off++) {
    const a = add(d, -off),
      b = add(a, x.cfg.minDias - 1);
    if (soLivres(a, b, x) && cotar(a, b, x).ok) return [a, b];
  }
  return null;
}

// Próximos pacotes livres, para atalhos de um toque.
export function proximas(x: AgendaData, quantas: number): { a: string; b: string; total: number }[] {
  const out: { a: string; b: string; total: number }[] = [];
  for (let i = 0, d = x.hoje; i < 400 && out.length < quantas; i++, d = add(d, 1)) {
    if (!visivel(d, x)) continue;
    const b = add(d, x.cfg.minDias - 1),
      c = cotar(d, b, x);
    if (!c.ok || !soLivres(d, b, x)) continue;
    out.push({ a: d, b, total: c.total });
    d = b;
    i += x.cfg.minDias - 1;
  }
  return out;
}

// ---------- Painel do administrador ----------
export type StatusReserva = 'aguardando_sinal' | 'confirmada' | 'cancelada' | 'expirada';
export interface Reserva {
  id: number;
  entrada: string;
  saida: string;
  status: StatusReserva;
  total: number;
  sinal: number;
  segura_ate: string | null;
  nome: string;
  igreja: string | null;
  whatsapp: string;
  publico: string | null;
  origem: string;
  criada_em: string;
}
export interface PeriodoAdm extends Periodo {
  id: number;
}
export interface AdminData {
  hoje: string;
  agora: string;
  cfg: Cfg;
  periodos: PeriodoAdm[];
  dias: Record<string, { aberto: boolean; motivo: string | null }>;
  reservas: Reserva[];
  admins: { email: string; criado_em: string }[];
  eu: string; // e-mail de quem está logado
}

// A reserva segura as datas se está confirmada, ou aguardando sinal dentro do prazo.
export const segura = (r: Reserva, agora: string) =>
  r.status === 'confirmada' || (r.status === 'aguardando_sinal' && !!r.segura_ate && r.segura_ate > agora);

// Mesma visão que o cliente tem, montada a partir dos dados do painel.
export const paraAgenda = (a: AdminData): AgendaData => ({
  hoje: a.hoje,
  cfg: a.cfg,
  periodos: a.periodos,
  dias: Object.fromEntries(Object.entries(a.dias).map(([d, v]) => [d, v.aberto])),
  ocupadas: a.reservas.filter((r) => segura(r, a.agora)).map(({ entrada, saida }) => ({ entrada, saida })),
});

// Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher)
export function pascoa(ano: number): string {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

// Períodos sugeridos para um ano. O dono confere datas e preços antes de valer.
export function sugerirPeriodos(ano: number, cfg: Cfg): Periodo[] {
  const p = pascoa(ano), cc = add(p, 60), ny = `${ano}-12-30`;
  let domingo = `${ano + 1}-01-01`;
  while (dow(domingo) !== 0) domingo = add(domingo, 1);
  const p5 = (nome: string, entrada: string, saida: string, preco: number, bloqueado = false): Periodo => ({ nome, entrada, saida, preco, bloqueado });
  return [
    p5(`Carnaval ${ano}`, add(p, -51), add(p, -46), 25000),
    p5(`Semana Santa ${ano}`, add(p, -3), p, 10000),
    p5(`Corpus Christi ${ano}`, add(cc, -1), add(cc, 3), cfg.base + 2 * cfg.extra),
    p5(`Ano Novo ${ano}/${String(ano + 1).slice(2)}`, ny, domingo < add(ny, 4) ? domingo : add(ny, 4), 10000),
    p5(`Natal ${ano}`, `${ano}-12-24`, `${ano}-12-26`, 0, true),
  ];
}
