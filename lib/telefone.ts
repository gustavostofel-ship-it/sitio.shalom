// DDDs que existem no Brasil.
const DDDS = new Set(
  '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ')
);

// WhatsApp brasileiro de celular: DDD + 9 + 8 dígitos. Aceita o 55 na frente.
// Devolve só os dígitos, sem o 55, ou null se não parecer um número de verdade.
export function whatsappNormalizado(texto: string): string | null {
  let d = String(texto ?? '').replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  if (d.length !== 11) return null;
  if (!DDDS.has(d.slice(0, 2))) return null;
  const numero = d.slice(2);
  if (numero[0] !== '9') return null;
  const resto = numero.slice(1);
  if (/^(\d)\1+$/.test(resto)) return null; // 99999999, 00000000...
  if ('0123456789'.includes(resto) || '9876543210'.includes(resto)) return null; // 12345678, 87654321
  return d;
}
