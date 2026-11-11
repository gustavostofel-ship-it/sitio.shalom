import { db } from '@/lib/db';

// Atualizações do banco. Rodam sozinhas quando o site liga e só fazem efeito uma vez:
// tudo aqui é "se não existir" e pode rodar de novo sem problema. Vale para quem já tem o sistema
// instalado e para instalações novas (o db/init.sql cria só a base; o resto nasce daqui).
// Na primeira subida o banco pode ainda estar criando as tabelas básicas (db/init.sql): tenta de novo
// por até ~1 minuto, em vez de desistir na primeira falha e deixar tabelas faltando até reiniciar.
export async function migrar() {
  for (let tentativa = 1; tentativa <= 20; tentativa++) {
    try {
      await migrarUmaVez();
      return;
    } catch (e) {
      if (tentativa === 20) {
        console.error('migração do banco falhou depois de várias tentativas:', e);
        return;
      }
      console.warn(`migração do banco: tentativa ${tentativa} falhou, tentando de novo em 3 s…`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function migrarUmaVez() {
  {
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
        dias_semana      int[] not null default '{0,1,2,3,4,5,6}', -- dias da semana com visita (0 = domingo); o administrador muda no painel
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
    // Dados que entram nas mensagens de WhatsApp para o cliente (só o painel enxerga; nunca vão para o site público).
    await db().query(`
      create table if not exists agenda_mensagens (
        id          int primary key default 1 check (id = 1),
        pix_chave   text not null default '',
        pix_titular text not null default '',
        saldo_regra text not null default '',
        extras      text not null default ''
      );
      insert into agenda_mensagens (id) values (1) on conflict (id) do nothing;
    `);
    // Visitas: horário próprio por dia da semana e horários soltos fechados pelo administrador.
    await db().query(`
      alter table agenda_visita_config add column if not exists horarios_por_dia jsonb not null default '{}';
      create table if not exists agenda_visita_horas_fechadas (
        data date not null,
        hora text not null check (hora ~ '^[0-2][0-9]:[0-5][0-9]$'),
        primary key (data, hora)
      );
    `);
    // Notificações: histórico de acontecimentos, aparelhos que recebem push e preferências de cada pessoa.
    await db().query(`
      alter table agenda_admins add column if not exists notificacoes_lidas_ate bigint not null default 0;
      -- "Versão" da sessão: subir o número encerra todas as sessões abertas dessa pessoa (sair, trocar senha).
      alter table agenda_admins add column if not exists sessao_versao integer not null default 1;

      create table if not exists agenda_notificacoes (
        id        bigint generated always as identity primary key,
        tipo      text not null,
        titulo    text not null,
        corpo     text not null,
        ref_tipo  text,                      -- 'reserva' ou 'visita'
        ref_id    bigint,
        dados     jsonb not null default '{}',
        autor     text,                      -- e-mail de quem fez a ação (vazio = aconteceu sozinho)
        chave     text unique,               -- evita avisar duas vezes a mesma coisa
        criada_em timestamptz not null default now()
      );
      create index if not exists agenda_notificacoes_criada_idx on agenda_notificacoes (criada_em desc);

      -- Chaves que identificam o site perante o serviço de push (geradas sozinhas na primeira vez)
      create table if not exists agenda_push_chaves (
        id        int primary key default 1 check (id = 1),
        publica   text not null,
        privada   text not null,
        criada_em timestamptz not null default now()
      );

      create table if not exists agenda_push_aparelhos (
        id           bigint generated always as identity primary key,
        email        text not null references agenda_admins (email) on delete cascade,
        endpoint     text not null unique,
        p256dh       text not null,
        auth         text not null,
        agente       text,
        criado_em    timestamptz not null default now(),
        ultimo_envio timestamptz,
        falhas       int not null default 0
      );
      create index if not exists agenda_push_aparelhos_email_idx on agenda_push_aparelhos (email);

      -- Só guarda o que a pessoa DESLIGOU (sem linha = recebe)
      create table if not exists agenda_push_desligados (
        email text not null references agenda_admins (email) on delete cascade,
        tipo  text not null,
        primary key (email, tipo)
      );
    `);

    // Travas no próprio banco (valem mesmo se alguém mexer fora do painel). "not valid" = vale para o que
    // for gravado daqui para frente, sem reclamar de linhas antigas.
    await db().query(`
      do $$ begin
        if not exists (select 1 from pg_constraint where conname = 'agenda_periodos_preco_chk') then
          alter table agenda_periodos add constraint agenda_periodos_preco_chk check (bloqueado or preco > 0) not valid;
        end if;
        if not exists (select 1 from pg_constraint where conname = 'agenda_config_valores_chk') then
          alter table agenda_config add constraint agenda_config_valores_chk check (base > 0 and extra > 0 and min_dias <= max_dias) not valid;
        end if;
        if not exists (select 1 from pg_constraint where conname = 'agenda_reservas_total_chk') then
          alter table agenda_reservas add constraint agenda_reservas_total_chk check (total > 0) not valid;
        end if;
      end $$;
    `);
  }
}
