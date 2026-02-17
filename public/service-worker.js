// Dentro do seu sw.js
self.registration.showNotification("Alpha Fit 💪", {
  body: "Descanso acabou! Próxima série.",
  icon: "/icon-192.png",
  badge: "/icon-192.png",
  vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40], // Padrão mais forte
  tag: "rest-timer",
  renotify: true,
  silent: false, // Garante que não venha mutada
  data: {
    arrival: Date.now()
  },
  // Algumas versões do Chrome Mobile exigem interaction para som alto
  requireInteraction: true 
});