// interaction-effects.js
// Paquete: barra progreso scroll, header shrink, botón back-to-top, contadores métricas
// No usa dependencias externas.

(function(){
  const docEl = document.documentElement;
  const progressEl = document.getElementById('scroll-progress');
  let ticking = false;

  function updateProgress(){
    if(!progressEl) return;
    const scrollTop = window.scrollY || docEl.scrollTop;
    const max = (docEl.scrollHeight - window.innerHeight) || 1;
    const ratio = Math.min(1, scrollTop / max);
    progressEl.style.transform = `scaleX(${ratio})`;
  }

  function onScroll(){
    if(!ticking){
      window.requestAnimationFrame(()=>{
        updateProgress();
        handleShrink();
        toggleBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Header shrink
  let shrinkApplied = false;
  function handleShrink(){
    const threshold = 60;
    if(window.scrollY > threshold && !shrinkApplied){
      document.body.classList.add('scrolled');
      shrinkApplied = true;
    } else if(window.scrollY <= threshold && shrinkApplied){
      document.body.classList.remove('scrolled');
      shrinkApplied = false;
    }
  }

  // Back to top
  let backBtn = document.getElementById('back-to-top');
  function ensureBackBtn(){
    if(!backBtn){
      backBtn = document.createElement('button');
      backBtn.id = 'back-to-top';
      backBtn.type = 'button';
      backBtn.setAttribute('aria-label','Volver arriba');
      backBtn.innerHTML = '<span aria-hidden="true">↑</span>';
      document.body.appendChild(backBtn);
      backBtn.addEventListener('click',() => window.scrollTo({top:0, behavior:'smooth'}));
    }
  }
  ensureBackBtn();
  function toggleBackToTop(){
    if(!backBtn) return;
    if(window.scrollY > window.innerHeight * 0.6){
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }

  // Contadores en MetricsStrip
  const counterEls = [];
  document.querySelectorAll('.metrics .metric-value').forEach(el => {
    const raw = el.textContent?.trim() || '';
    // Detectar sufijos (+, %, etc.)
    const match = raw.match(/([0-9][0-9\.,]*)\s*(.*)/);
    if(match){
      const numberPart = match[1].replace(/\./g,'').replace(/,/g,'');
      const suffix = match[2];
      const target = parseInt(numberPart,10);
      if(!isNaN(target)){
        counterEls.push({ el, target, suffix });
        el.dataset.counterOriginal = raw; // para fallback / debug
        el.textContent = '0' + (suffix||'');
      }
    }
  });

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  function animateCounter(item){
    const { el, target, suffix } = item;
    if(el.dataset.countDone) return;
    el.dataset.countDone = 'true';
    const duration = 1400;
    const start = performance.now();
    function frame(now){
      const p = Math.min(1, (now - start)/duration);
      const eased = easeOut(p);
      const val = Math.round(eased * target);
      el.textContent = val.toLocaleString('es-CL') + (suffix||'');
      if(p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if(counterEls.length){
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const item = counterEls.find(c => c.el === el);
          if(item){ animateCounter(item); }
          obs.unobserve(el);
        }
      });
    }, { threshold:0.5 });
    counterEls.forEach(c => obs.observe(c.el));
  }

  // Inicialización
  updateProgress();
  handleShrink();
  toggleBackToTop();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', updateProgress);
})();
