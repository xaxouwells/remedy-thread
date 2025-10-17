# Servex Thread

Framework-agnostic Service Worker thread abstraction system. Organize your Service Worker code into modular "threads" with a clean, type-safe API.

## ✨ Features

- 🧵 **Modular Architecture** - Organize SW code into separate thread modules
- 📝 **Type-Safe** - Full TypeScript support with type inference
- 🎯 **Simple API** - `thread(name).execute(data).finish(callback)`
- 🔄 **4 Handler Types** - Thread, ThreadFetch, ThreadInstall, ThreadActivate
- 🏗️ **Auto-Build** - Compiles TypeScript threads into worker.js
- 🌐 **Framework Agnostic** - Works with any framework (React, Vue, Svelte, etc.)
- ⚡ **Performance** - Each thread has its own message listener
- 🔌 **Plugin Support** - Vite, Webpack, Rollup plugins included

## 📦 Installation

```bash
npm install servex-thread
# or
yarn add servex-thread
# or
pnpm add servex-thread
```

## 🚀 Quick Start

### 1. Create Thread Structure

```
src/
└── threads/
    └── my-thread/
        └── index.ts
```

### 2. Define Your Thread

**src/threads/my-thread/index.ts:**

```typescript
import type { ThreadMessageEvent } from 'servex-thread';

interface Input {
  message: string;
}

interface Output {
  result: string;
  timestamp: number;
}

// Message handler - corresponds to self.addEventListener('message')
export async function Thread(event: ThreadMessageEvent<Input>): Promise<Output> {
  const { message } = event.data;

  return {
    result: `Processed: ${message}`,
    timestamp: Date.now(),
  };
}
```

### 3. Build Your Threads

```bash
npx tsx build-threads.ts
```

**build-threads.ts:**

```typescript
import { buildThreads } from 'servex-thread';

buildThreads({
  threadsDir: 'src/threads',
  output: 'public/worker.js',
  minify: true,
}).catch(console.error);
```

### 4. Use in Your App

```typescript
import { registerThreads, thread } from 'servex-thread';

// Register threads once
await registerThreads({ workerPath: '/worker.js' });

// Use a thread
thread('my-thread')
  .execute({ message: 'Hello!' })
  .finish((result) => {
    console.log(result.result); // "Processed: Hello!"
  });
```

## 📖 Thread Handlers

Each thread can export up to 4 handlers:

### Thread - Message Handler

Handles messages from the client (corresponds to `self.addEventListener('message')`).

```typescript
export async function Thread(event: ThreadMessageEvent<Input>): Promise<Output> {
  // Process messages from client
  return result;
}
```

### ThreadFetch - Fetch Handler

Intercepts fetch requests (corresponds to `self.addEventListener('fetch')`).

```typescript
export function ThreadFetch(event: ThreadFetchEvent): void {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
}
```

### ThreadInstall - Install Handler

Runs during service worker installation (corresponds to `self.addEventListener('install')`).

```typescript
export function ThreadInstall(event: ThreadInstallEvent): void {
  event.waitUntil(
    caches.open('my-cache-v1').then(cache =>
      cache.addAll(['/','/ index.html'])
    )
  );
}
```

### ThreadActivate - Activate Handler

Runs when service worker activates (corresponds to `self.addEventListener('activate')`).

```typescript
export function ThreadActivate(event: ThreadActivateEvent): void {
  event.waitUntil(clients.claim());
}
```

## 🔌 Build Tool Integration

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { threadsPlugin } from 'servex-thread/vite-threads';

export default defineConfig({
  plugins: [
    threadsPlugin({
      threadsDir: 'src/threads',
      output: 'public/worker.js',
      minify: true,
    }),
  ],
});
```

### Webpack

```javascript
// webpack.config.js
const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');

module.exports = {
  plugins: [
    new ThreadsWebpackPlugin({
      threadsDir: 'src/threads',
      output: 'worker.js',
      minify: true,
    }),
  ],
};
```

### Rollup

```javascript
// rollup.config.js
import { threadsRollupPlugin } from 'servex-thread/rollup-threads';

