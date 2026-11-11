// "Ficha" do painel como aplicativo: é o que permite adicionar o painel à tela inicial do iPhone
// (Compartilhar > Adicionar à Tela de Início) e receber notificações.
export const dynamic = 'force-static';

export function GET() {
  const corpo = {
    name: 'Painel Sítio Shalom',
    short_name: 'Shalom',
    description: 'Reservas, visitas e avisos do Sítio Shalom Xerém.',
    lang: 'pt-BR',
    start_url: '/painel',
    scope: '/painel',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0F291E',
    theme_color: '#0F291E',
    icons: [
      { src: '/icons/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(corpo), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
