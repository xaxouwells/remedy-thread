# Threads Demo

This example demonstrates the thread abstraction system for Service Workers.

## Structure

```
src/
├── threads/
│   ├── data-processor/
│   │   └── index.ts       # Thread with message handler
│   └── cache-manager/
│       └── index.ts       # Thread with all handlers (fetch, install, activate)
└── app.ts                 # Client-side usage
```

## Run the Demo

1. Build the threads:

```bash
npm run build:threads
# or
npx tsx build.ts
```

2. Serve the demo:

```bash
npx serve .
```

3. Open your browser to the provided URL

## What's Demonstrated

### Data Processor Thread

- Basic message handling
- Type-safe input/output
- Async processing

### Cache Manager Thread

- All four handler types:
  - `Thread` - Message handler for cache commands
  - `ThreadFetch` - Intercepts fetch requests
  - `ThreadInstall` - Pre-caches resources
  - `ThreadActivate` - Cleans up old caches

## Code Highlights

### Thread Definition

```typescript
// src/threads/data-processor/index.ts
export async function Thread(event: ThreadMessageEvent<Input>): Promise<Output> {
  const { numbers, operation } = event.data;
  // Process and return result
}
```

### Client Usage

```typescript
// src/app.ts
await registerThreads();

thread('data-processor')
  .execute({ numbers: [1,2,3], operation: 'sum' })
  .finish((result) => {
    console.log('Result:', result);
  });
```

### Build

```typescript
// build.ts
await buildThreads({
  threadsDir: 'src/threads',
  output: 'public/worker.js',
});
```
