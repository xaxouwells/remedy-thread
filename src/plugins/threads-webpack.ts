/**
 * Webpack plugin for automatic thread building
 */

import type { Compiler } from 'webpack';
import { buildThreads, type ThreadBuildOptions } from '../threads/builder';

export interface ThreadsWebpackPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
  /** Output file path relative to Webpack's output directory */
  output?: string;
}

/**
 * Webpack plugin that automatically builds threads during compilation
 *
 * @example
 * ```javascript
 * // webpack.config.js
 * const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');
 *
 * module.exports = {
 *   plugins: [
 *     new ThreadsWebpackPlugin({
 *       threadsDir: 'src/threads',
 *       minify: true,
 *     }),
 *   ],
 * };
 * ```
 */
export class ThreadsWebpackPlugin {
  private options: ThreadsWebpackPluginOptions;

  constructor(options: ThreadsWebpackPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    const {
      threadsDir = 'src/threads',
      output = 'worker.js',
      minify,
      sourcemap,
      target,
    } = this.options;

    // Get output directory from webpack config
    const outputPath = compiler.options.output?.path || 'dist';

    compiler.hooks.beforeCompile.tapPromise('ThreadsWebpackPlugin', async () => {
      try {
        await buildThreads({
          threadsDir,
          output: `${outputPath}/${output}`,
          minify,
          sourcemap,
          target,
        });
      } catch (error) {
        console.error(`[ThreadsWebpackPlugin] Failed to build threads: ${error}`);
        throw error;
      }
    });

    // Watch for changes in threads directory
    if (compiler.options.watch) {
      compiler.hooks.watchRun.tapPromise('ThreadsWebpackPlugin', async () => {
        try {
          await buildThreads({
            threadsDir,
            output: `${outputPath}/${output}`,
            minify,
            sourcemap,
            target,
          });
        } catch (error) {
          console.error(`[ThreadsWebpackPlugin] Failed to rebuild threads: ${error}`);
        }
      });
    }
  }
}

export default ThreadsWebpackPlugin;
