var c=null,g=new Map;async function m(e={}){if(typeof window>"u"||!("serviceWorker"in navigator))throw new Error("Service Workers are not supported in this environment");let{workerPath:t="/worker.js",scope:l="/",type:a="classic"}=e;try{return c=await navigator.serviceWorker.register(t,{scope:l,type:a}),navigator.serviceWorker.addEventListener("message",i=>{let{threadName:r,data:s}=i.data,u=g.get(r);u&&(u(s),g.delete(r))}),c}catch(i){throw new Error(`Failed to register service worker: ${i}`)}}function y(){if(!c)throw new Error("Service worker not registered. Call registerThreads() first.");let e=c.active||c.waiting||c.installing;if(!e)throw new Error("No active service worker found");return e}function w(e){return{execute(t){return y().postMessage({threadName:e,data:t}),{finish(a){g.set(e,a)}}}}}function k(){return typeof window<"u"&&"serviceWorker"in navigator}function $(){return c}async function x(){if(!c)return!1;let e=await c.unregister();return c=null,g.clear(),e}import*as n from"fs";import*as h from"path";import{build as A}from"esbuild";function b(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function I(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function S(e){return e.hasInstall?`      ThreadInstall_${e.name.replace(/-/g,"_")}(event, self)`:""}function E(e){return e.hasActivate?`      ThreadActivate_${e.name.replace(/-/g,"_")}(event, self)`:""}async function F(e){let t=[];if(!n.existsSync(e))return t;let l=n.readdirSync(e,{withFileTypes:!0});for(let a of l)if(a.isDirectory()){let i=h.join(e,a.name),r=h.join(i,"index.ts");if(n.existsSync(r)){let s=n.readFileSync(r,"utf-8");t.push({name:a.name,path:r,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(s),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(s),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(s),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(s)})}}return t}function _(e){let t=e.map(d=>{let o=[],p=d.name.replace(/-/g,"_");return d.hasThread&&o.push(`Thread as Thread_${p}`),d.hasFetch&&o.push(`ThreadFetch as ThreadFetch_${p}`),d.hasInstall&&o.push(`ThreadInstall as ThreadInstall_${p}`),d.hasActivate&&o.push(`ThreadActivate as ThreadActivate_${p}`),`import { ${o.join(", ")} } from './${d.name}/index';`}).join(`
`),l=e.map(b).filter(Boolean).join(`
`),a=e.map(I).filter(Boolean).join(`
`),i=e.map(S).filter(Boolean).join(`,
`),r=e.map(E).filter(Boolean).join(`,
`),s=a?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${a}
});
`:"",u=i?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
      ${i}
    ])
  );
  self.skipWaiting();
});
`:"",f=r?`
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

${l}
${s}
${u}
${f}
`}async function W(e={}){let{threadsDir:t="src/threads",output:l="public/worker.js",minify:a=!1,sourcemap:i=!1,target:r="es2020"}=e,s=h.resolve(process.cwd(),t),u=h.resolve(process.cwd(),l),f=await F(s);if(f.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${f.length} thread(s): ${f.map(p=>p.name).join(", ")}`);let d=_(f),o=h.join(s,"__sw-entry__.ts");n.writeFileSync(o,d,"utf-8");try{await A({entryPoints:[o],bundle:!0,outfile:u,format:"iife",platform:"browser",target:Array.isArray(r)?r:[r],minify:a,sourcemap:i,write:!0}),console.log(`\u2713 Built worker.js at ${l}`)}finally{n.existsSync(o)&&n.unlinkSync(o)}}export{W as buildThreads,$ as getRegistration,k as isServiceWorkerSupported,m as registerThreads,w as thread,x as unregisterThreads};
