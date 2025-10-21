/**
 * Thread abstraction system for Service Workers
 * Framework-agnostic implementation
 *
 * Note: For build-time functionality (buildThreads), import from 'servex-thread/builder'
 */

export { thread, registerThreads, isServiceWorkerSupported, getRegistration, unregisterThreads } from './client';
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
  Self
} from './types';
