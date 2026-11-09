import { db } from '@/lib/db';

// Atualizações do banco. Rodam sozinhas quando o site liga e só fazem efeito uma vez:
// tudo aqui é "se não existir" e pode rodar de novo sem problema. Vale para quem já tem o sistema
// instalado e para instalações novas (o db/init.sql cria só a base; o resto nasce daqui).
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

    // Reservas: origem do pedido (guardada só como resumo, nunca o IP em si) e aceite dos termos.
    await db().query(`
      alter table agenda_reservas add column if not exists ip_hash text;
      alter table agenda_reservas add column if not exists aceite_em timestamptz;
      alter table agenda_reservas add column if not exists aceite_versao text;
      create index if not exists agenda_reservas_ip_idx on agenda_reservas (ip_hash, criada_em);
    `);

    // Visitas ao sítio: pedidos do site, agenda e controle.
    await db().query(`
      create table if not exists agenda_visita_config (
        id               int primary key default 1 check (id = 1),
        dias_semana      int[] not null default '{6}',        -- dias da semana com visita (0 = domingo)
        hora_ini         text  not null default '09:00',
        hora_fim         text  not null default '16:00',
        duracao_min      int   not null default 60,
        antecedencia_h   int   not null default 24,           -- quantas horas antes dá para marcar
        horizonte_dias   int   not null default 45            -- até quantos dias à frente aparecem horários
      );
      insert into agenda_visita_config (id) values (1) on conflict (id) do nothing;

      create table if not exists agenda_visita_bloqueios (
        data   date primary key,
        motivo text
      );

      create table if not exists agenda_visitas (
        id            bigint generated always as identity primary key,
        nome          text not null,
        igreja        text,
        whatsapp      text not null,
        publico       text,
        formato       text,
        obs           text,
        data          date,                                   -- vazio = a combinar
        hora          text check (hora is null or hora ~ '^[0-2][0-9]:[0-5][0-9]$'),
        status        text not null default 'pedida'
                      check (status in ('pedida', 'agendada', 'realizada', 'cancelada', 'nao_compareceu')),
        origem        text not null default 'site',
        nota_interna  text,
        ip_hash       text,
        aceite_em     timestamptz,
        aceite_versao text,
        criada_em     timestamptz not null default now(),
        atualizada_em timestamptz not null default now()
      );
      -- Um horário só pode ter uma visita ativa (pedida ou agendada)
      create unique index if not exists agenda_visitas_horario_uq
        on agenda_visitas (data, hora) where data is not null and hora is not null and status in ('pedida', 'agendada');
      create index if not exists agenda_visitas_data_idx on agenda_visitas (data, status);
      create index if not exists agenda_visitas_ip_idx on agenda_visitas (ip_hash, criada_em);
    `);
  } catch (e) {
    console.error('migração do banco:', e);
  }
}
