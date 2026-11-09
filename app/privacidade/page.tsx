import type { Metadata } from 'next';
import { PaginaLegal } from '@/components/PaginaLegal';
import { EMPRESA, SITE_INFO } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Sítio Shalom Xerém',
  description: 'Como o Sítio Shalom Xerém usa e protege os dados de quem pede uma reserva ou uma visita pelo site.',
  alternates: { canonical: '/privacidade' },
};

export default function Privacidade() {
  return (
    <PaginaLegal titulo="Política de Privacidade" atualizado="09/11/2026">
      <section>
        <p>
          Esta página explica quais dados pessoais o site do {SITE_INFO.name} recebe, para que usamos, por quanto tempo guardamos e quais são os seus direitos,
          conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>
      </section>

      <section>
        <h2>Quem é o responsável pelos dados</h2>
        <p>
          {EMPRESA.razaoSocial || SITE_INFO.name}
          {EMPRESA.cnpj ? `, CNPJ ${EMPRESA.cnpj}` : ''}. Endereço: {SITE_INFO.address}. Contato: WhatsApp {SITE_INFO.displayPhone}.
        </p>
      </section>

      <section>
        <h2>Quais dados recebemos</h2>
        <ul>
          <li>
            <b>Pedido de reserva:</b> nome, igreja ou ministério, WhatsApp, faixa de público e as datas escolhidas.
          </li>
          <li>
            <b>Pedido de visita:</b> nome, igreja ou ministério, WhatsApp, faixa de público, horário escolhido e observações que você escrever.
          </li>
          <li>
            <b>Aceite:</b> a data e a versão dos textos que você aceitou ao enviar o pedido.
          </li>
          <li>
            <b>Segurança:</b> guardamos apenas um resumo irreversível do seu endereço de internet (IP), usado somente para barrar pedidos falsos em excesso. Não guardamos o IP em si.
          </li>
        </ul>
        <p className="mt-2">Não pedimos documentos, dados de cartão nem dados de pagamento pelo site.</p>
      </section>

      <section>
        <h2>Para que usamos</h2>
        <ul>
          <li>Registrar e atender o seu pedido de reserva ou de visita e falar com você pelo WhatsApp sobre ele.</li>
          <li>Confirmar datas, valores e pagamento do sinal.</li>
          <li>Evitar fraudes e pedidos falsos.</li>
          <li>Cumprir obrigações legais e guardar o histórico do atendimento.</li>
        </ul>
        <p className="mt-2">Não vendemos nem compartilhamos os seus dados para propaganda.</p>
      </section>

      <section>
        <h2>Base legal</h2>
        <p>
          Tratamos os dados para dar andamento ao seu pedido e a um possível contrato de locação (procedimentos preliminares e execução de contrato), com o seu
          consentimento ao aceitar esta política, e para cumprir obrigações legais.
        </p>
      </section>

      <section>
        <h2>Com quem os dados passam</h2>
        <ul>
          <li>A equipe do sítio que atende reservas e visitas.</li>
          <li>
            <b>WhatsApp (Meta):</b> quando você conversa conosco pelo aplicativo, valem os termos e a política de privacidade dele.
          </li>
          <li>
            <b>Vimeo e Google Maps:</b> o vídeo da página inicial e o mapa da seção &ldquo;Como chegar&rdquo; são carregados desses serviços, que podem registrar o seu acesso
            conforme as próprias políticas.
          </li>
          <li>Servidor e banco de dados em que o site funciona, que guardam as informações com acesso restrito.</li>
        </ul>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          O site para visitantes não usa cookies de rastreamento nem de propaganda. Apenas a área de administração (equipe do sítio) usa um cookie de sessão para manter o
          login.
        </p>
      </section>

      <section>
        <h2>Por quanto tempo guardamos</h2>
        <p>
          Pedidos de reserva e de visita ficam guardados pelo tempo necessário para o atendimento e para a comprovação de direitos, em geral por até 5 anos depois do
          evento. Depois disso, os dados são apagados ou anonimizados. Pedidos que não viram reserva podem ser apagados antes, a seu pedido.
        </p>
      </section>

      <section>
        <h2>Os seus direitos</h2>
        <p>Você pode, a qualquer momento, pedir:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados errados;</li>
          <li>apagamento dos dados, quando não houver obrigação de guardá-los;</li>
          <li>informação sobre com quem compartilhamos;</li>
          <li>retirada do consentimento.</li>
        </ul>
        <p className="mt-2">
          É só falar com a gente pelo WhatsApp {SITE_INFO.displayPhone}, informando o nome e o número usados no pedido. Respondemos em até 15 dias.
        </p>
      </section>

      <section>
        <h2>Mudanças nesta política</h2>
        <p>Quando este texto mudar, a data de atualização no topo da página muda junto. Cada pedido guarda a versão que você aceitou.</p>
      </section>
    </PaginaLegal>
  );
}
