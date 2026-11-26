// Sticky header state and the mobile navigation panel.

const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
if (!header) return;

// Hairline under the header once the page has scrolled.
let ticking = false;
const updateScrolled = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
  ticking = false;
};
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrolled);
    }
  },
  { passive: true },
);
updateScrolled();

if (!toggle || !nav) return;

const label = toggle.querySelector('[data-menu-label]');
const desktop = window.matchMedia('(min-width: 64em)');

const setOpen = (open, { returnFocus = false } = {}) => {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('is-menu-open', open);
  label.textContent = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
  if (open) {
    nav.querySelector('a')?.focus();
  } else if (returnFocus) {
    toggle.focus();
  }
};

toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

// Close after choosing a link, on Escape, and when switching to desktop.
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
