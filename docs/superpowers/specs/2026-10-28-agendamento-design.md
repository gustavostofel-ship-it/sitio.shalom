# Sistema de agendamento do Sítio Shalom — design

Status: **rascunho para aprovação**. Nada foi construído. Fontes: duas conversas por áudio do dono (transcritas pelo usuário) e as respostas do usuário nesta conversa. O que é proposta nossa está marcado como **[proposta]**.

## Intenção e por quê

O dono aluga o sítio por dias. Hoje o site só recebe um pedido por WhatsApp, com a data em texto livre ("Novembro / Feriado"). O dono quer que o cliente **veja os dias disponíveis, escolha as datas, veja o preço na hora e já pague o sinal** para segurar a data. Isso antecipa a venda e tira do dono o trabalho de conferir datas à mão.

## Objetivos

1. Calendário no site com cada dia **livre**, **fechado** ou **reservado**.
2. O cliente escolhe entrada e saída e vê o total e o sinal.
3. O cliente pede a reserva; ela fica **aguardando sinal**.
4. O dono tem um **painel com login** para ter **controle total**: fechar/abrir datas e dias, criar períodos especiais com preço, ver e confirmar reservas. O que ele muda aparece direto no calendário do cliente.
5. Pagamento do sinal por Asaas na **fase 2**, ligado ao mesmo status, sem refazer a fase 1.

## Não objetivos

- Pagamento do valor total no site (só o sinal de 20%).
- Dia avulso ou 2 dias pelo site: ficam sob consulta por WhatsApp **[proposta]**.
- Vários espaços, vários imóveis, contratos, e-mails automáticos.

## Anti-objetivos (seria falha mesmo funcionando)

- O cliente conseguir reservar menos dias que um período especial.
- Dois clientes com a mesma data confirmada.
- Preço calculado no navegador e aceito pelo servidor sem conferir.
- Dados pessoais de clientes aparecendo no calendário público.

## Regras de negócio (ditas pelo dono)

- Preço base: **3 dias = R$ 7.500**, até 150 pessoas. **Cada dia a mais = R$ 1.500**, em qualquer dia da semana. Exemplos: 4 dias R$ 9.000; 5 dias R$ 10.500.
- Pode alugar **dias de semana**, não só fim de semana (ex.: segunda a quarta).
- **Dia extra:** o cliente pode estender **1 dia antes e 1 dia depois** dos dias abertos (ex.: quinta e segunda, com sexta a domingo abertos), pagando a diária extra de R$ 1.500. Só vale para dias fechados **pelo padrão**. Dias fechados pelo dono, bloqueados ou reservados nunca podem ser escolhidos, e a extensão não vale colada num período especial (que é sempre inteiro).
- Por padrão ficam abertos 3 dias na semana (sexta, sábado, domingo); o dono abre e fecha qualquer dia.
- **Período especial** = pacote fechado: nome, entrada, saída, preço. O cliente leva **o período inteiro**, nunca menos. Exemplos ditos: Semana Santa R$ 10.000; Carnaval de sexta até quarta de cinzas R$ 25.000; Ano Novo R$ 10.000 (entra no dia 30 até domingo). Natal: **bloqueado**.
- Feriados em geral: a pessoa entra um dia antes e sai no domingo, **sem passar de 5 dias**.
- Para reservar, **sinal de 20%** do total.
- Entrada à tarde no primeiro dia, saída à tarde no último.
- O dono precisa poder **criar** novos períodos especiais quando quiser.

## Restrições do projeto atual

- Next.js 15, app de página única (`'use client'`), **sem rotas de API hoje**. `@supabase/supabase-js` já instalado; `.env.local` existe (as chaves o usuário preenche).
- `components/BookingSection.tsx` já tem o formulário (líder, igreja, WhatsApp, formato, público, observações) com data em texto livre e envio por WhatsApp.
- Supabase do projeto: `eocpwpvxcxtnjcydloeu` (já guarda as fotos).
- Estilo de código: menor mudança que resolve tudo (skill ponytail), sem dependência nova sem necessidade, com um teste pequeno nas contas de preço.

## Abordagens consideradas

