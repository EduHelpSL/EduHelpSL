// serviceworker.js

// Define a cache name with a version number to manage updates.
// Increment this version when you update any of the urlsToCache or the SW logic.
const CACHE_NAME = "my-site-cache-v2"; // Example: incremented version

// List the static assets that should be pre-cached.
// These paths are relative to the service worker's location (usually the root).
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
  "/assets/media/logo.png",
  // Consider adding an offline fallback page here if you have one:
  // e.g., '/offline.html'
];

// Install event: This is triggered when the service worker is first registered or updated.
// It pre-caches the defined static assets.
self.addEventListener("install", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Install event`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(
          `Service Worker (${CACHE_NAME}): Caching app shell listed in urlsToCache`
        );
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        console.log(
          `Service Worker (${CACHE_NAME}): App shell cached, skipping waiting.`
        );
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          `Service Worker (${CACHE_NAME}): Failed to cache app shell during install. One or more URLs in urlsToCache might be incorrect or unreachable.`,
          error
        );
        // If addAll fails, the SW installation will fail.
      })
  );
});

// Activate event: This is triggered when the service worker becomes active.
// It's used to clean up old caches and take control of clients.
self.addEventListener("activate", (event) => {
  console.log(`Service Worker (${CACHE_NAME}): Activate event`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match the current active CACHE_NAME.
            if (cacheName !== CACHE_NAME) {
              console.log(
                `Service Worker (${CACHE_NAME}): Deleting old cache:`,
                cacheName
              );
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Ensures that the newly activated service worker takes control of all open clients (pages)
        // without needing a reload.
        console.log(
          `Service Worker (${CACHE_NAME}): Old caches cleaned, claiming clients.`
        );
        return self.clients.claim();
      })
      .catch((error) => {
        console.error(
          `Service Worker (${CACHE_NAME}): Failed to clean up old caches or claim clients during activate.`,
          error
        );
      })
  );
});

// Fetch event: This is triggered for every network request made by the page.
// It intercepts requests and serves assets from the cache if available (Cache-First strategy).
// Otherwise, it fetches from the network, caches the response (if valid), and returns it.
self.addEventListener("fetch", (event) => {
  // We only want to handle GET requests for caching purposes.
  // Other methods (POST, PUT, DELETE etc.) are typically not cacheable or have side effects.
  if (event.request.method !== "GET") {
    // For non-GET requests, let the browser handle them as usual (pass through to the network).
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache hit - return response from cache
      if (cachedResponse) {
        // console.log(`Service Worker (${CACHE_NAME}): Serving from cache: ${event.request.url}`);
        return cachedResponse;
      }

      // console.log(`Service Worker (${CACHE_NAME}): Not in cache, fetching from network: ${event.request.url}`);

      // IMPORTANT: Check the request URL scheme before attempting to cache.
      // The Cache API only supports http and https schemes.
      const requestUrl = new URL(event.request.url);
      if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
        // If the scheme is not http or https (e.g., 'chrome-extension:', 'blob:', etc.),
        // don't try to cache it. Just fetch it and return the response directly.
        // console.log(`Service Worker (${CACHE_NAME}): Unsupported scheme ('${requestUrl.protocol}'), fetching directly (no cache): ${event.request.url}`);
        return fetch(event.request);
      }

      // Clone the request because it's a stream and can only be consumed once.
      // One for the fetch, one for the cache.put if needed.
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((networkResponse) => {
          // Check if we received a valid response to cache.
          // - Response must exist.
          // - Status must be 200 (OK).
          // - Response type 'basic' indicates same-origin requests (good for caching app assets).
          //   Other types like 'opaque' are for cross-origin requests without CORS;
          //   they can be cached but their contents are not inspectable by the SW.
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            // console.log(`Service Worker (${CACHE_NAME}): Not caching invalid or non-basic response: ${event.request.url} (Status: ${networkResponse ? networkResponse.status : 'N/A'}, Type: ${networkResponse ? networkResponse.type : 'N/A'})`);
            return networkResponse; // Return the problematic response as is, without caching.
          }

          // Clone the response because it's a stream and can only be consumed once.
          // One for the browser, one for the cache.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // console.log(`Service Worker (${CACHE_NAME}): Caching new resource: ${event.request.url}`);
            cache
              .put(event.request, responseToCache) // This is where the 'chrome-extension' error would occur if the scheme check above was missing
              .catch((cachePutError) => {
                // Log caching errors, but don't let them break the main fetch flow.
                console.warn(
                  `Service Worker (${CACHE_NAME}): Failed to put resource in cache: ${event.request.url}`,
                  cachePutError
                );
              });
          });

          return networkResponse; // Return the original network response to the browser.
        })
        .catch((fetchError) => {
          // This catch handles network errors (e.g., user is offline).
          console.warn(
            `Service Worker (${CACHE_NAME}): Network fetch failed for: ${event.request.url}`,
            fetchError
          );

          // OPTIONAL: Fallback for navigation requests when offline.
          // Ensure '/offline.html' is in urlsToCache if you use this.
          // if (event.request.mode === 'navigate') {
          //     return caches.match('/offline.html').then(offlineResponse => {
          //         return offlineResponse || new Response("You are offline. Please check your connection.", { headers: { 'Content-Type': 'text/html' }});
          //     });
          // }

          // Rethrow the error to let the browser handle it as a failed network request.
          // The page's JavaScript might have its own error handling for failed fetches.
          throw fetchError;
        });
    })
  );
});
