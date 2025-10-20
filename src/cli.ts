#!/usr/bin/env node

/**
 * Servex Thread CLI
 * Interactive setup for installing dependencies
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

interface Answers {
  installEsbuild: boolean;
  hasProject: boolean;
  bundler?: 'vite' | 'webpack' | 'rollup' | 'none';
}

// Simple prompts without external dependencies
function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function confirm(message: string): Promise<boolean> {
  const answer = await question(`${message} (y/n): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function select(message: string, choices: string[]): Promise<string> {
  console.log(`\n${message}`);
  choices.forEach((choice, i) => {
    console.log(`  ${i + 1}. ${choice}`);
  });

  const answer = await question('\nEnter your choice (1-' + choices.length + '): ');
  const index = parseInt(answer) - 1;

  if (index >= 0 && index < choices.length) {
    return choices[index];
  }

  console.log('Invalid choice, defaulting to first option.');
  return choices[0];
}

function installPackages(packages: string[], dev: boolean = false): void {
  const devFlag = dev ? '-D' : '';
  const command = `npm install ${devFlag} ${packages.join(' ')}`;

  console.log(`\n📦 Installing: ${packages.join(', ')}...`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Installation complete!\n');
  } catch (error) {
    console.error('❌ Installation failed:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('\n🧵 Welcome to Servex Thread Setup!\n');

  const answers: Answers = {
    installEsbuild: false,
    hasProject: false,
  };

  // Question 1: Install esbuild?
  answers.installEsbuild = await confirm(
    '📦 Do you want to install esbuild? (needed for building threads)'
  );

  // Question 2: Existing project?
  answers.hasProject = await confirm(
    '\n🏗️  Do you already have a bundler in your project? (Vite, Webpack, or Rollup)'
  );

  // Question 3: Which bundler?
  if (!answers.hasProject) {
    const bundlerChoice = await select(
      '\n🔧 Which bundler would you like to use?',
      ['Vite (recommended)', 'Webpack', 'Rollup', 'None (I\'ll set it up later)']
    );

    if (bundlerChoice.includes('Vite')) {
      answers.bundler = 'vite';
    } else if (bundlerChoice.includes('Webpack')) {
      answers.bundler = 'webpack';
    } else if (bundlerChoice.includes('Rollup')) {
      answers.bundler = 'rollup';
    } else {
      answers.bundler = 'none';
    }
  }

  // Install dependencies
  console.log('\n📋 Summary:');
  console.log('  - Servex Thread: ✅ (already installing)');
  console.log(`  - esbuild: ${answers.installEsbuild ? '✅' : '❌'}`);
  console.log(`  - Bundler: ${answers.bundler || 'Already installed'}`);

  const packagesToInstall: string[] = [];
  const devPackagesToInstall: string[] = [];

  if (answers.installEsbuild) {
    packagesToInstall.push('esbuild');
  }

  if (answers.bundler && answers.bundler !== 'none') {
    devPackagesToInstall.push(answers.bundler);
  }

  // Install packages
  if (packagesToInstall.length > 0) {
    installPackages(packagesToInstall, false);
  }

  if (devPackagesToInstall.length > 0) {
    installPackages(devPackagesToInstall, true);
  }

  // Show next steps
  console.log('\n🎉 Setup complete!\n');
  console.log('📖 Next steps:\n');
  console.log('1. Create your thread structure:');
  console.log('   mkdir -p src/threads/my-thread');
  console.log('   touch src/threads/my-thread/index.ts\n');

  if (answers.bundler === 'vite') {
    console.log('2. Add the Vite plugin to vite.config.ts:');
    console.log('   import { threadsPlugin } from \'servex-thread/vite-threads\';');
    console.log('   export default defineConfig({');
    console.log('     plugins: [threadsPlugin()],');
    console.log('   });\n');
  } else if (answers.bundler === 'webpack') {
    console.log('2. Add the Webpack plugin to webpack.config.js:');
    console.log('   const { ThreadsWebpackPlugin } = require(\'servex-thread/webpack-threads\');');
    console.log('   module.exports = {');
    console.log('     plugins: [new ThreadsWebpackPlugin()],');
    console.log('   };\n');
  } else if (answers.bundler === 'rollup') {
    console.log('2. Add the Rollup plugin to rollup.config.js:');
    console.log('   import { threadsRollupPlugin } from \'servex-thread/rollup-threads\';');
    console.log('   export default {');
    console.log('     plugins: [threadsRollupPlugin()],');
    console.log('   };\n');
  } else if (answers.installEsbuild) {
    console.log('2. Create a build script (build-threads.ts):');
    console.log('   import { buildThreads } from \'servex-thread/builder\';');
    console.log('   buildThreads().catch(console.error);\n');
  }

  console.log('3. Read the docs: https://www.npmjs.com/package/servex-thread\n');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});