#!/usr/bin/env node
import{execSync as d}from"child_process";import*as i from"readline";function a(e){let o=i.createInterface({input:process.stdin,output:process.stdout});return new Promise(n=>{o.question(e,l=>{o.close(),n(l.trim())})})}async function t(e){let o=await a(`${e} (y/n): `);return o.toLowerCase()==="y"||o.toLowerCase()==="yes"}async function u(e,o){console.log(`
${e}`),o.forEach((s,c)=>{console.log(`  ${c+1}. ${s}`)});let n=await a(`
Enter your choice (1-`+o.length+"): "),l=parseInt(n)-1;return l>=0&&l<o.length?o[l]:(console.log("Invalid choice, defaulting to first option."),o[0])}function r(e,o=!1){let l=`npm install ${o?"-D":""} ${e.join(" ")}`;console.log(`
\u{1F4E6} Installing: ${e.join(", ")}...`);try{d(l,{stdio:"inherit"}),console.log(`\u2705 Installation complete!
`)}catch(s){console.error("\u274C Installation failed:",s),process.exit(1)}}async function g(){console.log(`
\u{1F9F5} Welcome to Servex Thread Setup!
`);let e={installEsbuild:!1,hasProject:!1};if(e.installEsbuild=await t("\u{1F4E6} Do you want to install esbuild? (needed for building threads)"),e.hasProject=await t(`
\u{1F3D7}\uFE0F  Do you already have a bundler in your project? (Vite, Webpack, or Rollup)`),!e.hasProject){let l=await u(`
\u{1F527} Which bundler would you like to use?`,["Vite (recommended)","Webpack","Rollup","None (I'll set it up later)"]);l.includes("Vite")?e.bundler="vite":l.includes("Webpack")?e.bundler="webpack":l.includes("Rollup")?e.bundler="rollup":e.bundler="none"}console.log(`
\u{1F4CB} Summary:`),console.log("  - Servex Thread: \u2705 (already installing)"),console.log(`  - esbuild: ${e.installEsbuild?"\u2705":"\u274C"}`),console.log(`  - Bundler: ${e.bundler||"Already installed"}`);let o=[],n=[];e.installEsbuild&&o.push("esbuild"),e.bundler&&e.bundler!=="none"&&n.push(e.bundler),o.length>0&&r(o,!1),n.length>0&&r(n,!0),console.log(`
\u{1F389} Setup complete!
`),console.log(`\u{1F4D6} Next steps:
`),console.log("1. Create your thread structure:"),console.log("   mkdir -p src/threads/my-thread"),console.log(`   touch src/threads/my-thread/index.ts
`),e.bundler==="vite"?(console.log("2. Add the Vite plugin to vite.config.ts:"),console.log("   import { threadsPlugin } from 'servex-thread/vite-threads';"),console.log("   export default defineConfig({"),console.log("     plugins: [threadsPlugin()],"),console.log(`   });
`)):e.bundler==="webpack"?(console.log("2. Add the Webpack plugin to webpack.config.js:"),console.log("   const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');"),console.log("   module.exports = {"),console.log("     plugins: [new ThreadsWebpackPlugin()],"),console.log(`   };
`)):e.bundler==="rollup"?(console.log("2. Add the Rollup plugin to rollup.config.js:"),console.log("   import { threadsRollupPlugin } from 'servex-thread/rollup-threads';"),console.log("   export default {"),console.log("     plugins: [threadsRollupPlugin()],"),console.log(`   };
`)):e.installEsbuild&&(console.log("2. Create a build script (build-threads.ts):"),console.log("   import { buildThreads } from 'servex-thread/builder';"),console.log(`   buildThreads().catch(console.error);
`)),console.log(`3. Read the docs: https://www.npmjs.com/package/servex-thread
`)}g().catch(e=>{console.error("Error:",e),process.exit(1)});
