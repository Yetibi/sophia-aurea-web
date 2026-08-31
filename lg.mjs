import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:1280,height:900}});
const rotas=[];
p.on('response', r=>{ if(r.status()>=400 && /\.(png|jpg|svg|webp)/i.test(r.url())) rotas.push(`${r.status()} ${r.url().slice(-55)}`); });
await p.goto('https://www.sophiaaurea.co/catalogo',{waitUntil:'networkidle',timeout:70000}).catch(()=>{});
await p.waitForTimeout(6000);
const logo = await p.evaluate(()=>{
  const i=document.querySelector('header img');
  return i?{src:(i.currentSrc||i.src), cargada:i.complete&&i.naturalWidth>0, ancho:i.naturalWidth}:null;
});
console.log('════ LOGO EN EL CATÁLOGO ════');
console.log('  ', logo ? `cargada: ${logo.cargada?'SÍ ✅':'NO ⚠️'} | ${logo.ancho}px | ${logo.src.slice(0,70)}` : 'no hay <img> en el header');
console.log('  imágenes rotas:', rotas.length||'ninguna ✅');
rotas.slice(0,3).forEach(r=>console.log('    🔴',r));
await b.close();
