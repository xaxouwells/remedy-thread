import { Plugin } from 'rollup';
import { ThreadBuildOptions } from '../threads/builder.mjs';

/**
 * Rollup plugin for automatic thread building
 */

interface ThreadsRollupPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
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
declare function threadsRollupPlugin(options?: ThreadsRollupPluginOptions): Plugin;

export { type ThreadsRollupPluginOptions, threadsRollupPlugin as default, threadsRollupPlugin };
