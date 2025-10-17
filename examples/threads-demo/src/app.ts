/**
 * Example usage of the thread API
 * Framework-agnostic client code
 */

import { registerThreads, thread } from '../../../dist/threads/index.js';

async function main() {
  console.log('Registering threads...');

  try {
    // Register service worker threads
    await registerThreads({
      workerPath: '/worker.js',
      scope: '/',
    });

    console.log('✓ Threads registered successfully');

    // Example 1: Use data-processor thread
    console.log('\n--- Example 1: Data Processor ---');
    thread('data-processor')
      .execute({
        numbers: [1, 2, 3, 4, 5],
        operation: 'sum',
      })
      .finish((result) => {
        console.log('Sum result:', result);
        // Output: { result: 15, operation: 'sum', count: 5 }
      });

    thread('data-processor')
      .execute({
        numbers: [10, 20, 30, 40, 50],
        operation: 'average',
      })
      .finish((result) => {
        console.log('Average result:', result);
        // Output: { result: 30, operation: 'average', count: 5 }
      });

    // Example 2: Use cache-manager thread
    console.log('\n--- Example 2: Cache Manager ---');

    // List cached URLs
    thread('cache-manager')
      .execute({
        action: 'list',
      })
      .finish((result) => {
        console.log('Cached URLs:', result);
      });

    // Add URL to cache
    thread('cache-manager')
      .execute({
        action: 'add',
        url: '/api/data.json',
      })
      .finish((result) => {
        console.log('Add to cache:', result);
      });

    // Clear all caches
    setTimeout(() => {
      thread('cache-manager')
        .execute({
          action: 'clear',
        })
        .finish((result) => {
          console.log('Clear cache:', result);
        });
    }, 2000);

  } catch (error) {
    console.error('Failed to initialize threads:', error);
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
