# Pendências e decisões

Lista viva do que ficou combinado e ainda não foi feito. Atualizado em 09/11/2026.

## Para fazer mais para a frente (combinado com o dono, não esquecer)

1. **Avisos de novo pedido (reserva e visita).** Hoje ninguém é avisado: só aparece no painel. O Telegram já está pronto no código, mas **não está ligado** (faltam `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env`). A ideia desejada é mais completa: aviso por **push no celular** dos responsáveis (painel instalado na tela inicial do iPhone), **e-mail** e **WhatsApp** para o dono e para o cliente, com o responsável escolhido no painel. O desenho dessa ideia está em `docs/pagamento-asaas.md`, seção 5.1 (os avisos do cliente C1 a C10 e da equipe R1 a R8).
2. **Backup automático.** Hoje o backup é **manual** (`sh scripts/backup.sh`). Falta uma rotina automática (por exemplo, todo dia de madrugada), com cópia **fora do servidor** (snapshot da VPS e/ou nuvem), e um teste periódico de restauração. Sem isso, se o servidor ou o disco falhar, as reservas se perdem.

## Antes de colocar no ar

- Definir o **domínio** e preencher `SITE_URL` no servidor (veja `docs/docker.md`).
- Criar o primeiro administrador pelo script no servidor, antes de divulgar o endereço.
- Revisar com um **advogado** os textos de `/privacidade` e `/termos`.
- Preencher `POLITICA_CANCELAMENTO` (faixas de devolução do sinal depois dos 7 dias) e `EMPRESA` (razão social e CNPJ) em `lib/site-data.ts`. Enquanto estiver vazio, os Termos dizem que valem as condições combinadas por escrito antes do pagamento.
- Cadastrar no painel os **períodos especiais** de 2027 (Carnaval, Semana Santa, Corpus Christi etc.): *Regras e preços → Sugerir feriados do ano*, e conferir os preços. Sem isso, essas datas saem pelo preço normal.

## Decisões tomadas

- Os 7 dias da semana ficam abertos por padrão no calendário.
- O zoom da página continua bloqueado, como está.
- **Pagamento automático (gateway) fora de escopo:** o sinal segue manual (combinado por WhatsApp e confirmado no painel). O estudo ficou em `docs/pagamento-asaas.md`, só para o caso de voltar ao assunto. As partes sobre política de cancelamento e avisos continuam úteis.
- Shalom só roda no computador por enquanto. O projeto no Vercel foi excluído.

## Ideias futuras (sem pressa)

- Desafio anti-robô do Cloudflare Turnstile nos formulários, se os pedidos falsos continuarem mesmo com os limites atuais.
- Página "Minha reserva" para o cliente acompanhar o pedido e desistir em 7 dias.
- Lembretes automáticos de prazo e de chegada ao cliente.
