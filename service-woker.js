const CACHE_NAME = "quantum-rio-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/login.html",
  "/dashboard.html",
  "/wallet.html",
  "/investment.html",
  "/referral.html",
  "/trading.html",
  "/admin.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/style.css", // Add your CSS file here
  "/script.js"  // Add your main JS file if needed
];

// Install service worker and cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate service worker and clear old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // Control all clients immediately
});

// Intercept requests and serve from cache if available
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      // Optional fallback page for offline use
      return caches.match("/index.html");
    })
  );
});