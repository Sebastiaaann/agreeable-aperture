// Copia pública de interaction-effects.js para servir como asset directo.
// Si prefieres mantenerlo sólo en src y que Astro lo procese, ajusta el import.

(function(){
  // Activar debug escribiendo en consola: window.__interactionDebug = true
  if(!('__interactionDebug' in window)) window.__interactionDebug = false;
  const docEl = document.documentElement;
  const progressEl = document.querySelector('#scroll-progress .bar') || document.getElementById('scroll-progress');
  let ticking = false;
  function updateProgress(){ if(progressEl){ const scrollTop = window.scrollY||docEl.scrollTop; const max=(docEl.scrollHeight-window.innerHeight)||1; const ratio=Math.min(1,scrollTop/max); progressEl.style.transform=`scaleX(${ratio})`; if(window.__interactionDebug) progressEl.dataset.ratio = ratio.toFixed(3); }}
  let shrink=false; function handleShrink(){ const th=60; if(window.scrollY>th && !shrink){ document.body.classList.add('scrolled'); shrink=true; } else if(window.scrollY<=th && shrink){ document.body.classList.remove('scrolled'); shrink=false; } }
  let backBtn=document.getElementById('back-to-top'); if(!backBtn){ backBtn=document.createElement('button'); backBtn.id='back-to-top'; backBtn.type='button'; backBtn.setAttribute('aria-label','Volver arriba'); backBtn.innerHTML='<span aria-hidden="true">↑</span>'; document.body.appendChild(backBtn); backBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})); if(window.__interactionDebug) console.info('[interaction] back-to-top creado'); }
  function toggleBack(){ if(!backBtn) return; if(window.scrollY>window.innerHeight*0.3){ backBtn.classList.add('visible'); } else { backBtn.classList.remove('visible'); } }
  function onScroll(){ if(!ticking){ requestAnimationFrame(()=>{ updateProgress(); handleShrink(); toggleBack(); ticking=false; }); ticking=true; } }
  const counterEls=[]; document.querySelectorAll('.metrics .metric-value').forEach(el=>{ const raw=el.getAttribute('data-counter') || el.textContent?.trim()||''; // acepta formato +8, 8+, 2,500+, 98%, etc
    const cleaned = raw.replace(/^\+/,'');
    const m=cleaned.match(/([0-9][0-9\.,]*)\s*([+%]?)/); if(m){ let numberPart=m[1].replace(/\./g,'').replace(/,/g,''); const suffix=m[2] || (/[+%]$/.test(raw)? raw.trim().slice(-1):''); const target=parseInt(numberPart,10); if(!isNaN(target)){ counterEls.push({el,target,suffix}); el.dataset.counterOriginal=raw; el.textContent='0'+(suffix||''); if(window.__interactionDebug) console.info('[interaction] counter registrado', raw); } }});
  const easeOut=t=>1-Math.pow(1-t,3); function animateCounter(item){ const {el,target,suffix}=item; if(el.dataset.countDone) return; el.dataset.countDone='true'; const dur=1400; const start=performance.now(); function frame(now){ const p=Math.min(1,(now-start)/dur); const val=Math.round(easeOut(p)*target); el.textContent=val.toLocaleString('es-CL')+(suffix||''); if(p<1) requestAnimationFrame(frame); } requestAnimationFrame(frame); }
  if(counterEls.length){ const obs=new IntersectionObserver(entries=>{ entries.forEach(en=>{ if(en.isIntersecting){ const it=counterEls.find(c=>c.el===en.target); if(it){ animateCounter(it); if(window.__interactionDebug) console.info('[interaction] counter animado', it.el.dataset.counterOriginal); } obs.unobserve(en.target); }}); },{threshold:0.4}); counterEls.forEach(c=>obs.observe(c.el)); }
  updateProgress(); handleShrink(); toggleBack(); window.addEventListener('scroll',onScroll,{passive:true}); window.addEventListener('resize',updateProgress);
})();
