const CACHE_NAME = 'absensi-yayasan-v1.0.4';
const OFFLINE_URL = '/offline.html';

const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/notification/notification.mp3',
  '/icon/icon-48x48.png',
  '/icon/icon-72x72.png',
  '/icon/icon-96x96.png',
  '/icon/icon-144x144.png',
  '/icon/icon-192x192.png',
  '/icon/icon-512x512.png'
];

// ✅ Install - Cache essential files including offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell + offline page');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// ✅ Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('🗑️ Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ✅ Helper: Fetch with timeout to prevent infinite loops
function fetchWithTimeout(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// ✅ Fetch - Network First, Cache Fallback (with proper offline handling)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // ✅ Handle Supabase API calls with timeout and offline fallback
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetchWithTimeout(event.request, 5000)
        .catch(() => {
          // Return offline response for failed API calls
          return new Response(
            JSON.stringify({
              error: 'Offline',
              message: 'Tidak ada koneksi internet'
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // ✅ Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(event.request, 5000)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Show offline page
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // ✅ Handle other resources (images, scripts, etc)
  event.respondWith(
    fetchWithTimeout(event.request, 5000)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // For failed resources, return empty response to prevent errors
            return new Response('', { status: 200 });
          });
      })
  );
});

// ✅ Push Notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Absensi Yayasan Al Barakah';
  const options = {
    body: data.body || 'Ada notifikasi baru',
    icon: '/icon/icon-192x192.png',
    badge: '/icon/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'general',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Buka'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ✅ Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ✅ Message Handler (for manual cache refresh)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});