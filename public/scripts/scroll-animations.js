import * as AnimeNS from 'animejs';
const anime = (AnimeNS && (AnimeNS.default || AnimeNS)) || function noop(){};

const animationPresets = {
  'fade-up':   { translateY: [40, 0], opacity: [0, 1] },
  'fade-down': { translateY: [-40, 0], opacity: [0, 1] },
  'fade-left': { translateX: [40, 0], opacity: [0, 1] },
  'fade-right':{ translateX: [-40, 0], opacity: [0, 1] },
  'zoom-in':   { scale: [0.85, 1], opacity: [0, 1] },
  'scale-in':  { scale: [0.6, 1], opacity: [0, 1] },
  'rotate-in': { rotate: [-8, 0], opacity: [0, 1] },
  'flip-up':   { rotateX: [-75, 0], opacity: [0, 1], perspective: '800px' },
};

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateElement(el, indexInGroup = 0) {
  const type = el.dataset.animate || 'fade-up';
  const base = animationPresets[type] || animationPresets['fade-up'];
  const delayAttr = Number(el.dataset.delay || 0);
  const duration = Number(el.dataset.duration || 650);
  const easing = el.dataset.easing || 'cubicBezier(0.22,0.65,0.21,0.99)';
  const group = el.dataset.staggerGroup;
  const groupDelay = group ? indexInGroup * 90 : 0;

  if (prefersReduced) {
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
    return;
  }

  anime({
    targets: el,
    ...base,
    delay: delayAttr + groupDelay,
    duration,
    easing,
    opacity: base.opacity || [0, 1],
    complete: () => {
      if (el.dataset.once !== 'false') observer.unobserve(el);
    }
  });
}

const observedGroups = new Map();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const groupName = el.dataset.staggerGroup;
      if (groupName) {
        const groupEls = observedGroups.get(groupName) || [];
        groupEls.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
        groupEls.forEach((gEl, idx) => animateElement(gEl, idx));
        groupEls.forEach(() => observedGroups.get(groupName)?.splice(0));
      } else {
        animateElement(el);
      }
    }
  });
}, { threshold: 0.22, rootMargin: '0px 0px -5% 0px' });

function initScrollAnimations() {
  document.querySelectorAll('[data-animate]').forEach(el => {
    const group = el.dataset.staggerGroup;
    if (group) {
      if (!observedGroups.has(group)) observedGroups.set(group, []);
      observedGroups.get(group).push(el);
    }
    observer.observe(el);
  });
}

function runInitialLoadAnimations() {
  const initialEls = Array.from(document.querySelectorAll('[data-initial]'));
  if (!initialEls.length) return;
  const baseDelay = 40;
  initialEls.forEach((el, idx) => {
    if (!el.dataset.duration) el.dataset.duration = '750';
    el.dataset.delay = String((Number(el.dataset.delay)||0) + baseDelay * idx);
    animateElement(el, 0);
  });
}

function setInitialStyles() {
  document.querySelectorAll('[data-animate]').forEach(el => {
    if (prefersReduced) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }
    el.style.opacity = '0';
    el.style.willChange = 'transform, opacity';
  });
}

function revealAllFallback() {
  document.querySelectorAll('[data-animate]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

try {
  if (typeof anime !== 'function') {
    console.warn('anime.js no disponible, mostrando sin animaciones');
    revealAllFallback();
  } else if (document.readyState !== 'loading') {
    setInitialStyles();
    runInitialLoadAnimations();
    initScrollAnimations();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setInitialStyles();
      runInitialLoadAnimations();
      initScrollAnimations();
    });
  }
  requestAnimationFrame(()=> document.body.classList.add('is-ready'));
} catch (e) {
  console.warn('Error animaciones:', e);
  revealAllFallback();
  document.body.classList.add('is-ready');
}

window.__replayAnimations = () => {
  document.querySelectorAll('[data-animate]').forEach(el => { el.style.opacity = '0'; });
  initScrollAnimations();
};
