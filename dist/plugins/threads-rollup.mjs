import*as r from"fs";import*as d from"path";import{build as T}from"esbuild";function v(e){if(!e.hasThread)return"";let t=e.name.replace(/-/g,"_");return`
// Message handler for thread: ${e.name}
self.addEventListener('message', async (event) => {
  const { threadName } = event.data;
  if (threadName === '${e.name}') {
    const result = await Thread_${t}(event);
    if (event.source) {
      event.source.postMessage({ threadName: '${e.name}', data: result });
    }
  }
});`}function y(e){return e.hasFetch?`  ThreadFetch_${e.name.replace(/-/g,"_")}(event);`:""}function $(e){return e.hasInstall?`    ThreadInstall_${e.name.replace(/-/g,"_")}(event)`:""}function b(e){return e.hasActivate?`    ThreadActivate_${e.name.replace(/-/g,"_")}(event)`:""}async function w(e){let t=[];if(!r.existsSync(e))return t;let o=r.readdirSync(e,{withFileTypes:!0});for(let s of o)if(s.isDirectory()){let l=d.join(e,s.name),a=d.join(l,"index.ts");if(r.existsSync(a)){let n=r.readFileSync(a,"utf-8");t.push({name:s.name,path:a,hasThread:/export\s+(const|async\s+function|function)\s+Thread\b/.test(n),hasFetch:/export\s+(const|async\s+function|function)\s+ThreadFetch\b/.test(n),hasInstall:/export\s+(const|async\s+function|function)\s+ThreadInstall\b/.test(n),hasActivate:/export\s+(const|async\s+function|function)\s+ThreadActivate\b/.test(n)})}}return t}function A(e){let t=e.map(c=>{let i=[],u=c.name.replace(/-/g,"_");return c.hasThread&&i.push(`Thread as Thread_${u}`),c.hasFetch&&i.push(`ThreadFetch as ThreadFetch_${u}`),c.hasInstall&&i.push(`ThreadInstall as ThreadInstall_${u}`),c.hasActivate&&i.push(`ThreadActivate as ThreadActivate_${u}`),`import { ${i.join(", ")} } from './${c.name}/index';`}).join(`
`),o=e.map(v).filter(Boolean).join(`
`),s=e.map(y).filter(Boolean).join(`
`),l=e.map($).filter(Boolean).join(`,
`),a=e.map(b).filter(Boolean).join(`,
`),n=s?`
// Fetch handler - calls all thread fetch handlers
self.addEventListener('fetch', async (event) => {
${s}
});
`:"",f=l?`
// Install handler - coordinates all thread installations
self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
${l}
    ])
  );
  self.skipWaiting();
});
`:"",h=a?`
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

${o}
${n}${f}${h}
`}async function p(e={}){let{threadsDir:t="src/threads",output:o="public/worker.js",minify:s=!1,sourcemap:l=!1,target:a="es2020"}=e,n=d.resolve(process.cwd(),t),f=d.resolve(process.cwd(),o),h=await w(n);if(h.length===0){console.warn(`No threads found in ${t}`);return}console.log(`Found ${h.length} thread(s): ${h.map(u=>u.name).join(", ")}`);let c=A(h),i=d.join(n,"__sw-entry__.ts");r.writeFileSync(i,c,"utf-8");try{await T({entryPoints:[i],bundle:!0,outfile:f,format:"iife",platform:"browser",target:Array.isArray(a)?a:[a],minify:s,sourcemap:l,write:!0}),console.log(`\u2713 Built worker.js at ${o}`)}finally{r.existsSync(i)&&r.unlinkSync(i)}}function x(e={}){let{threadsDir:t="src/threads",output:o="dist/worker.js",minify:s,sourcemap:l,target:a}=e;return{name:"servex-thread-threads-rollup",async buildStart(){try{await p({threadsDir:t,output:o,minify:s,sourcemap:l,target:a})}catch(n){this.error(`Failed to build threads: ${n}`)}},async watchChange(n){if(n.includes(t))try{await p({threadsDir:t,output:o,minify:s,sourcemap:l,target:a}),console.log("[servex-thread-threads] Threads rebuilt")}catch(f){console.error(`[servex-thread-threads] Failed to rebuild threads: ${f}`)}}}}var M=x;export{M as default,x as threadsRollupPlugin};
