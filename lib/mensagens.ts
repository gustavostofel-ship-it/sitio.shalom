// Mensagens prontas de WhatsApp para o administrador mandar ao cliente. Sem dependências: roda no navegador.
import { SITE_INFO, LOCAL } from './site-data.ts';

export interface MsgConfig {
  pixChave: string; // chave PIX para receber sinal e saldo
  pixTitular: string; // nome de quem recebe (aparece junto da chave)
  saldoRegra: string; // texto livre sobre quando pagar o saldo (ex.: "O saldo vence 7 dias antes da entrada")
  extras: string; // texto livre no fim das mensagens de confirmação (ex.: o que levar)
}

export interface DadosMsgReserva {
  id: number;
  nome: string;
  igreja: string | null;
  entrada: string;
  saida: string;
  total: number;
  sinal: number;
  pago: number;
  publico: string | null;
  segura_ate: string | null;
}

export type ModeloId = 'pedido' | 'lembrete' | 'confirmada' | 'saldo' | 'quitada' | 'chegada' | 'cancelada' | 'expirada';
export interface Modelo {
  id: ModeloId;
  rotulo: string;
  texto: string;
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const dow = (s: string) => new Date(s + 'T00:00:00Z').getUTCDay();
const dataCompleta = (s: string) => `${DIAS[dow(s)]} ${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`;
const nDias = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5) + 1;
const reais = (v: number) => 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const prazo = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ' às') : '';
const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCAL.endereco)}`;

// Cada mensagem começa cumprimentando pelo nome e se apresentando; termina de forma cordial.
export function modelosReserva(r: DadosMsgReserva, m: MsgConfig, sinalPct: number, capacidade: number, st: string): { sugerido: ModeloId; modelos: Modelo[] } {
  const nome = r.nome && r.nome !== '—' ? r.nome.split(' ')[0] : '';
  const oi = `Olá${nome ? ', ' + nome : ''}! Tudo bem? Aqui é do ${SITE_INFO.name}. 🌿`;
  const igreja = r.igreja && r.igreja !== 'Reserva manual' ? ` (${r.igreja})` : '';
  const datas = `${dataCompleta(r.entrada)} a ${dataCompleta(r.saida)} (${nDias(r.entrada, r.saida)} dias)`;
  const falta = Math.max(0, r.total - r.pago);
  const pix = m.pixChave
    ? `💳 *PIX:* ${m.pixChave}${m.pixTitular ? `\n👤 *Favorecido:* ${m.pixTitular}` : ''}\nDepois é só enviar o comprovante aqui na conversa.`
    : 'Vou te passar por aqui os dados para o pagamento. 😊';
  const extras = m.extras ? `\n\n${m.extras}` : '';
  const fim = '\n\nQualquer dúvida, estou à disposição! 🙏';

  const resumoValores = `💰 *Valor total:* ${reais(r.total)}\n✅ *Recebido:* ${reais(r.pago)}\n📌 *Saldo a pagar:* ${reais(falta)}`;
  const local = `📍 *Endereço:* ${SITE_INFO.address}\n🗺️ Como chegar: ${mapa}`;

  const modelos: Modelo[] = [
    {
      id: 'pedido',
      rotulo: 'Pedido recebido e dados do sinal',
      texto:
        `${oi}\n\nRecebemos o pedido de reserva nº ${r.id}${igreja}:\n\n📅 *Datas:* ${datas}\n` +
        `${r.publico ? `👥 *Público:* ${r.publico}\n` : ''}💰 *Valor total:* ${reais(r.total)}\n` +
        `✅ *Sinal para garantir a data (${sinalPct}%):* ${reais(r.sinal)}\n\n` +
        `${r.segura_ate ? `As datas estão seguradas para vocês até *${prazo(r.segura_ate)}*. ` : ''}Para confirmar a reserva, é só fazer o pagamento do sinal:\n\n${pix}\n\n` +
        `Assim que recebermos, enviamos a confirmação.${fim}`,
    },
    {
      id: 'lembrete',
      rotulo: 'Lembrete do prazo do sinal',
      texto:
        `${oi}\n\nPassando para lembrar que as datas *${datas}* seguem seguradas${r.segura_ate ? ` até *${prazo(r.segura_ate)}*` : ''}.\n\n` +
        `Para garantir a reserva, falta o sinal de *${reais(r.sinal)}*:\n\n${pix}\n\n` +
        `Passado o prazo, precisamos liberar as datas para outras igrejas. Se tiver qualquer imprevisto, me avise que a gente conversa!${fim}`,
    },
    {
      id: 'confirmada',
      rotulo: 'Reserva confirmada (sinal recebido)',
      texto:
        `${oi}\n\n*Reserva confirmada!* ✅🙌 Recebemos o sinal de ${reais(r.pago)}. Obrigado pela confiança!\n\n` +
        `📅 *Datas:* ${datas}\n🕐 Entrada à tarde e saída à tarde\n👥 Até ${capacidade} pessoas\n\n${resumoValores}\n` +
        `${falta > 0 ? `\n${m.saldoRegra || 'O saldo combinamos por aqui, conforme a data se aproxima.'}\n${pix}\n` : ''}\n${local}${extras}\n\nQue Deus abençoe o retiro de vocês! 🙏`,
    },
    {
      id: 'saldo',
      rotulo: 'Cobrar o saldo',
      texto:
        `${oi}\n\nSobre a reserva de *${datas}*, ainda falta o saldo de *${reais(falta)}* (total ${reais(r.total)}, já recebemos ${reais(r.pago)}).\n\n` +
        `${m.saldoRegra ? m.saldoRegra + '\n\n' : ''}${pix}${fim}`,
    },
    {
      id: 'quitada',
      rotulo: 'Pagamento completo (agradecimento)',
      texto:
        `${oi}\n\n*Pagamento completo recebido!* ✅ Obrigado! A reserva de *${datas}* está totalmente quitada (${reais(r.total)}).\n\n` +
        `🕐 Entrada à tarde e saída à tarde\n${local}${extras}\n\nEstamos preparando tudo com carinho para receber vocês. 🙏`,
    },
    {
      id: 'chegada',
      rotulo: 'Orientações de chegada',
      texto:
        `${oi}\n\nFalta pouco para o retiro de vocês! 🎉 A chegada está marcada para *${dataCompleta(r.entrada)}*, à tarde.\n\n${local}\n` +
        `${falta > 0 ? `\nLembrando que ainda falta o saldo de *${reais(falta)}*.\n${pix}\n` : ''}${extras}\n\nAvise por aqui quando estiverem a caminho. Que seja uma bênção! 🙏`,
    },
    {
      id: 'cancelada',
      rotulo: 'Reserva cancelada',
      texto:
        `${oi}\n\nConforme combinamos, a reserva nº ${r.id} das datas *${datas}* foi cancelada e as datas foram liberadas.\n` +
        `${r.pago > 0 ? `\nSobre os ${reais(r.pago)} já recebidos, vamos combinar a devolução conforme as condições combinadas. Me avise a melhor forma por aqui.\n` : ''}` +
        `\nSe quiserem reservar outra data, é só falar. Estamos à disposição! 🙏`,
    },
    {
      id: 'expirada',
      rotulo: 'Prazo do sinal venceu',
      texto:
        `${oi}\n\nO prazo para o sinal da reserva nº ${r.id} (*${datas}*) venceu e as datas foram liberadas para outras igrejas.\n\n` +
        `Se vocês ainda tiverem interesse, me avise que eu confiro a disponibilidade e seguro a data de novo. 😊${fim}`,
    },
  ];

  const sugerido: ModeloId =
    st === 'aguardando_sinal' ? 'pedido' : st === 'confirmada' ? (falta <= 0 ? 'quitada' : 'confirmada') : st === 'cancelada' ? 'cancelada' : st === 'expirada' ? 'expirada' : 'pedido';
  // Só oferece o que faz sentido para a situação da reserva
  const validos: Record<string, ModeloId[]> = {
    aguardando_sinal: ['pedido', 'lembrete'],
    confirmada: falta > 0 ? ['confirmada', 'saldo', 'chegada'] : ['quitada', 'chegada'],
    cancelada: ['cancelada'],
    expirada: ['expirada', 'pedido'],
  };
  const lista = validos[st] ?? ['pedido'];
  return { sugerido, modelos: lista.map((id) => modelos.find((x) => x.id === id)!) };
}
