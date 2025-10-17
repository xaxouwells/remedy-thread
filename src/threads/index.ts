/**
 * Thread abstraction system for Service Workers
 * Framework-agnostic implementation
 */

export { thread, registerThreads, isServiceWorkerSupported, getRegistration, unregisterThreads } from './client';
export { buildThreads } from './builder';
export type {
  ThreadDefinition,
  ThreadInstance,
  ThreadExecutor,
  ThreadMessageHandler,
  ThreadFetchHandler,
  ThreadInstallHandler,
  ThreadActivateHandler,
  ThreadMessageEvent,
  ThreadFetchEvent,
  ThreadInstallEvent,
  ThreadActivateEvent,
  RegisterThreadsOptions,
} from './types';
export type { ThreadBuildOptions } from './builder';
