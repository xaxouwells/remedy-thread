#!/usr/bin/env node
import{execSync as u}from"child_process";import*as i from"readline";function a(o){let e=i.createInterface({input:process.stdin,output:process.stdout});return new Promise(l=>{e.question(o,n=>{e.close(),l(n.trim())})})}async function t(o){let e=await a(`${o} (y/n): `);return e.toLowerCase()==="y"||e.toLowerCase()==="yes"}async function d(o,e){console.log(`
${o}`),e.forEach((s,c)=>{console.log(`  ${c+1}. ${s}`)});let l=await a(`
Enter your choice (1-`+e.length+"): "),n=parseInt(l)-1;return n>=0&&n<e.length?e[n]:(console.log("Invalid choice, defaulting to first option."),e[0])}function r(o,e=!1){let n=`npm install ${e?"-D":""} ${o.join(" ")}`;console.log(`
\u{1F4E6} Installing: ${o.join(", ")}...`);try{u(n,{stdio:"inherit"}),console.log(`\u2705 Installation complete!
`)}catch(s){console.error("\u274C Installation failed:",s),process.exit(1)}}async function g(){if(process.env.npm_package_name==="servex-thread")return;if(console.log(`
\u{1F9F5} Welcome to Servex Thread Setup!
`),!await t('\u{1F4E6} Would you like to configure servex-thread now? (you can skip and run "npx servex-thread" later)')){console.log(`
\u2705 Skipped setup. Run "npx servex-thread" anytime to configure.
`);return}let e={installEsbuild:!1,hasProject:!1};if(e.installEsbuild=await t("\u{1F4E6} Do you want to install esbuild? (needed for building threads)"),e.hasProject=await t(`
\u{1F3D7}\uFE0F  Do you already have a bundler in your project? (Vite, Webpack, or Rollup)`),!e.hasProject){let s=await d(`
\u{1F527} Which bundler would you like to use?`,["Vite (recommended)","Webpack","Rollup","None (I'll set it up later)"]);s.includes("Vite")?e.bundler="vite":s.includes("Webpack")?e.bundler="webpack":s.includes("Rollup")?e.bundler="rollup":e.bundler="none"}console.log(`
\u{1F4CB} Summary:`),console.log("  - Servex Thread: \u2705 (already installing)"),console.log(`  - esbuild: ${e.installEsbuild?"\u2705":"\u274C"}`),console.log(`  - Bundler: ${e.bundler||"Already installed"}`);let l=[],n=[];e.installEsbuild&&l.push("esbuild"),e.bundler&&e.bundler!=="none"&&n.push(e.bundler),l.length>0&&r(l,!1),n.length>0&&r(n,!0),console.log(`
\u{1F389} Setup complete!
`),console.log(`\u{1F4D6} Next steps:
`),console.log("1. Create your thread structure:"),console.log("   mkdir -p src/threads/my-thread"),console.log(`   touch src/threads/my-thread/index.ts
`),e.bundler==="vite"?(console.log("2. Add the Vite plugin to vite.config.ts:"),console.log("   import { threadsPlugin } from 'servex-thread/vite-threads';"),console.log("   export default defineConfig({"),console.log("     plugins: [threadsPlugin()],"),console.log(`   });
`)):e.bundler==="webpack"?(console.log("2. Add the Webpack plugin to webpack.config.js:"),console.log("   const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');"),console.log("   module.exports = {"),console.log("     plugins: [new ThreadsWebpackPlugin()],"),console.log(`   };
`)):e.bundler==="rollup"?(console.log("2. Add the Rollup plugin to rollup.config.js:"),console.log("   import { threadsRollupPlugin } from 'servex-thread/rollup-threads';"),console.log("   export default {"),console.log("     plugins: [threadsRollupPlugin()],"),console.log(`   };
`)):e.installEsbuild&&(console.log("2. Create a build script (build-threads.ts):"),console.log("   import { buildThreads } from 'servex-thread/builder';"),console.log(`   buildThreads().catch(console.error);
`)),console.log(`3. Read the docs: https://www.npmjs.com/package/servex-thread
`)}g().catch(o=>{console.error("Error:",o),process.exit(1)});
