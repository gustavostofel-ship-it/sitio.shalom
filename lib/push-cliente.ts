// Notificações push no navegador/iPhone. Só roda no navegador.
export type EstadoPush = 'carregando' | 'iphone_fora_do_app' | 'sem_suporte' | 'sem_https' | 'bloqueado' | 'desligado' | 'ligado';

const ESCOPO = '/painel';

export const ehIos = () => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
// Painel aberto pelo ícone da tela inicial (e não numa aba do Safari)
export const emModoApp = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
const suportaPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const seguro = () => window.isSecureContext;

// A chave pública do site vem em base64 "url-safe"; o navegador quer bytes.
export function chaveParaBytes(base64url: string): Uint8Array {
  const b64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function estadoAtual(): Promise<{ estado: EstadoPush; endpoint?: string }> {
  if (ehIos() && !emModoApp()) return { estado: 'iphone_fora_do_app' }; // no iPhone, push só existe no app instalado
  if (!seguro()) return { estado: 'sem_https' };
  if (!suportaPush()) return { estado: 'sem_suporte' };
  if (Notification.permission === 'denied') return { estado: 'bloqueado' };
  const reg = await navigator.serviceWorker.getRegistration(ESCOPO);
  const sub = await reg?.pushManager.getSubscription();
  if (sub && Notification.permission === 'granted') return { estado: 'ligado', endpoint: sub.endpoint };
  return { estado: 'desligado' };
}

export interface Assinatura {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Liga os avisos neste aparelho. Precisa ser chamado por um toque da pessoa (o iPhone exige).
export async function ligarPush(chavePublica: string): Promise<Assinatura> {
  const reg = await navigator.serviceWorker.register('/sw-painel.js', { scope: ESCOPO });
  await navigator.serviceWorker.ready;
  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') throw new Error('permissao');
  const chave = chaveParaBytes(chavePublica) as unknown as BufferSource;
  let sub = await reg.pushManager.getSubscription();
  try {
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chave });
  } catch (e) {
    // Assinatura antiga feita com outra chave: recomeça
    if ((e as Error).name === 'InvalidStateError') {
      await sub?.unsubscribe();
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: chave });
    } else throw e;
  }
  const j = sub.toJSON();
  if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) throw new Error('assinatura');
  return { endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth };
}

// Desliga neste aparelho e devolve o endereço da assinatura (para o servidor esquecer).
export async function desligarPush(): Promise<string | null> {
  const reg = await navigator.serviceWorker.getRegistration(ESCOPO);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return endpoint;
}

// Número no ícone do app (iPhone com o painel instalado).
export function marcarIcone(n: number) {
  const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
  if (!nav.setAppBadge) return;
  (n > 0 ? nav.setAppBadge(n) : nav.clearAppBadge?.())?.catch(() => {});
}
