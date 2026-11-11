# Guia para o desenvolvedor (deploy e manutenção)

Tudo o que você precisa para subir o Sítio Shalom na VPS e manter o sistema. Leia este arquivo inteiro uma vez; depois use como consulta.

## 1. O que é o sistema

Um único aplicativo web que faz duas coisas no mesmo endereço:

| Endereço | O que é | Quem usa |
|---|---|---|
| `/` | Página de vendas do sítio: calendário de datas, pedido de reserva, agendamento de visita, galeria, mapa | Clientes (igrejas) |
| `/painel` | Painel interno: notificações, calendário, reservas, visitas, regras e preços, administradores | A equipe do sítio (login) |
| `/privacidade`, `/termos` | Páginas legais | Clientes |
| `/api/*` | API usada pelas telas acima | Interno |

**Não há pagamento online.** O sinal de 20% é combinado e recebido manualmente (WhatsApp/PIX) e registrado pelo administrador no painel. Isso foi uma decisão do dono: não implemente gateway.

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Aplicação | **Next.js 16** (App Router, saída `standalone`), **React 19**, **TypeScript 5.9** |
| Estilo | **Tailwind CSS 4** |
| Banco de dados | **PostgreSQL 16** (imagem `postgres:16-alpine`) |
| Acesso ao banco | `pg` direto (SQL escrito à mão, sempre parametrizado). **Não há ORM** |
| Execução | **Docker** (Node 22 alpine) e **Docker Compose** |
| Hospedagem alvo | **VPS com Easypanel** (proxy Traefik com HTTPS) |
| Notificações push | `web-push` (Web Push/VAPID), painel instalável (PWA) no iPhone |
| Testes | `node --test` (sem framework), ESLint |

Serviços externos (nenhum exige chave): vídeo da home no **Supabase Storage** (link público), mapa do **Google Maps** (iframe), fontes do **Google Fonts** (baixadas **na hora do build**, então o build precisa de internet). Telegram é opcional.

## 3. O que é o banco de dados (em poucas palavras)

O **PostgreSQL** é o programa que guarda os dados do sistema: reservas, visitas, preços, períodos especiais, administradores e notificações. Ele roda num contêiner próprio (`db`) e **só o contêiner do site (`app`) consegue falar com ele**; a porta 5432 não é aberta para fora.

Os dados ficam num **volume Docker** chamado `dados` (pasta `/var/lib/postgresql/data` dentro do contêiner). Apagar o volume apaga tudo.

> **Nunca rode `docker compose down -v`.** O `-v` apaga o volume do banco. Para reiniciar, use `docker compose up -d` ou o botão do Easypanel.

### Como as tabelas nascem

1. **`db/init.sql`**: roda **uma única vez**, quando o volume está vazio. Cria as tabelas-base (`agenda_config`, `agenda_periodos`, `agenda_dias`, `agenda_reservas`, `agenda_admins`) e a trava que impede duas reservas nas mesmas datas.
2. **`lib/migrar.ts`**: roda **toda vez que o app liga** (`instrumentation.ts`). Só faz coisas do tipo "se não existir" (idempotente): colunas novas, tabelas de visitas, notificações e push, e constraints. **Todo ajuste de banco novo entra aqui**, nunca editando o `init.sql` (que não roda de novo em banco existente). Tenta de novo por ~1 minuto se o banco ainda estiver subindo.

### Tabelas

| Tabela | Para que serve |
|---|---|
| `agenda_config` | Uma linha só: preço base, dias do pacote, dia extra, % do sinal, horas que a data fica segurada, capacidade, máx. de dias, dias abertos por padrão |
| `agenda_periodos` | Feriados/períodos especiais (pacote fechado, preço próprio ou bloqueado) |
| `agenda_dias` | Dias abertos ou fechados à mão pelo dono |
| `agenda_reservas` | Reservas (`aguardando_sinal`, `confirmada`, `cancelada`, `expirada`), valor total, sinal e quanto já foi pago |
| `agenda_visita_config`, `agenda_visita_bloqueios`, `agenda_visitas` | Agenda de visitas ao sítio |
| `agenda_admins` | Logins do painel (senha em hash scrypt; `sessao_versao` invalida sessões antigas) |
| `agenda_notificacoes` | Histórico de avisos do painel |
| `agenda_push_chaves`, `agenda_push_aparelhos`, `agenda_push_desligados` | Chaves VAPID (geradas sozinhas na primeira vez), aparelhos que recebem push e preferências |

Regras importantes que **vivem no banco** (não só no código):
- `agenda_sem_sobreposicao` (exclusion constraint com `btree_gist`): duas reservas ativas **nunca** ocupam o mesmo dia.
- Índice único em `agenda_visitas (data, hora)` para visita ativa: um horário só tem uma visita.
- Checks de preço (`preco > 0` salvo bloqueado, `total > 0`, `min_dias <= max_dias`).

### Fuso horário

