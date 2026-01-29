let restEndTime = null;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "START_TIMER") {
    restEndTime = Date.now() + event.data.seconds * 1000;
    checkTimer();
  }
});

function checkTimer() {
  if (!restEndTime) return;

  const remaining = restEndTime - Date.now();

  if (remaining <= 0) {
    self.registration.showNotification("Alpha Fit Training 💪", {
      body: "Descanso finalizado! Bora pra próxima série!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [500, 200, 500, 200, 800],
      tag: "rest-timer",
      requireInteraction: true
    });
    restEndTime = null;
    return;
  }

  setTimeout(checkTimer, Math.min(remaining, 8000));
}
