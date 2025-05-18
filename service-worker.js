// Define a cache name with a version number to manage updates.
const CACHE_NAME = 'my-site-cache-v1';

// List the static assets that should be cached.
// This list should include all critical files for the site to function offline.
const urlsToCache = [
    '/',
    '/index.html',
    '/css/base.css',
    '/css/chat.css',
    '/css/components.css',
    '/css/details.css',
    '/css/header.css',
    '/css/home.css',
    '/css/layout.css',
    '/css/library.css',
    '/css/navigation.css',
    '/css/reset.css',
    '/css/scroll.css',
    '/css/style.css',
    '/css/variables.css',
    '/css/videos.css',
    '/js/chat.js',
    '/js/commonRendering.js',
    '/js/config.js',
    '/js/dom.js',
    '/js/domCache.js',
    '/js/eventListeners.js',
    '/js/gemini.js',
    '/js/library.js',
    '/js/main.js',
    '/js/navigation.js',
    '/js/scroll.js',
    '/js/state.js',
    '/js/translation.js',
    '/js/utils.js',
    '/js/videos.js',
    '/languages/en.json',
    '/languages/ta.json',
    '/assets/media/background-image.jpg',
    '/assets/media/hero-bg.jpg',
    '/assets/media/logo.png'
    // Add other important assets like fonts here
];

// Install event: This is triggered when the service worker is installed.
// It caches the defined static assets.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event: This is triggered when the service worker becomes active.
// It's used to clean up old caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete caches that don't match the current cache name.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: This is triggered every time a request is made by the page.
// It intercepts requests and serves assets from the cache if available,
// otherwise fetches from the network and caches the response.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a stream and can only be consumed once.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it's a stream and can only be consumed once.
                        const responseToCache = response.clone();

                        // Open the cache and put the new response in it.
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});