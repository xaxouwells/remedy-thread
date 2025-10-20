"use strict";var S=Object.create;var g=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var _=Object.getPrototypeOf,W=Object.prototype.hasOwnProperty;var M=(e,t)=>{for(var r in t)g(e,r,{get:t[r],enumerable:!0})},T=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of F(t))!W.call(e,a)&&a!==r&&g(e,a,{get:()=>t[a],enumerable:!(n=E(t,a))||n.enumerable});return e};var m=(e,t,r)=>(r=e!=null?S(_(e)):{},T(t||!e||!e.__esModule?g(r,"default",{value:e,enumerable:!0}):r,e)),j=e=>T(g({},"__esModule",{value:!0}),e);var N={};M(N,{buildThreads:()=>I,getRegistration:()=>x,isServiceWorkerSupported:()=>$,registerThreads:()=>w,thread:()=>k,unregisterThreads:()=>A});module.exports=j(N);var l=null,v=new Map;async function w(e={}){if(typeof window>"u"||!("serviceWorker"in navigator))throw new Error("Service Workers are not supported in this environment");let{workerPath:t="/worker.js",scope:r="/",type:n="classic"}=e;try{return l=await navigator.serviceWorker.register(t,{scope:r,type:n}),navigator.serviceWorker.addEventListener("message",a=>{let{threadName:s,data:o}=a.data,u=v.get(s);u&&(u(o),v.delete(s))}),l}catch(a){throw new Error(`Failed to register service worker: ${a}`)}}function H(){if(!l)throw new Error("Service worker not registered. Call registerThreads() first.");let e=l.active||l.waiting||l.installing;if(!e)throw new Error("No active service worker found");return e}function k(e){return{execute(t){return H().postMessage({threadName:e,data:t}),{finish(n){v.set(e,n)}}}}}function $(){return typeof window<"u"&&"serviceWorker"in navigator}function x(){return l}async function A(){if(!l)return!1;let e=await l.unregister();return l=null,v.clear(),e}var i=m(require("fs")),h=m(require("path")),b=require("esbuild");function O(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function P(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function C(e){return e.hasInstall?`      ThreadInstall_${e.name.replace(/-/g,"_")}(event, self)`:""}function R(e){return e.hasActivate?`      ThreadActivate_${e.name.replace(/-/g,"_")}(event, self)`:""}async function B(e){let t=[];if(!i.existsSync(e))return t;let r=i.readdirSync(e,{withFileTypes:!0});for(let n of r)if(n.isDirectory()){let a=h.join(e,n.name),s=h.join(a,"index.ts");if(i.existsSync(s)){let o=i.readFileSync(s,"utf-8");t.push({name:n.name,path:s,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(o),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(o),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(o),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(o)})}}return t}function L(e){let t=e.map(d=>{let c=[],p=d.name.replace(/-/g,"_");return d.hasThread&&c.push(`Thread as Thread_${p}`),d.hasFetch&&c.push(`ThreadFetch as ThreadFetch_${p}`),d.hasInstall&&c.push(`ThreadInstall as ThreadInstall_${p}`),d.hasActivate&&c.push(`ThreadActivate as ThreadActivate_${p}`),`import { ${c.join(", ")} } from './${d.name}/index';`}).join(`
`),r=e.map(O).filter(Boolean).join(`
`),n=e.map(P).filter(Boolean).join(`
`),a=e.map(C).filter(Boolean).join(`,
`),s=e.map(R).filter(Boolean).join(`,
`),o=n?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${n}
});
`:"",u=a?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
      ${a}
    ])
  );
  self.skipWaiting();
});
`:"",f=s?`
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${s}
    ])
  );
  await clients.claim();
});
`:"";return`/**
 * Generated Service Worker
 * This file is auto-generated from your thread definitions
 */

${t}

${r}
${o}
${u}
${f}
`}async function I(e={}){let{threadsDir:t="src/threads",output:r="public/worker.js",minify:n=!1,sourcemap:a=!1,target:s="es2020"}=e,o=h.resolve(process.cwd(),t),u=h.resolve(process.cwd(),r),f=await B(o);if(f.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${f.length} thread(s): ${f.map(p=>p.name).join(", ")}`);let d=L(f),c=h.join(o,"__sw-entry__.ts");i.writeFileSync(c,d,"utf-8");try{await(0,b.build)({entryPoints:[c],bundle:!0,outfile:u,format:"iife",platform:"browser",target:Array.isArray(s)?s:[s],minify:n,sourcemap:a,write:!0}),console.log(`\u2713 Built worker.js at ${r}`)}finally{i.existsSync(c)&&i.unlinkSync(c)}}0&&(module.exports={buildThreads,getRegistration,isServiceWorkerSupported,registerThreads,thread,unregisterThreads});
