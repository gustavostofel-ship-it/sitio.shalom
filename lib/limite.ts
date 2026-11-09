// Freio simples em memória: conta ocorrências por chave dentro de uma janela de tempo.
// Reinicia quando o site reinicia, o que é aceitável para frear tentativa de abuso.
const baldes = new Map<string, { n: number; ate: number }>();

function limpar(agora: number) {
  if (baldes.size < 5000) return;
  for (const [k, v] of baldes) if (v.ate <= agora) baldes.delete(k);
}

// Registra mais uma ocorrência e diz se ainda está dentro do limite (true = pode seguir).
export function dentroDoLimite(chave: string, max: number, janelaMs: number, agora = Date.now()): boolean {
  limpar(agora);
  const b = baldes.get(chave);
  if (!b || b.ate <= agora) {
    baldes.set(chave, { n: 1, ate: agora + janelaMs });
    return true;
  }
  b.n++;
  return b.n <= max;
}

// Só consulta, sem contar (para login: conta apenas as senhas erradas).
export function estourou(chave: string, max: number, agora = Date.now()): boolean {
  const b = baldes.get(chave);
  return !!b && b.ate > agora && b.n >= max;
}

export function contar(chave: string, janelaMs: number, agora = Date.now()) {
  limpar(agora);
  const b = baldes.get(chave);
  if (!b || b.ate <= agora) baldes.set(chave, { n: 1, ate: agora + janelaMs });
  else b.n++;
}

export function zerar(chave: string) {
  baldes.delete(chave);
}
