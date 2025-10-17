"use strict";
(() => {
  // examples/threads-demo/src/threads/cache-manager/index.ts
  var CACHE_NAME = "my-cache-v1";
  var CACHE_URLS = [
    "/",
    "/index.html",
    "/styles.css",
    "/app.js"
  ];
  async function Thread(event) {
    const { action, url } = event.data;
    try {
      switch (action) {
        case "clear": {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
          return { success: true, message: "All caches cleared" };
        }
        case "list": {
          const cache = await caches.open(CACHE_NAME);
          const requests = await cache.keys();
          const urls = requests.map((req) => req.url);
          return { success: true, message: "Cache list retrieved", data: urls };
        }
        case "add": {
          if (!url) {
            return { success: false, message: "URL is required for add action" };
          }
          const cache = await caches.open(CACHE_NAME);
          await cache.add(url);
          return { success: true, message: `Added ${url} to cache` };
        }
        default:
          return { success: false, message: "Unknown action" };
      }
    } catch (error) {
      return { success: false, message: `Error: ${error}` };
    }
  }
  function ThreadFetch(event) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response2) => {
          if (!response2 || response2.status !== 200 || response2.type !== "basic") {
            return response2;
          }
          const responseToCache = response2.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response2;
        });
      })
    );
  }
  function ThreadInstall(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Caching app shell");
        return cache.addAll(CACHE_URLS);
      })
    );
  }
  function ThreadActivate(event) {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }

  // examples/threads-demo/src/threads/data-processor/index.ts
  async function Thread2(event) {
    const { numbers, operation } = event.data;
    let result;
    switch (operation) {
      case "sum":
        result = numbers.reduce((acc, n) => acc + n, 0);
        break;
      case "average":
        result = numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
        break;
      case "max":
        result = Math.max(...numbers);
        break;
      case "min":
        result = Math.min(...numbers);
        break;
      default:
        result = 0;
    }
    return {
      result,
      operation,
      count: numbers.length
    };
  }

  // examples/threads-demo/src/threads/__sw-entry__.ts
  self.addEventListener("message", async (event) => {
    const { threadName } = event.data;
    if (threadName === "cache-manager") {
      const result = await Thread(event);
      if (event.source) {
        event.source.postMessage({ threadName: "cache-manager", data: result });
      }
    }
  });
  self.addEventListener("message", async (event) => {
    const { threadName } = event.data;
    if (threadName === "data-processor") {
      const result = await Thread2(event);
      if (event.source) {
        event.source.postMessage({ threadName: "data-processor", data: result });
      }
    }
  });
  self.addEventListener("fetch", async (event) => {
    ThreadFetch(event);
  });
  self.addEventListener("install", async (event) => {
    event.waitUntil(
      Promise.all([
        ThreadInstall(event)
      ])
    );
    self.skipWaiting();
  });
  self.addEventListener("activate", async (event) => {
    event.waitUntil(
      Promise.all([
        ThreadActivate(event)
      ])
    );
    await clients.claim();
  });
})();
