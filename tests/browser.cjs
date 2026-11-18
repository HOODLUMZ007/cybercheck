const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
for(const engine of [chromium,webkit]){
 let b;try{b=await engine.launch({headless:true,...(engine===chromium?{executablePath:process.env.CHROME_PATH||chromium.executablePath(),args:['--no-sandbox']}: {})})}catch(e){console.log(engine.name()+': BLOCKED '+e.message.split('\n')[0]);process.exitCode=1;continue}
 for(const width of [320,390,768,1280]){
 const context=await b.newContext({viewport:{width,height:844},acceptDownloads:true}); const page=await context.newPage();const requests=[],errors=[],payloads=[];
 page.on('request',r=>{requests.push(r.url());if(r.postData())payloads.push(r.postData())});page.on('pageerror',e=>errors.push(e.message));
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
 await page.getByRole('button',{name:'Check another',exact:true}).click();
 await page.getByText('Check multiple websites',{exact:true}).click();
 const addresses=page.getByLabel('Website addresses');
 await addresses.fill('https://cnn.com/private?token=batch-sentinel\nCNN.com\nbbc.com\nexample.org\ninvalid');
 await page.getByRole('button',{name:'Check addresses',exact:true}).click();
 assert.match(await page.getByRole('status').innerText(),/3 unique hostnames checked/);
 assert.equal(await addresses.inputValue(),'');
 for(const label of ['Exact published match','Related hostname only','Not listed']) {
  await page.getByText(label,{exact:true}).waitFor();
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.getByRole('button',{name:'Assess cnn.com',exact:true}).click();
 await page.getByRole('heading',{name:'Tell us about your visit'}).waitFor();
 await page.getByRole('button',{name:'View assessment',exact:true}).click();
 await page.getByRole('heading',{name:'Affected host identified — timing unclear'}).waitFor();
 assert.ok(requests.every(url=>!url.includes('batch-sentinel')));
 assert.deepEqual(payloads,[]);
 assert.deepEqual(await context.cookies(),[]);
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
 assert.equal(requests.filter(u=>!u.startsWith('http://127.0.0.1:4173/')).length,0);
 assert.equal(requests.some(u=>u.includes('equifax')),false);assert.deepEqual(errors,[]);
 console.log(engine.name(),width,'PASS: flow, layout, download, no external requests/storage/errors');await context.close();
 }
 await b.close();
}
})().catch(e=>{console.error(e);process.exitCode=1});
