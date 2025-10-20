/**
 * Types for the thread abstraction system
 */

/// <reference lib="dom" />
/// <reference lib="webworker" />

export interface ThreadMessageEvent<T = any> extends MessageEvent {
  data: T;
}

export type ThreadFetchEvent = FetchEvent;
export type ThreadInstallEvent = ExtendableEvent;
export type ThreadActivateEvent = ExtendableEvent;

/**
 * Thread handler function types
 */
export type ThreadMessageHandler<TInput = any, TOutput = any> = (
  event: ThreadMessageEvent<TInput>
) => TOutput | Promise<TOutput>;

export type ThreadFetchHandler = (event: ThreadFetchEvent) => void | Promise<void>;
export type ThreadInstallHandler = (event: ThreadInstallEvent) => void | Promise<void>;
export type ThreadActivateHandler = (event: ThreadActivateEvent) => void | Promise<void>;

/**
 * Thread definition interface
 */
export interface ThreadDefinition<TInput = any, TOutput = any> {
  /** Message handler - corresponds to self.addEventListener('message') */
  Thread?: ThreadMessageHandler<TInput, TOutput>;
  /** Fetch handler - corresponds to self.addEventListener('fetch') */
  ThreadFetch?: ThreadFetchHandler;
  /** Install handler - corresponds to self.addEventListener('install') */
  ThreadInstall?: ThreadInstallHandler;
  /** Activate handler - corresponds to self.addEventListener('activate') */
  ThreadActivate?: ThreadActivateHandler;
}

/**
 * Client-side thread instance
 */
export interface ThreadInstance<TInput = any, TOutput = any> {
  /**
   * Execute the thread with input data
   * @param data - Data to send to the thread
   * @returns Promise that resolves with the thread's response
   */
  execute(data: TInput): ThreadExecutor<TOutput>;
}

/**
 * Thread executor with finish method
 */
export interface ThreadExecutor<TOutput = any> {
  /**
   * Wait for the thread to finish and get the result
   * @param callback - Callback function that receives the thread's output
   */
  finish(callback: (data: TOutput) => void): void;
}

/**
 * Thread registration options
 */
export interface RegisterThreadsOptions {
  /** Custom service worker path (default: '/worker.js') */
  workerPath?: string;
  /** Service worker registration options */
  scope?: string;
  /** Type of worker registration */
  type?: 'classic' | 'module';
}
