// Leitura segura do corpo dos pedidos: tamanho limitado e sem caracteres que o banco recusa.
const MAX_BYTES = 8 * 1024;

export async function lerJson(req: Request, max = MAX_BYTES): Promise<Record<string, unknown> | null> {
  const tam = Number(req.headers.get('content-length') ?? 0);
  if (tam > max) return null;
  try {
    // Lê aos poucos para não aceitar corpo enorme sem Content-Length.
    const leitor = req.body?.getReader();
    if (!leitor) return null;
    const partes: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > max) {
        await leitor.cancel();
        return null;
      }
      partes.push(value);
    }
    const texto = Buffer.concat(partes).toString('utf8');
    if (texto.includes('\\u0000') || texto.includes('\u0000')) return null;
    const j = JSON.parse(texto);
    return j && typeof j === 'object' && !Array.isArray(j) ? (j as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
