/**
 * Vite plugin for automatic thread building
 */

import type { Plugin } from 'vite';
import { buildThreads, type ThreadBuildOptions } from '../threads/builder';

export interface ThreadsPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
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
export function threadsPlugin(options: ThreadsPluginOptions = {}): Plugin {
  const {
    threadsDir = 'src/threads',
    output = 'public/worker.js',
    minify,
    sourcemap,
    target,
  } = options;

  return {
    name: 'servex-thread-threads',

    async buildStart() {
      // Build threads when the build starts
      try {
        await buildThreads({
          threadsDir,
          output,
          minify,
          sourcemap,
          target,
        });
      } catch (error) {
        this.error(`Failed to build threads: ${error}`);
      }
    },

    async handleHotUpdate({ file }) {
      // Rebuild threads when any thread file changes
      if (file.includes(threadsDir)) {
        try {
          await buildThreads({
            threadsDir,
            output,
            minify,
            sourcemap,
            target,
          });
          console.log('✓ Threads rebuilt');
        } catch (error) {
          console.error(`Failed to rebuild threads: ${error}`);
        }
      }
    },
  };
}

export default threadsPlugin;
