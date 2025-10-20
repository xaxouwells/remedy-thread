import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'cli': 'src/cli.ts',
    'plugins/threads-vite': 'src/plugins/threads-vite.ts',
    'plugins/threads-webpack': 'src/plugins/threads-webpack.ts',
    'plugins/threads-rollup': 'src/plugins/threads-rollup.ts',
    'threads/index': 'src/threads/index.ts',
    'threads/client': 'src/threads/client.ts',
    'threads/builder': 'src/threads/builder.ts',
    'threads/types': 'src/threads/types.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: true,  // Minifier pour réduire la taille
  shims: true,
});
