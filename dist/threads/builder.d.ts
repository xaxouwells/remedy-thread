/**
 * Thread builder - Compiles TypeScript thread definitions into a single worker.js
 */
interface ThreadBuildOptions {
    /** Path to the threads directory (default: 'src/threads') */
    threadsDir?: string;
    /** Output file path (default: 'public/worker.js') */
    output?: string;
    /** Whether to minify the output */
    minify?: boolean;
    /** Whether to generate source maps */
    sourcemap?: boolean;
    /** Target ECMAScript version */
    target?: string | string[];
}
/**
 * Build all threads into a single worker.js file
 *
 * @example
 * ```typescript
 * import { buildThreads } from 'sw-merger/threads/builder';
 *
 * await buildThreads({
 *   threadsDir: 'src/threads',
 *   output: 'public/worker.js',
 *   minify: true
 * });
 * ```
 */
declare function buildThreads(options?: ThreadBuildOptions): Promise<void>;

export { type ThreadBuildOptions, buildThreads };
