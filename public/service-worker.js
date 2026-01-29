// public/service-worker.js

self.addEventListener("message", (event) => {
    if (event.data?.type === "START_TIMER") {
      const seconds = event.data.seconds;
  
      setTimeout(() => {
        self.registration.showNotification("Alpha Fit Training 💪", {
          body: "Descanso finalizado! Bora pra próxima série!",
          icon: "/logo192.png",
          badge: "/logo192.png",
          vibrate: [500, 200, 500, 200, 800],
          tag: "rest-timer",
          renotify: true, // Faz o celular vibrar de novo se já houver uma notificação ativa
          requireInteraction: true 
        });
      }, seconds * 1000);
    }
  });
  
  // 🔥 ADICIONE ISSO: Faz o app abrir ao tocar na notificação
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) return clientList[0].focus();
        return clients.openWindow('/');
      })
    );
  });