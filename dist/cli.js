#!/usr/bin/env node
"use strict";var g=Object.create;var r=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var m=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var f=(o,e,n,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of h(e))!b.call(o,s)&&s!==n&&r(o,s,{get:()=>e[s],enumerable:!(l=p(e,s))||l.enumerable});return o};var y=(o,e,n)=>(n=o!=null?g(m(o)):{},f(e||!o||!o.__esModule?r(n,"default",{value:o,enumerable:!0}):n,o));var a=require("child_process"),c=y(require("readline"));function d(o){let e=c.createInterface({input:process.stdin,output:process.stdout});return new Promise(n=>{e.question(o,l=>{e.close(),n(l.trim())})})}async function t(o){let e=await d(`${o} (y/n): `);return e.toLowerCase()==="y"||e.toLowerCase()==="yes"}async function w(o,e){console.log(`
${o}`),e.forEach((s,u)=>{console.log(`  ${u+1}. ${s}`)});let n=await d(`
Enter your choice (1-`+e.length+"): "),l=parseInt(n)-1;return l>=0&&l<e.length?e[l]:(console.log("Invalid choice, defaulting to first option."),e[0])}function i(o,e=!1){let l=`npm install ${e?"-D":""} ${o.join(" ")}`;console.log(`
\u{1F4E6} Installing: ${o.join(", ")}...`);try{(0,a.execSync)(l,{stdio:"inherit"}),console.log(`\u2705 Installation complete!
`)}catch(s){console.error("\u274C Installation failed:",s),process.exit(1)}}async function k(){if(process.env.npm_package_name==="remedy-thread")return;if(console.log(`
\u{1F9F5} Welcome to Remedy Thread Setup!
`),!await t('\u{1F4E6} Would you like to configure remedy-thread now? (you can skip and run "npx remedy-thread" later)')){console.log(`
\u2705 Skipped setup. Run "npx remedy-thread" anytime to configure.
`);return}let e={installEsbuild:!1,hasProject:!1};if(e.installEsbuild=await t("\u{1F4E6} Do you want to install esbuild? (needed for building threads)"),e.hasProject=await t(`
\u{1F3D7}\uFE0F  Do you already have a bundler in your project? (Vite, Webpack, or Rollup)`),!e.hasProject){let s=await w(`
\u{1F527} Which bundler would you like to use?`,["Vite (recommended)","Webpack","Rollup","None (I'll set it up later)"]);s.includes("Vite")?e.bundler="vite":s.includes("Webpack")?e.bundler="webpack":s.includes("Rollup")?e.bundler="rollup":e.bundler="none"}console.log(`
\u{1F4CB} Summary:`),console.log("  - Remedy Thread: \u2705 (already installed)"),console.log(`  - esbuild: ${e.installEsbuild?"\u2705":"\u274C"}`),console.log(`  - Bundler: ${e.bundler||"Already installed"}`);let n=[],l=[];e.installEsbuild&&n.push("esbuild"),e.bundler&&e.bundler!=="none"&&l.push(e.bundler),n.length>0&&i(n,!1),l.length>0&&i(l,!0),console.log(`
\u{1F389} Setup complete!
`),console.log(`\u{1F4D6} Next steps:
`),console.log("1. Create your thread structure:"),console.log("   mkdir -p src/threads/my-thread"),console.log(`   touch src/threads/my-thread/index.ts
`),e.bundler==="vite"?(console.log("2. Add the Vite plugin to vite.config.ts:"),console.log("   import { threadsPlugin } from 'remedy-thread/vite-threads';"),console.log("   export default defineConfig({"),console.log("     plugins: [threadsPlugin()],"),console.log(`   });
`)):e.bundler==="webpack"?(console.log("2. Add the Webpack plugin to webpack.config.js:"),console.log("   const { ThreadsWebpackPlugin } = require('remedy-thread/webpack-threads');"),console.log("   module.exports = {"),console.log("     plugins: [new ThreadsWebpackPlugin()],"),console.log(`   };
`)):e.bundler==="rollup"?(console.log("2. Add the Rollup plugin to rollup.config.js:"),console.log("   import { threadsRollupPlugin } from 'remedy-thread/rollup-threads';"),console.log("   export default {"),console.log("     plugins: [threadsRollupPlugin()],"),console.log(`   };
`)):e.installEsbuild&&(console.log("2. Create a build script (build-threads.ts):"),console.log("   import { buildThreads } from 'remedy-thread/builder';"),console.log(`   buildThreads().catch(console.error);
`)),console.log(`3. Read the docs: https://www.npmjs.com/package/remedy-thread
`)}k().catch(o=>{console.error("Error:",o),process.exit(1)});
