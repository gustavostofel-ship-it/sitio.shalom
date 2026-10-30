import { db } from '@/lib/db';

// Atualizações do banco para quem já tem o sistema instalado. Rodam sozinhas quando o site liga
// e só fazem efeito uma vez (instalações novas já nascem com tudo pelo db/init.sql).
export async function migrar() {
  try {
    // Pagamento: quanto já foi recebido de cada reserva. Quem já estava confirmada tinha o sinal recebido.
    await db().query(`
      do $$ begin
        if not exists (select 1 from information_schema.columns where table_name = 'agenda_reservas' and column_name = 'pago') then
          alter table agenda_reservas add column pago numeric not null default 0 check (pago >= 0);
          update agenda_reservas set pago = sinal where status = 'confirmada';
        end if;
      end $$;
    `);
  } catch (e) {
    console.error('migração do banco:', e);
  }
}
