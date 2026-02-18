// public/sw.js

self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body } = event.data;

    // Criamos uma Promise para o navegador manter o SW vivo
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body: body,
          icon: '/pwa-192x192.png', 
          badge: '/pwa-192x192.png',
          vibrate: [500, 110, 500, 110, 450, 110, 200],
          tag: 'alpha-fit-rest', 
          renotify: true,
          requireInteraction: true,
          silent: false,
          data: { url: '/' } // Adicionado para facilitar o redirecionamento
        }).then(resolve);
      }, delay);
    });

    // Esta é a linha mágica que impede o SW de ser encerrado prematuramente
    event.waitUntil(promise);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Tenta focar em uma aba já aberta
      for (const client of windowClients) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não houver aba aberta, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});