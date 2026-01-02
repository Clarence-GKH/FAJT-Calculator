const CACHE_NAME = "fajt-calculator-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Network-first for HTML so updates show up quickly
  if (req.mode === "navigate" || (req.headers.get("accept")||"").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy)).catch(()=>{});
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});