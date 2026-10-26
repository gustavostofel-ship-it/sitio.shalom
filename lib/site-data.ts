export interface GalleryItem {
  id: string;
  title: string;
  category: 'culto' | 'dormitorios' | 'lazer' | 'refeitorio';
  categoryLabel: string;
  image: string;
  description: string;
  featured?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const SITE_INFO = {
  name: 'Sítio Shalom Xerém',
  tagline: 'Retiros & Eventos Cristãos',
  whatsappNumber: '5521997242970',
  displayPhone: '(21) 99724-2970',
  address: 'Estrada São Lourenço, 3897 — Xerém, Duque de Caxias — RJ',
  maxCapacity: 150,
  rentalModel: 'Valor fechado por fim de semana (dias específicos sob negociação)',
};

export const SUPABASE_IMAGES = {
  auditorio: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/auditorio-para-cultos.png',
  salao: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/area-gurmet.png',
  banheiros: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/banheiros.png',
  campo: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/campo.png',
  dormitorio: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/dormitorio.jpeg',
  piscina: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/piscina.png',
  quadra: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/quadra.jpeg',
  quadra1: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/quadra%201.jpeg',
  areaGourmet2: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/area-gurmet-2.png',
  salaReuniao: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/sala%20de%20reuniao.png',
  salaJogos: 'https://eocpwpvxcxtnjcydloeu.supabase.co/storage/v1/object/public/sitio%20shalom/sala-de-jogos.png',
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'culto-1',
    title: 'Auditório de Cultos, Vigílias & Ministrações',
    category: 'culto',
    categoryLabel: 'Auditório de Cultos',
    image: SUPABASE_IMAGES.auditorio,
    description: 'Espaço dedicado e preparado para cultos, louvores, reuniões e vigílias da igreja.',
    featured: true,
  },
  {
    id: 'salao-1',
    title: 'Área Gourmet com Mesas e Cozinha',
    category: 'refeitorio',
    categoryLabel: 'Salão & Refeitório',
    image: SUPABASE_IMAGES.salao,
    description: 'Salão aberto com mesas, cadeiras e cozinha para a igreja preparar as próprias refeições.',
    featured: true,
  },
  {
    id: 'piscina-1',
    title: 'Piscina Panorâmica & Área de Lazer',
    category: 'lazer',
    categoryLabel: 'Piscina e Esporte',
    image: SUPABASE_IMAGES.piscina,
    description: 'Piscina para momentos de lazer saudável e recreação da congregação.',
    featured: true,
  },
  {
    id: 'campo-1',
    title: 'Campo de Futebol Gramado',
    category: 'lazer',
    categoryLabel: 'Piscina e Esporte',
    image: SUPABASE_IMAGES.campo,
    description: 'Campo gramado para partidas de futebol, esportes e gincanas da juventude e irmãos.',
    featured: true,
  },
  {
    id: 'dorm-1',
    title: 'Alojamentos & Dormitórios',
    category: 'dormitorios',
    categoryLabel: 'Acomodações',
    image: SUPABASE_IMAGES.dormitorio,
    description: 'Dormitórios com beliches e ventiladores, separados para homens e mulheres. Hospedagem para até 150 pessoas.',
    featured: false,
  },
  {
    id: 'banheiro-1',
    title: 'Banheiros',
    category: 'dormitorios',
    categoryLabel: 'Acomodações',
    image: SUPABASE_IMAGES.banheiros,
    description: 'Mais de 4 banheiros espalhados pelo sítio, além dos que ficam nos dormitórios.',
    featured: false,
  },
  {
    id: 'quadra-1',
    title: 'Quadra Poliesportiva para Atividades',
    category: 'lazer',
    categoryLabel: 'Piscina e Esporte',
    image: SUPABASE_IMAGES.quadra,
    description: 'Quadra esportiva para jogos, recreação e atividades em grupo.',
    featured: false,
  },
  {
    id: 'quadra-2',
    title: 'Quadra Esportiva Adicional',
    category: 'lazer',
    categoryLabel: 'Piscina e Esporte',
    image: SUPABASE_IMAGES.quadra1,
    description: 'Mais um espaço versátil para esportes e momentos ao ar livre.',
    featured: false,
  },
  {
    id: 'gourmet-2',
    title: 'Área Gourmet — Outro Ângulo',
    category: 'refeitorio',
    categoryLabel: 'Salão & Refeitório',
    image: SUPABASE_IMAGES.areaGourmet2,
    description: 'Mais uma vista da área gourmet, com espaço para a igreja preparar e servir as refeições.',
    featured: false,
  },
  {
    id: 'reuniao-1',
    title: 'Sala de Reuniões',
    category: 'culto',
    categoryLabel: 'Auditório de Cultos',
    image: SUPABASE_IMAGES.salaReuniao,
    description: 'Ambiente reservado para reuniões de liderança, estudos e encontros menores.',
    featured: false,
  },
  {
    id: 'jogos-1',
    title: 'Sala de Jogos',
    category: 'lazer',
    categoryLabel: 'Piscina e Esporte',
    image: SUPABASE_IMAGES.salaJogos,
    description: 'Sala de jogos para momentos de descontração e confraternização da congregação.',
    featured: false,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Como funciona a locação do Sítio Shalom Xerém?',
    answer:
      'A locação é feita com valor fechado para o fim de semana completo (geralmente de sexta a domingo), garantindo exclusividade total para a sua igreja. Caso a sua congregação queira alugar apenas um dia específico (day use) ou outro período, os valores e horários são negociados diretamente conosco.',
  },
  {
    id: 'faq-2',
    question: 'Qual é a capacidade total de pessoas do sítio?',
    answer:
      'A capacidade do sítio, tanto de hospedagem quanto do auditório, é de até 150 pessoas.',
  },
  {
    id: 'faq-3',
    question: 'A igreja tem exclusividade na propriedade durante o retiro?',
    answer:
      'Sim, 100% de exclusividade! O Sítio Shalom Xerém nunca aluga o espaço para mais de um grupo no mesmo período. Toda a propriedade fica reservada exclusivamente para o seu ministério.',
  },
  {
    id: 'faq-4',
    question: 'Quais são as principais estruturas que temos acesso?',
    answer:
      'A congregação tem acesso exclusivo ao auditório de cultos, salão aberto com mesas e cozinha (a igreja realiza as próprias refeições), piscina, campo de futebol gramado, quadra esportiva, estacionamento amplo e dormitórios com beliches separados para homens e mulheres, para até 150 pessoas.',
  },
  {
    id: 'faq-5',
    question: 'Como podemos agendar uma visita presencial para conhecer o sítio?',
    answer:
      'Basta entrar em contato pelo WhatsApp através dos botões do site ou preencher o formulário. Combinaremos o melhor dia para você e sua comissão visitarem toda a propriedade pessoalmente antes de fechar a data.',
  },
];
