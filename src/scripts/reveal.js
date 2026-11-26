// Content arriving as it scrolls into view: headings rise word by word out of
// a soft mask, blocks fade up. Nothing is hidden for reduced motion, without
// IntersectionObserver, or above the fold at load.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion || !('IntersectionObserver' in window)) return;

// Split headings into words. The text stays one text node per word, so screen
// readers read it as before.
for (const el of document.querySelectorAll('[data-split]')) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    const outer = document.createElement('span');
    outer.className = 'word';
    const inner = document.createElement('span');
    inner.className = 'word__in';
    inner.textContent = word;
    inner.style.setProperty('--i', i);
    outer.append(inner);
    el.append(outer, i < words.length - 1 ? ' ' : '');
  });
}

const items = document.querySelectorAll('[data-reveal], [data-split]');
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('reveal-in');
      entry.target.classList.remove('reveal-pending');
      observer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
);

const fold = window.innerHeight;
for (const el of items) {
  if (el.getBoundingClientRect().top > fold * 0.9) {
    el.classList.add('reveal-pending');
    observer.observe(el);
  } else {
    // Already in view at load: play the entrance once, without hiding first.
    el.classList.add('reveal-intro');
  }
}