| | Como funciona | Vantagem | Custo |
|---|---|---|---|
| A. Asaas direto | Site gera o Pix do sinal; ao pagar, o webhook confirma e bloqueia | Totalmente automático | Conta Asaas, chave, webhook e testes antes de ir ao ar |
| B. Pix manual | Site mostra a chave Pix; o dono confirma no painel | Mais simples, sem taxa | Lento; data fica em aberto até o dono conferir |
| **C. Manual primeiro, Asaas depois** (**escolhida pelo usuário**) | Status "aguardando sinal" confirmado no painel; depois o webhook do Asaas passa a confirmar sozinho | Funciona já; Asaas entra sem refazer | Dois passos de entrega |

## Desenho

### Dados (Supabase) **[proposta]**

- `dias_override(data date primary key, aberto boolean)` — escolha do dono para o dia (abrir ou fechar). Sem linha, vale o período ou o padrão.
- `config(chave text primary key, valor jsonb)` — inclui `dias_abertos_padrao` (lista de dias da semana), editável no painel.
- `periodos(id, nome, entrada date, saida date, preco numeric, bloqueado boolean)` — períodos especiais, editáveis pelo dono.
- `reservas(id, entrada date, saida date, status, total numeric, sinal numeric, segura_ate timestamptz, nome, igreja, whatsapp, publico, obs, periodo_id, criada_em)` com `status` em `aguardando_sinal`, `confirmada`, `cancelada`.
- Um dia está **ocupado** se alguma reserva `confirmada`, ou `aguardando_sinal` ainda dentro de `segura_ate`, cobre esse dia. Uma restrição no banco impede duas reservas ativas sobrepostas.

### Preço (uma função pura, testada) **[proposta]**

1. Dias = saída − entrada + 1.
2. Se a faixa toca um período especial: precisa ser **exatamente** o período; o preço é o do período. Se toca parcialmente, é inválido.
3. Senão: mínimo 3 dias; total = 7.500 + (dias − 3) × 1.500.
4. Sinal = 20% do total.
5. O **servidor recalcula** o preço ao gravar; o valor do navegador é só exibição.

### Cliente (site)

Calendário no lugar do campo "Mês ou Data Pretendida". Dias fechados e reservados ficam apagados. Ao escolher entrada e saída aparecem total e sinal. Se a escolha toca um período especial, o calendário seleciona o período inteiro. O envio grava a reserva `aguardando_sinal`, segura a data (**24 horas [proposta]**) e abre o WhatsApp com os dados e a data, como hoje. A leitura pública mostra só o estado de cada dia, sem dados pessoais.

### Escolha de datas (cliente, na primeira tela da página de vendas)

O calendário fica **na primeira tela da página de vendas, abaixo do título**, sem login, sem cadastro e sem senha. Todo o restante da página de vendas atual (vídeo, fotos, o espaço, depoimentos, perguntas frequentes) **permanece como está**; o bloco de agendamento só entra na primeira dobra. Princípios: poucas palavras, nenhum termo técnico, um passo por vez.

- Duas cores no calendário: **disponível** (verde) e **indisponível** (cinza). O cliente não precisa saber se o dia está reservado, fechado ou fora do padrão. Feriado com pacote fechado tem um traço laranja e legenda.
- **Um toque na data de entrada já marca o pacote de 3 dias.** Se o toque cair no fim de um bloco (ex.: o sábado de sexta a domingo), a seleção ajusta para o bloco inteiro. Para mudar a saída, toca em outra data (mínimo 3 dias). Uma frase de instrução acompanha cada momento.
- **Mínimo de 3 dias seguidos:** um dia aberto só aparece como disponível para o cliente se fizer parte de um bloco de pelo menos 3 dias abertos seguidos (ou de um período especial). Blocos menores (ex.: só segunda e terça abertas, com domingo e quarta fechados) aparecem como **fechados** para o cliente. Para o dono, esses dias aparecem **tracejados com a marca "oculto"**, com o motivo.
- **Sempre dá para desfazer:** tocar de novo na entrada **limpa tudo**; tocar na saída **tira só a saída**; tocar noutra data troca a saída (ou vira a nova entrada se for anterior); tocar num dia extra ligado o desliga; tocar num feriado escolhido o desmarca. Há também um botão "Limpar datas" sempre visível acima do calendário.
- Atalhos de fins de semana livres (3) enquanto as datas não estão completas.
- **Dia extra por botões, não por calendário:** depois de escolher, aparece "Quer ficar mais tempo?" com "Chegar 1 dia antes (qui 05/11) + R$ 1.500" e "Sair 1 dia depois (seg 09/11) + R$ 1.500", só quando disponíveis. Ficam fora dos feriados com pacote fechado.
- Resumo ao lado com entrada, saída, linhas de preço, total e sinal. Os campos (nome, igreja, WhatsApp, público) **só aparecem depois que as datas são válidas**.
- Tocar numa data que não dá explica numa frase. No celular o calendário mostra um mês por vez.

