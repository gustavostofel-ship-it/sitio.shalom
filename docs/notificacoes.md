# Notificações do painel (push no celular)

Guia para quem cuida do sistema. O painel avisa, no celular, cada coisa que acontece: pedido de
reserva, pedido de visita, prazo do sinal acabando e outros. Tudo também fica no histórico da aba
**Notificações**, com os detalhes.

## O que é preciso para funcionar

1. **O painel no servidor, com endereço seguro (`https://`).** No computador local, sem domínio, o
   iPhone não recebe notificações. Elas passam a funcionar quando o Shalom estiver na VPS com domínio.
2. **iPhone com iOS 16.4 ou mais novo**, usando o **Safari**.
3. **O painel instalado na tela inicial** (o iPhone só entrega notificação para aplicativos instalados).

## Como ativar no iPhone (cada pessoa, uma vez)

1. Abra o endereço do painel (`https://seudominio.com.br/painel`) no **Safari** e entre com o seu login.
2. Toque no botão **Compartilhar** (o quadrado com uma seta para cima, na barra de baixo).
3. Toque em **Adicionar à Tela de Início** e depois em **Adicionar**.
4. Feche o Safari e abra o painel pelo **ícone novo** (chamado "Shalom") na tela inicial.
5. Entre na aba **Notificações** e toque em **Ativar avisos neste aparelho**. Quando o iPhone
   perguntar, toque em **Permitir**.
6. Toque em **Enviar notificação de teste**: ela deve aparecer em poucos segundos.

Cada pessoa liga no seu próprio aparelho. Dá para ter vários aparelhos por pessoa.

## Os avisos

Em **Notificações → Quais avisos você quer receber**, cada pessoa liga ou desliga cada aviso. Vale para
a conta dela, em todos os aparelhos dela.

**Pedem uma ação**

| Aviso | Quando chega | O que fazer |
|---|---|---|
| Nova reserva pedida | Assim que um cliente pede uma reserva pelo site | Chamar o cliente no WhatsApp e combinar o sinal |
| Nova visita pedida | Assim que um cliente pede uma visita pelo site | Confirmar o horário pelo WhatsApp e no painel |
| Prazo do sinal acabando | 6 h e 1 h antes de o prazo de um pedido sem sinal vencer | Cobrar o sinal |
| Pedido venceu sem sinal | Quando o prazo acaba e as datas são liberadas | Reativar, se o cliente ainda quiser e as datas estiverem livres |
| Visita sem confirmação | 3 h depois de um pedido de visita não confirmado | Responder o cliente e confirmar |
| Visita chegando | Resumo às 8h nos dias com visita, e 1 h antes de cada visita | Deixar o sítio pronto |
| Visitas para dar baixa | Às 9h, se há visitas passadas sem resultado | Marcar realizada, faltou ou cancelada |
| Saldo a receber | 15 e 3 dias antes da entrada, se falta pagar | Combinar o restante e registrar o valor |
| Cliente chega amanhã | Na véspera da entrada de uma reserva confirmada | Confirmar a chegada e o saldo |

**Só registro (histórico):** reserva confirmada, reserva cancelada, pagamento registrado, visita
confirmada, visita cancelada e visita realizada. Dizem **quem fez e quando**.

Regras importantes:

- Quem faz a ação **não recebe o push da própria ação** (mas ela fica no histórico).
- Os lembretes automáticos só chegam **entre 7h e 21h** (horário de Brasília), para não acordar
  ninguém. Pedidos novos chegam na hora, a qualquer horário.
- Cada aviso chega **uma vez só**, mesmo que o servidor reinicie.
- O número no ícone do aplicativo mostra quantas notificações ainda não foram lidas.
- Tocar numa notificação abre o painel **direto na reserva ou na visita**.

## Problemas comuns

- **Não aparece o botão "Ativar":** no iPhone, falta instalar o painel na tela inicial (passos acima).
  A própria aba mostra a explicação.
- **"As notificações estão bloqueadas":** no iPhone, vá em **Ajustes → Notificações → Shalom** e ligue
  **Permitir notificações**.
- **Parou de chegar:** desative e ative de novo em **Avisos no celular**. Se o aparelho some do serviço
  de push (por exemplo, o app foi apagado), o sistema o remove sozinho.
- **Sem domínio ainda:** o painel avisa que as notificações precisam do endereço `https://`.

## Privacidade

As notificações passam pelos servidores da Apple (ou do Google, no Android), **criptografadas** de
ponta a ponta: só o aparelho consegue ler. Elas citam o nome da igreja e do responsável, então vale
manter o celular com bloqueio de tela.

## Para quem mantém o código

- Tabelas: `agenda_notificacoes` (histórico), `agenda_push_aparelhos`, `agenda_push_desligados` e
  `agenda_push_chaves`. Todas criadas sozinhas por `lib/migrar.ts`.
- As **chaves do site** (VAPID) são geradas na primeira vez e guardadas no banco: não há nada para
  configurar e elas entram no backup. Se o banco for trocado, os aparelhos precisam ativar de novo.
- Catálogo e textos: `lib/notificacoes.ts`. Envio: `lib/notificar.ts`. Lembretes: `lib/agendador.ts`
  (roda a cada minuto, iniciado em `instrumentation.ts`).
- Instalação e recebimento: `public/sw-painel.js`, `app/painel/manifest.webmanifest/route.ts` e
  `lib/push-cliente.ts`.
- Para criar um aviso novo: acrescente o tipo em `lib/notificacoes.ts`, chame `notificar(...)` no lugar
  certo e, se for automático, a regra em `lib/agendador.ts`.
