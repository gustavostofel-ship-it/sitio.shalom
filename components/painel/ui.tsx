import React from 'react';
import type { Pagamento } from '@/lib/agenda';

// Peças visuais compartilhadas do painel. Cores do site: Folha #1B4332, Mata #0F291E, Papel #F6F3EC, Âmbar #D97706.
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]';

// Campos com 16px no celular: abaixo disso o Safari do iPhone dá zoom a cada toque no campo.
export const campo = `w-full rounded-md border border-[#BDB4A1] bg-white px-3 py-2.5 text-base text-[#1F2937] placeholder:text-stone-500 focus:border-[#1B4332] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]/30 sm:py-2 sm:text-sm`;
export const rotulo = 'block text-[13px] font-medium text-stone-700';
export const botao = `inline-flex items-center justify-center gap-2 rounded-md border border-[#BDB4A1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:border-[#1B4332] hover:text-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 ${foco}`;
export const botaoPri = `inline-flex items-center justify-center gap-2 rounded-md bg-[#1B4332] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#14301F] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 ${foco}`;
export const botaoPerigo = `inline-flex items-center justify-center gap-2 rounded-md border border-[#BDB4A1] bg-white px-3.5 py-2.5 text-sm font-medium text-[#B42318] transition-colors hover:border-[#B42318] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 ${foco}`;

const COR: Record<string, string> = {
  aguardando_sinal: 'bg-[#FBEBC8] text-[#6B3A04]',
  confirmada: 'bg-[#DDEBDD] text-[#1B4332]',
  cancelada: 'bg-[#F6DAD5] text-[#8F2517]',
  expirada: 'bg-[#E4DFD3] text-stone-700',
};
const PONTO: Record<string, string> = { aguardando_sinal: 'bg-[#D97706]', confirmada: 'bg-[#2F7A55]', cancelada: 'bg-[#B42318]', expirada: 'bg-stone-500' };
const NOME: Record<string, string> = { aguardando_sinal: 'Aguardando sinal', confirmada: 'Confirmada', cancelada: 'Cancelada', expirada: 'Expirada' };

export const Pilula = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${COR[status] ?? ''}`}>
    <i className={`h-1.5 w-1.5 rounded-full ${PONTO[status] ?? 'bg-stone-500'}`} />
    {NOME[status] ?? status}
  </span>
);

// Reserva confirmada: o selo mostra a situação do dinheiro (quitada, sinal pago, em parte, sem pagamento).
const PAG: Record<Pagamento, [string, string, string]> = {
  quitada: ['Quitada', 'bg-[#1B4332] text-[#F3EFE6]', 'bg-emerald-300'],
  sinal: ['Sinal pago', 'bg-[#DDEBDD] text-[#1B4332]', 'bg-[#2F7A55]'],
  parcial: ['Pago em parte', 'bg-[#FBEBC8] text-[#6B3A04]', 'bg-[#D97706]'],
  pendente: ['Sem pagamento', 'bg-[#F6DAD5] text-[#8F2517]', 'bg-[#B42318]'],
};
export function PilulaReserva({ status, pag }: { status: string; pag: Pagamento }) {
  if (status !== 'confirmada') return <Pilula status={status} />;
  const [rot, cor, ponto] = PAG[pag];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${cor}`}>
      <i className={`h-1.5 w-1.5 rounded-full ${ponto}`} />
      {rot}
    </span>
  );
}

// Bloco de formulário: título em serifa, texto de apoio e conteúdo.
export function Secao({ titulo, texto, children, className = '' }: { titulo: string; texto?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-[#D2CAB8] bg-white p-4 shadow-[0_1px_2px_rgba(20,48,31,0.08)] sm:p-6 ${className}`}>
      <h2 className="font-serif text-xl text-[#14301F]">{titulo}</h2>
      {texto && <p className="mt-1 max-w-prose text-sm text-stone-600">{texto}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const iniciais = (email: string) => (email.split('@')[0].replace(/[^a-zA-Z]/g, '').slice(0, 2) || '?').toUpperCase();

// Curvas de nível discretas, um toque do terreno do sítio no fundo verde.
export const CURVAS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320' fill='none' stroke='white' stroke-opacity='.07'%3E%3Cg transform='rotate(-18 160 160)'%3E%3Cellipse cx='160' cy='160' rx='34' ry='20'/%3E%3Cellipse cx='160' cy='160' rx='66' ry='42'/%3E%3Cellipse cx='160' cy='160' rx='100' ry='66'/%3E%3Cellipse cx='160' cy='160' rx='136' ry='92'/%3E%3Cellipse cx='160' cy='160' rx='174' ry='120'/%3E%3C/g%3E%3C/svg%3E\")";