### Painel do dono

Área **interna, separada da página de vendas** (rota própria, ex.: `/painel`), com **login** (Supabase Auth). O cliente nunca passa por ela: ele vê as datas disponíveis direto na página de vendas, sem conta nenhuma. **Tudo é definido pelo dono, nada é imposto pelo sistema:** (1) calendário em que ele clica em **qualquer dia** para fechar ou abrir; (2) **bloqueio em intervalo** (de/até): fechar, abrir ou voltar ao padrão, mantendo os dias com reserva; (3) **dias da semana abertos por padrão**, configuráveis (o padrão inicial é sexta a domingo, mas é só um ponto de partida); (4) **períodos especiais** com nome, entrada, saída, preço e "bloqueado", com criar, editar e remover (mudar a entrada leva a saída junto, mantendo a duração; aviso se dois períodos se sobrepõem); (5) lista de reservas com confirmar e cancelar. Toda mudança aparece no calendário do cliente. Protótipo navegável: `docs/superpowers/mockups/agendamento-prototipo.html`.

### Segurança

Gravação de reservas só por rota de servidor com a chave de serviço, que fica fora do navegador. O painel só entra com usuário autenticado; as tabelas têm RLS. O calendário público lê uma view sem dados pessoais.

### Fase 2 — Asaas

A rota de servidor cria a cobrança Pix do sinal; o webhook do Asaas passa a reserva para `confirmada`. Exige conta Asaas e chave, que o usuário fornece pelo `.env`.

### Datas de feriado **[proposta]**

Carnaval, Semana Santa e Corpus Christi seguem a Páscoa. O painel sugere as datas dos próximos anos (cálculo da Páscoa) e o dono só informa o preço e confirma. Nada fica fixo no código.

## Decisões do usuário

- Dias de semana também podem ser alugados.
- Preço: 3 dias R$ 7.500; dia extra R$ 1.500; períodos especiais fechados.
- Dono com controle total, refletido no calendário do cliente.
- Pagamento por gateway tipo Asaas; abordagem **C**.

## Calls nossas (sujeitas a correção)

Mínimo de 3 dias pelo site; dia avulso e 2 dias por WhatsApp. Retenção da data por 24 horas enquanto o sinal não é pago. Padrão de dias abertos: sexta a domingo. Uma tabela de exceções em vez de um calendário completo. Sugestão automática das datas da Páscoa.

## Calls tomadas após a revisão do construtor (nossas, sujeitas a correção)

