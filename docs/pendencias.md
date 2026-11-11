# Pendências e decisões

Lista viva do que ficou combinado e ainda não foi feito. Atualizado em 09/11/2026.

## Para fazer mais para a frente (combinado com o dono, não esquecer)

1. **Avisos por e-mail e WhatsApp (o push já está pronto).** O **push no iPhone** dos responsáveis foi feito em 11/11/2026 (veja `docs/notificacoes.md`): ele só funciona quando o painel estiver no servidor com `https://`, e **ainda precisa ser testado num iPhone de verdade** depois que o domínio estiver no ar. Falta o que foi combinado para depois: **e-mail** e **WhatsApp** para o dono e para o cliente (avisos do cliente C1 a C10 e da equipe, desenhados em `docs/pagamento-asaas.md`, seção 5.1). O Telegram continua opcional e desligado (faltam `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env`).
2. **Backup automático.** O script de backup agora é seguro (não deixa arquivo vazio, guarda fora do OneDrive, mantém os 30 últimos; no Windows: `scripts/backup.ps1`), mas **ainda roda só quando alguém manda**. Falta agendar no servidor (cron, exemplo em `docs/docker.md`), com cópia **fora do servidor** (snapshot da VPS e/ou nuvem), e um teste periódico de restauração. Sem isso, se o servidor ou o disco falhar, as reservas se perdem.

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
