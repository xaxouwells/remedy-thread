#!/usr/bin/env node
"use strict";var g=Object.create;var t=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var b=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty;var m=(e,o,l,n)=>{if(o&&typeof o=="object"||typeof o=="function")for(let s of h(o))!f.call(e,s)&&s!==l&&t(e,s,{get:()=>o[s],enumerable:!(n=p(o,s))||n.enumerable});return e};var w=(e,o,l)=>(l=e!=null?g(b(e)):{},m(o||!e||!e.__esModule?t(l,"default",{value:e,enumerable:!0}):l,e));var a=require("child_process"),c=w(require("readline"));function d(e){let o=c.createInterface({input:process.stdin,output:process.stdout});return new Promise(l=>{o.question(e,n=>{o.close(),l(n.trim())})})}async function r(e){let o=await d(`${e} (y/n): `);return o.toLowerCase()==="y"||o.toLowerCase()==="yes"}async function y(e,o){console.log(`
${e}`),o.forEach((s,u)=>{console.log(`  ${u+1}. ${s}`)});let l=await d(`
Enter your choice (1-`+o.length+"): "),n=parseInt(l)-1;return n>=0&&n<o.length?o[n]:(console.log("Invalid choice, defaulting to first option."),o[0])}function i(e,o=!1){let n=`npm install ${o?"-D":""} ${e.join(" ")}`;console.log(`
\u{1F4E6} Installing: ${e.join(", ")}...`);try{(0,a.execSync)(n,{stdio:"inherit"}),console.log(`\u2705 Installation complete!
`)}catch(s){console.error("\u274C Installation failed:",s),process.exit(1)}}async function v(){console.log(`
\u{1F9F5} Welcome to Servex Thread Setup!
`);let e={installEsbuild:!1,hasProject:!1};if(e.installEsbuild=await r("\u{1F4E6} Do you want to install esbuild? (needed for building threads)"),e.hasProject=await r(`
\u{1F3D7}\uFE0F  Do you already have a bundler in your project? (Vite, Webpack, or Rollup)`),!e.hasProject){let n=await y(`
\u{1F527} Which bundler would you like to use?`,["Vite (recommended)","Webpack","Rollup","None (I'll set it up later)"]);n.includes("Vite")?e.bundler="vite":n.includes("Webpack")?e.bundler="webpack":n.includes("Rollup")?e.bundler="rollup":e.bundler="none"}console.log(`
\u{1F4CB} Summary:`),console.log("  - Servex Thread: \u2705 (already installing)"),console.log(`  - esbuild: ${e.installEsbuild?"\u2705":"\u274C"}`),console.log(`  - Bundler: ${e.bundler||"Already installed"}`);let o=[],l=[];e.installEsbuild&&o.push("esbuild"),e.bundler&&e.bundler!=="none"&&l.push(e.bundler),o.length>0&&i(o,!1),l.length>0&&i(l,!0),console.log(`
\u{1F389} Setup complete!
`),console.log(`\u{1F4D6} Next steps:
`),console.log("1. Create your thread structure:"),console.log("   mkdir -p src/threads/my-thread"),console.log(`   touch src/threads/my-thread/index.ts
`),e.bundler==="vite"?(console.log("2. Add the Vite plugin to vite.config.ts:"),console.log("   import { threadsPlugin } from 'servex-thread/vite-threads';"),console.log("   export default defineConfig({"),console.log("     plugins: [threadsPlugin()],"),console.log(`   });
`)):e.bundler==="webpack"?(console.log("2. Add the Webpack plugin to webpack.config.js:"),console.log("   const { ThreadsWebpackPlugin } = require('servex-thread/webpack-threads');"),console.log("   module.exports = {"),console.log("     plugins: [new ThreadsWebpackPlugin()],"),console.log(`   };
`)):e.bundler==="rollup"?(console.log("2. Add the Rollup plugin to rollup.config.js:"),console.log("   import { threadsRollupPlugin } from 'servex-thread/rollup-threads';"),console.log("   export default {"),console.log("     plugins: [threadsRollupPlugin()],"),console.log(`   };
`)):e.installEsbuild&&(console.log("2. Create a build script (build-threads.ts):"),console.log("   import { buildThreads } from 'servex-thread/builder';"),console.log(`   buildThreads().catch(console.error);
`)),console.log(`3. Read the docs: https://www.npmjs.com/package/servex-thread
`)}v().catch(e=>{console.error("Error:",e),process.exit(1)});