- **Contagem:** dias inclusivos (sexta a domingo = 3). Cada dia pertence a uma só reserva ativa (sem troca no mesmo dia), salvo o dono decidir o contrário (pergunta 1).
- **Concorrência:** no banco, restrição de exclusão (`btree_gist`) sobre `daterange(entrada, saida, '[]')` para reservas ativas. Antes de gravar, a rota cancela as reservas `aguardando_sinal` com `segura_ate` vencido, na mesma transação (função SQL). Status `expirada` separado de `cancelada`.
- **Fuso:** `America/Sao_Paulo` fixo; não aceita entrada no passado; janela máxima de **18 meses** à frente.
- **Precedência de disponibilidade:** reserva ativa > **escolha do dono para o dia (abrir ou fechar)** > período especial > dias abertos por padrão. O dono tem a última palavra sobre qualquer dia, inclusive abrir um dia dentro de um período bloqueado. Um período especial abre os dias dele mesmo fora do padrão (Carnaval de sexta a quarta). Se o dono fecha um dia dentro de um período, o período inteiro fica indisponível (o cliente só leva o período inteiro). O painel **não deixa fechar** dia coberto por reserva ativa e avisa.
- **Períodos:** por data absoluta, **um por ano**, sem recorrência (resolve a virada do Ano Novo). O painel rejeita períodos sobrepostos e avisa que é preciso recadastrar a cada ano.
- **"Toca um período"** = interseção de dias inclusivos. Reserva que termina no dia anterior à entrada do período **não** toca.
- **Dias de semana:** o cliente seleciona dias contíguos **abertos**, mais no máximo 1 dia extra antes e 1 depois (ver regra de Dia extra); o dono abre os dias de semana que quiser.
- **Dia extra vizinho de dia reservado ou fechado pelo dono:** não está disponível (a extensão precisa encostar nos dias abertos da própria escolha).
- **Preço fora de período:** mínimo 3 dias. O teto de 5 dias vale para feriados sem período cadastrado.
- **Abuso:** no máximo 2 reservas `aguardando_sinal` por WhatsApp, limite simples de requisições por IP, tamanho máximo de campos, cadastro público do Supabase Auth **desligado**, e RLS do painel por usuário específico do dono.
- **Texto e formulário:** o select "Formato de Locação" sai; o campo de público fica; FAQ e textos de "fim de semana fechado" são atualizados.
- **WhatsApp:** depois que a rota responde, o site mostra um botão "Abrir WhatsApp" (evita o bloqueio de pop-up do Safari) e o número da reserva com a hora em que a data deixa de ser segurada.
- **Confirmar após a expiração:** permitido só se a data ainda estiver livre; senão o painel avisa.
- **Cancelar:** libera a data na hora; valores em `numeric(10,2)`.
- **Horários:** entrada à tarde e saída à tarde em todos os períodos, inclusive Carnaval.

## Em aberto — só o dono ou o usuário respondem

1. Dois clientes podem **trocar no mesmo dia** (um sai domingo à tarde, outro entra domingo à tarde), ou o domingo fica só de um?
2. **Máximo de dias** por reserva fora dos feriados (existe um teto?) e, para feriados sem período cadastrado (Corpus Christi, 7 de setembro), vale o preço normal por dias?
3. **Onde o site está hospedado hoje?** A parte de servidor (reservas, painel, Asaas) exige hospedagem com Node, como Vercel.
4. **Fase 1, pagamento do sinal:** qual chave Pix e nome do favorecido aparecem para o cliente?
5. **Aviso de nova reserva:** quem recebe e por qual canal (Telegram, WhatsApp, e-mail)? Sem resposta, só o painel mostra as pendentes.
6. **Desistência com sinal pago:** perde, devolve ou remarca? (Entra só como texto/termos.)
7. **Painel:** só o dono entra, ou mais alguém?

## Status da implementação (2026-10-28)

**Feito e no site:** calendário do cliente na página de vendas, logo abaixo do Hero (`components/AgendaReserva.tsx`), com as regras de datas e preço em `lib/agenda.ts` (9 testes: `npm test`), rotas `GET /api/agenda` e `POST /api/agenda/reservar` (o servidor recalcula o preço e a disponibilidade) e o SQL em `supabase/agenda.sql`. Se o banco não responder, o bloco mostra um convite para o WhatsApp e o resto da página continua normal. Aviso no Telegram é opcional (variáveis `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`).

**Calls tomadas:** sem troca no mesmo dia; teto de 7 dias fora de períodos especiais; janela de reserva de 18 meses; máximo de 2 pedidos aguardando por WhatsApp; data segurada por 24 horas.

**Painel do administrador (feito):** `/painel`, com login do Supabase Auth, fora dos buscadores (noindex). Só entra quem tem usuário no Supabase **e** e-mail na tabela `agenda_admins`; todas as ações passam por `/api/admin`, que confere o login a cada chamada e valida tudo no servidor. Abas: Resumo, Calendário (1, 3 ou 12 meses, reservas em barras, arrastar para selecionar, gaveta lateral), Reservas (filtros e busca) e Regras e preços (preços, dias abertos por padrão, períodos especiais e sugestão de feriados pela Páscoa). O cliente não tem acesso a nada disso.

**Ainda não feito:** confirmação automática do sinal pelo Asaas (fase 2) e limite de requisições por IP.
