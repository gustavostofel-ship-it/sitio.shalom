export type Resposta = { ok?: boolean; erro?: string; [k: string]: unknown };
// Faz uma ação no servidor e recarrega os dados. Devolve { ok } ou { erro } em português.
export type Chamar = (acao: string, corpo?: object) => Promise<Resposta>;
export type Gaveta = { tipo: 'reserva'; id: number } | { tipo: 'dias'; a: string; b: string } | null;
