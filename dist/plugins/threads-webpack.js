"use strict";var $=Object.create;var f=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,_=Object.prototype.hasOwnProperty;var k=(e,t)=>{for(var a in t)f(e,a,{get:t[a],enumerable:!0})},T=(e,t,a,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of w(t))!_.call(e,n)&&n!==a&&f(e,n,{get:()=>t[n],enumerable:!(s=b(t,n))||s.enumerable});return e};var y=(e,t,a)=>(a=e!=null?$(A(e)):{},T(t||!e||!e.__esModule?f(a,"default",{value:e,enumerable:!0}):a,e)),x=e=>T(f({},"__esModule",{value:!0}),e);var W={};k(W,{ThreadsWebpackPlugin:()=>m,default:()=>O});module.exports=x(W);var o=y(require("fs")),h=y(require("path")),v=require("esbuild");function P(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function j(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function C(e){return e.hasInstall?`      ThreadInstall_${e.name.replace(/-/g,"_")}(event, self)`:""}function M(e){return e.hasActivate?`      ThreadActivate_${e.name.replace(/-/g,"_")}(event, self)`:""}async function I(e){let t=[];if(!o.existsSync(e))return t;let a=o.readdirSync(e,{withFileTypes:!0});for(let s of a)if(s.isDirectory()){let n=h.join(e,s.name),r=h.join(n,"index.ts");if(o.existsSync(r)){let i=o.readFileSync(r,"utf-8");t.push({name:s.name,path:r,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(i),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(i),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(i),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(i)})}}return t}function B(e){let t=e.map(d=>{let c=[],p=d.name.replace(/-/g,"_");return d.hasThread&&c.push(`Thread as Thread_${p}`),d.hasFetch&&c.push(`ThreadFetch as ThreadFetch_${p}`),d.hasInstall&&c.push(`ThreadInstall as ThreadInstall_${p}`),d.hasActivate&&c.push(`ThreadActivate as ThreadActivate_${p}`),`import { ${c.join(", ")} } from './${d.name}/index';`}).join(`
`),a=e.map(P).filter(Boolean).join(`
`),s=e.map(j).filter(Boolean).join(`
`),n=e.map(C).filter(Boolean).join(`,
`),r=e.map(M).filter(Boolean).join(`,
`),i=s?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${s}
});
`:"",u=n?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
      ${n}
    ])
  );
  self.skipWaiting();
});
`:"",l=r?`
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${r}
    ])
  );
  await clients.claim();
});
`:"";return`/**
 * Generated Service Worker
 * This file is auto-generated from your thread definitions
 */

${t}

${a}
${i}
${u}
${l}
`}async function g(e={}){let{threadsDir:t="src/threads",output:a="public/worker.js",minify:s=!1,sourcemap:n=!1,target:r="es2020"}=e,i=h.resolve(process.cwd(),t),u=h.resolve(process.cwd(),a),l=await I(i);if(l.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${l.length} thread(s): ${l.map(p=>p.name).join(", ")}`);let d=B(l),c=h.join(i,"__sw-entry__.ts");o.writeFileSync(c,d,"utf-8");try{await(0,v.build)({entryPoints:[c],bundle:!0,outfile:u,format:"iife",platform:"browser",target:Array.isArray(r)?r:[r],minify:s,sourcemap:n,write:!0}),console.log(`\u2713 Built worker.js at ${a}`)}finally{o.existsSync(c)&&o.unlinkSync(c)}}var m=class{constructor(t={}){this.options=t}apply(t){let{threadsDir:a="src/threads",output:s="worker.js",minify:n,sourcemap:r,target:i}=this.options,u=t.options.output?.path||"dist";t.hooks.beforeCompile.tapPromise("ThreadsWebpackPlugin",async()=>{try{await g({threadsDir:a,output:`${u}/${s}`,minify:n,sourcemap:r,target:i})}catch(l){throw console.error(`[ThreadsWebpackPlugin] Failed to build threads: ${l}`),l}}),t.options.watch&&t.hooks.watchRun.tapPromise("ThreadsWebpackPlugin",async()=>{try{await g({threadsDir:a,output:`${u}/${s}`,minify:n,sourcemap:r,target:i})}catch(l){console.error(`[ThreadsWebpackPlugin] Failed to rebuild threads: ${l}`)}})}},O=m;0&&(module.exports={ThreadsWebpackPlugin});
