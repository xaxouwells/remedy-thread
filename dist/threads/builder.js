"use strict";var T=Object.create;var u=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var _=(e,t)=>{for(var a in t)u(e,a,{get:t[a],enumerable:!0})},m=(e,t,a,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of $(t))!b.call(e,n)&&n!==a&&u(e,n,{get:()=>t[n],enumerable:!(r=y(t,n))||r.enumerable});return e};var g=(e,t,a)=>(a=e!=null?T(A(e)):{},m(t||!e||!e.__esModule?u(a,"default",{value:e,enumerable:!0}):a,e)),w=e=>m(u({},"__esModule",{value:!0}),e);var S={};_(S,{buildThreads:()=>H});module.exports=w(S);var s=g(require("fs")),d=g(require("path")),v=require("esbuild");function F(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function j(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function x(e){return e.hasInstall?`    ThreadInstall_${e.name.replace(/-/g,"_")}(event, self);`:""}function M(e){return e.hasActivate?`    ThreadActivate_${e.name.replace(/-/g,"_")}(event, self);`:""}async function I(e){let t=[];if(!s.existsSync(e))return t;let a=s.readdirSync(e,{withFileTypes:!0});for(let r of a)if(r.isDirectory()){let n=d.join(e,r.name),i=d.join(n,"index.ts");if(s.existsSync(i)){let l=s.readFileSync(i,"utf-8");t.push({name:r.name,path:i,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(l),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(l),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(l),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(l)})}}return t}function C(e){let t=e.map(c=>{let o=[],f=c.name.replace(/-/g,"_");return c.hasThread&&o.push(`Thread as Thread_${f}`),c.hasFetch&&o.push(`ThreadFetch as ThreadFetch_${f}`),c.hasInstall&&o.push(`ThreadInstall as ThreadInstall_${f}`),c.hasActivate&&o.push(`ThreadActivate as ThreadActivate_${f}`),`import { ${o.join(", ")} } from './${c.name}/index';`}).join(`
`),a=e.map(F).filter(Boolean).join(`
`),r=e.map(j).filter(Boolean).join(`
`),n=e.map(x).filter(Boolean).join(`,
`),i=e.map(M).filter(Boolean).join(`,
`),l=r?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${r}
});
`:"",p=n?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
${n}
    ])
  );
  self.skipWaiting();
});
`:"",h=i?`
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${i}
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
${l}${p}${h}
`}async function H(e={}){let{threadsDir:t="src/threads",output:a="public/worker.js",minify:r=!1,sourcemap:n=!1,target:i="es2020"}=e,l=d.resolve(process.cwd(),t),p=d.resolve(process.cwd(),a),h=await I(l);if(h.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${h.length} thread(s): ${h.map(f=>f.name).join(", ")}`);let c=C(h),o=d.join(l,"__sw-entry__.ts");s.writeFileSync(o,c,"utf-8");try{await(0,v.build)({entryPoints:[o],bundle:!0,outfile:p,format:"iife",platform:"browser",target:Array.isArray(i)?i:[i],minify:r,sourcemap:n,write:!0}),console.log(`\u2713 Built worker.js at ${a}`)}finally{s.existsSync(o)&&s.unlinkSync(o)}}0&&(module.exports={buildThreads});
