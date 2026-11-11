# Auditoria completa do sistema: 11/11/2026

Revisão do código (branch `feat/notificacoes`, commit `a92d8e2`) feita por **três revisores
independentes** (segurança, regras de negócio e telas/infraestrutura) mais **testes práticos de ataque e de
falha** feitos pelo próprio autor com o sistema rodando. Nada do projeto foi alterado pela auditoria, e os
dados de teste foram apagados.

Legenda: **[Confirmado]** = reproduzido na prática · **[Código]** = visto no código por pelo menos um
revisor, sem reprodução · **[Regressão]** = defeito introduzido por mudanças recentes.

## Resumo

| Gravidade | Quantidade |
|---|---|
| Alta (corrigir antes de publicar) | 8 |
| Média | 31 |
| Baixa | cerca de 30 (agrupadas abaixo) |

Não há falha crítica: sem injeção de SQL, sem forma de entrar no painel sem senha, sem segredo no Git.
O que mais pesa é **abuso do formulário público**, **travar o site com um pedido**, **telas que perdem o
que a pessoa digitou** e **backup/instalação no servidor**.

## ALTA

> **Atualização de 11/11/2026 (branch fix/auditoria-altos):** os itens ALTA A1, A2, A3, A4, A5, A6 e A8 (marcados com ✅) foram corrigidos e testados. O A7 (zoom bloqueado) foi mantido de propósito, por decisão do dono. A2: a ficha anti-robô agora é emitida e assinada pelo servidor e IPv6 é contado por bloco /64; o teto global de pedidos continua existindo.

| # | Problema | Onde | Como foi visto |
|---|---|---|---|
| A1 ✅ | **Um único pedido de reserva trava o site.** A data de saída não tem limite: com saída em 2800 o servidor ficou 0,9 s ocupado e o calendário passou de 0,1 s para 0,64 s; em 9999 são ~5 s e ~450 MB. Poucos pedidos em paralelo derrubam o servidor. | `lib/agenda.ts` (`cotar`/`faixa`) | **[Confirmado]** |
| A2 ✅ | **12 pedidos falsos trancam TODAS as reservas do site por 24 h.** Cada pedido segura as datas sem pagamento; o teto global de 12 faz o cliente real receber erro 429. A proteção anti-robô (`ms`, campo escondido) é declarada pelo próprio cliente, e o limite por IP é contornável (IPv6 inteiro, vários IPs). Cada pedido ainda gera push para os responsáveis. | `app/api/agenda/reservar/route.ts`, `lib/ip.ts` | **[Confirmado]** |
| A3 ✅ | **Pedidos de visita nunca vencem.** 30 pedidos "aguardando" bloqueiam o formulário para todos, e cada um ocupa um horário até o dono cancelar à mão. | `app/api/visitas/route.ts`, `lib/agendador.ts` | **[Código]** (2 revisores) |
| A4 ✅ | **Em Regras e preços, o que a pessoa digita some** na atualização automática do painel (a cada 45 s ou ao voltar para a tela). Digitado 9999, voltou para 7500. | `components/painel/Regras.tsx` | **[Confirmado]** **[Regressão]** |
| A5 ✅ | **Reativar uma reserva cancelada ou vencida zera o valor já recebido**, sem aviso, e perde pagamentos acima do sinal. | `app/api/admin/route.ts` (`statusReserva`) | **[Código]** |
| A6 ✅ | **Backup não serve para o servidor:** só manual; com o banco parado deixa um arquivo **vazio com nome de backup válido**; guarda hashes de senha, a chave privada de push e dados de clientes sem proteção, numa pasta sincronizada com o OneDrive; usa o compose errado na VPS; é `.sh` (o dono usa Windows). Restaurar funciona (testei). | `scripts/backup.sh`, `docs/docker.md` | **[Confirmado]** |
| A7 🔒 | **Zoom bloqueado** no site e no painel (reprova a acessibilidade, afeta pastores mais velhos). Foi decisão do dono, mas é o maior obstáculo de acessibilidade. | `app/layout.tsx`, `components/SemZoom.tsx` | **[Código]** |
| A8 ✅ | **Sessão não pode ser revogada:** depois do logout, o cookie antigo continua valendo por 7 dias; trocar a senha também não encerra sessões. Com um cookie roubado dá para criar outro administrador ou trocar a senha de qualquer um, sem reautenticar. | `lib/sessao.ts`, `app/api/admin/route.ts` | **[Confirmado]** (logout) |

## MÉDIA

> **Atualização (branch fix/auditoria-medios):** corrigidos e testados: **M1, M2, M3, M5, M6, M7 (pede a senha atual), M8, M9, M10, M11, M12, M13, M14, M15, M17, M18, M19, M20, M21, M22, M23, M24, M25, M26, M27, M28, M29 (Esc, rótulos e teclado na galeria e nas gavetas), M30 (calendário pelo teclado) e M31.**
> **Parcial:** M16 (visita num dia que depois ganha bloqueio continua marcada; o painel mostra o dia com visita, mas não alerta sozinho). **Só documentado:** M4 (conferir `PROXY_HOPS` no servidor; veja `docs/docker.md`).
> **Velocidade:** páginas públicas agora são estáticas e ficam em cache; leituras do calendário ficam 5 s em memória e têm limite por origem; fotos com cache no navegador. Home: ~10 ms no computador (antes ~200 ms por causa do IPv6 e sem cache).

