const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
for(const engine of [chromium,webkit]){
 let b;try{b=await engine.launch({headless:true,...(engine===chromium?{executablePath:process.env.CHROME_PATH||chromium.executablePath(),args:['--no-sandbox']}: {})})}catch(e){console.log(engine.name()+': BLOCKED '+e.message.split('\n')[0]);process.exitCode=1;continue}
 for(const width of [320,390,768,1280]){
 const context=await b.newContext({viewport:{width,height:844},acceptDownloads:true}); const page=await context.newPage();const requests=[],errors=[];
 page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');
 await page.getByRole('textbox',{name:'Website or company name'}).fill('Equifax');
 await page.getByRole('button',{name:'Continue',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Continue',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'equifax.com',exact:true}).click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByRole('button',{name:'Yes — on November 16',exact:true}).click();
 await page.getByRole('button',{name:'I entered payment card details',exact:true}).click();
 await page.getByRole('button',{name:'View assessment',exact:true}).click();
 await page.getByRole('heading',{name:'Prompt follow-up recommended',exact:true}).waitFor();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'Save summary',exact:true}).click();assert.equal((await dl).suggestedFilename(),'cybercheck-assessment.txt');
 assert.deepEqual(await context.cookies(),[]);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 assert.equal(requests.filter(u=>!u.startsWith('http://127.0.0.1:4173/')).length,0);
 assert.equal(requests.some(u=>u.includes('equifax')),false);assert.deepEqual(errors,[]);
 console.log(engine.name(),width,'PASS: flow, layout, download, no external requests/storage/errors');await context.close();
 }
 await b.close();
}
})().catch(e=>{console.error(e);process.exitCode=1});
