import { db } from '@/lib/db';
import { urlDe, type Aviso } from '@/lib/notificacoes';

// A biblioteca de push é CommonJS: carregada aqui, de forma que funcione com ou sem o "default" do ESM.
type WebPush = typeof import('web-push');
let biblioteca: WebPush | null = null;
async function webpush(): Promise<WebPush> {
  if (!biblioteca) {
    const m = (await import('web-push')) as unknown as WebPush & { default?: WebPush };
    biblioteca = m.default ?? m;
  }
  return biblioteca;
}

// ---------- Chaves do site perante o serviço de push (Apple, Google...) ----------
// Geradas sozinhas na primeira vez e guardadas no banco: não precisa configurar nada, e elas sobrevivem
// a reinícios e entram no backup do banco.
let chaves: { publica: string; privada: string } | null = null;
export async function chavesPush() {
  if (chaves) return chaves;
  const p = db();
  let r = await p.query('select publica, privada from agenda_push_chaves where id = 1');
  if (!r.rowCount) {
    const k = (await webpush()).generateVAPIDKeys();
    await p.query('insert into agenda_push_chaves (id, publica, privada) values (1, $1, $2) on conflict (id) do nothing', [k.publicKey, k.privateKey]);
    r = await p.query('select publica, privada from agenda_push_chaves where id = 1');
  }
  return (chaves = r.rows[0]);
}

// Contato do site que o serviço de push exige: o endereço do site (https) ou um e-mail de administrador.
async function assunto() {
  if (process.env.VAPID_SUBJECT) return process.env.VAPID_SUBJECT;
  const site = process.env.SITE_URL?.trim();
  if (site?.startsWith('https://')) return site.replace(/\/+$/, '');
  const a = await db().query('select email from agenda_admins order by criado_em limit 1');
  return `mailto:${a.rows[0]?.email ?? 'contato@sitioshalom.com.br'}`;
}

export interface Carga {
  titulo: string;
  corpo: string;
  url: string;
  tag: string;
  naoLidas: number;
  id?: number;
}

interface Aparelho {
  id: number;
  email: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Manda para um aparelho. Se o aparelho não existe mais (404/410), apaga; se falhar muitas vezes seguidas, também.
async function enviarAoAparelho(a: Aparelho, carga: Carga) {
  const p = db();
  const k = await chavesPush();
  try {
    await (await webpush()).sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(carga), {
      vapidDetails: { subject: await assunto(), publicKey: k.publica, privateKey: k.privada },
      TTL: 12 * 3600,
      urgency: 'high',
      timeout: 10000,
    });
    await p.query('update agenda_push_aparelhos set ultimo_envio = now(), falhas = 0 where id = $1', [a.id]);
    return true;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) await p.query('delete from agenda_push_aparelhos where id = $1', [a.id]);
    else await p.query('update agenda_push_aparelhos set falhas = falhas + 1 where id = $1', [a.id]);
    await p.query('delete from agenda_push_aparelhos where id = $1 and falhas >= 10', [a.id]);
    console.error('push falhou:', status ?? (e as Error).message);
    return false;
  }
}

// Manda o aviso para os aparelhos de quem não desligou esse tipo (e que não fez a própria ação).
async function enviarPush(a: Aviso, notificacaoId: number) {
  const p = db();
  const r = await p.query(
    `select ap.id, ap.email, ap.endpoint, ap.p256dh, ap.auth, ad.notificacoes_lidas_ate as lidas
       from agenda_push_aparelhos ap
       join agenda_admins ad on ad.email = ap.email
      where ($1::text is null or ap.email <> $1)
        and not exists (select 1 from agenda_push_desligados d where d.email = ap.email and d.tipo = $2)`,
    [a.autor ?? null, a.tipo]
  );
  const naoLidasPorMarca = new Map<number, number>();
  for (const x of r.rows) {
    const marca = Number(x.lidas);
    if (!naoLidasPorMarca.has(marca)) naoLidasPorMarca.set(marca, Number((await p.query('select count(*) as n from agenda_notificacoes where id > $1', [marca])).rows[0].n));
    await enviarAoAparelho(x, {
      titulo: a.titulo,
      corpo: a.corpo,
      url: urlDe(a.refTipo, a.refId),
      tag: `${a.tipo}:${a.refId ?? notificacaoId}`,
      naoLidas: naoLidasPorMarca.get(marca) ?? 1,
      id: notificacaoId,
    });
  }
}

// Registra o acontecimento no histórico e manda o push. Nunca derruba a ação que o chamou.
// Se o aviso tem "chave" e já foi dado antes, não faz nada (devolve null).
export async function notificar(a: Aviso): Promise<number | null> {
  try {
    const r = await db().query(
      'insert into agenda_notificacoes (tipo, titulo, corpo, ref_tipo, ref_id, dados, autor, chave) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8) on conflict (chave) do nothing returning id',
      [a.tipo, a.titulo, a.corpo, a.refTipo ?? null, a.refId ?? null, JSON.stringify(a.dados ?? {}), a.autor ?? null, a.chave ?? null]
    );
    if (!r.rowCount) return null;
    const id = Number(r.rows[0].id);
    void enviarPush(a, id).catch((e) => console.error('push:', e));
    return id;
  } catch (e) {
    console.error('notificar:', e);
    return null;
  }
}

// Notificação de teste, só para os aparelhos de uma pessoa (não entra no histórico).
export async function enviarTeste(email: string): Promise<{ enviados: number; aparelhos: number }> {
  const r = await db().query('select id, email, endpoint, p256dh, auth from agenda_push_aparelhos where email = $1', [email]);
  let enviados = 0;
  for (const x of r.rows) {
    if (await enviarAoAparelho(x, { titulo: 'Teste: as notificações funcionam', corpo: 'Se você está vendo isto no celular, está tudo certo.', url: '/painel?aba=notif', tag: 'teste', naoLidas: 0 })) enviados++;
  }
  return { enviados, aparelhos: r.rowCount ?? 0 };
}