**Segurança**

| # | Problema | Como foi visto |
|---|---|---|
| M1 | O servidor aceita **qualquer endereço** como destino de push (inclusive internos): exfiltração dos avisos para um servidor do atacante e varredura de portas internas (SSRF cego). Falta lista de serviços de push permitidos e limite de aparelhos. | **[Confirmado]** |
| M2 | **Corpo das requisições sem limite de tamanho** (aceitei 20 MB numa rota pública). | **[Confirmado]** |
| M3 | **Dá para trancar o dono para fora do painel:** 20 senhas erradas no e-mail dele bloqueiam o login por 15 min, renovável. O hash de senha é síncrono (~50 ms) e bloqueia o servidor a cada tentativa. | **[Confirmado]** |
| M4 | O limite por IP depende de `PROXY_HOPS` bater com o número real de proxies; se errar, ou todos dividem o mesmo limite ou o IP pode ser forjado. | **[Código]** |
| M5 | O `docker-compose.yml` de desenvolvimento publica a porta para todo o computador/rede. | **[Código]** |
| M6 | Rotas públicas de leitura (`/api/agenda`, `/api/visitas/horarios`) sem cache nem limite, com pool de 5 conexões. | **[Código]** |
| M7 | Qualquer administrador troca a senha ou remove outro sem a senha atual e sem registro (sem papéis). | **[Código]** |

**Regras de negócio**

| # | Problema | Como foi visto |
|---|---|---|
| M8 | Avisos de **"prazo acabando" se perdem à noite**: a janela é 7h às 21h e o prazo (24 h) vence na mesma hora do pedido. Pedido às 22h ou às 3h nunca é avisado antes de vencer. | **[Código]** |
| M9 | Reativar uma reserva **não reabre os avisos**: a segunda "hold" vence em silêncio. | **[Código]** |
| M10 | Criar/reativar no painel pode dar **erro 409 em datas que o painel mostra livres** (o vencimento só é gravado pelo agendador, a cada minuto). | **[Código]** |
| M11 | A regra "bloco mínimo de 3 dias" **é contornável pela API**: 1 dia aberto isolado + 1 antes e 1 depois vira pacote. | **[Código]** (reproduzido pelo revisor) |
| M12 | Mudar duração/horários de visita **com visitas marcadas** cria sobreposição ou visitas órfãs. | **[Código]** |
| M13 | A visita pública usa a data do banco (UTC): das 21h às 23h59 o limite de 2 abertas por WhatsApp deixa de contar as de hoje. | **[Confirmado]** (banco em UTC) |
| M14 | Confirmar/cancelar sem checar o estado atual **duplica avisos** (duplo clique, dois administradores) e reforça pagamentos. | **[Código]** |
| M15 | **Período com preço 0** vende de graça; mínimo > máximo de dias bloqueia tudo; valores como `" "`, `[]` ou `true` são aceitos como números; status desconhecido vira reserva confirmada. | **[Código]** |
| M16 | Uma visita marcada **não é revalidada** quando surge reserva ou bloqueio no mesmo dia. | **[Código]** |
| M17 | **Primeira subida na VPS:** o teste de saúde do banco pode liberar o site antes do `init.sql` terminar, e a migração não tenta de novo (as tabelas de visitas e notificações ficam faltando até reiniciar). | **[Código]** |
| M18 | As variáveis `LIMITE_*` e `VAPID_SUBJECT` do `.env.example` **não chegam ao contêiner** (os limites ficam fixos). | **[Código]** |
| M19 | Um banco novo traz só 3 dias abertos (`init.sql`), diferente da decisão de 7 dias. | **[Código]** |
| M20 | Sem **teste de saúde do site** nos contêineres (um site travado fica "no ar" para sempre). | **[Código]** |
| M21 | Instruções de **restauração** sem parar o site e sem `ON_ERROR_STOP`: erro no meio deixa o banco pela metade. | **[Código]** |
| M22 | Páginas públicas **sem cache** (todas geradas a cada visita) por causa do endereço dinâmico no layout. | **[Confirmado]** **[Regressão]** |

**Telas, acessibilidade e iPhone**

| # | Problema | Como foi visto |
|---|---|---|
| M23 | Uma **falha passageira do servidor derruba o painel inteiro** (tela só com "Sair"), perdendo gavetas abertas e o número do ícone. | **[Código]** |
| M24 | **Tocar numa notificação de visita** com a aba Visitas já aberta não abre a visita. | **[Código]** |
| M25 | No iPhone, o pedido de **permissão de notificação** é feito depois de esperas de rede; o Safari pode recusar por falta de "toque do usuário". | **[Código]** |
| M26 | **Contraste baixo** nos botões principais: branco sobre laranja (3,2:1) e sobre o verde do WhatsApp (1,9:1); rótulos laranja (3:1). | **[Código]** (cálculo) |
| M27 | **Textos de 12 px** e alvos de toque pequenos (FAQ, rodapé, menu) para um público mais velho. | **[Código]** |
| M28 | **Sem menu** entre 640 e 1023 px (iPad, iPhone deitado). | **[Código]** |
| M29 | **Gavetas e galeria sem acessibilidade:** sem foco, sem tecla Esc, sem rótulo; fotos da galeria não abrem por teclado. | **[Código]** |
| M30 | **Calendário do painel só com mouse**: sem teclado e sem arrastar por toque no iPhone. | **[Código]** |
| M31 | A lista de **reservas** começa pelas mais antigas; as futuras ficam no fim. | **[Código]** |

