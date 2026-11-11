// Guarda por poucos segundos o resultado de leituras públicas (calendário e horários de visita).
// Assim, muitos visitantes abrindo o site ao mesmo tempo não viram muitas consultas ao banco: o site
// continua rápido e o pequeno pool de conexões não esgota. Qualquer alteração (reserva, visita, painel)
// limpa o cache na hora, e o servidor sempre confere de novo na hora de gravar.
const guardado = new Map<string, { ate: number; valor: unknown }>();
const emVoo = new Map<string, Promise<unknown>>();

export async function lembrar<T>(chave: string, ttlMs: number, ler: () => Promise<T>): Promise<T> {
  const agora = Date.now();
  const g = guardado.get(chave);
  if (g && g.ate > agora) return g.valor as T;
  // Várias pessoas pedindo ao mesmo tempo compartilham uma única consulta.
  const pendente = emVoo.get(chave);
  if (pendente) return pendente as Promise<T>;
  const p = ler()
    .then((valor) => {
      guardado.set(chave, { ate: Date.now() + ttlMs, valor });
      return valor;
    })
    .finally(() => emVoo.delete(chave));
  emVoo.set(chave, p);
  return p;
}

export const limparCache = () => guardado.clear();
