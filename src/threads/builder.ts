/**
 * Thread builder - Compiles TypeScript thread definitions into a single worker.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { build } from 'esbuild';

export interface ThreadBuildOptions {
  /** Path to the threads directory (default: 'src/threads') */
  threadsDir?: string;
  /** Output file path (default: 'public/worker.js') */
  output?: string;
  /** Whether to minify the output */
  minify?: boolean;
  /** Whether to generate source maps */
  sourcemap?: boolean;
  /** Target ECMAScript version */
  target?: string | string[];
}

interface ThreadMetadata {
  name: string;
  path: string;
  hasThread: boolean;
  hasFetch: boolean;
  hasInstall: boolean;
  hasActivate: boolean;
}

/**
 * Generate a complete message handler listener for a specific thread (one addEventListener per thread)
 */
function generateMessageHandler(thread: ThreadMetadata): string {
  if (!thread.hasThread) return '';

  const threadAlias = thread.name.replace(/-/g, '_');
  return `
// Message handler for thread: ${thread.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${thread.name}') {
    const result = await Thread_${threadAlias}(event);
    if (event.source) {
      event.source.postMessage({ threadName: '${thread.name}', data: result });
    }
  }
});`;
}

/**
 * Generate fetch handler call for a specific thread
 */
function generateFetchHandlerCall(thread: ThreadMetadata): string {
  if (!thread.hasFetch) return '';

  const threadAlias = thread.name.replace(/-/g, '_');
  return `  ThreadFetch_${threadAlias}(event);`;
}

/**
 * Generate install handler call for a specific thread
 */
function generateInstallHandlerCall(thread: ThreadMetadata): string {
  if (!thread.hasInstall) return '';

  const threadAlias = thread.name.replace(/-/g, '_');
  return `    ThreadInstall_${threadAlias}(event)`;
}

/**
 * Generate activate handler call for a specific thread
 */
function generateActivateHandlerCall(thread: ThreadMetadata): string {
  if (!thread.hasActivate) return '';

  const threadAlias = thread.name.replace(/-/g, '_');
  return `    ThreadActivate_${threadAlias}(event)`;
}

async function discoverThreads(threadsDir: string): Promise<ThreadMetadata[]> {
  const threads: ThreadMetadata[] = [];

  if (!fs.existsSync(threadsDir)) {
    return threads;
  }

  const entries = fs.readdirSync(threadsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const threadPath = path.join(threadsDir, entry.name);
      const indexPath = path.join(threadPath, 'index.ts');

      if (fs.existsSync(indexPath)) {
        // Read the file to determine which handlers exist
        const content = fs.readFileSync(indexPath, 'utf-8');

        threads.push({
          name: entry.name,
          path: indexPath,
          hasThread: /export\s+(const|async\s+function|function)\s+Thread\b/.test(content),
          hasFetch: /export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(content),
          hasInstall: /export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(content),
          hasActivate: /export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(content),
        });
      }
    }
  }

  return threads;
}

/**
 * Generate the service worker entry point code
 */
function generateWorkerCode(threads: ThreadMetadata[]): string {
  // Generate imports with unique aliases for each thread
  const imports = threads
    .map((thread) => {
      const handlers = [];
      const threadAlias = thread.name.replace(/-/g, '_'); // Convert kebab-case to snake_case

      if (thread.hasThread) handlers.push(`Thread as Thread_${threadAlias}`);
      if (thread.hasFetch) handlers.push(`ThreadFetch as ThreadFetch_${threadAlias}`);
      if (thread.hasInstall) handlers.push(`ThreadInstall as ThreadInstall_${threadAlias}`);
      if (thread.hasActivate) handlers.push(`ThreadActivate as ThreadActivate_${threadAlias}`);

      return `import { ${handlers.join(', ')} } from './${thread.name}/index';`;
    })
    .join('\n');
  
  // Generate message handlers (one addEventListener per thread)
  const messageHandlers = threads.map(generateMessageHandler).filter(Boolean).join('\n');

  // Generate fetch handler calls
  const fetchHandlerCalls = threads.map(generateFetchHandlerCall).filter(Boolean).join('\n');

  // Generate install handler calls
  const installHandlerCalls = threads.map(generateInstallHandlerCall).filter(Boolean).join(',\n');

  // Generate activate handler calls
  const activateHandlerCalls = threads.map(generateActivateHandlerCall).filter(Boolean).join(',\n');

  // Build fetch listener (ONE for all threads)
  const fetchListener = fetchHandlerCalls ? `
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${fetchHandlerCalls}
});
` : '';

  // Build install listener (ONE for all threads)
  const installListener = installHandlerCalls ? `
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
${installHandlerCalls}
    ])
  );
  self.skipWaiting();
});
` : '';

  // Build activate listener (ONE for all threads)
  const activateListener = activateHandlerCalls ? `
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${activateHandlerCalls}
    ])
  );
  await clients.claim();
});
` : '';

  return `/**
 * Generated Service Worker
 * This file is auto-generated from your thread definitions
 */

${imports}

${messageHandlers}
${fetchListener}${installListener}${activateListener}
`;
}

/**
 * Build all threads into a single worker.js file
 *
 * @example
 * ```typescript
 * import { buildThreads } from 'sw-merger/threads/builder';
 *
 * await buildThreads({
 *   threadsDir: 'src/threads',
 *   output: 'public/worker.js',
 *   minify: true
 * });
 * ```
 */
export async function buildThreads(options: ThreadBuildOptions = {}): Promise<void> {
  const {
    threadsDir = 'src/threads',
    output = 'public/worker.js',
    minify = false,
    sourcemap = false,
    target = 'es2020',
  } = options;

  const absoluteThreadsDir = path.resolve(process.cwd(), threadsDir);
  const absoluteOutput = path.resolve(process.cwd(), output);

  // Discover all threads
  const threads = await discoverThreads(absoluteThreadsDir);

  if (threads.length === 0) {
    console.warn(`No threads found in ${threadsDir}`);
    return;
  }

  console.log(`Found ${threads.length} thread(s): ${threads.map((t) => t.name).join(', ')}`);

  // Generate entry point code
  const entryCode = generateWorkerCode(threads);

  // Create a temporary entry file
  const tempEntry = path.join(absoluteThreadsDir, '__sw-entry__.ts');
  fs.writeFileSync(tempEntry, entryCode, 'utf-8');

  try {
    // Bundle with esbuild
    await build({
      entryPoints: [tempEntry],
      bundle: true,
      outfile: absoluteOutput,
      format: 'iife',
      platform: 'browser',
      target: Array.isArray(target) ? target : [target],
      minify,
      sourcemap,
      write: true,
    });

    console.log(`✓ Built worker.js at ${output}`);
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempEntry)) {
      fs.unlinkSync(tempEntry);
    }
  }
}
