/* Painel do Sítio Shalom: recebe as notificações (push) e abre o painel quando a pessoa toca nelas.
   Registrado só pelo painel (/painel). Não guarda nada em cache: o painel sempre mostra dados atuais. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

self.addEventListener('push', (evento) => {
  let d = {};
  try {
    d = evento.data ? evento.data.json() : {};
  } catch (e) {
    d = { titulo: 'Sítio Shalom', corpo: evento.data ? evento.data.text() : '' };
  }
  const trabalhos = [
    self.registration.showNotification(d.titulo || 'Sítio Shalom', {
      body: d.corpo || '',
      icon: '/icons/icone-192.png',
      tag: d.tag || undefined,
      lang: 'pt-BR',
      data: { url: d.url || '/painel' },
    }),
  ];
  // Número no ícone do app (iPhone com o painel instalado): quantas notificações ainda não foram lidas
  if (typeof d.naoLidas === 'number' && self.navigator && self.navigator.setAppBadge) {
    trabalhos.push(
      (d.naoLidas > 0 ? self.navigator.setAppBadge(d.naoLidas) : self.navigator.clearAppBadge()).catch(() => {})
    );
  }
  evento.waitUntil(Promise.all(trabalhos));
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const url = (evento.notification.data && evento.notification.data.url) || '/painel';
  evento.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const j of janelas) {
        if (j.url.indexOf('/painel') !== -1 && 'focus' in j) {
          await j.focus();
          j.postMessage({ tipo: 'abrir', url });
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    })()
  );
});
