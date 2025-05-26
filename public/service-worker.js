/*// serviceworker.js

// Define a cache name with a version number to manage updates.
// Increment this version when you update any of the urlsToCache or the SW logic.
const CACHE_NAME = "my-site-cache-v2"; // Incremented version for the new logic

// List the static assets that should be pre-cached.
const urlsToCache = [
  "/",
  "/index.html",
  "/css/base.css",
  "/css/chat.css",
  "/css/components.css",
  "/css/details.css",
  "/css/header.css",
  "/css/home.css",
  "/css/layout.css",
  "/css/library.css",
  "/css/navigation.css",
  "/css/reset.css",
  "/css/scroll.css",
  "/css/style.css",
  "/css/variables.css",
  "/css/videos.css",
  "/js/chat.js",
  "/js/commonRendering.js",
  "/js/config.js",
  "/js/dom.js",
  "/js/domCache.js",
  "/js/eventListeners.js",
  "/js/gemini.js",
  "/js/library.js",
  "/js/main.js",
  "/js/navigation.js",
  "/js/scroll.js",
  "/js/state.js",
  "/js/translation.js",
  "/js/utils.js",
  "/js/videos.js",
  "/languages/en.json",
  "/languages/ta.json",
  "/assets/media/background-image.jpg",
  "/assets/media/hero-bg.jpg",
  "/assets/media/logo.png"
];

// Install event: This is triggered when the service worker is first registered or updated.
// It pre-caches the defined static assets.
self.addEventListener("install", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Install event`);
  event.waitUntil(
    // Attempt to delete any existing cache with the same name.
    // This ensures that if an install event runs, it starts fresh for this CACHE_NAME.
    // Note: caches.delete() resolves to true if deleted, false if not found; it doesn't error on not found.
    caches
      .delete(CACHE_NAME)
      .catch((err) => {
        // Log error if deletion fails for unexpected reasons, but don't stop the process.
        console.warn(
          `Service Worker (${CACHE_NAME}): Could not delete cache ${CACHE_NAME} during pre-install cleanup. This is usually fine if the cache didn't exist. Error:`,
          err
        );
        return Promise.resolve(); // Continue the chain
      })
      .then(() => {
        console.log(
          `Service Worker (${CACHE_NAME}): Ensured any previous cache named '${CACHE_NAME}' is cleared. Opening new cache.`
        );
        return caches.open(CACHE_NAME);
      })
      .then((cache) => {
        console.log(
          `Service Worker (${CACHE_NAME}): Caching app shell listed in urlsToCache`
        );
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log(
          `Service Worker (${CACHE_NAME}): App shell cached, skipping waiting.`
        );
        return self.skipWaiting(); // Force the waiting service worker to become the active service worker.
      })
      .catch((error) => {
        console.error(
          `Service Worker (${CACHE_NAME}): Failed to cache app shell during install. One or more URLs in urlsToCache might be incorrect or unreachable.`,
          error
        );
      })
  );
});

// Activate event: This is triggered when the service worker becomes active.
// It's used to clean up old caches (from different CACHE_NAME versions) and take control of clients.
self.addEventListener("activate", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Activate event`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match the current active CACHE_NAME.
            // This is crucial for removing outdated caches from previous versions.
            if (cacheName !== CACHE_NAME) {
              console.log(
                `Service Worker (${CACHE_NAME}): Deleting old versioned cache:`,
                cacheName
              );
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log(
          `Service Worker (${CACHE_NAME}): Old caches cleaned, claiming clients.`
        );
        return self.clients.claim(); // Ensures that the newly activated service worker takes control of all open clients.
      })
      .catch((error) => {
        console.error(
          `Service Worker (${CACHE_NAME}): Failed to clean up old caches or claim clients during activate.`,
          error
        );
      })
  );
});

// Fetch event: Intercepts network requests.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return; // Only handle GET requests for caching.
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // console.log(`Service Worker (${CACHE_NAME}): Serving from cache: ${event.request.url}`);
        return cachedResponse; // Serve from cache if found.
      }

      // console.log(`Service Worker (${CACHE_NAME}): Not in cache, fetching from network: ${event.request.url}`);
      const requestUrl = new URL(event.request.url);
      if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
        // console.log(`Service Worker (${CACHE_NAME}): Unsupported scheme ('${requestUrl.protocol}'), fetching directly (no cache): ${event.request.url}`);
        return fetch(event.request); // Don't cache non-http/https requests.
      }

      const fetchRequest = event.request.clone();
      return fetch(fetchRequest)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic" // Cache only same-origin 'basic' responses.
          ) {
            // console.log(`Service Worker (${CACHE_NAME}): Not caching invalid or non-basic response: ${event.request.url} (Status: ${networkResponse ? networkResponse.status : 'N/A'}, Type: ${networkResponse ? networkResponse.type : 'N/A'})`);
            return networkResponse; // Return non-cacheable response as is.
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // console.log(`Service Worker (${CACHE_NAME}): Caching new resource: ${event.request.url}`);
            cache.put(event.request, responseToCache).catch((cachePutError) => {
              console.warn(
                `Service Worker (${CACHE_NAME}): Failed to put resource in cache: ${event.request.url}`,
                cachePutError
              );
            });
          });
          return networkResponse; // Return original network response to the browser.
        })
        .catch((fetchError) => {
          console.warn(
            `Service Worker (${CACHE_NAME}): Network fetch failed for: ${event.request.url}`,
            fetchError
          );
          // Optional: Fallback to an offline page if the request is for navigation.
          // if (event.request.mode === 'navigate' && urlsToCache.includes('/offline.html')) {
          //     return caches.match('/offline.html');
          // }
          throw fetchError; // Propagate fetch error.
        });
    })
  );
});
*/