O Postgres roda em **UTC**. Toda regra de "hoje" e de horário comercial usa **America/Sao_Paulo**, calculada no código (`hojeSP()` em `lib/agenda-server.ts`, `agoraSP()` em `lib/visitas.ts`). Não use `current_date` do banco para regras de negócio.

## 4. Estrutura do repositório

```
app/                 Páginas e API (Next.js App Router)
  page.tsx             página de vendas
  painel/              painel interno (tela única, cliente)
  api/agenda/          calendário público e criação de reserva do cliente
  api/visitas/         pedido de visita do cliente e horários livres
  api/formulario/      "ficha" anti-robô assinada pelo servidor
  api/admin/           login, logout, setup e a API do painel (route.ts com todas as ações)
  api/saude/           teste de saúde (usado pelo Docker)
components/          Telas (a pasta painel/ é o painel interno)
lib/                 Regras de negócio, banco, segurança, notificações
  agenda.ts            regras de datas e preço (roda no navegador e no servidor)
  visitas.ts           regras de horários de visita
  agendador.ts         lembretes automáticos (roda a cada minuto dentro do app)
  migrar.ts            migrações do banco (rodam ao ligar)
  *.test.ts            testes automáticos
db/init.sql          criação inicial do banco
scripts/             backup (.sh e .ps1) e criação de administrador
docs/                documentação (este guia, docker, notificações, auditoria, pendências)
docker-compose.yml        uso no computador de desenvolvimento
docker-compose.prod.yml   uso no servidor (Easypanel)
Dockerfile                imagem do site (3 etapas, usuário sem privilégio)
```

Detalhes de cada assunto: [docker.md](docker.md) (Docker, backup, servidor), [notificacoes.md](notificacoes.md) (push e tipos de aviso), [auditoria-2026-11-11.md](auditoria-2026-11-11.md) (revisão de segurança e o que falta), [pendencias.md](pendencias.md).

## 5. Variáveis de ambiente

Nunca vão para o GitHub. No servidor, preencha na aba **Ambiente** do Easypanel. Modelo: `.env.example`.

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `POSTGRES_PASSWORD` | sim | Senha do banco |
| `SESSION_SECRET` | sim | Assina o cookie de login (mínimo 32 caracteres). **Se trocar, todo mundo é deslogado** |
| `SITE_URL` | sim no servidor | Endereço público, ex.: `https://seudominio.com.br`, sem barra no fim. **Entra no site na hora do build** (veja seção 7) |
| `PROXY_HOPS` | sim no servidor | Quantos proxies há na frente do app (Easypanel/Traefik = `1`). Define de onde sai o IP real de quem acessa (limites anti-abuso). Se errar, os limites por IP ficam inúteis ou todos dividem o mesmo limite |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | não | Aviso no Telegram (opcional, desligado) |
| `LIMITE_RESERVAS_IP`, `LIMITE_RESERVAS_ABERTAS`, `LIMITE_VISITAS_IP`, `LIMITE_VISITAS_ABERTAS` | não | Limites contra pedidos falsos (padrões 3, 12, 3, 30) |
| `VAPID_SUBJECT` | não | Contato do serviço de push (padrão: o `SITE_URL`) |

Gerar um segredo forte: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 6. Rodar no computador

```bash
cp .env.example .env        # preencha POSTGRES_PASSWORD e SESSION_SECRET
docker compose up -d --build
# site em http://localhost:3200 (a porta vem de APP_PORT)
docker compose exec app node scripts/criar-admin.mjs email@exemplo.com 'senha-com-10-ou-mais-caracteres'
```

Sem Docker: precisa de um Postgres 16 e `DATABASE_URL`; depois `npm ci && npm run dev`.

Verificações antes de subir qualquer mudança:

```bash
npm test          # 49 testes de regras, segurança, senha, sessão
npm run lint
npx tsc --noEmit
npm run build
```
Sem instalar nada: `docker build --target build -t shalom-check .` e `docker run --rm shalom-check npm test`.

## 7. Subir na VPS (Easypanel)

Use **`docker-compose.prod.yml`** (não o `docker-compose.yml`). Diferenças: o app **não publica porta** (só o proxy do Easypanel o enxerga), `SITE_URL` e `PROXY_HOPS` são obrigatórios, e há healthcheck.

1. Easypanel → novo serviço **Compose**, repositório do GitHub, ramo **`main`**, arquivo `docker-compose.prod.yml`.
2. Aba **Ambiente**: `POSTGRES_PASSWORD`, `SESSION_SECRET`, `SITE_URL`, `PROXY_HOPS=1`.
3. **Domínios**: aponte o domínio para o serviço **`app`**, porta **3000**, com HTTPS (certificado automático). Um domínio só serve `/` e `/painel`.
4. Implante.
5. **Antes de divulgar o endereço**, crie o primeiro administrador no terminal do serviço `app`:
   ```bash
   node scripts/criar-admin.mjs email@exemplo.com 'senha-longa'
   ```
   (Pela tela, o primeiro administrador só pode ser criado em `localhost`; no servidor é só pelo script, de propósito.)
