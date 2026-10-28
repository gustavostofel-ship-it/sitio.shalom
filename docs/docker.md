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
5. Abra **http://localhost:3200/painel**. Na primeira vez, como ainda não existe nenhum login, a própria tela pede para **criar o primeiro administrador**: digite e-mail e senha (mínimo 10 caracteres), repita a senha e clique em **Criar e entrar**. Pronto, você já entra no painel. Essa tela só aparece enquanto não houver nenhum administrador; depois disso ela nunca mais funciona, por segurança.
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

```bash
sh scripts/backup.sh
```

Gera `backups/shalom-AAAA-MM-DD-HHMM.sql`. Guarde uma cópia **fora deste computador** (nuvem ou pendrive). Para restaurar numa instalação limpa:

```bash
docker compose exec -T db psql -U shalom -d shalom < backups/ARQUIVO.sql
```

## Segurança

- O `.env` guarda os segredos e **nunca vai para o GitHub** (já está ignorado).
- O Postgres não é exposto fora do Docker: só o contêiner do site fala com ele.
- A senha do painel é guardada com hash (scrypt) e o login vira um cookie seguro (HttpOnly, SameSite). Há limite de tentativas de senha por IP.
- Para publicar na internet será preciso um domínio e **HTTPS** (por exemplo, o Caddy na frente do site). Sem HTTPS, não coloque o painel na internet.

## Opcional: aviso no Telegram

Preencha `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env` e reinicie (`docker compose up -d`). Cada nova reserva do site manda uma mensagem.

## Testes automáticos

```bash
npm test
```

Cobrem as regras de datas e preço, a senha e a sessão.
