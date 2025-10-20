"use strict";var $=Object.create;var p=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,x=Object.prototype.hasOwnProperty;var _=(e,t)=>{for(var a in t)p(e,a,{get:t[a],enumerable:!0})},g=(e,t,a,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of w(t))!x.call(e,n)&&n!==a&&p(e,n,{get:()=>t[n],enumerable:!(s=b(t,n))||s.enumerable});return e};var T=(e,t,a)=>(a=e!=null?$(A(e)):{},g(t||!e||!e.__esModule?p(a,"default",{value:e,enumerable:!0}):a,e)),F=e=>g(p({},"__esModule",{value:!0}),e);var O={};_(O,{default:()=>H,threadsRollupPlugin:()=>y});module.exports=F(O);var o=T(require("fs")),d=T(require("path")),v=require("esbuild");function P(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function M(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function I(e){return e.hasInstall?`    ThreadInstall_${e.name.replace(/-/g,"_")}(event, self);`:""}function B(e){return e.hasActivate?`    ThreadActivate_${e.name.replace(/-/g,"_")}(event, self);`:""}async function C(e){let t=[];if(!o.existsSync(e))return t;let a=o.readdirSync(e,{withFileTypes:!0});for(let s of a)if(s.isDirectory()){let n=d.join(e,s.name),r=d.join(n,"index.ts");if(o.existsSync(r)){let i=o.readFileSync(r,"utf-8");t.push({name:s.name,path:r,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(i),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(i),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(i),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(i)})}}return t}function S(e){let t=e.map(c=>{let l=[],u=c.name.replace(/-/g,"_");return c.hasThread&&l.push(`Thread as Thread_${u}`),c.hasFetch&&l.push(`ThreadFetch as ThreadFetch_${u}`),c.hasInstall&&l.push(`ThreadInstall as ThreadInstall_${u}`),c.hasActivate&&l.push(`ThreadActivate as ThreadActivate_${u}`),`import { ${l.join(", ")} } from './${c.name}/index';`}).join(`
`),a=e.map(P).filter(Boolean).join(`
`),s=e.map(M).filter(Boolean).join(`
`),n=e.map(I).filter(Boolean).join(`,
`),r=e.map(B).filter(Boolean).join(`,
`),i=s?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${s}
});
`:"",f=n?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
${n}
    ])
  );
  self.skipWaiting();
});
`:"",h=r?`
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
${i}${f}${h}
`}async function m(e={}){let{threadsDir:t="src/threads",output:a="public/worker.js",minify:s=!1,sourcemap:n=!1,target:r="es2020"}=e,i=d.resolve(process.cwd(),t),f=d.resolve(process.cwd(),a),h=await C(i);if(h.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${h.length} thread(s): ${h.map(u=>u.name).join(", ")}`);let c=S(h),l=d.join(i,"__sw-entry__.ts");o.writeFileSync(l,c,"utf-8");try{await(0,v.build)({entryPoints:[l],bundle:!0,outfile:f,format:"iife",platform:"browser",target:Array.isArray(r)?r:[r],minify:s,sourcemap:n,write:!0}),console.log(`\u2713 Built worker.js at ${a}`)}finally{o.existsSync(l)&&o.unlinkSync(l)}}function y(e={}){let{threadsDir:t="src/threads",output:a="dist/worker.js",minify:s,sourcemap:n,target:r}=e;return{name:"servex-thread-threads-rollup",async buildStart(){try{await m({threadsDir:t,output:a,minify:s,sourcemap:n,target:r})}catch(i){this.error(`Failed to build threads: ${i}`)}},async watchChange(i){if(i.includes(t))try{await m({threadsDir:t,output:a,minify:s,sourcemap:n,target:r}),console.log("[servex-thread-threads] Threads rebuilt")}catch(f){console.error(`[servex-thread-threads] Failed to rebuild threads: ${f}`)}}}}var H=y;0&&(module.exports={threadsRollupPlugin});
