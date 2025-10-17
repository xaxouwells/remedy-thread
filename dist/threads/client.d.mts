import { ThreadInstance, RegisterThreadsOptions } from './types.mjs';

/**
 * Client-side thread API
 * Framework-agnostic implementation for communicating with service worker threads
 */

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
declare function registerThreads(options?: RegisterThreadsOptions): Promise<ServiceWorkerRegistration>;
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
declare function thread<TInput = any, TOutput = any>(threadName: string): ThreadInstance<TInput, TOutput>;
/**
 * Check if service workers are supported
 */
declare function isServiceWorkerSupported(): boolean;
/**
 * Get the current service worker registration
 */
declare function getRegistration(): ServiceWorkerRegistration | null;
/**
 * Unregister the service worker
 */
declare function unregisterThreads(): Promise<boolean>;

export { getRegistration, isServiceWorkerSupported, registerThreads, thread, unregisterThreads };
