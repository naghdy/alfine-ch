// Contour map drawing itself in as the principles scroll by, and the legal
// texts at the foot of the page opening from links and addresses.

/* Contours: each line draws in turn, tied to scroll position. */
const topo = document.querySelector('[data-topo]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (topo && !reduceMotion) {
  const paths = [...topo.querySelectorAll('path')];
  paths.forEach((p, i) => {
    p.setAttribute('pathLength', '1');
    p.style.setProperty('--i', (i / paths.length).toFixed(3));
  });
  topo.classList.add('is-drawing');
  const section = topo.closest('section') || topo;
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.4 + r.height * 0.6)));
    topo.style.setProperty('--draw', t.toFixed(3));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

/* Legal texts: open the right one for #impressum / #privacy. */
const openFromHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  const details = el && (el.matches('details') ? el : el.closest('details'));
  if (details && !details.open) {
    details.open = true;
    details.scrollIntoView({ block: 'start' });
  }
};
window.addEventListener('hashchange', openFromHash);
openFromHash();

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-legal-link]');
  if (!link) return;
  const details = document.getElementById(link.hash.slice(1));
  if (details && details.matches('details')) {
    event.preventDefault();
    details.open = true;
    details.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', link.hash);
    details.querySelector('summary')?.focus({ preventScroll: true });
  }
});
