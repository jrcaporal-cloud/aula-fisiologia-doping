// Mede o que sai da caixa do simulador (fora da área visível do painel).
import { chromium } from 'playwright';
const [target='', port='5386', size='1280x720', steps='0'] = process.argv.slice(2);
const [W,H]=size.split('x').map(Number);
const CHROME='/Users/mac/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const url = target.startsWith('#') ? `http://localhost:${port}/aula-fisiologia-doping/${target}` : `http://localhost:${port}/aula-fisiologia-doping/?sim=${target}`;
const b=await chromium.launch({executablePath:CHROME});
const p=await b.newPage({viewport:{width:W,height:H}});
await p.goto(url,{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
for (const s of steps.split(',')) {
  for (let i=0;i<Number(s);i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400); }
  await p.waitForTimeout(1200);
  const out = await p.evaluate(() => {
    const roots=[...document.querySelectorAll('div')].filter(d=>/height: 4\d\d|height: 5\d\d/.test(d.getAttribute('style')||''));
    const res=[];
    for (const r of roots){
      const rb=r.getBoundingClientRect();
      for (const el of r.querySelectorAll('*')){
        const t=el.textContent?.trim()||''; if(!t||el.children.length) continue;
        const q=el.getBoundingClientRect(); if(!q.height) continue;
        if (q.bottom>rb.bottom+1||q.top<rb.top-1||q.right>rb.right+1) res.push(`${t.slice(0,30)} | el ${q.top.toFixed(0)}-${q.bottom.toFixed(0)} vs root ${rb.top.toFixed(0)}-${rb.bottom.toFixed(0)}`);
      }
    }
    return [...new Set(res)].slice(0,10);
  });
  console.log('passo+'+s, JSON.stringify(out,null,1));
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
}
await b.close();
