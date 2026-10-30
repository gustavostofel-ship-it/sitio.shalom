// O Next chama esta função uma vez, quando o servidor liga.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
    const { migrar } = await import('./lib/migrar');
    await migrar();
  }
}
