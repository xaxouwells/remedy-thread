/**
 * Build script for threads demo
 * This demonstrates how to use the buildThreads function
 */

import { buildThreads } from '../../src/threads/builder';

async function build() {
  console.log('Building threads...\n');

  await buildThreads({
    threadsDir: 'examples/threads-demo/src/threads',
    output: 'examples/threads-demo/public/worker.js',
    minify: false,
    sourcemap: true,
    target: 'es2020',
  });

  console.log('\nBuild complete!');
}

build().catch(console.error);
