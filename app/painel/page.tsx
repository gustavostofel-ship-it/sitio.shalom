import type { Metadata } from 'next';
import { Painel } from '@/components/painel/Painel';

// Área interna: fica fora dos buscadores.
export const metadata: Metadata = { title: 'Painel do administrador | Sítio Shalom', robots: { index: false, follow: false } };

export default function PainelPage() {
  return <Painel />;
}