export default {
  plugins: [
    threadsRollupPlugin({
      threadsDir: 'src/threads',
      output: 'dist/worker.js',
      minify: true,
    }),
  ],
};
```

## 📚 Examples

### Simple Data Processor

```typescript
// src/threads/calculator/index.ts
export async function Thread(event) {
  const { operation, a, b } = event.data;
  const result = operation === 'add' ? a + b : a - b;
  return { result };
}
```

```typescript
// Client
thread('calculator')
  .execute({ operation: 'add', a: 5, b: 3 })
  .finish(result => console.log(result.result)); // 8
```

### Cache Manager with All Handlers

```typescript
// src/threads/cache/index.ts
const CACHE_NAME = 'app-v1';

export async function Thread(event) {
  const { action } = event.data;
  if (action === 'clear') {
    await caches.delete(CACHE_NAME);
    return { success: true };
  }
}

export function ThreadFetch(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}

export function ThreadInstall(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(['/']))
  );
}

export function ThreadActivate(event) {
  event.waitUntil(clients.claim());
}
```

## 🏗️ How It Works

The builder generates a single Service Worker with:

- **Separate message listeners** for each thread (performance optimization)
- **Single fetch listener** that calls all ThreadFetch handlers
- **Single install listener** coordinating all ThreadInstall handlers with `Promise.all()`
- **Single activate listener** coordinating all ThreadActivate handlers with `Promise.all()`

Generated code example:

```javascript
// Message: one listener per thread
self.addEventListener('message', async (event) => {
  if (event.data.threadName === 'cache') {
    const result = await Thread_cache(event);
    event.source.postMessage({ threadName: 'cache', data: result });
  }
});

self.addEventListener('message', async (event) => {
  if (event.data.threadName === 'calculator') {
    const result = await Thread_calculator(event);
    event.source.postMessage({ threadName: 'calculator', data: result });
  }
});

// Fetch: ONE listener for all
self.addEventListener('fetch', async (event) => {
  ThreadFetch_cache(event);
});

// Install: ONE listener coordinating all
self.addEventListener('install', async (event) => {
  event.waitUntil(Promise.all([
    ThreadInstall_cache(event)
  ]));
  self.skipWaiting();
});
```

## 🎯 API Reference

### Client API

- `registerThreads(options?)` - Register the service worker
- `thread<TInput, TOutput>(name)` - Create a thread instance
- `isServiceWorkerSupported()` - Check browser support
- `getRegistration()` - Get current registration
- `unregisterThreads()` - Unregister service worker

### Build API

- `buildThreads(options?)` - Compile threads into worker.js

### Types

- `ThreadMessageEvent<T>` - Message event with typed data
- `ThreadFetchEvent` - Fetch event
- `ThreadInstallEvent` - Install event
- `ThreadActivateEvent` - Activate event
- `ThreadDefinition` - Thread handler interface
- `RegisterThreadsOptions` - Registration options
- `ThreadBuildOptions` - Build options

## ⚙️ Configuration

### BuildThreads Options

```typescript
{
  threadsDir?: string;    // default: 'src/threads'
  output?: string;        // default: 'public/worker.js'
  minify?: boolean;       // default: false
  sourcemap?: boolean;    // default: false
  target?: string;        // default: 'es2020'
}
```

### RegisterThreads Options

```typescript
{
  workerPath?: string;    // default: '/worker.js'
  scope?: string;         // default: '/'
  type?: 'classic' | 'module';  // default: 'classic'
}
```

## 🔥 Best Practices

1. **One Responsibility Per Thread** - Each thread should handle a specific concern
2. **Type Your Interfaces** - Define clear input/output types
3. **Error Handling** - Always handle errors in thread handlers
4. **Async Operations** - Use async/await for clarity
5. **Testing** - Test thread logic separately from SW registration

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Open an issue or PR.

---

**[📖 Full Documentation](./THREADS.md)** | **[🚀 Quick Start Guide](./QUICK_START_THREADS.md)** | **[💡 Examples](./examples/threads-demo)**