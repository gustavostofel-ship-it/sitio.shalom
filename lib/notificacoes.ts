// Catálogo e textos das notificações. Sem dependências do servidor: roda no navegador e no servidor.
import { brl, dia } from './agenda.ts';
import { dataBr, DIAS_CURTOS, diaSemanaDe } from './visitas.ts';

export type TipoNotificacao =
  // precisam de uma ação de quem cuida do sistema
  | 'reserva_nova'
  | 'visita_nova'
  | 'reserva_vencendo'
  | 'reserva_expirada'
  | 'visita_sem_resposta'
  | 'visita_proxima'
  | 'visita_baixa'
  | 'reserva_saldo'
  | 'reserva_chegada'
  // histórico: o que aconteceu no sistema
  | 'reserva_confirmada'
  | 'reserva_cancelada'
  | 'reserva_pagamento'
  | 'visita_confirmada'
  | 'visita_cancelada'
  | 'visita_realizada';

export interface InfoTipo {
  rotulo: string;
  grupo: 'acao' | 'historico';
  icone: 'reserva' | 'visita' | 'relogio' | 'dinheiro' | 'chegada' | 'ok' | 'cancela';
  quando: string; // quando o sistema avisa
  fazer: string; // o que a pessoa responsável deve fazer
}

export const TIPOS: Record<TipoNotificacao, InfoTipo> = {
  reserva_nova: { rotulo: 'Nova reserva pedida', grupo: 'acao', icone: 'reserva', quando: 'Assim que um cliente pede uma reserva pelo site.', fazer: 'Chame o cliente no WhatsApp e combine o sinal. As datas ficam seguradas pelo prazo mostrado.' },
  visita_nova: { rotulo: 'Nova visita pedida', grupo: 'acao', icone: 'visita', quando: 'Assim que um cliente pede uma visita pelo site.', fazer: 'Confirme o dia e o horário com o cliente pelo WhatsApp e confirme a visita no painel.' },
  reserva_vencendo: { rotulo: 'Prazo do sinal acabando', grupo: 'acao', icone: 'relogio', quando: '6 horas e 1 hora antes de o prazo de um pedido sem sinal vencer.', fazer: 'Cobre o sinal do cliente. Se ele não pagar, o pedido vence e as datas voltam a ficar livres.' },
  reserva_expirada: { rotulo: 'Pedido venceu sem sinal', grupo: 'acao', icone: 'cancela', quando: 'Quando o prazo do sinal acaba e as datas são liberadas.', fazer: 'Se o cliente ainda quiser as datas e elas estiverem livres, reative o pedido na aba Reservas.' },
  visita_sem_resposta: { rotulo: 'Visita sem confirmação', grupo: 'acao', icone: 'visita', quando: '3 horas depois de um pedido de visita ainda não confirmado.', fazer: 'Responda o cliente pelo WhatsApp e confirme a visita no painel.' },
  visita_proxima: { rotulo: 'Visita chegando', grupo: 'acao', icone: 'visita', quando: 'Resumo às 8h nos dias com visita e um aviso 1 hora antes de cada visita.', fazer: 'Deixe o sítio pronto para receber e confira o contato do cliente.' },
  visita_baixa: { rotulo: 'Visitas para dar baixa', grupo: 'acao', icone: 'ok', quando: 'Às 9h, se houver visitas que já passaram e ainda não foram marcadas.', fazer: 'Abra cada visita e marque se foi realizada, se o cliente não compareceu ou se foi cancelada.' },
  reserva_saldo: { rotulo: 'Saldo a receber', grupo: 'acao', icone: 'dinheiro', quando: '15 dias e 3 dias antes da entrada, se ainda falta receber parte do valor.', fazer: 'Combine o pagamento do restante com o cliente e registre o valor recebido na reserva.' },
  reserva_chegada: { rotulo: 'Cliente chega amanhã', grupo: 'acao', icone: 'chegada', quando: 'Na véspera da entrada de uma reserva confirmada.', fazer: 'Confirme o horário de chegada, o saldo pago e deixe o sítio preparado.' },
  reserva_confirmada: { rotulo: 'Reserva confirmada', grupo: 'historico', icone: 'ok', quando: 'Quando alguém confirma o sinal ou cria uma reserva pelo painel.', fazer: 'Nada: é o registro de quem confirmou e quando.' },
  reserva_cancelada: { rotulo: 'Reserva cancelada', grupo: 'historico', icone: 'cancela', quando: 'Quando alguém cancela uma reserva e libera as datas.', fazer: 'Nada: se houve valor pago, combine a devolução com o cliente.' },
  reserva_pagamento: { rotulo: 'Pagamento registrado', grupo: 'historico', icone: 'dinheiro', quando: 'Quando alguém registra um valor recebido ou quita uma reserva.', fazer: 'Nada: é o registro do pagamento.' },
  visita_confirmada: { rotulo: 'Visita confirmada', grupo: 'historico', icone: 'ok', quando: 'Quando alguém confirma, marca ou remarca uma visita.', fazer: 'Nada: é o registro da confirmação.' },
  visita_cancelada: { rotulo: 'Visita cancelada', grupo: 'historico', icone: 'cancela', quando: 'Quando alguém cancela uma visita.', fazer: 'Nada: o horário voltou a ficar livre.' },
  visita_realizada: { rotulo: 'Visita realizada', grupo: 'historico', icone: 'ok', quando: 'Quando alguém marca uma visita como realizada ou como falta do cliente.', fazer: 'Nada: é o registro do resultado da visita.' },
};
export const LISTA_TIPOS = Object.keys(TIPOS) as TipoNotificacao[];

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  corpo: string;
  ref_tipo: 'reserva' | 'visita' | null;
  ref_id: number | null;
  dados: Record<string, unknown>;
  autor: string | null;
  criada_em: string;
}

