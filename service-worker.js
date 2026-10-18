const CACHE_NAME = "ppu-dashboard-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./css/style.css", "./logo.png", "./plant-banner.jpg"];

function cacheKeyFor(requestUrl) {
    const url = new URL(requestUrl);
    url.search = "";
    url.hash = "";
    return url.href;
}

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("ppu-dashboard-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const requestUrl = new URL(event.request.url);
    const isCsv = requestUrl.pathname.toLowerCase().endsWith(".csv");
    const isSameOrigin = requestUrl.origin === self.location.origin;
    if (!isCsv && !isSameOrigin) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const stableKey = cacheKeyFor(event.request.url);
        try {
            const response = await fetch(event.request, { cache: "no-store" });
            if (response && response.ok) {
                await cache.put(stableKey, response.clone());
                if (event.request.url !== stableKey) await cache.put(event.request, response.clone());
            }
            return response;
        } catch (error) {
            const cached = await caches.match(event.request) || await caches.match(stableKey);
            if (cached) return cached;
            if (isCsv) return new Response("", { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "X-Offline-Fallback": "1" } });
            throw error;
        }
    })());
});
