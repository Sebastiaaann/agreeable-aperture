// Sistema ligero de animaciones sin dependencias externas
// Usa IntersectionObserver + CSS transitions y transform inicial
// Atributos soportados: data-animate (fade-up, fade-right, zoom-in, scale-in, flip-up, rotate-in)
// data-delay (ms), data-duration (ms), data-initial, data-stagger-group, data-once="false"

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const groups = new Map();
let io;

function setInitialState(){
  document.querySelectorAll('[data-animate]').forEach(el => {
    if(prefersReduced) return; // deja como está
    const type = el.dataset.animate || 'fade-up';
    el.classList.add('anim-pre');
    switch(type){
      case 'fade-up': el.style.transform='translateY(40px)'; break;
      case 'fade-down': el.style.transform='translateY(-40px)'; break;
      case 'fade-left': el.style.transform='translateX(40px)'; break;
      case 'fade-right': el.style.transform='translateX(-40px)'; break;
      case 'zoom-in': el.style.transform='scale(.85)'; break;
      case 'scale-in': el.style.transform='scale(.6)'; break;
      case 'rotate-in': el.style.transform='rotate(-8deg)'; break;
      case 'flip-up': el.style.transform='perspective(800px) rotateX(-75deg)'; break;
      default: el.style.transform='translateY(40px)';
    }
    el.style.opacity='0';
  });
}

function applyAnimation(el, idxInGroup=0){
  if (prefersReduced){
    el.style.opacity='1'; el.style.transform='none'; return;
  }
  const delayBase = Number(el.dataset.delay||0);
  const duration = Number(el.dataset.duration||650);
  const group = el.dataset.staggerGroup;
  const groupDelay = group ? idxInGroup * 90 : 0;
  el.style.transition = `opacity ${duration}ms cubic-bezier(.22,.65,.21,.99), transform ${duration}ms cubic-bezier(.22,.65,.21,.99)`;
  el.style.transitionDelay = `${delayBase + groupDelay}ms`;
  requestAnimationFrame(()=>{
    el.classList.remove('anim-pre');
    el.style.opacity='1';
    el.style.transform='none';
  });
}

function revealAll(){
  document.querySelectorAll('[data-animate]').forEach(el=>{
    el.classList.remove('anim-pre');
    el.style.opacity='1';
    el.style.transform='none';
  });
}

function runInitial(){
  const list = Array.from(document.querySelectorAll('[data-initial]'));
  if(!list.length) return;
  list.forEach((el, i)=> applyAnimation(el, i));
}

function observe(){
  io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const g = el.dataset.staggerGroup;
        if(g){
          const arr = groups.get(g) || [];
          arr.sort((a,b)=> a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
          arr.forEach((ge,idx)=> applyAnimation(ge, idx));
          groups.set(g, []);
        } else {
          applyAnimation(el);
        }
        if (el.dataset.once !== 'false') io.unobserve(el);
      }
    });
  }, { threshold:0.2, rootMargin:'0px 0px -10% 0px' });

  document.querySelectorAll('[data-animate]').forEach(el=>{
    const g = el.dataset.staggerGroup;
    if(g){ if(!groups.has(g)) groups.set(g, []); groups.get(g).push(el); }
    io.observe(el);
  });
}

(function init(){
  try {
    setInitialState();
    if (document.readyState !== 'loading') {
      runInitial();
      observe();
    } else {
      document.addEventListener('DOMContentLoaded', ()=>{ runInitial(); observe(); });
    }
  } catch (e){
    console.warn('Anim error fallback', e);
    revealAll();
  } finally {
    window.__scrollAnimInit = true;
  }
})();

window.__replayAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach(el=>{
    el.style.transition='none';
    el.classList.add('anim-pre');
    el.style.opacity='0';
  });
  setTimeout(()=>{ observe(); runInitial(); }, 50);
};
