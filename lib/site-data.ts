export interface GalleryItem {
  id: string;
  title: string;
  category: 'culto' | 'dormitorios' | 'lazer' | 'refeitorio' | 'natureza';
  categoryLabel: string;
  image: string;
  description: string;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  church: string;
  avatar: string;
  event: string;
  attendees: number;
  quote: string;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const SITE_INFO = {
  name: 'Sítio Shalom',
  tagline: 'Retiros & Eventos Cristãos',
  whatsappNumber: '5511999887766',
  displayPhone: '(11) 99988-7766',
  email: 'contato@sitioshalom.com.br',
  address: 'Estrada das Palmeiras, Km 14 - Serra da Cantareira / Região Metropolitana, SP',
  travelTime: 'A apenas 45 minutos da capital',
  maxCapacity: 150,
  yearsOfExperience: 12,
  completedEvents: 480,
};

export const SUPABASE_IMAGES = {
  banheiros: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/banheiros.jpeg',
  campo: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/campo.jpeg',
  dormitorio: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/dormitorio.jpeg',
  piscina: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/piscina.jpeg',
  quadra1: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/quadra%201.jpeg',
  quadra: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/quadra.jpeg',
  salao: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/salao.jpeg',
  vistaDoAlto: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/salao.jpeg',
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'culto-1',
    title: 'Salão Principal de Cultos & Eventos',
    category: 'culto',
    categoryLabel: 'Espaço de Culto',
    image: SUPABASE_IMAGES.salao,
    description: 'Espaço coberto e climatizado com capacidade para até 200 pessoas sentadas, púlpito amplo, iluminação cênica e excelente acústica.',
    featured: true,
  },
  {
    id: 'lazer-1',
    title: 'Piscina Panorâmica com Área de Lazer e Batismos',
    category: 'lazer',
    categoryLabel: 'Piscina e Campo',
    image: SUPABASE_IMAGES.piscina,
    description: 'Piscina ampla com deck ao redor, perfeita para momentos solenes de batismo nas águas e recreação saudável.',
    featured: true,
  },
  {
    id: 'lazer-2',
    title: 'Campo de Futebol Society Gramado',
    category: 'lazer',
    categoryLabel: 'Piscina e Campo',
    image: SUPABASE_IMAGES.campo,
    description: 'Gramado natural impecável, traves oficiais e amplo espaço para torneios, gincanas e dinâmicas da igreja.',
    featured: true,
  },
  {
    id: 'dorm-1',
    title: 'Alojamentos e Dormitórios Aconchegantes',
    category: 'dormitorios',
    categoryLabel: 'Dormitórios',
    image: SUPABASE_IMAGES.dormitorio,
    description: 'Quartos arejados e confortáveis com camas firmes e colchões de alta densidade para o descanso ideal dos participantes.',
    featured: false,
  },
  {
    id: 'dorm-2',
    title: 'Baterias de Banheiros com Duchas Quentes',
    category: 'dormitorios',
    categoryLabel: 'Dormitórios',
    image: SUPABASE_IMAGES.banheiros,
    description: 'Baterias de banheiros higienizadas e preparadas para alto fluxo, com duchas quentes aquecidas para evitar filas pós-culto.',
    featured: false,
  },
  {
    id: 'lazer-3',
    title: 'Quadra Poliesportiva para Recreação',
    category: 'lazer',
    categoryLabel: 'Piscina e Campo',
    image: SUPABASE_IMAGES.quadra1,
    description: 'Espaço poliesportivo versátil para vôlei, basquete, futebol e gincanas da juventude e famílias.',
    featured: false,
  },
  {
    id: 'lazer-4',
    title: 'Quadra Esportiva Ampla com Alambrado',
    category: 'lazer',
    categoryLabel: 'Piscina e Campo',
    image: SUPABASE_IMAGES.quadra,
    description: 'Área esportiva adicional com alambrado de proteção para dinâmicas e atividades ao ar livre.',
    featured: false,
  },
  {
    id: 'ref-1',
    title: 'Refeitório Comunitário e Cozinha Industrial',
    category: 'refeitorio',
    categoryLabel: 'Refeitório',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Salão de alimentação para até 160 pessoas sentadas simultaneamente, com buffet aquecido, despensa refrigerada e bancadas em inox.',
    featured: false,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Pr. Marcos Aurélio Silva',
    role: 'Pastor Sênior',
    church: 'Igreja Batista Memorial de Moema',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    event: 'Retiro de Carnaval com Jovens e Famílias',
    attendees: 135,
    quote:
      'Realizamos nossos retiros há mais de 10 anos e foi a primeira vez que encontramos um lugar onde a liderança não teve nenhuma dor de cabeça com infraestrutura. A acústica do salão permitiu ministrações profundas, a comida saiu sempre no horário e os dormitórios são impecavelmente limpos e cheirosos. Nossa igreja já bloqueou a data do próximo ano!',
    date: 'Fevereiro de 2026',
  },
  {
    id: 'test-2',
    name: 'Pra. Raquel Oliveira',
    role: 'Coordenadora do Ministério da Família',
    church: 'Comunidade Evangélica Graça & Paz',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    event: 'Encontro de Casais - 42 Casais',
    attendees: 84,
    quote:
      'Para um Encontro de Casais, o nível de conforto e privacidade precisa ser diferenciado. As suítes privativas atenderam com muita dignidade os preletores e casais de apoio, e a área verde proporcionou caminhadas românticas inesquecíveis. A gentileza dos caseiros e o respeito com a nossa programação foram nota 10.',
    date: 'Julho de 2025',
  },
  {
    id: 'test-3',
    name: 'Lucas Mendes',
    role: 'Líder Geral de Juventude',
    church: 'Igreja Presbiteriana Renovada',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    event: 'Acampamento de Verão Radical Jump',
    attendees: 148,
    quote:
      'Nossa juventude é intensa: gincanas na lama, torneio de society até tarde, piscina lotada e cultos de louvor com bateria e som pesado. O sítio aguentou o ritmo com maestria! O salão tem energia estável para os nossos equipamentos e a praça da fogueira na última noite foi o ápice de salvação e batismo com o Espírito Santo.',
    date: 'Janeiro de 2026',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Como são divididos os dormitórios para os 150 lugares?',
    answer:
      'Nossa estrutura é planejada estrategicamente com 2 alas independentes (Masculina e Feminina), cada uma com suas baterias de banheiros com duchas quentes aquecidas a gás/solar de alta vazão (sem filas pós-culto). Além dos quartos coletivos com beliches de madeira maciça super confortáveis, contamos com 4 suítes privativas para pastores, preletores ou casais de apoio com ar-condicionado e banheiro privativo.',
  },
  {
    id: 'faq-2',
    question: 'O sítio fornece alimentação ou alugamos apenas o espaço (locação seca)?',
    answer:
      'Oferecemos total flexibilidade para a sua igreja! Você pode optar pela Locação Seca (sua igreja traz a própria equipe de tias e cozinheiras e utiliza nossa cozinha industrial completa com fogão industrial, fornos, câmaras frias e panelões) OU contratar nosso Pacote com Pensão Completa (café da manhã colonial, almoço farto, lanche da tarde, jantar e ceia noturna preparados por nossas cozinheiras profissionais).',
  },
  {
    id: 'faq-3',
    question: 'Como funciona a forma de pagamento para igrejas? Parcelam até a data do evento?',
    answer:
      'Sim, entendemos perfeitamente a dinâmica financeira das igrejas! Trabalhamos com entrada facilitada no ato da assinatura do contrato para bloqueio da data exclusiva e o saldo restante pode ser parcelado em boletos ou Pix sem juros mensais até 10 dias antes da data de entrada do seu retiro.',
  },
  {
    id: 'faq-4',
    question: 'O espaço possui fácil acesso para ônibus de excursão e vans?',
    answer:
      'Sim! O acesso é 100% asfaltado e pavimentado até o portão principal do sítio, sem estradas de terra escorregadias ou pontes precárias. Nosso pátio interno possui bolsão de estacionamento amplo com raio de manobra para ônibus rodoviários de até 50 passageiros e mais de 30 veículos de passeio.',
  },
  {
    id: 'faq-5',
    question: 'Temos garantia de exclusividade no sítio durante o nosso retiro?',
    answer:
      'Com certeza, 100% de exclusividade! O Sítio Shalom NUNCA aluga para dois grupos ou ministérios simultâneos. No período reservado pela sua igreja, todos os espaços (salão de cultos, piscina, campo, refeitório e dormitórios) são de uso exclusivo e privativo da sua congregação.',
  },
  {
    id: 'faq-6',
    question: 'Quais equipamentos de som e multimídia já estão inclusos no salão de cultos?',
    answer:
      'Nosso templo conta com 200 cadeiras confortáveis estofadas, púlpito de madeira rústica, palco com pontos de energia dedicados, microfones com pedestal, mesa de som de 16 canais, caixas acústicas ativas balanceadas, projetor de alta luminosidade com telão e iluminação cênica regulável. Sua equipe de louvor só precisa trazer os instrumentos individuais.',
  },
  {
    id: 'faq-7',
    question: 'O sítio possui gerador de emergência e poço artesiano?',
    answer:
      'Sim. Sabemos que um culto ou momento de ministração não pode parar por instabilidades na rede elétrica. Possuímos gerador a diesel automático com capacidade para alimentar o salão de culto, refeitório e iluminação das vias principais, além de poço artesiano com reservatório de 50.000 litros garantindo água pura e ininterrupta.',
  },
];
