# Sítio Shalom em Docker (site + banco Postgres)

Dois contêineres: **app** (o site, com o calendário e o painel) e **db** (Postgres 16). Os dados ficam num volume do Docker e sobrevivem a reinícios.

## Primeira vez

1. Abra o **Docker Desktop** e espere ele ficar pronto.
2. Copie `.env.example` para `.env` e preencha `POSTGRES_PASSWORD` e `SESSION_SECRET` (gere cada um com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. Suba tudo:
   ```bash
   docker compose up -d --build
   ```
4. O site abre em **http://localhost:3200** (mude a porta com `APP_PORT` no `.env`).
5. Abra **http://localhost:3200/painel**. Na primeira vez, como ainda não existe nenhum login, a própria tela pede para **criar o primeiro administrador**: digite e-mail e senha (mínimo 10 caracteres), repita a senha e clique em **Criar e entrar**. Pronto, você já entra no painel. Essa tela só aparece enquanto não houver nenhum administrador, e **só no próprio computador** (localhost). No servidor ela nunca aparece: lá o primeiro acesso é criado pelo script (veja "Servidor" abaixo).
   - **Mais pessoas:** no painel, aba **Administradores** (adicionar, trocar senha, remover).
   - **Esqueceu a senha de todos?** Dê dois cliques em `criar-admin.bat` (ou use o comando `docker compose exec app node scripts/criar-admin.mjs seu-email@exemplo.com 'sua-senha-longa'`) para criar um acesso novo ou trocar a senha de um e-mail.
6. No painel, em **Regras e preços**, clique em **Sugerir feriados do ano** e confira datas e preços.

## Dia a dia

| O que fazer | Comando |
|---|---|
| Ligar | `docker compose up -d` |
| Desligar (os dados ficam) | `docker compose down` |
| Ver o que está acontecendo | `docker compose logs -f app` |
| Aplicar mudanças no código | `docker compose up -d --build` |

**Nunca use `docker compose down -v`**: o `-v` apaga o volume e **todos os dados** (reservas, períodos, administradores).

## Cópia de segurança

No Windows (PowerShell):

```bash
powershell -File scripts\backup.ps1
```

No servidor (Linux), usando o compose de produção:

```bash
COMPOSE_FILE=docker-compose.prod.yml sh scripts/backup.sh
```

- Os arquivos ficam em `~/backups-shalom` (no Windows, `%USERPROFILE%\backups-shalom`), **fora da pasta do projeto e do OneDrive**. Os 30 mais recentes são mantidos.
- O arquivo só recebe o nome final se o backup terminou certo. Se o banco estiver parado, o script avisa o erro e **não deixa arquivo vazio**.
- O backup contém **dados de clientes e hashes das senhas**: não compartilhe e guarde uma cópia **fora do servidor**, de preferência criptografada.
- No servidor, agende para rodar todo dia de madrugada (cron: `0 3 * * * cd /caminho/do/projeto && COMPOSE_FILE=docker-compose.prod.yml sh scripts/backup.sh`).

Para restaurar (para tudo se houver qualquer erro, sem deixar o banco pela metade):

```bash
gzip -dc ~/backups-shalom/ARQUIVO.sql.gz | docker compose exec -T db psql -U shalom -d shalom -v ON_ERROR_STOP=1 --single-transaction
```

(No Windows o arquivo é `.sql` puro: `Get-Content ARQUIVO.sql -Raw | docker compose exec -T db psql -U shalom -d shalom -v ON_ERROR_STOP=1 --single-transaction`.)

## Segurança

- O `.env` guarda os segredos e **nunca vai para o GitHub** (já está ignorado).
- O Postgres não é exposto fora do Docker: só o contêiner do site fala com ele.
- A senha do painel é guardada com hash (scrypt) e o login vira um cookie seguro (HttpOnly, SameSite). Há limite de tentativas de senha por IP.
- Para publicar na internet será preciso um domínio e **HTTPS** (por exemplo, o Caddy na frente do site). Sem HTTPS, não coloque o painel na internet.

## Servidor (VPS com Easypanel)

Use o `docker-compose.prod.yml` (não o `docker-compose.yml`): ele **não abre porta para a internet**; quem recebe o público é o proxy do Easypanel, com HTTPS.

1. No Easypanel, crie um serviço **Compose** apontando para o repositório do GitHub, ramo `main`, arquivo `docker-compose.prod.yml`.
2. Na aba **Ambiente**, preencha (os valores ficam só lá, nunca no GitHub):
   - `POSTGRES_PASSWORD` e `SESSION_SECRET` (gere cada um com o comando do `.env.example`);
   - `SITE_URL`: o endereço do site, por exemplo `https://seudominio.com.br`;
   - `PROXY_HOPS=1`.
3. Em **Domínios**, aponte o domínio para o serviço `app`, porta `3000`, com HTTPS. O mesmo endereço mostra o site (`/`) e o painel (`/painel`).
4. Implante. **Antes** de divulgar o endereço, crie o primeiro administrador pelo terminal do serviço `app`:
   ```bash
   node scripts/criar-admin.mjs seu-email@exemplo.com 'sua-senha-longa'
   ```
   (Ou restaure o backup do banco, que já traz os administradores.)
5. Para trazer os dados do computador, restaure o backup no banco do servidor (veja "Cópia de segurança"). O nome do volume muda com o nome do projeto no Easypanel: confira antes de restaurar.

Depois de implantar, confira: o endereço abre, `/painel` pede login, `/robots.txt` e `/sitemap.xml` mostram o seu domínio, e o mapa aparece em "Como chegar".

## Opcional: aviso no Telegram

Preencha `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env` e reinicie (`docker compose up -d`). Cada nova reserva e cada novo pedido de visita do site manda uma mensagem.

## Testes automáticos

```bash
npm test
```

Cobrem as regras de datas e preço, a agenda de visitas, a senha e a sessão e as proteções contra pedidos falsos.
