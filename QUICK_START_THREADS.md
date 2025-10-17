# Quick Start - Servex Thread

Get your Service Worker threads up and running in 5 minutes!

## What You'll Build

A simple calculator thread that processes math operations in the Service Worker.

## Step 1: Install

```bash
npm install servex-thread
```

## Step 2: Create Thread Structure

Create your threads directory:

```bash
mkdir -p src/threads/calculator
```

Your structure should look like:

```
src/
└── threads/
    └── calculator/
        └── index.ts
```

## Step 3: Write Your Thread

Create **src/threads/calculator/index.ts**:

```typescript
import type { ThreadMessageEvent } from 'servex-thread';

interface CalculatorInput {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
}

interface CalculatorOutput {
  result: number;
  operation: string;
}

export async function Thread(
  event: ThreadMessageEvent<CalculatorInput>
): Promise<CalculatorOutput> {
  const { operation, a, b } = event.data;

  let result: number;

  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      result = a / b;
      break;
  }

  return {
    result,
    operation,
  };
}
```

## Step 4: Build Your Threads

### Option A: With a Build Script

Create **build-threads.ts**:

```typescript
import { buildThreads } from 'servex-thread';

buildThreads({
  threadsDir: 'src/threads',
  output: 'public/worker.js',
  minify: process.env.NODE_ENV === 'production',
}).catch(console.error);
```

Run it:

```bash
npx tsx build-threads.ts
```

### Option B: With Vite Plugin

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite';
import { threadsPlugin } from 'servex-thread/vite-threads';

export default defineConfig({
  plugins: [
    threadsPlugin({
      threadsDir: 'src/threads',
      output: 'public/worker.js',
    }),
  ],
});
```

### Option C: With Webpack Plugin

**webpack.config.js**:

```javascript
const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');

module.exports = {
  plugins: [
    new ThreadsWebpackPlugin({
      threadsDir: 'src/threads',
      output: 'worker.js',
    }),
  ],
};
```

### Option D: With Rollup Plugin

**rollup.config.js**:

```javascript
import { threadsRollupPlugin } from 'servex-thread/rollup-threads';

export default {
  plugins: [
    threadsRollupPlugin({
      threadsDir: 'src/threads',
      output: 'dist/worker.js',
    }),
  ],
};
```

## Step 5: Use in Your App

**app.ts** (or **app.js**):

```typescript
import { registerThreads, thread } from 'servex-thread';

async function main() {
  // Register the service worker
  await registerThreads({
    workerPath: '/worker.js',
  });

  console.log('✓ Threads registered');

  // Use the calculator thread
  thread('calculator')
    .execute({
      operation: 'add',
      a: 5,
      b: 3,
    })
    .finish((result) => {
      console.log(`${result.operation}: ${result.result}`);
      // Output: "add: 8"
    });

  // Another calculation
  thread('calculator')
    .execute({
      operation: 'multiply',
      a: 4,
      b: 7,
    })
    .finish((result) => {
      console.log(`${result.operation}: ${result.result}`);
      // Output: "multiply: 28"
    });
}

main().catch(console.error);
```

## Step 6: Test It!

1. Build your threads (if using build script):
   ```bash
   npx tsx build-threads.ts
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. Open your browser console and you should see:
   ```
   ✓ Threads registered
   add: 8
   multiply: 28
   ```

## ✅ Done!

You now have a working Service Worker thread system!

## 🎯 What's Next?

### Add More Handlers

Your thread can do more than just handle messages:

```typescript
// src/threads/cache/index.ts
export async function Thread(event) {
  // Handle messages
}

export function ThreadFetch(event) {
  // Intercept fetch requests
}

export function ThreadInstall(event) {
  // Cache resources during installation
}

export function ThreadActivate(event) {
  // Clean up on activation
}
```

### Create Multiple Threads

Just add more folders:

```
src/threads/
├── calculator/
│   └── index.ts
├── cache-manager/
│   └── index.ts
└── analytics/
    └── index.ts
```

Use them:

```typescript
thread('calculator').execute(data).finish(callback);
thread('cache-manager').execute(data).finish(callback);
thread('analytics').execute(data).finish(callback);
```

### Add Type Safety

Define clear interfaces for better autocompletion and type checking:

```typescript
interface Input {
  // Your input type
}

interface Output {
  // Your output type
}

export async function Thread(
  event: ThreadMessageEvent<Input>
): Promise<Output> {
  // TypeScript knows the types!
}
```

Then in your client code:

```typescript
thread<Input, Output>('my-thread')
  .execute({ /* typed input */ })
  .finish((result) => {
    // result is typed as Output
  });
```

## 💡 Common Patterns

### Error Handling

```typescript
export async function Thread(event) {
  try {
    // Your logic
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Async Operations

```typescript
export async function Thread(event) {
  // Fetch from API
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();

  // Process and return
  return { data };
}
```

### Caching Strategy

```typescript
export function ThreadFetch(event) {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached if available
      if (cached) return cached;

      // Otherwise fetch and cache
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open('my-cache').then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
}
```

## 📚 Learn More

- [Full Documentation](./THREADS.md)
- [API Reference](./README.md#-api-reference)
- [Examples](./examples/threads-demo)
- [Architecture](./ARCHITECTURE.md)

## 🆘 Troubleshooting

### Service Worker not updating?

```typescript
// Force update
const registration = await registerThreads();
await registration.update();
```

### Messages not received?

Make sure the thread name matches:

```typescript
// Thread folder name
src/threads/my-thread/index.ts

// Client usage (must match)
thread('my-thread').execute(...)
```

### Build errors?

- Check that `index.ts` exists in each thread folder
- Verify exported functions are named: `Thread`, `ThreadFetch`, `ThreadInstall`, `ThreadActivate`
- Make sure TypeScript can find the types

## 🎉 That's It!

You're now ready to build powerful, modular Service Workers with the thread abstraction system.

Happy coding! 🚀
