# Pagamento automático do sinal (20%) com Asaas

Documento de estrutura. Ainda **não há código**: aqui estão o fluxo, os cenários e as decisões
que precisam ser tomadas antes de programar. Escrito em 09/11/2026.

## 1. Objetivo

Hoje o cliente pede a reserva no site, as datas ficam seguradas por 24 horas e o sinal é combinado
pelo WhatsApp. Quem confirma é o administrador, clicando em **Confirmar sinal recebido** no painel.

Queremos que o cliente **pague o sinal (20%) sozinho, por Pix ou cartão**, e que a reserva se
confirme **automaticamente** quando o pagamento for aprovado.

## 2. Como o sistema funciona hoje (conferido no código)

| Ponto | Como é hoje |
|---|---|
| Valor do sinal | `sinal_pct` (20%) do total, arredondado. Calculado no servidor em `lib/agenda.ts` (`cotar`) |
| Pedido do cliente | `POST /api/agenda/reservar` grava a reserva com status `aguardando_sinal` e `segura_ate` = agora + `hold_horas` (24 h) |
| Limite de pedidos | No máximo 2 pedidos abertos por WhatsApp |
| Datas duplicadas | O próprio banco impede duas reservas ativas no mesmo dia (`agenda_sem_sobreposicao`) |
| Expiração | Pedido vencido vira `expirada` quando entra um novo pedido; no painel e no calendário, o vencido já é tratado como livre (`segura()` e `statusReal()`) |
| Confirmar | Painel, ação `reserva.status` → `confirmada`, e `pago = max(pago, sinal)` |
| Restante (80%) | Painel registra o "total já recebido" na mão (`reserva.pago`) |
| Cancelar | Painel, ação `reserva.status` → `cancelada`; as datas ficam livres. **Não há reembolso** |
| Banco | Postgres. Tabelas novas entram por `lib/migrar`, que roda quando o servidor liga |

## 3. Como vai ficar (caminho feliz)

1. O cliente escolhe as datas e preenche nome, WhatsApp e **CPF ou CNPJ**.
2. O servidor grava a reserva (`aguardando_sinal`, datas seguradas) **e cria a cobrança no Asaas** do valor do sinal.
3. O cliente vai para a **página de pagamento do próprio Asaas** (link da cobrança), onde escolhe Pix ou cartão.
4. O cliente paga. O Asaas avisa o nosso servidor por **webhook** (aviso automático).
5. O servidor confere o pagamento direto na API do Asaas e marca a reserva como `confirmada`, com `pago = sinal`.
6. O administrador recebe o aviso no Telegram (já existe) e vê a reserva confirmada no painel.

Por que a página do Asaas e não um formulário nosso: os dados do cartão nunca passam pelo nosso
servidor, o que elimina o maior risco de segurança e reduz muito o trabalho.

## 4. Cenários e o que o sistema deve fazer

### Pagamento
| # | Cenário | O que fazer |
|---|---|---|
| 1 | Pix pago dentro do prazo | Evento `PAYMENT_RECEIVED` → confirmar a reserva |
| 2 | Cartão aprovado | `PAYMENT_CONFIRMED` → confirmar a reserva (o dinheiro cai depois; `PAYMENT_RECEIVED` só concilia) |
| 3 | Mesmo evento chega duas vezes | Guardar o id do pagamento do Asaas (único) e ignorar repetição |
| 4 | Eventos chegam fora de ordem | Decidir pelo **estado atual consultado na API**, não pela ordem de chegada |
| 5 | Cliente paga duas vezes | A segunda cobrança paga vira alerta ao administrador e **estorno** |
| 6 | Valor pago diferente do sinal | Não confirmar sozinho; alerta ao administrador |
| 7 | Cartão recusado | A cobrança continua aberta; o cliente pode tentar de novo até o prazo |
| 8 | Chargeback (contestação do cartão) | Alerta ao administrador; marcar a reserva para revisão. Não cancelar sozinho |

