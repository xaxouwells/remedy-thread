import*as s from"fs";import*as h from"path";import{build as y}from"esbuild";function v(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event, self);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function $(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event, self);`:""}function b(e){return e.hasInstall?`      ThreadInstall_${e.name.replace(/-/g,"_")}(event, self)`:""}function w(e){return e.hasActivate?`      ThreadActivate_${e.name.replace(/-/g,"_")}(event, self)`:""}async function A(e){let t=[];if(!s.existsSync(e))return t;let l=s.readdirSync(e,{withFileTypes:!0});for(let r of l)if(r.isDirectory()){let c=h.join(e,r.name),a=h.join(c,"index.ts");if(s.existsSync(a)){let n=s.readFileSync(a,"utf-8");t.push({name:r.name,path:a,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(n),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(n),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(n),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(n)})}}return t}function _(e){let t=e.map(d=>{let o=[],p=d.name.replace(/-/g,"_");return d.hasThread&&o.push(`Thread as Thread_${p}`),d.hasFetch&&o.push(`ThreadFetch as ThreadFetch_${p}`),d.hasInstall&&o.push(`ThreadInstall as ThreadInstall_${p}`),d.hasActivate&&o.push(`ThreadActivate as ThreadActivate_${p}`),`import { ${o.join(", ")} } from './${d.name}/index';`}).join(`
`),l=e.map(v).filter(Boolean).join(`
`),r=e.map($).filter(Boolean).join(`
`),c=e.map(b).filter(Boolean).join(`,
`),a=e.map(w).filter(Boolean).join(`,
`),n=r?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${r}
});
`:"",u=c?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
      ${c}
    ])
  );
  self.skipWaiting();
});
`:"",i=a?`
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${a}
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
${n}
${u}
${i}
`}async function f(e={}){let{threadsDir:t="src/threads",output:l="public/worker.js",minify:r=!1,sourcemap:c=!1,target:a="es2020"}=e,n=h.resolve(process.cwd(),t),u=h.resolve(process.cwd(),l),i=await A(n);if(i.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${i.length} thread(s): ${i.map(p=>p.name).join(", ")}`);let d=_(i),o=h.join(n,"__sw-entry__.ts");s.writeFileSync(o,d,"utf-8");try{await y({entryPoints:[o],bundle:!0,outfile:u,format:"iife",platform:"browser",target:Array.isArray(a)?a:[a],minify:r,sourcemap:c,write:!0}),console.log(`\u2713 Built worker.js at ${l}`)}finally{s.existsSync(o)&&s.unlinkSync(o)}}var m=class{constructor(t={}){this.options=t}apply(t){let{threadsDir:l="src/threads",output:r="worker.js",minify:c,sourcemap:a,target:n}=this.options,u=t.options.output?.path||"dist";t.hooks.beforeCompile.tapPromise("ThreadsWebpackPlugin",async()=>{try{await f({threadsDir:l,output:`${u}/${r}`,minify:c,sourcemap:a,target:n})}catch(i){throw console.error(`[ThreadsWebpackPlugin] Failed to build threads: ${i}`),i}}),t.options.watch&&t.hooks.watchRun.tapPromise("ThreadsWebpackPlugin",async()=>{try{await f({threadsDir:l,output:`${u}/${r}`,minify:c,sourcemap:a,target:n})}catch(i){console.error(`[ThreadsWebpackPlugin] Failed to rebuild threads: ${i}`)}})}},j=m;export{m as ThreadsWebpackPlugin,j as default};
