/**
 * Client-side thread API
 * Framework-agnostic implementation for communicating with service worker threads
 */

/// <reference lib="dom" />
/// <reference lib="webworker" />

import type { ThreadInstance, ThreadExecutor, RegisterThreadsOptions } from './types';

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
const messageHandlers = new Map<string, (data: any) => void>();

/**
 * Register service worker threads
 * This should be called once in your application initialization
 *
 * @example
 * ```typescript
 * import { registerThreads } from 'sw-merger/threads';
 *
 * registerThreads();
 * ```
 */
export async function registerThreads(
  options: RegisterThreadsOptions = {}
): Promise<ServiceWorkerRegistration> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported in this environment');
  }

  const {
    workerPath = '/worker.js',
    scope = '/',
    type = 'classic',
  } = options;

  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register(workerPath, {
      scope,
      type,
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { threadName, data } = event.data;
      const handler = messageHandlers.get(threadName);
      if (handler) {
        handler(data);
        messageHandlers.delete(threadName);
      }
    });

    return serviceWorkerRegistration;
  } catch (error) {
    throw new Error(`Failed to register service worker: ${error}`);
  }
}

/**
 * Get the active service worker
 */
function getActiveWorker(): ServiceWorker {
  if (!serviceWorkerRegistration) {
    throw new Error('Service worker not registered. Call registerThreads() first.');
  }

  const worker =
    serviceWorkerRegistration.active ||
    serviceWorkerRegistration.waiting ||
    serviceWorkerRegistration.installing;

  if (!worker) {
    throw new Error('No active service worker found');
  }

  return worker;
}

/**
 * Create a thread instance for communicating with a specific service worker thread
 *
 * @param threadName - The name of the thread (must match the folder name in src/threads/)
 * @returns Thread instance with execute method
 *
 * @example
 * ```typescript
 * import { thread } from 'sw-merger/threads';
 *
 * thread('my-thread').execute({ userId: 123 }).finish((result) => {
 *   console.log('Thread result:', result);
 * });
 * ```
 */
export function thread<TInput = any, TOutput = any>(
  threadName: string
): ThreadInstance<TInput, TOutput> {
  return {
    execute(data: TInput): ThreadExecutor<TOutput> {
      const worker = getActiveWorker();

      // Post message to service worker
      worker.postMessage({
        threadName,
        data,
      });

      return {
        finish(callback: (data: TOutput) => void): void {
          messageHandlers.set(threadName, callback);
        },
      };
    },
  };
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get the current service worker registration
 */
export function getRegistration(): ServiceWorkerRegistration | null {
  return serviceWorkerRegistration;
}

/**
 * Unregister the service worker
 */
export async function unregisterThreads(): Promise<boolean> {
  if (!serviceWorkerRegistration) {
    return false;
  }

  const result = await serviceWorkerRegistration.unregister();
  serviceWorkerRegistration = null;
  messageHandlers.clear();
  return result;
}
