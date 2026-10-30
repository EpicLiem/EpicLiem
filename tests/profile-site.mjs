import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.PROFILE_ORIGIN || 'https://profile.epicliem.com';
const label=process.env.PROFILE_LABEL || 'before';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const runs=[];
try {
for(let i=0;i<3;i++) {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const cdp=await context.newCDPSession(page);
 await cdp.send('Network.enable');
 await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.addInitScript(()=>{
  window.__metrics={lcp:0,cls:0,longTasks:0};
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__metrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__metrics.longTasks+=Math.max(0,e.duration-50)}).observe({type:'longtask',buffered:true});
 });
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.locator('blockquote').waitFor();
 const quoteVisible=await page.evaluate(()=>performance.now());
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForLoadState('networkidle');
 const result=await page.evaluate(()=>({metrics:window.__metrics,navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize,encoded:r.encodedBodySize,duration:r.duration,start:r.startTime})),fontReady:performance.now()}));
 result.quoteVisible=quoteVisible;runs.push(result);
 await context.close();
}
await mkdir('outputs/performance',{recursive:true});
await writeFile(`outputs/performance/${label}.json`,JSON.stringify({origin,conditions:'390x844; 150ms RTT, 1.6Mbps down, 4x CPU slowdown; new context and disabled cache each run',runs},null,2));
console.log(JSON.stringify(runs.map(r=>({quoteMs:Math.round(r.quoteVisible),lcpMs:Math.round(r.metrics.lcp),cls:r.metrics.cls,blockingMs:Math.round(r.metrics.longTasks),bytes:r.resources.reduce((s,x)=>s+x.bytes,0)+r.navigation.transferSize,resources:r.resources.map(x=>({path:new URL(x.name).pathname,bytes:x.bytes,ms:Math.round(x.duration)}))})),null,2));
}finally{await browser.close();}
