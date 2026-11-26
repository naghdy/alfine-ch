// Gentle fade-and-rise for content as it scrolls into view.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('[data-reveal]');
if (reduceMotion || !items.length || !('IntersectionObserver' in window)) return;

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      el.classList.add('reveal-in');
      el.classList.remove('reveal-pending');
      observer.unobserve(el);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);

// Only hide what is still below the fold, so nothing visible ever flickers.
const fold = window.innerHeight;
for (const el of items) {
  if (el.getBoundingClientRect().top > fold) {
    el.classList.add('reveal-pending');
    observer.observe(el);
  }
}
