import { Pool, types } from 'pg';

// Datas voltam como texto "AAAA-MM-DD" (sem fuso) e números como number.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => parseInt(v, 10));

const g = globalThis as unknown as { _pool?: Pool };

export function db(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Banco não configurado (DATABASE_URL).');
  return (g._pool ??= new Pool({ connectionString: url, max: 5 }));
}