6. Confira: o site abre, `/painel` pede login, `/robots.txt` e `/sitemap.xml` mostram o seu domínio, `/api/saude` responde `{"ok":true}`, o mapa aparece em "Como chegar".

Pontos de atenção:
- **`SITE_URL` entra no HTML durante o build** (ARG no `Dockerfile`, repassado pelo compose). Isso permite páginas estáticas em cache (site rápido). Se mudar o domínio, **faça novo build/deploy**, não basta reiniciar. Se o Easypanel não repassar a variável ao build, confira o `og:url` no HTML da home.
- **Rode uma única réplica do `app`.** O limitador de pedidos, o cache curto e o **agendador de lembretes** (`lib/agendador.ts`, a cada minuto, dentro do próprio processo) vivem em memória. Duas réplicas duplicariam os lembretes e dividiriam os limites.
- O volume do banco tem o nome do projeto no Easypanel como prefixo; confira o nome antes de restaurar um backup.
- `https://` é obrigatório para as notificações no iPhone (e para o cookie `Secure`). O proxy deve enviar `X-Forwarded-Proto` (Traefik envia).
- Primeira subida: o healthcheck do banco usa TCP (`pg_isready -h 127.0.0.1`), então o app só inicia depois do `init.sql` terminar. A migração ainda tenta de novo sozinha se precisar.

## 8. Rotina de atualização (Git)

- **`main` é a branch que vai para produção.** Toda alteração entra por Pull Request e é revisada/juntada no `main`.
- Fluxo: nova branch (`feat/...` ou `fix/...`) → commits → Pull Request → `main` → redeploy no Easypanel (manual ou por webhook do Easypanel, a configurar).
- Mudou algo do banco? Coloque em `lib/migrar.ts` (idempotente). Ela roda sozinha no próximo deploy.
- Não há CI configurada ainda. Rode os 4 comandos da seção 6 antes de abrir o PR.

## 9. Backup e restauração

Scripts em `scripts/` (`backup.sh` para Linux/servidor, `backup.ps1` para Windows). Geram o arquivo só se o `pg_dump` terminou certo, guardam os 30 mais recentes em `~/backups-shalom` (fora da pasta do projeto). **O backup contém dados de clientes e hashes de senha**: proteja e guarde cópia fora do servidor.

```bash
COMPOSE_FILE=docker-compose.prod.yml sh scripts/backup.sh
# restaurar (para tudo se der qualquer erro, sem deixar o banco pela metade):
gzip -dc ~/backups-shalom/ARQUIVO.sql.gz | docker compose exec -T db psql -U shalom -d shalom -v ON_ERROR_STOP=1 --single-transaction
```

**Pendente:** agendar o backup todo dia (cron de exemplo em `docs/docker.md`), enviar cópia para fora da VPS e testar uma restauração periodicamente. Sem isso, falha de disco = perda das reservas.

## 10. Segurança em resumo (o que já existe)

- Login com senha em hash **scrypt**; cookie `painel` assinado (HMAC), `HttpOnly`, `SameSite=Strict`, `Secure` em https. Sessões se encerram ao sair ou trocar a senha (`sessao_versao`). Criar/remover administrador e trocar senha exige a senha atual.
- Limites de tentativa de login por IP e por e-mail; limites de pedidos públicos por IP (IPv6 agrupado em /64), por WhatsApp e no total; campo-isca e "ficha" assinada contra robôs.
- Corpo das requisições limitado, datas validadas, SQL sempre parametrizado, texto de clientes escapado.
- Cabeçalhos de segurança e CSP em `next.config.ts` (se mudar o endereço do vídeo no Supabase, atualize o CSP também).
- Push só para serviços de navegador conhecidos (Apple, Google, Mozilla, Microsoft).
- O zoom do site está **bloqueado de propósito** (decisão do dono); não "corrija" sem falar com ele.

## 11. Checklist antes de divulgar

- [ ] Domínio apontado e `SITE_URL` preenchido; HTTPS funcionando
- [ ] Primeiro administrador criado pelo script
- [ ] Backup agendado + cópia fora da VPS + restauração testada
- [ ] Advogado revisou `/privacidade` e `/termos`; preencher `POLITICA_CANCELAMENTO` e `EMPRESA` em `lib/site-data.ts`
- [ ] Feriados de 2027 cadastrados no painel (Regras e preços → Sugerir feriados)
- [ ] Teste completo: pedido de reserva e de visita pelo site, confirmação no painel, notificação no iPhone (painel instalado na tela inicial, iOS 16.4+)
- [ ] Confirmar que só existe **uma** réplica do `app`

## 12. Pendências conhecidas

Veja [pendencias.md](pendencias.md) e a seção de itens baixos da [auditoria](auditoria-2026-11-11.md). Resumo: avisos por e-mail e WhatsApp (só push existe hoje), backup automático, teste do push num iPhone real depois de `https`, e cerca de 30 itens menores (textos, dependências, LGPD de retenção de dados antigos).
