function checkTimer() {
  if (!restEndTime) return;

  const remaining = restEndTime - Date.now();

  if (remaining <= 0) {
    // A notificação enviada pelo Service Worker é o que garante o funcionamento
    // com a tela bloqueada.
    self.registration.showNotification("Alpha Fit 💪", {
      body: "Descanso acabou! Próxima série.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [400, 200, 400], // Pulso mais curto e direto
      tag: "rest-timer",
      renotify: true, // Faz o celular vibrar de novo se houver outra notificação
      requireInteraction: false // 👈 Mude para false para não ficar "gritando" infinitamente
    });
    restEndTime = null;
    return;
  }

  // Se falta muito tempo, checa a cada 5 segundos para economizar bateria
  // Se falta pouco, checa a cada 1 segundo para precisão
  const nextCheck = remaining > 5000 ? 5000 : 1000;
  setTimeout(checkTimer, nextCheck);
}