## BAIXA

- Datas inexistentes (30/02) passam na validação e dão **erro 500** no painel · byte nulo no nome dá erro 503 · texto enorme é aceito (cortado em 80). **[Confirmado]**
- Telegram sem tempo limite dentro do pedido do cliente; `SITE_URL` sem `https://` derruba o site inteiro; Postgres usado como superusuário; CSP com `'unsafe-inline'`; HSTS curto; cookie sem `Secure` garantido e sem prefixo `__Host-`; sem checagem de `Origin`; senha mínima de 10 e parâmetros do hash abaixo do recomendado.
- **LGPD:** a Política de Privacidade não cita o Telegram; pedidos antigos nunca são apagados ou anonimizados; o WhatsApp aparece na tela de bloqueio nos avisos de visita.
- Contador de "não lidas" inclui as próprias ações; "marcar como lidas" marca o que a pessoa ainda não viu; resumo "Hoje tem N visitas" não inclui visitas marcadas depois das 8h; aviso de saldo diz "em 0 dias"; selo de visitas do menu difere do da aba.
- Migração engole erros; WhatsApp criado pelo painel tem formato diferente do site; reserva para o passado pode ser reativada.
- Formulários sem rótulo (só texto de exemplo); gaveta fixa com o teclado aberto no iPhone; no celular o valor da reserva fica abaixo do calendário sem aviso.
- "Confirmar visita e avisar no WhatsApp" abre o WhatsApp antes de saber se a confirmação deu certo; aviso (toast) pode sumir cedo; ícone do app sem margem de segurança.
- Textos inconsistentes: "Visita Técnica" × "Visita Presencial", "Lazer & Batismo", "café da manhã cortesia" (sem confirmação do que o sítio oferece), filtro "Banheiros".
- Documentação: porta local 3000 × 3200; vídeo sem botão de pausa.
- Páginas legais herdam a imagem de compartilhamento da home; imagem do lightbox da galeria em baixa resolução.
- Dependências com versões novas disponíveis (lucide, tailwind, typescript, eslint); imagens do Docker sem versão fixa.
- O vídeo de 32 MB toca sozinho no celular (decisão do dono de manter); gasta dados e a cota do Supabase.

## O que foi conferido e está CORRETO

- Login: cookie assinado, comparação segura, **cookie forjado recusado**, **admin removido perde o acesso na hora**, mesma mensagem para e-mail errado e senha errada.
- Todas as ações do painel exigem login e validam a entrada; **SQL sempre parametrizado**; texto de clientes é escapado nas telas, nos avisos e no push (nada de XSS).
- Arquivos sensíveis (`.env`, `.git`, `package.json`, `init.sql`) **não são servidos**; métodos errados dão 405; sem segredo no histórico do Git; `.env.local` tem só marcadores, sem chave real.
- O preço é **recalculado no servidor**; reservas simultâneas das mesmas datas: só uma passa; o banco impede sobreposição.
- Dependências de produção: **0 vulnerabilidades**; contêiner roda sem privilégio; banco sem porta aberta; contêiner de produção sem porta publicada.
- **Backup e restauração** voltam todos os dados (testado num banco temporário).
- Primeiro administrador só pelo script no servidor; service worker, manifesto, âncoras, CSP e cabeçalhos de segurança coerentes.
- Testes automáticos: 40 de 40 passam; lint limpo.

## Lacunas nos testes automáticos

Não há testes para: transições de estado da reserva (confirmar, cancelar, reativar), o agendador, o banco real
(sobreposição, índice único de visita, avisos sem repetição), data de saída muito distante, bloco isolado,
período com preço 0, mínimo > máximo, 29/02, e horários perto da meia-noite.

## Ordem sugerida de correção

1. **A1, M2, baixa de datas inexistentes**: validar a saída e o tamanho do pedido (rápido).
2. **A4, M23, M24, M25**: o que a pessoa digita não pode sumir; painel não pode cair; notificação precisa abrir.
3. **A2, A3**: expiração dos pedidos de visita, limites por faixa de IP, código no WhatsApp ou desafio anti-robô.
4. **A5, M14, M9, M10, M15**: regras de reserva (valor recebido, avisos, validações).
5. **A8, M1, M3, M7**: sessão revogável, lista de serviços de push, login.
6. **A6, M17, M18, M20, M21**: backup automático e instalação no servidor.
7. **M26 a M31 e acessibilidade (A7)**: contraste, textos, menu, teclado.
