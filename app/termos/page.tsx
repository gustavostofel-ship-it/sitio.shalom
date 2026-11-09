import type { Metadata } from 'next';
import { PaginaLegal } from '@/components/PaginaLegal';
import { POLITICA_CANCELAMENTO, SITE_INFO } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Termos de reserva | Sítio Shalom Xerém',
  description: 'Como funciona a reserva, o sinal, o cancelamento e a visita no Sítio Shalom Xerém.',
  alternates: { canonical: '/termos' },
};

export default function Termos() {
  return (
    <PaginaLegal titulo="Termos de reserva" atualizado="09/11/2026">
      <section>
        <p>
          Estes termos valem para pedidos de reserva e de visita feitos pelo site do {SITE_INFO.name}, que aluga o espaço com exclusividade para igrejas, retiros e eventos
          cristãos, para até {SITE_INFO.maxCapacity} pessoas. Ao enviar um pedido, você declara que leu e aceita estes termos e a Política de Privacidade.
        </p>
      </section>

      <section>
        <h2>1. Como funciona a reserva pelo site</h2>
        <ul>
          <li>Você escolhe as datas no calendário. O valor total e o valor do sinal aparecem antes de enviar o pedido, calculados pelas regras de preço em vigor.</li>
          <li>Ao enviar, as datas ficam <b>seguradas por tempo limitado</b> (o prazo é informado na tela) enquanto combinamos o sinal pelo WhatsApp.</li>
          <li>
            O pedido <b>só vira reserva confirmada depois que o sinal é recebido</b>. Se o sinal não for pago dentro do prazo, as datas voltam a ficar livres.
          </li>
          <li>Os valores e as datas mostrados pelo site são conferidos pelo sítio. Se houver erro evidente, avisamos você antes de qualquer cobrança.</li>
        </ul>
      </section>

      <section>
        <h2>2. Pagamento</h2>
        <p>
          O sinal e o restante do valor são combinados com você pelo WhatsApp, junto com a forma de pagamento. O site não recebe pagamentos nem dados de cartão.
          O que for pago é registrado e confirmado a você por escrito.
        </p>
      </section>

      <section>
        <h2>3. Desistência em até 7 dias</h2>
        <p>
          Como o pedido é feito pela internet, você pode desistir em <b>até 7 dias corridos</b> depois de fazê-lo, e recebe de volta <b>tudo o que pagou</b>, sem desconto,
          conforme o art. 49 do Código de Defesa do Consumidor. Para desistir, avise pelo mesmo WhatsApp usado no pedido. Confirmamos o recebimento do seu aviso na hora.
        </p>
      </section>

      <section>
        <h2>4. Cancelamento depois dos 7 dias</h2>
        {POLITICA_CANCELAMENTO.length ? (
          <>
            <p>Depois do prazo de 7 dias, a devolução do sinal depende de quanto tempo falta para a entrada:</p>
            <ul>
              {POLITICA_CANCELAMENTO.map((f) => (
                <li key={f.quando}>
                  {f.quando}: {f.devolucao}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            Depois do prazo de 7 dias, valem as condições de cancelamento e de devolução do sinal <b>combinadas por escrito com a administração antes do pagamento do
            sinal</b>. Pergunte antes de pagar: respondemos pelo WhatsApp.
          </p>
        )}
      </section>

      <section>
        <h2>5. Se o sítio precisar cancelar ou mudar a data</h2>
        <p>
          Se o sítio não puder receber o seu grupo na data reservada, você escolhe entre outra data ou a devolução de <b>100% do que pagou</b>.
        </p>
      </section>

      <section>
        <h2>6. Uso do espaço</h2>
        <ul>
          <li>A locação é exclusiva: nunca recebemos dois grupos ao mesmo tempo.</li>
          <li>A capacidade máxima é de {SITE_INFO.maxCapacity} pessoas, e as regras de uso do espaço são passadas a você antes da chegada.</li>
          <li>O responsável pelo grupo responde pelo uso do espaço e pelo cuidado com as instalações durante a locação.</li>
        </ul>
      </section>

      <section>
        <h2>7. Visitas</h2>
        <p>
          A visita ao sítio é gratuita e sem compromisso. O horário escolhido no site fica <b>aguardando confirmação</b> até a gente confirmar pelo WhatsApp. Se precisar
          mudar ou cancelar, avise com antecedência.
        </p>
      </section>

      <section>
        <h2>8. Mudanças nestes termos</h2>
        <p>Quando estes termos mudarem, a data no topo da página muda junto. Cada pedido guarda a versão que você aceitou.</p>
      </section>
    </PaginaLegal>
  );
}
