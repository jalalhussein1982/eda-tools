// service-worker.js - Enable offline functionality

const CACHE_NAME = 'eda-tool-v1.0.0';
const PYODIDE_CACHE = 'pyodide-cache-v1';

// Files to cache for offline use
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/utils.js',
    '/js/state-manager.js',
    '/js/pyodide-loader.js',
    '/js/ui-controller.js',
    '/js/data-handler.js',
    '/js/visualization.js',
    '/js/main.js',
    '/python/preprocessing.py',
    '/python/distribution.py',
    '/python/correlation.py',
    '/python/modeling.py',
    '/python/assumptions.py',
    '/python/report_generator.py',
    '/python/eda_core.py'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== PYODIDE_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Special handling for Pyodide files
    if (request.url.includes('cdn.jsdelivr.net/pyodide')) {
        event.respondWith(
            caches.open(PYODIDE_CACHE).then(cache => {
                return cache.match(request).then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(networkResponse => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }
    
    // Network first, fall back to cache
    event.respondWith(
        fetch(request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(request).then(response => {
                    if (response) {
                        return response;
                    }
                    // Return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