export interface Aviso {
  tipo: TipoNotificacao;
  titulo: string;
  corpo: string;
  refTipo?: 'reserva' | 'visita';
  refId?: number;
  dados?: Record<string, unknown>;
  chave?: string; // se já existir um aviso com essa chave, não avisa de novo
  autor?: string | null; // quem fez a ação (não recebe o push da própria ação)
}

export interface DadosReserva {
  id: number;
  nome: string;
  igreja: string | null;
  whatsapp: string;
  entrada: string;
  saida: string;
  total: number;
  sinal: number;
  pago: number;
  segura_ate: string | null;
}
export interface DadosVisita {
  id: number;
  nome: string;
  igreja: string | null;
  whatsapp: string;
  data: string | null;
  hora: string | null;
}

const cliente = (d: { igreja: string | null; nome: string }) => d.igreja || d.nome;
const periodo = (d: DadosReserva) => `${dia(d.entrada)} a ${dia(d.saida)}`;
const quandoVisita = (d: { data: string | null; hora: string | null }) => (d.data && d.hora ? `${DIAS_CURTOS[diaSemanaDe(d.data)]} ${dataBr(d.data)} às ${d.hora}` : 'horário a combinar');
const quem = (autor?: string | null) => (autor ? ` por ${autor.split('@')[0]}` : '');

// Data e hora no horário de Brasília: "11/11 às 14:30".
export function quandoSP(iso: string | Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value])
  );
  return `${p.day}/${p.month} às ${p.hour}:${p.minute}`;
}

// "3 horas", "1 hora", "45 minutos".
export function faltaTexto(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const h = Math.round(min / 60);
  return `${h} ${h === 1 ? 'hora' : 'horas'}`;
}

// Lembretes automáticos só chegam entre 7h e 21h (horário de Brasília), para não acordar ninguém.
export const dentroDaJanelaDeAvisos = (minutosDoDia: number) => minutosDoDia >= 7 * 60 && minutosDoDia < 21 * 60;

export const urlDe = (refTipo?: 'reserva' | 'visita', refId?: number) => (refTipo && refId ? `/painel?abrir=${refTipo}:${refId}` : '/painel?aba=notif');

const dadosR = (d: DadosReserva) => ({ ...d });
const dadosV = (d: DadosVisita) => ({ ...d });

