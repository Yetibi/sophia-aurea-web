import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1280,height:900}});
const fallos=[], errores=[];
p.on('requestfailed', r=>fallos.push(`${r.failure()?.errorText} | ${r.url().slice(0,95)}`));
p.on('response', r=>{ if(r.status()>=400) errores.push(`${r.status()} ${r.url().slice(0,95)}`); });
p.on('console', m=>{ if(m.type()==='error') errores.push('CONSOLA: '+m.text().slice(0,90)); });
await p.goto('https://www.sophiaaurea.co/catalogo',{waitUntil:'networkidle',timeout:70000}).catch(e=>console.log('nav:',e.message.slice(0,60)));
await p.waitForTimeout(7000);
const r = await p.evaluate(()=>({
  txt: document.body.innerText.trim().slice(0,70).replace(/\n/g,' | '),
  imgs: document.querySelectorAll('img').length,
}));
console.log('════ ESTADO ════');
console.log('  texto:', r.txt);
console.log('  imágenes:', r.imgs);
console.log('\n════ RESPUESTAS 4xx/5xx Y ERRORES ════');
[...new Set(errores)].slice(0,8).forEach(e=>console.log('  🔴',e));
console.log('\n════ PETICIONES FALLIDAS ════');
[...new Set(fallos)].slice(0,8).forEach(f=>console.log('  🔴',f));
await b.close();
