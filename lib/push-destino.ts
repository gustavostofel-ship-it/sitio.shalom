// Só aceita como destino de notificação os serviços de push dos navegadores de verdade (Apple, Google, Mozilla,
// Microsoft). Sem isso, um endereço qualquer (inclusive interno) poderia receber os avisos ou ser "cutucado" pelo servidor.
const PERMITIDOS = [
  /^web\.push\.apple\.com$/,
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^[a-z0-9-]+\.push\.services\.mozilla\.com$/,
  /^[a-z0-9.-]+\.notify\.windows\.com$/,
];

export function destinoPushPermitido(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    return u.protocol === 'https:' && !u.port && !u.username && !u.password && PERMITIDOS.some((r) => r.test(u.hostname));
  } catch {
    return false;
  }
}