// ---------- Precisam de ação ----------
export const avisoReservaNova = (d: DadosReserva): Aviso => ({
  tipo: 'reserva_nova',
  titulo: `Nova reserva: ${cliente(d)}`,
  corpo: `${periodo(d)} · ${brl(d.total)}. Sinal de ${brl(d.sinal)}. Chame ${d.nome} no WhatsApp para combinar o sinal${d.segura_ate ? `; as datas ficam seguradas até ${quandoSP(d.segura_ate)}` : ''}.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
});
export const avisoVisitaNova = (d: DadosVisita): Aviso => ({
  tipo: 'visita_nova',
  titulo: `Nova visita: ${cliente(d)}`,
  corpo: `Pediu ${quandoVisita(d)}. Confirme com ${d.nome} pelo WhatsApp.`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
});
export const avisoReservaVencendo = (d: DadosReserva, faltaMs: number, marca: '6h' | '1h'): Aviso => ({
  tipo: 'reserva_vencendo',
  titulo: `Prazo do sinal acabando: ${cliente(d)}`,
  corpo: `Faltam cerca de ${faltaTexto(faltaMs)} (vence ${d.segura_ate ? quandoSP(d.segura_ate) : 'em breve'}). ${periodo(d)} · sinal de ${brl(d.sinal)}. Cobre ${d.nome} no WhatsApp.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  chave: `reserva:${d.id}:vence${marca}`,
});
export const avisoReservaExpirada = (d: DadosReserva): Aviso => ({
  tipo: 'reserva_expirada',
  titulo: `Pedido venceu: ${cliente(d)}`,
  corpo: `Sem sinal dentro do prazo. As datas ${periodo(d)} voltaram a ficar livres. Se ${d.nome} ainda quiser, reative em Reservas.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  chave: `reserva:${d.id}:expirada`,
});
export const avisoVisitaSemResposta = (d: DadosVisita, desdeMs: number): Aviso => ({
  tipo: 'visita_sem_resposta',
  titulo: `Visita sem confirmação: ${cliente(d)}`,
  corpo: `Pedido há ${faltaTexto(desdeMs)} e ainda sem resposta (${quandoVisita(d)}). Responda ${d.nome} pelo WhatsApp.`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
  chave: `visita:${d.id}:semresposta`,
});
export const avisoVisitaProxima = (d: DadosVisita): Aviso => ({
  tipo: 'visita_proxima',
  titulo: `Visita em 1 hora: ${cliente(d)}`,
  corpo: `${quandoVisita(d)} com ${d.nome} (WhatsApp ${d.whatsapp}).`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
  chave: `visita:${d.id}:1h`,
});
export const avisoVisitasHoje = (lista: DadosVisita[], data: string): Aviso => ({
  tipo: 'visita_proxima',
  titulo: lista.length === 1 ? 'Hoje tem 1 visita' : `Hoje tem ${lista.length} visitas`,
  corpo: lista.map((v) => `${v.hora} ${cliente(v)}`).join(' · '),
  dados: { visitas: lista },
  chave: `visitas:hoje:${data}`,
});
export const avisoVisitasBaixa = (n: number, data: string): Aviso => ({
  tipo: 'visita_baixa',
  titulo: n === 1 ? '1 visita para dar baixa' : `${n} visitas para dar baixa`,
  corpo: 'Já passaram e ainda não foram marcadas. Abra cada uma e marque se foi realizada, se o cliente não compareceu ou se foi cancelada.',
  dados: { quantidade: n },
  chave: `visitas:baixa:${data}`,
});
export const avisoReservaSaldo = (d: DadosReserva, dias: number, marca: '15d' | '3d'): Aviso => ({
  tipo: 'reserva_saldo',
  titulo: `Saldo a receber: ${cliente(d)}`,
  corpo: `Falta ${brl(d.total - d.pago)} de ${brl(d.total)}. A entrada é em ${dias} ${dias === 1 ? 'dia' : 'dias'} (${dia(d.entrada)}). Combine o pagamento com ${d.nome}.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  chave: `reserva:${d.id}:saldo${marca}`,
});
export const avisoReservaChegada = (d: DadosReserva): Aviso => ({
  tipo: 'reserva_chegada',
  titulo: `Amanhã chega: ${cliente(d)}`,
  corpo: `Entrada ${dia(d.entrada)}, saída ${dia(d.saida)}. ${d.pago >= d.total ? 'Tudo pago.' : `Falta receber ${brl(d.total - d.pago)}.`} Confirme o horário de chegada com ${d.nome}.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  chave: `reserva:${d.id}:chegada1d`,
});

// ---------- Histórico ----------
export const avisoReservaConfirmada = (d: DadosReserva, autor: string | null, manual = false): Aviso => ({
  tipo: 'reserva_confirmada',
  titulo: manual ? `Reserva criada: ${cliente(d)}` : `Reserva confirmada: ${cliente(d)}`,
  corpo: `${periodo(d)} · ${brl(d.total)}. ${manual ? 'Criada' : 'Sinal confirmado'}${quem(autor)}. Recebido: ${brl(d.pago)}.`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  autor,
});
export const avisoReservaCancelada = (d: DadosReserva, autor: string | null): Aviso => ({
  tipo: 'reserva_cancelada',
  titulo: `Reserva cancelada: ${cliente(d)}`,
  corpo: `${periodo(d)}. Cancelada${quem(autor)} e as datas ficaram livres.${d.pago > 0 ? ` Já tinham sido recebidos ${brl(d.pago)}: combine a devolução.` : ''}`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  autor,
});
export const avisoReservaPagamento = (d: DadosReserva, autor: string | null): Aviso => ({
  tipo: 'reserva_pagamento',
  titulo: d.pago >= d.total ? `Reserva quitada: ${cliente(d)}` : `Pagamento registrado: ${cliente(d)}`,
  corpo: `Recebido ${brl(d.pago)} de ${brl(d.total)}${quem(autor)}.${d.pago >= d.total ? ' Tudo pago.' : ` Falta ${brl(d.total - d.pago)}.`}`,
  refTipo: 'reserva',
  refId: d.id,
  dados: dadosR(d),
  autor,
});
export const avisoVisitaConfirmada = (d: DadosVisita, autor: string | null): Aviso => ({
  tipo: 'visita_confirmada',
  titulo: `Visita confirmada: ${cliente(d)}`,
  corpo: `${quandoVisita(d)}${quem(autor)}.`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
  autor,
});
export const avisoVisitaCancelada = (d: DadosVisita, autor: string | null): Aviso => ({
  tipo: 'visita_cancelada',
  titulo: `Visita cancelada: ${cliente(d)}`,
  corpo: `${quandoVisita(d)}${quem(autor)}. O horário voltou a ficar livre.`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
  autor,
});
export const avisoVisitaRealizada = (d: DadosVisita, autor: string | null, faltou: boolean): Aviso => ({
  tipo: 'visita_realizada',
  titulo: faltou ? `Cliente faltou: ${cliente(d)}` : `Visita realizada: ${cliente(d)}`,
  corpo: `${quandoVisita(d)}${quem(autor)}.`,
  refTipo: 'visita',
  refId: d.id,
  dados: dadosV(d),
  autor,
});
