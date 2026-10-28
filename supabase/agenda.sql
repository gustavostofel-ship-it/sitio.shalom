-- Agendamento do Sítio Shalom — banco de dados
-- Cole tudo no Supabase: SQL Editor > New query > Run. É seguro rodar mais de uma vez.

create extension if not exists btree_gist;

-- Preços e regras (uma linha só)
create table if not exists public.agenda_config (
  id          int primary key default 1 check (id = 1),
  base        numeric not null default 7500,   -- preço do pacote base
  min_dias    int     not null default 3,      -- dias do pacote base e mínimo pelo site
  extra       numeric not null default 1500,   -- diária extra
  sinal_pct   int     not null default 20,     -- sinal para segurar a data
  hold_horas  int     not null default 24,     -- quanto tempo a data fica segurada
  capacidade  int     not null default 150,
  max_dias    int     not null default 7,      -- teto de dias pelo site (fora de períodos especiais)
  dias_padrao int[]   not null default '{0,5,6}' -- dias da semana abertos por padrão (0 = domingo)
);
insert into public.agenda_config (id) values (1) on conflict do nothing;

-- Períodos especiais: pacote fechado (o cliente leva o período inteiro)
create table if not exists public.agenda_periodos (
  id        bigint generated always as identity primary key,
  nome      text    not null,
  entrada   date    not null,
  saida     date    not null,
  preco     numeric not null default 0,
  bloqueado boolean not null default false,    -- true = ninguém reserva (ex.: Natal)
  check (saida >= entrada)
);

-- Escolha do dono para um dia: aberto ou fechado
create table if not exists public.agenda_dias (
  data   date primary key,
  aberto boolean not null,
  motivo text
);

-- Reservas
create table if not exists public.agenda_reservas (
  id         bigint generated always as identity primary key,
  entrada    date    not null,
  saida      date    not null,
  status     text    not null default 'aguardando_sinal'
             check (status in ('aguardando_sinal', 'confirmada', 'cancelada', 'expirada')),
  total      numeric not null,
  sinal      numeric not null,
  segura_ate timestamptz,
  nome       text    not null,
  igreja     text,
  whatsapp   text    not null,
  publico    text,
  origem     text    not null default 'site',
  criada_em  timestamptz not null default now(),
  check (saida >= entrada)
);
create index if not exists agenda_reservas_datas_idx on public.agenda_reservas (entrada, saida);

-- Duas reservas ativas nunca podem ocupar o mesmo dia
do $$ begin
  alter table public.agenda_reservas
    add constraint agenda_sem_sobreposicao
    exclude using gist (daterange(entrada, saida, '[]') with &&)
    where (status in ('aguardando_sinal', 'confirmada'));
exception when duplicate_object then null; end $$;

-- Segurança: o site só fala com o banco pelo servidor (chave service_role).
-- Sem nenhuma policy, ninguém de fora lê ou grava nestas tabelas.
alter table public.agenda_config   enable row level security;
alter table public.agenda_periodos enable row level security;
alter table public.agenda_dias     enable row level security;
alter table public.agenda_reservas enable row level security;

-- Exemplos (apague o "--" para usar). Até o painel do administrador ficar pronto,
-- você gerencia estas tabelas em Table Editor.
-- insert into public.agenda_periodos (nome, entrada, saida, preco, bloqueado) values
--   ('Carnaval 2027',   '2027-02-05', '2027-02-10', 25000, false),
--   ('Semana Santa 2027','2027-03-25', '2027-03-28', 10000, false),
--   ('Natal 2026',      '2026-12-24', '2026-12-26', 0,     true),
--   ('Ano Novo 2026/27','2026-12-30', '2027-01-03', 10000, false);