### Prazo e datas
| # | Cenário | O que fazer |
|---|---|---|
| 9 | Cliente não paga e o prazo vence | Reserva vira `expirada`, datas livres e **cobrança cancelada no Asaas** (o link antigo para de funcionar) |
| 10 | Pagamento chega **depois** do prazo e as datas continuam livres | Reativar a reserva e confirmar |
| 11 | Pagamento chega depois do prazo e **outra pessoa já reservou** as datas | **Não confirmar.** Alerta ao administrador e estorno ao cliente |
| 12 | Dois clientes pedem as mesmas datas ao mesmo tempo | Já resolvido hoje (trava no banco). Só quem gravou primeiro recebe a cobrança |
| 13 | Administrador cancela antes do pagamento | Cancelar também a cobrança no Asaas. Se o cliente pagar mesmo assim, cai no cenário 11 |

### Cancelamento e dinheiro
| # | Cenário | O que fazer |
|---|---|---|
| 14 | Administrador cancela reserva **já paga** | Pergunta no painel: **cancelar e estornar** ou **só cancelar** (sem devolver). Política de devolução a definir (ver seção 7) |
| 15 | Cliente pede para mudar as datas | Cancelar a reserva e criar outra; o sinal pago pode ser reaproveitado pelo administrador (decisão manual) |
| 16 | Restante (80%) | Continua manual no painel. A estrutura já nasce preparada para várias cobranças por reserva, e gerar o link do saldo pode vir numa segunda etapa |
| 17 | Reserva criada manualmente pelo administrador | Sem cobrança. Opção futura: botão "gerar link de pagamento" |
| 18 | Cliente perdeu o link | Botão no painel **Reenviar link de pagamento** (abre o WhatsApp com o link) |

### Falhas técnicas
| # | Cenário | O que fazer |
|---|---|---|
| 19 | Asaas fora do ar ao criar a cobrança | Não gravar a reserva sem cobrança. Mostrar "tente de novo ou fale pelo WhatsApp" |
| 20 | Nosso servidor fora do ar quando o webhook chega | O Asaas **para de enviar depois de 15 falhas seguidas** e guarda os eventos por até 14 dias. Por isso precisamos de uma **conferência periódica** (cenário 21) |
| 21 | Webhook perdido | Rotina a cada poucos minutos: para cada reserva `aguardando_sinal` com cobrança, perguntar ao Asaas se foi paga |
| 22 | Webhook falso (alguém tenta enganar) | Validar o token configurado no webhook **e** confirmar consultando o pagamento na API do Asaas pelo id antes de confirmar |
| 23 | Resposta lenta ao webhook | Responder `200` na hora e processar em seguida (timeout derruba a fila) |
| 24 | Erro ao gravar a confirmação | Fazer tudo numa transação; se falhar, devolver erro para o Asaas tentar de novo |

## 5. Mudanças necessárias no sistema

**Banco** (nova migração em `lib/migrar`)
- Tabela `agenda_pagamentos`: `id`, `reserva_id`, `asaas_id` (único), `tipo` (sinal ou saldo), `forma`, `valor`, `status`, `link`, `criado_em`, `pago_em`, `dados_asaas` (cópia do retorno, para auditoria).
- Colunas de cliente na reserva: CPF/CNPJ (o Asaas pede para cadastrar o cliente) e `asaas_cliente_id`.

**Servidor**
- `POST /api/agenda/reservar`: depois de gravar, cria cliente e cobrança no Asaas e devolve o link.
- `POST /api/pagamento/webhook`: recebe os avisos do Asaas (token, idempotência, consulta de confirmação).
- Rotina de conferência (cenário 21), iniciada em `instrumentation.ts` ou por tarefa agendada do servidor.
- Cancelar reserva (painel) passa a cancelar a cobrança; opção de estorno.

**Site**
- Formulário com CPF/CNPJ e mensagem nova: "Pague o sinal para confirmar".
- Depois de reservar, o cliente vai para a página de pagamento; ao voltar, vê "Estamos aguardando a confirmação do pagamento".

**Painel**
- Status do pagamento em cada reserva, histórico de pagamentos, **Reenviar link** e **Cancelar e estornar**.

