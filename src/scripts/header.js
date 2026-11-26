// Masthead: its state over the scene, the current section, the language links
// and the mobile navigation panel.

const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
if (!header) return;

const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const targets = navLinks
  .map((a) => [a, document.getElementById(a.hash.slice(1))])
  .filter(([, el]) => el);
const langLinks = [...document.querySelectorAll('[data-lang-link]')];
const langBase = langLinks.map((a) => a.getAttribute('href'));

let ticking = false;
let current = '';
const update = () => {
  ticking = false;
  header.classList.toggle('is-scrolled', window.scrollY > 24);

  // The section under the middle of the screen.
  const mid = window.innerHeight * 0.45;
  let id = '';
  for (const [, el] of targets) {
    const r = el.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) id = el.id;
  }
  if (id === current) return;
  current = id;
  for (const [a, el] of targets) {
    if (el.id === id) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
  // Switching language keeps your place on the page.
  langLinks.forEach((a, i) => a.setAttribute('href', id ? `${langBase[i]}#${id}` : langBase[i]));
};
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
update();

if (!toggle || !nav) return;

const label = toggle.querySelector('[data-menu-label]');
const desktop = window.matchMedia('(min-width: 64em)');

const setOpen = (open, { returnFocus = false } = {}) => {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('is-menu-open', open);
  header.classList.toggle('is-menu-open', open);
  label.textContent = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
  if (open) {
    nav.querySelector('a')?.focus();
  } else if (returnFocus) {
    toggle.focus();
  }
};

toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

nav.addEventListener('click', (event) => {
  if (event.target.closest('a') && nav.classList.contains('is-open')) setOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, { returnFocus: true });
});

desktop.addEventListener('change', (event) => {
  if (event.matches) setOpen(false);
});

// Keep keyboard focus inside the open panel (and its toggle button).
document.addEventListener('focusin', (event) => {
  if (!nav.classList.contains('is-open')) return;
  if (!nav.contains(event.target) && event.target !== toggle) toggle.focus();
});
