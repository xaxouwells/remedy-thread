import*as a from"fs";import*as l from"path";import{build as p}from"esbuild";function m(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function g(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event);`:""}function v(e){return e.hasInstall?`    ThreadInstall_${e.name.replace(/-/g,"_")}(event)`:""}function T(e){return e.hasActivate?`    ThreadActivate_${e.name.replace(/-/g,"_")}(event)`:""}async function y(e){let t=[];if(!a.existsSync(e))return t;let c=a.readdirSync(e,{withFileTypes:!0});for(let i of c)if(i.isDirectory()){let d=l.join(e,i.name),n=l.join(d,"index.ts");if(a.existsSync(n)){let r=a.readFileSync(n,"utf-8");t.push({name:i.name,path:n,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(r),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(r),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(r),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(r)})}}return t}function $(e){let t=e.map(o=>{let s=[],f=o.name.replace(/-/g,"_");return o.hasThread&&s.push(`Thread as Thread_${f}`),o.hasFetch&&s.push(`ThreadFetch as ThreadFetch_${f}`),o.hasInstall&&s.push(`ThreadInstall as ThreadInstall_${f}`),o.hasActivate&&s.push(`ThreadActivate as ThreadActivate_${f}`),`import { ${s.join(", ")} } from './${o.name}/index';`}).join(`
`),c=e.map(m).filter(Boolean).join(`
`),i=e.map(g).filter(Boolean).join(`
`),d=e.map(v).filter(Boolean).join(`,
`),n=e.map(T).filter(Boolean).join(`,
`),r=i?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${i}
});
`:"",u=d?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
${d}
    ])
  );
  self.skipWaiting();
});
`:"",h=n?`
// Activate handler - coordinates all thread activations
self.addEventListener('activate', async (event) => {
  event.waitUntil(
    Promise.all([
${n}
    ])
  );
  await clients.claim();
});
`:"";return`/**
 * Generated Service Worker
 * This file is auto-generated from your thread definitions
 */

${t}

${c}
${r}${u}${h}
`}async function w(e={}){let{threadsDir:t="src/threads",output:c="public/worker.js",minify:i=!1,sourcemap:d=!1,target:n="es2020"}=e,r=l.resolve(process.cwd(),t),u=l.resolve(process.cwd(),c),h=await y(r);if(h.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${h.length} thread(s): ${h.map(f=>f.name).join(", ")}`);let o=$(h),s=l.join(r,"__sw-entry__.ts");a.writeFileSync(s,o,"utf-8");try{await p({entryPoints:[s],bundle:!0,outfile:u,format:"iife",platform:"browser",target:Array.isArray(n)?n:[n],minify:i,sourcemap:d,write:!0}),console.log(`\u2713 Built worker.js at ${c}`)}finally{a.existsSync(s)&&a.unlinkSync(s)}}export{w as buildThreads};
