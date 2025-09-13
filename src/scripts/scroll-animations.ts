// Import namespace (animejs exporta una función pero typings pueden variar según versión)
import * as AnimeNS from 'animejs';
// Cast a any para evitar conflictos tipado en este entorno simple
const anime: any = (AnimeNS as any).default || (AnimeNS as any);

// Tipos soportados y transformaciones iniciales
const animationPresets: Record<string, any> = {
  'fade-up':   { translateY: [40, 0], opacity: [0, 1] },
  'fade-down': { translateY: [-40, 0], opacity: [0, 1] },
  'fade-left': { translateX: [40, 0], opacity: [0, 1] },
  'fade-right':{ translateX: [-40, 0], opacity: [0, 1] },
  'zoom-in':   { scale: [0.85, 1], opacity: [0, 1] },
  'scale-in':  { scale: [0.6, 1], opacity: [0, 1] },
  'rotate-in': { rotate: [-8, 0], opacity: [0, 1] },
  'flip-up':   { rotateX: [-75, 0], opacity: [0, 1], perspective: '800px' },
};

interface DatasetEl extends HTMLElement {
  dataset: HTMLElement['dataset'] & {
    animate?: string;
    delay?: string;
    duration?: string;
    easing?: string;
    once?: string;
    staggerGroup?: string;
  };
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateElement(el: DatasetEl, indexInGroup = 0) {
  const type = el.dataset.animate || 'fade-up';
  const base = animationPresets[type] || animationPresets['fade-up'];
  const delayAttr = Number(el.dataset.delay || 0);
  const duration = Number(el.dataset.duration || 650);
  const easing = el.dataset.easing || 'cubicBezier(0.22,0.65,0.21,0.99)';

  // Stagger interno si se usa data-stagger-group
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
      if (el.dataset.once !== 'false') {
        observer.unobserve(el);
      }
    }
  });
}

const observedGroups = new Map<string, DatasetEl[]>();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target as DatasetEl;
      const groupName = el.dataset.staggerGroup;
      if (groupName) {
        const groupEls = observedGroups.get(groupName) || [];
        groupEls.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
        groupEls.forEach((gEl, idx) => animateElement(gEl, idx));
        groupEls.forEach(gEl => observedGroups.get(groupName)?.splice(0));
      } else {
        animateElement(el);
      }
    }
  });
}, { threshold: 0.22, rootMargin: '0px 0px -5% 0px' });

function initScrollAnimations() {
  const els = document.querySelectorAll<DatasetEl>('[data-animate]');
  els.forEach(el => {
    const group = el.dataset.staggerGroup;
    if (group) {
      if (!observedGroups.has(group)) observedGroups.set(group, []);
      observedGroups.get(group)!.push(el);
    }
    observer.observe(el);
  });
}

function runInitialLoadAnimations() {
  const initialEls = Array.from(document.querySelectorAll<DatasetEl>('[data-initial]'));
  if (!initialEls.length) return;
  let baseDelay = 40;
  initialEls.forEach((el, idx) => {
    // No usar observer; animar directo
    const type = el.dataset.animate || 'fade-up';
    // Pequeño escalado para hero/h1 si se desea
    if (!el.dataset.duration) el.dataset.duration = '750';
    el.dataset.delay = String((Number(el.dataset.delay)||0) + baseDelay * idx);
    animateElement(el, 0);
  });
}

// Estado inicial (evitar flash)
function setInitialStyles() {
  document.querySelectorAll<HTMLElement>('[data-animate]').forEach(el => {
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
  document.querySelectorAll<HTMLElement>('[data-animate]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

try {
  if (typeof anime !== 'function') {
    console.warn('anime.js no disponible, mostrando contenido sin animaciones');
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
} catch (e) {
  console.warn('Error inicializando animaciones:', e);
  revealAllFallback();
}

// Expose to window for debug (opcional)
// @ts-ignore
window.__replayAnimations = () => {
  document.querySelectorAll<HTMLElement>('[data-animate]').forEach(el => {
    el.style.opacity = '0';
  });
  initScrollAnimations();
};
