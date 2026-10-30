-- Banco do agendamento do Sítio Shalom.
-- Roda sozinho na primeira vez que o contêiner do Postgres é criado.

create extension if not exists btree_gist;

-- Preços e regras (uma linha só)
create table agenda_config (
  id          int primary key default 1 check (id = 1),
  base        numeric not null default 7500,     -- preço do pacote base
  min_dias    int     not null default 3,        -- dias do pacote base e mínimo pelo site
  extra       numeric not null default 1500,     -- diária extra
  sinal_pct   int     not null default 20,       -- sinal para segurar a data
  hold_horas  int     not null default 24,       -- quanto tempo a data fica segurada
  capacidade  int     not null default 150,
  max_dias    int     not null default 7,        -- teto de dias pelo site (fora de períodos especiais)
  dias_padrao int[]   not null default '{0,5,6}' -- dias da semana abertos por padrão (0 = domingo)
);
insert into agenda_config (id) values (1);

-- Períodos especiais: pacote fechado (o cliente leva o período inteiro)
create table agenda_periodos (
  id        bigint generated always as identity primary key,
  nome      text    not null,
  entrada   date    not null,
  saida     date    not null,
  preco     numeric not null default 0,
  bloqueado boolean not null default false,      -- true = ninguém reserva (ex.: Natal)
  check (saida >= entrada)
);

-- Escolha do dono para um dia: aberto ou fechado
create table agenda_dias (
  data   date primary key,
  aberto boolean not null,
  motivo text
);

-- Reservas
create table agenda_reservas (
  id         bigint generated always as identity primary key,
  entrada    date    not null,
  saida      date    not null,
  status     text    not null default 'aguardando_sinal'
             check (status in ('aguardando_sinal', 'confirmada', 'cancelada', 'expirada')),
  total      numeric not null,
  sinal      numeric not null,
  pago       numeric not null default 0 check (pago >= 0), -- quanto já foi recebido
  segura_ate timestamptz,
  nome       text    not null,
  igreja     text,
  whatsapp   text    not null,
  publico    text,
  origem     text    not null default 'site',
  criada_em  timestamptz not null default now(),
  check (saida >= entrada),
  -- Duas reservas ativas nunca podem ocupar o mesmo dia
  constraint agenda_sem_sobreposicao
    exclude using gist (daterange(entrada, saida, '[]') with &&)
    where (status in ('aguardando_sinal', 'confirmada'))
);
create index agenda_reservas_datas_idx on agenda_reservas (entrada, saida);

-- Administradores do painel (/painel). A senha é guardada com hash (scrypt).
-- Crie com: docker compose exec app node scripts/criar-admin.mjs email@exemplo.com 'senha-longa'
create table agenda_admins (
  email      text primary key check (email = lower(email)),
  senha_hash text not null,
  criado_em  timestamptz not null default now()
);
