import { Compiler } from 'webpack';
import { ThreadBuildOptions } from '../threads/builder.js';

/**
 * Webpack plugin for automatic thread building
 */

interface ThreadsWebpackPluginOptions extends Omit<ThreadBuildOptions, 'output'> {
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
declare class ThreadsWebpackPlugin {
    private options;
    constructor(options?: ThreadsWebpackPluginOptions);
    apply(compiler: Compiler): void;
}

export { ThreadsWebpackPlugin, type ThreadsWebpackPluginOptions, ThreadsWebpackPlugin as default };