**Configuração (variáveis do servidor, nunca no GitHub)**
- `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `ASAAS_AMBIENTE` (`sandbox` ou `producao`). Chaves de teste e de produção são diferentes.

## 5.1 Notificações

Três públicos, cada um com seus canais:

| Quem | Canais | Para quê |
|---|---|---|
| **Responsáveis do sítio** (administradores do painel) | **Push** no celular (painel instalado na tela inicial do iPhone) | Avisos de trabalho: o que precisa de atenção |
| **Dono** | **E-mail e WhatsApp** | Acompanhar e ter comprovante |
| **Cliente** (quem alugou) | **E-mail e WhatsApp** | Saber em que pé está a reserva e quanto falta pagar |

Todo aviso passa por **uma fila no banco** (`agenda_avisos`): é gravado, enviado, e se o canal falhar o
sistema tenta de novo. Assim nenhum aviso se perde e fica o histórico do que foi enviado a quem.

### Avisos para o cliente (e-mail + WhatsApp)

| # | Quando | O que diz |
|---|---|---|
| C1 | Pedido feito | "Recebemos seu pedido." Datas, total, **sinal de R$ X (20%)**, **prazo para pagar** e o link de pagamento |
| C2 | Faltando pouco para vencer o prazo (ex.: 6 h antes) | "Sua data será liberada às HH:MM se o sinal não for pago." Link de pagamento |
| C3 | Sinal pago | "**Sinal confirmado.** Sua reserva está garantida." Datas, valor pago, **saldo restante** e quando pagar |
| C4 | Prazo venceu sem pagar | "Liberamos as datas." Convite para fazer um novo pedido |
| C5 | Antes da entrada (ex.: 15 e 3 dias) | Lembrete do saldo, se houver, com o valor e como pagar |
| C6 | Saldo pago (reserva quitada) | "**Pagamento total confirmado.**" Resumo e comprovante |
| C7 | Pouco antes do evento (ex.: 7 e 1 dia) | Lembrete com data, horário de chegada e orientações do sítio |
| C8 | Reserva cancelada | Aviso do cancelamento e, se houver devolução, o valor e o prazo |
| C9 | Estorno feito | "Devolvemos R$ X." |
| C10 | Pagamento recebido com problema (tardio sem datas, duplicado) | Explicação e o que será feito (estorno), com contato da equipe |

### Avisos para o dono (e-mail + WhatsApp) e responsáveis (push)

| # | Quando | Push | E-mail | WhatsApp |
|---|---|---|---|---|
| R1 | Nova reserva (aguardando sinal) | sim | sim | opcional |
| R2 | **Sinal pago, reserva confirmada** | sim | sim | sim |
| R3 | Reserva quitada (total pago) | sim | sim | opcional |
| R4 | Reserva expirada sem pagamento | sim | não | não |
| R5 | Reserva cancelada | sim | sim | opcional |
| R6 | **Pagamento tardio sem datas livres, duplicado, valor errado ou contestação do cartão** | **sim** | **sim** | **sim** |
| R7 | Falha técnica (webhook parado, Asaas fora do ar, conferência falhando) | sim | sim | não |
| R8 | Resumo do dia (reservas e valores a receber) | não | sim | não |

Quais avisos cada responsável recebe, e por qual canal, fica configurável no painel (tela **Responsáveis**).
Os avisos R6 vão sempre por todos os canais.

### Regras de cada canal

- **Push:** o painel vira um app instalável (PWA). Cada responsável abre o painel no Safari, toca em
  *Compartilhar → Adicionar à Tela de Início* e permite notificações. No iPhone isso só funciona assim
  (iOS 16.4 ou mais novo). Exige HTTPS, portanto só depois da VPS com domínio.
- **E-mail:** envio pelo Resend, com o domínio do sítio verificado (para não cair em spam).
- **WhatsApp (API oficial da Meta):** exige conta comercial verificada, número exclusivo e **modelos de
  mensagem aprovados** pela Meta. Cada aviso C1 a C10 e R1 a R8 é um modelo, escrito com variáveis
  ({nome}, {datas}, {valor}). A aprovação leva alguns dias. Há custo por mensagem, a confirmar na tabela da Meta.
- **Consentimento (LGPD):** o formulário passa a ter uma caixinha "Aceito receber avisos da minha reserva
  por WhatsApp e e-mail". Sem ela não se envia.
- Os avisos de pagamento só saem **depois** de o servidor confirmar o pagamento na API do Asaas, nunca
  só pelo aviso recebido.

## 5.2 Reembolsos e estornos

> Esta seção reúne o que foi pesquisado. **Não é parecer jurídico.** A política de cancelamento e os
> termos do site precisam ser revisados por um advogado antes de entrar no ar.

### Regras do Asaas (documentação oficial)

- **Pix:** aceita estorno **total** ou **vários parciais**; a soma não pode passar do valor recebido.
- **Cartão:** estorno vale para cobrança recebida ou confirmada; o valor sai do **saldo da conta Asaas**
  e a cobrança é cancelada no cartão do cliente.
- **As taxas da cobrança não voltam no estorno.** Estornar o valor cheio logo depois de receber pode dar
  erro 400 se a conta não tiver saldo para cobrir a diferença. Ou seja: **cada devolução total custa a
  taxa para o sítio**, e a conta Asaas precisa ter saldo.
- **Eventos (webhook):** `PAYMENT_REFUND_IN_PROGRESS` (agendado, ainda não feito), `PAYMENT_REFUNDED`
  (concluído), `PAYMENT_PARTIALLY_REFUNDED` (parcial) e, para contestação do cartão,
  `PAYMENT_CHARGEBACK_REQUESTED`, `PAYMENT_CHARGEBACK_DISPUTE` e `PAYMENT_AWAITING_CHARGEBACK_REVERSAL`.
- O estorno do cartão pode demorar (uma fonte secundária fala em até 10 dias) e aparece na fatura do
  cliente conforme o banco. O prazo do Pix para devolver também tem limite (regra do Banco Central de
  90 dias, **a confirmar no Asaas**).
- **A confirmar no sandbox ou com o suporte do Asaas:** se a taxa do cartão volta no estorno; o que
  acontece com saldo insuficiente; se o estorno de cartão antes do dinheiro cair também usa saldo.

### O que a lei brasileira pede (resumo da pesquisa)

- **Direito de arrependimento (CDC, art. 49):** em contratação **pela internet**, o cliente pode
  desistir em **7 dias corridos** e receber **tudo de volta**, sem desconto, de imediato. A orientação
  mais comum dos tribunais aplica isso a reservas de hospedagem feitas online. **Não achei decisão
  específica sobre aluguel de sítio por temporada**, então o caminho seguro é **oferecer os 7 dias**.
- **Decreto 7.962/2013 (comércio eletrônico):** o site precisa dar informações claras (preço, o que
  está incluso, política de cancelamento), **confirmar imediatamente o recebimento do pedido** e permitir
  desistir **pelo mesmo meio** da compra, com **confirmação imediata** do pedido de desistência.
- **Depois dos 7 dias:** o sinal é "arras" no Código Civil (arts. 417 a 420). O que vale é o que está
  escrito no contrato. Reter tudo sem regra clara, ou reter além do razoável, pode ser considerado
  **abusivo** e o juiz pode reduzir (CC art. 413 e CDC). Por isso a política precisa ser **escrita, com
  faixas por prazo**, aceita pelo cliente antes de pagar.
- **Se o sítio cancelar** a reserva (e não o cliente): devolver tudo, e o contrato deve dizer o que mais
  se paga. Em arras, quem recebeu e desiste costuma devolver em dobro (a confirmar com o advogado).

### Política de cancelamento (proposta para vocês decidirem)

| Quando o cliente cancela | Devolução do sinal |
|---|---|
| Até **7 dias depois do pedido** (arrependimento) | **100%**, sem desconto |
| Depois, com **mais de 60 dias** para a entrada | exemplo: 80% |
| Entre **30 e 60 dias** | exemplo: 50% |
| **Menos de 30 dias** | exemplo: 0% (ou crédito para remarcar) |
| **O sítio cancela** | **100%**, mais o que o contrato definir |

Os percentuais são só exemplo. Quem define é o dono, com o advogado. O sistema calcula o valor
**sugerido** pela data, e o administrador pode ajustar com motivo registrado.

### Como o sistema faz o estorno

1. O administrador clica em **Cancelar e estornar** na reserva. Vê o valor sugerido pela política, pode
   ajustar (com motivo obrigatório) e confirma. Só o **administrador principal** pode estornar.
2. Em uma transação: a reserva vira `cancelada` (as datas já ficam livres, sem esperar o estorno) e
   grava-se um **pedido de estorno** em `agenda_estornos` (valor, motivo, quem pediu, status).
3. O servidor chama o Asaas. O estorno passa por `solicitado` → `em_andamento` → `concluido` ou
   `falhou`, atualizado pelos eventos do webhook **e** pela conferência periódica.
4. O valor "recebido" da reserva passa a ser **soma dos pagamentos menos soma dos estornos** (calculado,
   não digitado à mão). O painel mostra o histórico.
5. Os avisos de estorno saem para cliente e equipe (tabela abaixo).

### Cenários de reembolso (continuação da seção 4)

| # | Cenário | O que fazer |
|---|---|---|
| 25 | Duplo clique ou pedido repetido de estorno | Bloquear: soma dos estornos nunca passa do valor pago, e o botão fica desativado enquanto há estorno em andamento |
| 26 | O Asaas não responde (tempo esgotado) ao pedir o estorno | **Não repetir às cegas.** Marcar como "desconhecido" e conferir no Asaas antes de tentar de novo |
| 27 | Saldo insuficiente na conta Asaas | Estorno fica `pendente`. Alerta crítico à equipe pedindo para colocar saldo. Cliente é avisado de que está em andamento |
| 28 | Estorno falhou ou foi recusado | Alerta crítico. Reserva continua cancelada, com a marca **estorno pendente** no painel |
| 29 | Passou o prazo para estornar pelo Pix ou pelo cartão | Devolução **manual** (transferência) e registro no sistema como "estorno manual", com comprovante e quem fez |
| 30 | Cliente pagou mais de uma vez (sinal e saldo) | O estorno é dividido entre os pagamentos, do mais recente para o mais antigo, respeitando o valor de cada um |
| 31 | Estorno parcial | Permitido (Pix e cartão); a reserva continua cancelada ou confirmada conforme escolha do administrador |
| 32 | Contestação do cartão (chargeback) | Marcar a reserva como **contestada**, alerta crítico, juntar provas (aceite dos termos, e-mails e mensagens enviados, datas) e responder no painel do Asaas dentro do prazo. O valor é descontado enquanto durar |
| 33 | Pix devolvido pelo banco do cliente (fraude ou erro) | Tratar como o cenário 32: alerta e revisão (mecanismo do Banco Central, a confirmar com o Asaas) |
| 34 | Cliente exerce o arrependimento (até 7 dias) | Estorno **integral** automático depois da confirmação do pedido pela página "Minha reserva" |
| 35 | O sítio cancela uma reserva já paga | Estorno integral sugerido, aviso especial ao cliente com pedido de desculpas e opção de remarcar |
| 36 | Cobrança do cliente com CPF diferente do pagador | O Pix volta para a conta de quem pagou. Registrar isso no pedido de estorno |
| 37 | Reserva quitada e estornada depois | Estorno do saldo e do sinal conforme a política; recibo é cancelado |

### Página "Minha reserva" (recomendada)

Link pessoal, enviado por e-mail e WhatsApp, onde o cliente vê: situação da reserva, o que falta pagar
(com o botão de pagar), a política de cancelamento e o botão **Desistir da reserva** (arrependimento
nos 7 dias). Isso cumpre o decreto do comércio eletrônico (desistir pelo mesmo meio, com confirmação
imediata) e evita ligações de cliente perdido.

### Avisos de reembolso

| # | Quando | Quem recebe | Canais |
|---|---|---|---|
| E1 | Cancelamento registrado | Cliente | e-mail + WhatsApp: valor a devolver, forma e prazo estimado |
| E2 | Estorno solicitado ou em andamento | Cliente | e-mail + WhatsApp |
| E3 | Estorno concluído | Cliente | e-mail + WhatsApp: valor devolvido e onde aparece (conta do Pix ou fatura do cartão) |
| E4 | Estorno atrasado ou com problema | Cliente | e-mail + WhatsApp: "estamos resolvendo", com contato |
| E5 | Pedido de desistência (7 dias) recebido | Cliente | e-mail na hora (confirmação imediata exigida pelo decreto) |
| R9 | Estorno concluído | Responsáveis | push + e-mail |
| R10 | **Estorno pendente (saldo insuficiente) ou falhou** | Responsáveis e dono | **push + e-mail + WhatsApp** |
| R11 | **Contestação do cartão aberta** | Responsáveis e dono | **push + e-mail + WhatsApp** |
| R12 | Prazo para estornar pelo Pix está acabando | Responsáveis | push + e-mail |

### Mudanças técnicas extras

- Tabela `agenda_estornos`: `id`, `reserva_id`, `pagamento_id`, `valor`, `motivo`, `solicitado_por`, `status`, `asaas_ref`, `criado_em`, `concluido_em`, `manual` (sim ou não), `comprovante`.
- `pago` da reserva deixa de ser digitado: passa a ser calculado pelos pagamentos e estornos (a digitação manual continua só para o saldo pago fora do sistema, como registro).
- Registro de auditoria: quem pediu, quando, valor e motivo. Nenhum estorno some do histórico.
- Antes de estornar, o sistema consulta o **saldo da conta Asaas** e avisa se não cobre.
- O aceite da política de cancelamento (data, hora e versão do texto) é gravado junto com a reserva.

## 6. Pontos que dependem do ambiente

- **O webhook precisa de endereço público com HTTPS.** No computador local não existe. Para testar antes da VPS usamos o **ambiente de testes (sandbox) do Asaas** com um túnel temporário, ou simulamos o aviso. Em produção, a VPS com domínio.
- Conta Asaas: o cadastro e a aprovação dos documentos são feitos por vocês.
- Confirmar no sandbox: se o CPF/CNPJ é obrigatório em Pix e cartão, a validade do QR Code do Pix e os eventos exatos de cada forma de pagamento.

## 7. Decisões de vocês (em aberto)

1. **Política de cancelamento e devolução** (seção 5.2): confirmar os 7 dias de arrependimento com 100%, definir as faixas depois disso e o que acontece se o sítio cancelar. **Revisar com advogado.**
1b. **Quem pode estornar** (sugestão: só o administrador principal) e se o sítio **absorve a taxa** nas devoluções (nos 7 dias a lei exige devolver tudo).
1c. **Saldo na conta Asaas** para cobrir estornos: quem coloca e qual valor mínimo manter.
1d. **Página "Minha reserva"** com o botão **Desistir da reserva**: entra na primeira versão?
2. **Prazo para pagar.** Hoje são 24 h. Com pagamento automático vale encurtar (por exemplo 2 a 6 h) para não segurar a data à toa? Ou manter 24 h?
3. **Cartão:** aceitar parcelado? (Sugestão: só à vista no sinal, porque a taxa parcelada é maior.)
4. **Taxa do cartão:** absorver ou repassar? (Em R$ 3.000, o cartão custa de R$ 90 a R$ 150 e o Pix quase nada.)
5. **Pagamento tardio sem datas livres:** estornar automaticamente ou avisar o administrador primeiro? (Sugestão: avisar primeiro, no começo.)
6. **Responsáveis e avisos** (seção 5.1): quem é o dono e quem são os responsáveis, com e-mail, WhatsApp e iPhone de cada um.
7. **Textos dos avisos ao cliente** (C1 a C10): revisar o tom e as informações antes de enviar para aprovação da Meta.
8. **Domínio e número de WhatsApp exclusivo** do negócio.
9. **Lembretes por tempo:** quantas horas antes do prazo (C2), quantos dias antes do saldo (C5) e da chegada (C7).

## 8. Etapas de trabalho

0. Decidir a seção 7 e abrir a conta Asaas (sandbox primeiro).
1. Banco: tabela de pagamentos e campos novos.
2. Criar cobrança ao reservar (sandbox) e página de pagamento.
3. Webhook e conferência periódica.
4. Painel: status, reenviar link, estorno, cancelamento com cobrança.
5. Testes de ponta a ponta com todos os cenários da seção 4 no sandbox.
6. Produção: VPS, domínio, HTTPS, chave de produção e primeiro pagamento real de valor baixo.

## 9. Testes obrigatórios antes de ligar em produção

Cenários 1, 2, 3, 5, 9, 10, 11, 13, 14, 20 e 21 no sandbox, mais: duas pessoas reservando as mesmas
datas ao mesmo tempo, webhook repetido e webhook com token errado.

## Fontes consultadas

Documentação oficial do Asaas: autenticação, cobranças, webhooks, fila pausada, estorno de cobrança
(`docs.asaas.com/reference/estornar-cobranca`) e eventos de cobrança (`docs.asaas.com/docs/webhook-para-cobrancas`).
Direito de arrependimento e hospedagem: IDEC, jus.com.br e decisões do TJDF. Decreto 7.962/2013 (Senado e Câmara).
Arras (Código Civil, arts. 417 a 420), cláusula penal abusiva (CC art. 413 e CDC). As taxas estão no
comparativo enviado separadamente; confirme sempre nas páginas oficiais.

Pontos marcados "a confirmar" não foram encontrados em fonte oficial e devem ser testados no sandbox
do Asaas ou esclarecidos com o suporte deles e com o advogado.
