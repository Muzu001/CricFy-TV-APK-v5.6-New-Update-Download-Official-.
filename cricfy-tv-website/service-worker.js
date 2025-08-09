// Service Worker for CricFy TV website
// Version 1.0.0

const CACHE_NAME = 'cricfy-tv-v1-2025-08-09';
const STATIC_CACHE_NAME = 'cricfy-tv-static-v1';
const DYNAMIC_CACHE_NAME = 'cricfy-tv-dynamic-v1';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/download.html',
    '/features.html',
    '/how-to-install.html',
    '/faq.html',
    '/assets/css/styles.css',
    '/assets/js/main.js',
    '/assets/js/timer.js',
    '/manifest.webmanifest',
    // Add critical images when available
    '/assets/img/cricfy-tv-logo.png',
    '/assets/img/favicon.ico'
];

// Files to cache on demand
const DYNAMIC_ASSETS = [
    '/contact.html',
    '/privacy.html',
    '/terms.html',
    '/dmca.html',
    '/changelog.html',
    '/older-versions.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static assets', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old caches
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('cricfy-tv-')) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip API calls and dynamic content
    if (url.pathname.includes('/api/') || 
        url.pathname.includes('/admin/') ||
        url.search.includes('no-cache')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                }
                
                // Fetch from network and cache dynamic content
                return fetch(request)
                    .then(networkResponse => {
                        // Check if response is valid
                        if (!networkResponse || 
                            networkResponse.status !== 200 || 
                            networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache dynamic assets
                        if (shouldCacheDynamically(url.pathname)) {
                            caches.open(DYNAMIC_CACHE_NAME)
                                .then(cache => {
                                    console.log('Service Worker: Caching dynamic asset', request.url);
                                    cache.put(request, responseToCache);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('Service Worker: Network fetch failed', error);
                        
                        // Return offline page for HTML requests
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html') || 
                                   caches.match('/index.html');
                        }
                        
                        // Return placeholder for images
                        if (request.headers.get('accept').includes('image/')) {
                            return new Response(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image Offline</text></svg>',
                                { headers: { 'Content-Type': 'image/svg+xml' } }
                            );
                        }
                        
                        throw error;
                    });
            })
    );
});

// Helper function to determine if content should be cached dynamically
function shouldCacheDynamically(pathname) {
    // Cache HTML pages
    if (pathname.endsWith('.html') || pathname === '/') {
        return true;
    }
    
    // Cache images
    if (pathname.includes('/assets/img/')) {
        return true;
    }
    
    // Cache specific dynamic assets
    return DYNAMIC_ASSETS.includes(pathname);
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'download-request') {
        event.waitUntil(
            // Handle offline download requests
            handleOfflineDownload()
        );
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/assets/img/icon-192x192.png',
        badge: '/assets/img/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/assets/img/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/img/icon-72x72.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('CricFy TV', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// Handle offline download requests
async function handleOfflineDownload() {
    try {
        // Check if online
        const response = await fetch('/download.html', { method: 'HEAD' });
        if (response.ok) {
            // Online - can proceed with download
            console.log('Service Worker: Online, proceeding with download');
            return;
        }
    } catch (error) {
        // Offline - store request for later
        console.log('Service Worker: Offline, storing download request');
        
        // Store download request in IndexedDB for later processing
        // This would be implemented based on specific requirements
    }
}

// Cache management utilities
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => cache.addAll(event.data.payload))
        );
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames.map(cacheName => {
                            if (cacheName.startsWith('cricfy-tv-')) {
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
        );
    }
});

// Performance monitoring
self.addEventListener('fetch', event => {
    const start = performance.now();
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                const end = performance.now();
                console.log(`Service Worker: Cache lookup took ${end - start} ms for ${event.request.url}`);
                return response;
            })
    );
});

console.log('Service Worker: Script loaded successfully');

