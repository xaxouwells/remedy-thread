/**
 * Rollup plugin for automatic thread building
 */

import type { Plugin } from 'rollup';
import { buildThreads, type ThreadBuildOptions } from '../threads/builder';

export interface ThreadsRollupPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
  /** Output file path (default: 'dist/worker.js') */
  output?: string;
}

/**
 * Rollup plugin that automatically builds threads during compilation
 *
 * @example
 * ```javascript
 * // rollup.config.js
 * import { threadsRollupPlugin } from 'servex-thread/rollup-threads';
 *
 * export default {
 *   plugins: [
 *     threadsRollupPlugin({
 *       threadsDir: 'src/threads',
 *       output: 'dist/worker.js',
 *       minify: true,
 *     }),
 *   ],
 * };
 * ```
 */
export function threadsRollupPlugin(options: ThreadsRollupPluginOptions = {}): Plugin {
  const {
    threadsDir = 'src/threads',
    output = 'dist/worker.js',
    minify,
    sourcemap,
    target,
  } = options;

  return {
    name: 'servex-thread-threads-rollup',

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

    async watchChange(id) {
      // Rebuild threads when any thread file changes
      if (id.includes(threadsDir)) {
        try {
          await buildThreads({
            threadsDir,
            output,
            minify,
            sourcemap,
            target,
          });
          console.log('[servex-thread-threads] Threads rebuilt');
        } catch (error) {
          console.error(`[servex-thread-threads] Failed to rebuild threads: ${error}`);
        }
      }
    },
  };
}

export default threadsRollupPlugin;
