/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Production-ready Service Worker for PrivacyLens AI PWA
const CACHE_NAME = 'privacylens-static-cache-v3';
const MODEL_CACHE_NAME = 'privacylens-models-cache-v1';

// Critical core assets to pre-cache during Service Worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// 1. Installation Event: Pre-cache static shell resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation in progress...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching application shell...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Force the waiting service worker to become active immediately
      return self.skipWaiting();
    })
  );
});

// 2. Activation Event: Clean up stale caches from older builds
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation in progress...');
  const cacheKeepList = [CACHE_NAME, MODEL_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!cacheKeepList.includes(name)) {
            console.log(`[Service Worker] Pruning obsolete cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Ensure active service worker controls all open tabs immediately
      return self.clients.claim();
    })
  );
});

// Helper: Determine if a request URL is for the BERT neural network model
function isModelRequest(url) {
  const urlString = url.toString();
  return (
    urlString.includes('huggingface.co') ||
    urlString.includes('onnx') ||
    urlString.includes('vocab') ||
    urlString.includes('tokenizer') ||
    urlString.includes('config.json')
  );
}

// 3. Intercept Fetch Requests: Custom Caching Strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE)
  if (event.request.method !== 'GET') {
    return;
  }

  // --- STRATEGY A: ON-DEVICE MACHINE LEARNING MODEL CACHING (Cache-First) ---
  if (isModelRequest(requestUrl)) {
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log(`[Service Worker] Model file served from local cache: ${requestUrl.pathname}`);
            return cachedResponse;
          }

          console.log(`[Service Worker] Model file cache-miss. Fetching from remote CDN: ${requestUrl.href}`);
          return fetch(event.request).then((networkResponse) => {
            // Cache a clone of the response for future offline runs
            if (networkResponse.status === 200 || networkResponse.status === 0) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.error('[Service Worker] Failed to fetch model file online:', err);
            throw err;
          });
        });
      })
    );
    return;
  }

  // --- STRATEGY B: APPLICATION PAGES & ROOT (Network-First, falling back to cached shell) ---
  const isHtmlPage = 
    event.request.mode === 'navigate' || 
    requestUrl.pathname === '/' || 
    requestUrl.pathname.endsWith('.html');

  if (isHtmlPage) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Keep the main shell updated in cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          console.log('[Service Worker] Offline detected. Serving cached application shell...');
          // Fall back to root/index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // --- STRATEGY C: CORE STATIC ASSETS (Stale-While-Revalidate) ---
  // Ideal for fingerprinted JS, CSS, images, and other resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
          return networkResponse.clone();
        })
        .catch(() => null); // Silent fail if offline

      // Return cached asset immediately if available, otherwise wait for network
      return cachedResponse || networkFetch;
    })
  );
});

// 4. Background Sync Event (Syncs pending records or audits when connection is re-established)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-phishing-logs') {
    console.log('[Service Worker] Triggering Background Sync for secure scan telemetry logs...');
    event.waitUntil(syncIncidentLogsWithIntelligenceHub());
  }
});

// Simulated Background Sync process
async function syncIncidentLogsWithIntelligenceHub() {
  console.log('[Service Worker] Querying IndexedDB offline transaction queue...');
  // In a production database setup, you would load items marked as "pendingSync: true" from IndexedDB
  // and POST them to a secure intelligence ledger (e.g. PhishTank/APWG telemetry database).
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Service Worker] Successfully synchronized offline threat indexes with threat-intelligence-ledger.');
      resolve(true);
    }, 1000);
  });
}

// 5. Message Channel Receiver: Receive diagnostics from the React App
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_OFFLINE_CACHE') {
    // Return cache usage metrics back to client
    Promise.all([
      caches.open(CACHE_NAME).then(c => c.keys()),
      caches.open(MODEL_CACHE_NAME).then(c => c.keys())
    ]).then(([staticKeys, modelKeys]) => {
      event.ports[0].postMessage({
        staticCachedCount: staticKeys.length,
        modelCachedCount: modelKeys.length,
        isFullyCached: staticKeys.length > 0 && modelKeys.length > 0
      });
    });
  }
});
