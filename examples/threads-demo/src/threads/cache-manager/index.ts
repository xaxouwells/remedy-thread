/**
 * Example thread: Cache Manager
 * Demonstrates all thread handler types
 */

import type {
  ThreadMessageEvent,
  ThreadFetchEvent,
  ThreadInstallEvent,
  ThreadActivateEvent,
} from '../../../../../src/threads/types';

const CACHE_NAME = 'my-cache-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
];

interface CacheCommand {
  action: 'clear' | 'list' | 'add';
  url?: string;
}

interface CacheResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Thread - Message handler
 * Corresponds to self.addEventListener('message')
 */
export async function Thread(event: ThreadMessageEvent<CacheCommand>): Promise<CacheResponse> {
  const { action, url } = event.data;

  try {
    switch (action) {
      case 'clear': {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        return { success: true, message: 'All caches cleared' };
      }

      case 'list': {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        const urls = requests.map((req) => req.url);
        return { success: true, message: 'Cache list retrieved', data: urls };
      }

      case 'add': {
        if (!url) {
          return { success: false, message: 'URL is required for add action' };
        }
        const cache = await caches.open(CACHE_NAME);
        await cache.add(url);
        return { success: true, message: `Added ${url} to cache` };
      }

      default:
        return { success: false, message: 'Unknown action' };
    }
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * ThreadFetch - Fetch handler
 * Corresponds to self.addEventListener('fetch')
 */
export function ThreadFetch(event: ThreadFetchEvent): void {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Add to cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
}

/**
 * ThreadInstall - Install handler
 * Corresponds to self.addEventListener('install')
 */
export function ThreadInstall(event: ThreadInstallEvent): void {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(CACHE_URLS);
    })
  );
}

/**
 * ThreadActivate - Activate handler
 * Corresponds to self.addEventListener('activate')
 */
export function ThreadActivate(event: ThreadActivateEvent): void {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}
