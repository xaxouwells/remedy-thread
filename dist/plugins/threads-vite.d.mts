import { Plugin } from 'vite';
import { ThreadBuildOptions } from '../threads/builder.mjs';

/**
 * Vite plugin for automatic thread building
 */

interface ThreadsPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
    /** Output file path relative to Vite's public directory */
    output?: string;
}
/**
 * Vite plugin that automatically builds threads during development and production builds
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { threadsPlugin } from 'servex-thread/vite-threads';
 *
 * export default defineConfig({
 *   plugins: [
 *     threadsPlugin({
 *       threadsDir: 'src/threads',
 *       minify: true,
 *     }),
 *   ],
 * });
 * ```
 */
declare function threadsPlugin(options?: ThreadsPluginOptions): Plugin;

export { type ThreadsPluginOptions, threadsPlugin as default, threadsPlugin };
