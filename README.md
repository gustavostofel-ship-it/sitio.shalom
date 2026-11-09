# Sítio Shalom Xerém

Site de vendas do sítio, com calendário de datas, pedido de reserva, agenda de visitas e painel interno para quem administra.
Feito em Next.js 16 e Postgres 16, rodando em Docker.

## O que tem aqui

| Endereço | O que é | Quem usa |
|---|---|---|
| `/` | Página de vendas: calendário e pedido de reserva, agendamento de visita, galeria, mapa "Como chegar" e dúvidas | Clientes |
| `/painel` | Painel interno: calendário, reservas, **visitas**, regras e preços, administradores | Quem tem login |
| `/privacidade` e `/termos` | Política de Privacidade e Termos de reserva | Clientes |

O banco guarda tudo (reservas, visitas, preços, administradores). O site continua no ar mesmo se o banco cair, mandando o cliente para o WhatsApp.

## Como rodar

- **No computador** (Docker Desktop): veja [docs/docker.md](docs/docker.md). Resumo: copie `.env.example` para `.env`, preencha as duas senhas e rode `docker compose up -d --build`. O site abre em http://localhost:3200.
- **No servidor (VPS com Easypanel):** use `docker-compose.prod.yml` e leia a seção "Servidor" de [docs/docker.md](docs/docker.md). Leia antes de colocar no ar.

## Testes e qualidade

```bash
npm test        # regras de datas e preço, visitas, segurança, senha e sessão
npm run lint    # verificação de código
```

Com Docker, sem instalar nada: `docker build --target build -t shalom-check .` e depois `docker run --rm shalom-check npm test`.

## Onde mexer

- **Textos e dados do sítio** (telefone, endereço, perguntas frequentes, fotos): `lib/site-data.ts`. As fotos ficam em `public/fotos`.
- **Regras de preço e datas:** no painel, em *Regras e preços* (e o código em `lib/agenda.ts`).
- **Horários de visita:** no painel, em *Visitas → Horários e dias fechados* (e o código em `lib/visitas.ts`).
- **Política de cancelamento** (faixas de devolução do sinal) e **dados da empresa** (razão social e CNPJ): `lib/site-data.ts`, em `POLITICA_CANCELAMENTO` e `EMPRESA`. Mostram nos Termos e na Privacidade.
- **Marca:** `docs/marca` (manual) e `public/brand` (logo).

## Segurança, em resumo

- Login do painel com senha guardada em hash, cookie protegido e bloqueio depois de 8 erros por origem.
- Pedidos de reserva e de visita têm limite por origem (IP), por WhatsApp e no total, campo anti-robô e tempo mínimo no formulário.
- O primeiro administrador do servidor é criado só pelo script (`scripts/criar-admin.mjs`), nunca pela tela.
- Cabeçalhos de segurança e política de conteúdo em `next.config.ts`.

## Pendências e decisões

Veja [docs/pendencias.md](docs/pendencias.md).
