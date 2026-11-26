// Very gentle parallax for the hero ridgelines. The CSS reads --scroll and
// moves each layer at its own rate. Disabled for reduced-motion users.

const hero = document.querySelector('[data-hero]');
const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
if (!hero || !motion.matches) return;

let visible = true;
let ticking = false;

const update = () => {
  ticking = false;
  if (!visible) return;
  const offset = Math.min(window.scrollY, hero.offsetHeight);
  hero.style.setProperty('--scroll', offset.toFixed(1));
};

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
}).observe(hero);

window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  },
  { passive: true },
);

motion.addEventListener('change', (event) => {
  if (!event.matches) hero.style.setProperty('--scroll', '0');
});
