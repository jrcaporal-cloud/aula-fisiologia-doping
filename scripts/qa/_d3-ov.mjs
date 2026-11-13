import { chromium } from 'playwright';
const [target='', port='5386', size='1280x720', nsteps='3'] = process.argv.slice(2);
const [W,H]=size.split('x').map(Number);
const CHROME='/Users/mac/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const url = target.startsWith('#') ? `http://localhost:${port}/aula-fisiologia-doping/${target}` : `http://localhost:${port}/aula-fisiologia-doping/?sim=${target}`;
const b=await chromium.launch({executablePath:CHROME});
const p=await b.newPage({viewport:{width:W,height:H}});
await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
for(let i=0;i<Number(nsteps);i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(500);}
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const out=[];
  for(const el of document.querySelectorAll('*')){
    const cs=getComputedStyle(el);
    if(!/(hidden|clip)/.test(cs.overflow+cs.overflowY+cs.overflowX))continue;
    if(el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2)
      out.push({cls:String(el.className).slice(0,60),txt:(el.textContent||'').slice(0,40),sw:el.scrollWidth,cw:el.clientWidth,sh:el.scrollHeight,ch:el.clientHeight});
  }
  return out;
}),null,1));
await b.close();
