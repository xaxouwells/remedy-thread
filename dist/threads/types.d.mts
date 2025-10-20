/**
 * Types for the thread abstraction system
 */
interface ThreadMessageEvent<T = any> extends MessageEvent {
    data: T;
}
type ThreadFetchEvent = FetchEvent;
type ThreadInstallEvent = ExtendableEvent;
type ThreadActivateEvent = ExtendableEvent;
type Self = Window & typeof globalThis & {
    clients: Clients;
};
/**
 * Thread handler function types
 */
type ThreadMessageHandler<TInput = any, TOutput = any> = (event: ThreadMessageEvent<TInput>) => TOutput | Promise<TOutput>;
type ThreadFetchHandler = (event: ThreadFetchEvent, self: Self) => void | Promise<void>;
type ThreadInstallHandler = (event: ThreadInstallEvent, self: Self) => void | Promise<void>;
type ThreadActivateHandler = (event: ThreadActivateEvent, self: Self) => void | Promise<void>;
/**
 * Thread definition interface
 */
interface ThreadDefinition<TInput = any, TOutput = any> {
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
interface ThreadInstance<TInput = any, TOutput = any> {
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
interface ThreadExecutor<TOutput = any> {
    /**
     * Wait for the thread to finish and get the result
     * @param callback - Callback function that receives the thread's output
     */
    finish(callback: (data: TOutput) => void): void;
}
/**
 * Thread registration options
 */
interface RegisterThreadsOptions {
    /** Custom service worker path (default: '/worker.js') */
    workerPath?: string;
    /** Service worker registration options */
    scope?: string;
    /** Type of worker registration */
    type?: 'classic' | 'module';
}

export type { RegisterThreadsOptions, Self, ThreadActivateEvent, ThreadActivateHandler, ThreadDefinition, ThreadExecutor, ThreadFetchEvent, ThreadFetchHandler, ThreadInstallEvent, ThreadInstallHandler, ThreadInstance, ThreadMessageEvent, ThreadMessageHandler };
