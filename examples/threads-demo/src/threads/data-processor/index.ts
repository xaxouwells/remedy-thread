/**
 * Example thread: Data Processor
 * Demonstrates how to create a thread with message handler
 */

import type { ThreadMessageEvent } from '../../../../../src/threads/types';

interface DataInput {
  numbers: number[];
  operation: 'sum' | 'average' | 'max' | 'min';
}

interface DataOutput {
  result: number;
  operation: string;
  count: number;
}

/**
 * Thread - Message handler
 * Corresponds to self.addEventListener('message')
 */
export async function Thread(event: ThreadMessageEvent<DataInput>): Promise<DataOutput> {
  const { numbers, operation } = event.data;

  let result: number;

  switch (operation) {
    case 'sum':
      result = numbers.reduce((acc, n) => acc + n, 0);
      break;
    case 'average':
      result = numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
      break;
    case 'max':
      result = Math.max(...numbers);
      break;
    case 'min':
      result = Math.min(...numbers);
      break;
    default:
      result = 0;
  }

  return {
    result,
    operation,
    count: numbers.length,
  };
}
