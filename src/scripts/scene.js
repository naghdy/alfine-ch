/*
 * The Zugerberg scene: a fixed canvas behind the page.
 *
 * The skyline is the real one, computed from elevation data (see
 * tools/terrain/): the view from Lake Zug east to the Zugerberg, with the
 * Rossberg, the Rigi and the Alps behind. Scrolling moves the scene through
 * one day, from before dawn to night, and climbs the two counterbalanced cars
 * of the Zugerbergbahn from the valley station to the top.
 *
 * The page works without it: until this runs, a static drawing of the same
 * skyline sits behind the page.
 */
const DATA = __SCENE_DATA__;

const docEl = document.documentElement;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext && canvas.getContext('2d', { alpha: false });
if (!ctx) return;

const upper = document.createElement('canvas');
const uctx = upper.getContext('2d', { alpha: false });
// The water is drawn at half resolution and scaled up: softer, and a
// fraction of the work.
const LAKE_Q = 0.5;
const mirror = document.createElement('canvas');
const mctx = mirror.getContext('2d', { alpha: false });
const lake = document.createElement('canvas');
const lctx = lake.getContext('2d', { alpha: false });

canvas.className = 'scene';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
docEl.classList.add('scene-on');

/* ------------------------------------------------------------- utilities */

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** Small seeded random generator, so the scene is the same on every visit. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------- light by hour */

// Key moments of the day. Colours are hex strings; numbers are 0 to 1.
const KEYS = [
  { h: 4.5, top: '#060c17', mid: '#0d1729', low: '#1b2840', haze: '#1b2a40', near: '#05090f', far: '#1a283d', lake: '#03070d', cloud: '#18243a', sun: '#ffd9a8', stars: 1, lights: 1, mist: 0.15, glow: 0, alpen: 0 },
  { h: 5.6, top: '#0c1530', mid: '#2a3459', low: '#a57788', haze: '#4a4e6d', near: '#0a111e', far: '#485372', lake: '#080f1c', cloud: '#6c5c7c', sun: '#ffb38a', stars: 0.6, lights: 0.9, mist: 0.5, glow: 0.35, alpen: 0 },
  { h: 6.6, top: '#2a4370', mid: '#7c85a8', low: '#f0b38e', haze: '#c39b97', near: '#18222f', far: '#858aa3', lake: '#1a2436', cloud: '#e6a990', sun: '#ffc690', stars: 0.08, lights: 0.45, mist: 0.75, glow: 0.75, alpen: 0 },
  { h: 7.7, top: '#5a83b7', mid: '#a6bdd7', low: '#f5d6b2', haze: '#d6cdc6', near: '#25352f', far: '#99abc0', lake: '#2c4256', cloud: '#fbe6d2', sun: '#fff1d6', stars: 0, lights: 0.05, mist: 0.55, glow: 0.8, alpen: 0 },
  { h: 9.6, top: '#6c9dcf', mid: '#b3cfe8', low: '#e5eef3', haze: '#c8d8e4', near: '#2b4036', far: '#a5bacc', lake: '#33536b', cloud: '#ffffff', sun: '#fffaf0', stars: 0, lights: 0, mist: 0.25, glow: 0.45, alpen: 0 },
  { h: 12.6, top: '#5b95cf', mid: '#a7cae8', low: '#e0ecf3', haze: '#cbdae5', near: '#30473a', far: '#9db4c8', lake: '#30536d', cloud: '#ffffff', sun: '#ffffff', stars: 0, lights: 0, mist: 0.1, glow: 0.3, alpen: 0 },
  { h: 16.0, top: '#6896c4', mid: '#b1c9df', low: '#eee6d6', haze: '#d5d4ca', near: '#344434', far: '#a7b2bd', lake: '#36526a', cloud: '#fff7ea', sun: '#fff1d8', stars: 0, lights: 0, mist: 0.15, glow: 0.2, alpen: 0.1 },
  { h: 18.4, top: '#577cab', mid: '#b5b4c3', low: '#f2cf9f', haze: '#e0c09e', near: '#3a382f', far: '#b39892', lake: '#3c4a5c', cloud: '#ffd7a8', sun: '#ffcf8f', stars: 0, lights: 0.05, mist: 0.25, glow: 0.15, alpen: 0.6 },
  { h: 19.3, top: '#313d69', mid: '#86779a', low: '#eea888', haze: '#c69798', near: '#29242e', far: '#bd8790', lake: '#2b2c40', cloud: '#f2a28e', sun: '#ff9f7a', stars: 0.05, lights: 0.35, mist: 0.35, glow: 0.1, alpen: 1 },
  { h: 20.2, top: '#152242', mid: '#32426c', low: '#6c7298', haze: '#475375', near: '#0e1525', far: '#3d496a', lake: '#0e1628', cloud: '#5a5f86', sun: '#ffd9a8', stars: 0.3, lights: 0.8, mist: 0.3, glow: 0, alpen: 0.15 },
  { h: 21.5, top: '#07101f', mid: '#101c32', low: '#23314c', haze: '#22304a', near: '#050a13', far: '#1e2b43', lake: '#040910', cloud: '#1a2540', sun: '#ffd9a8', stars: 0.9, lights: 1, mist: 0.2, glow: 0, alpen: 0 },
  { h: 23.5, top: '#050b16', mid: '#0b1527', low: '#1a2740', haze: '#1a2740', near: '#04080f', far: '#18243a', lake: '#03070d', cloud: '#141e33', sun: '#ffd9a8', stars: 1, lights: 1, mist: 0.15, glow: 0, alpen: 0 },
].map((k) => {
  const o = { ...k };
  for (const key of ['top', 'mid', 'low', 'haze', 'near', 'far', 'lake', 'cloud', 'sun']) o[key] = hex(k[key]);
  return o;
});

function lightAt(h) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].h < h) i += 1;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(a.h, b.h, h);
  const out = {};
  for (const key in a) {
    out[key] = Array.isArray(a[key]) ? mix(a[key], b[key], t) : lerp(a[key], b[key], t);
  }
  return out;
}

const ALPEN = hex('#ff9479');
const WARM = hex('#ffcf8a');
const BRASS = hex('#c9ad7f');

/* ------------------------------------------------------------- geometry */

const view = { w: 0, h: 0, dpr: 1, k: 1, ex: 2.8, hy: 0, c0: 0, c1: 0, scale: 1 };
const layers = DATA.layers.map((l) => ({ ...l, th: l.th.map((v) => v / 100), path: null, top: 0 }));
let town = [];
let slopeLights = [];
let stars = [];
let track = [];

function thetaAt(layer, az) {
  const f = (az - DATA.az0) / layer.step;
  const i = Math.floor(f);
  if (i < 0) return layer.th[0];
  if (i >= layer.th.length - 1) return layer.th[layer.th.length - 1];
  return lerp(layer.th[i], layer.th[i + 1], f - i);
}

// Screen position for an azimuth and elevation angle, before any pan.
const sx = (az) => view.w / 2 + (az - view.c0) * view.k;
const sy = (th) => view.hy - th * view.k * view.ex;
const azAt = (x) => view.c0 + (x - view.w / 2) / view.k;

function layout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  Object.assign(view, { w, h, dpr });
  view.k = Math.max(w / 150, h / 110);
  view.scale = clamp(view.k / 10, 0.7, 1.5);
  view.hy = Math.round(h * (w < h ? 0.6 : 0.7));
  view.ex = w < h ? 2.8 : 2.5;
  const fov = w / view.k;
  // Start centred on the funicular; drift south towards the Rigi as the day goes on.
  view.c0 = clamp(117 + (fov - 50) * 0.22, 117, 140);
  view.c1 = view.c0 + (w < h ? 20 : 10);

  for (const c of [canvas, upper]) {
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
  }
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  mirror.width = Math.ceil(w * LAKE_Q);
  mirror.height = Math.ceil(view.hy * LAKE_Q);
  lake.width = mirror.width;
  lake.height = Math.ceil((h - view.hy) * LAKE_Q);

  buildLayers();
  buildDetails();
}

function buildLayers() {
  const azMin = azAt(-view.w * 0.25);
  const azMax = azAt(view.w * 1.35);
  const step = Math.max(0.5, 1.5 / view.scale) / view.k; // about 1.5 px
  const s = view.scale;
  layers.forEach((layer, i) => {
    const forest = i < 2;
    const rand = rng(17 + i);
    const p = new Path2D();
    let top = Infinity;
    let x0 = null;
    let nextTree = 0;
    for (let az = Math.max(azMin, DATA.az0); az <= Math.min(azMax, DATA.az1); az += step) {
      const x = sx(az);
      let y = sy(thetaAt(layer, az));
      if (x0 === null) {
        x0 = x;
        p.moveTo(x, view.hy + 2);
      }
      if (forest && y < view.hy - 2 && x >= nextTree) {
        // A conifer: two short strokes up to a point and back down.
        const meadow = i === 1 && Math.sin(az * 0.9) + Math.sin(az * 2.3) > 1.2;
        const tw = (2 + rand() * 2.5) * s;
        const th = meadow ? 0 : (1.6 + rand() * 3.2) * s * (i === 0 ? 1 : 0.65);
        p.lineTo(x, y);
        p.lineTo(x + tw / 2, y - th);
        p.lineTo(x + tw, y);
        nextTree = x + tw + rand() * 1.5 * s;
        top = Math.min(top, y - th);
        continue;
      }
      if (x < nextTree) continue;
      p.lineTo(x, y);
      top = Math.min(top, y);
    }
    p.lineTo(sx(Math.min(azMax, DATA.az1)), view.hy + 2);
    p.closePath();
    layer.path = p;
    layer.top = top;
  });
}

function buildDetails() {
  const s = view.scale;
  const rand = rng(7);

  // The town of Zug along the shore, below the Zugerberg.
  town = [];
  for (let az = 50; az < 109; ) {
    const density = 0.35 + 0.65 * Math.exp(-(((az - 72) / 14) ** 2));
    const bw = (2.5 + rand() * 4) * s;
    const bh = (1.5 + rand() * 4.5 * density + (rand() < 0.04 ? 5 : 0)) * s;
    if (rand() < 0.35 + density * 0.6) {
      const windows = [];
      const n = Math.max(1, Math.round((bw * bh) / (9 * s * s)));
      for (let j = 0; j < n; j += 1) {
        if (rand() < 0.55) windows.push([rand() * bw, rand() * (bh - 1)]);
      }
      town.push({ x: sx(az), w: bw, h: bh, windows, roof: rand() < 0.3 });
    }
    az += (bw + rand() * 2.5 * s) / view.k;
  }

  // House lights on the lower slopes, and the hamlet at the top station.
  slopeLights = [];
  const near = layers[0];
  for (let i = 0; i < 90; i += 1) {
    const az = 58 + rand() * 54;
    const ridge = thetaAt(near, az);
    if (ridge < 0.6) continue;
    const t = rand() ** 1.8;
    slopeLights.push({ x: sx(az), y: sy(0.25 + t * (ridge - 0.5)), a: 0.4 + rand() * 0.6, p: rand() * 6 });
  }
  const topSt = DATA.track[DATA.track.length - 1];
  for (let i = 0; i < 9; i += 1) {
    slopeLights.push({ x: sx(topSt[0] + (rand() - 0.3) * 2.2), y: sy(topSt[1] + rand() * 0.25), a: 0.8, p: rand() * 6 });
  }

  // Funicular track, in screen space.
  track = DATA.track.map(([az, th]) => [sx(az), sy(th)]);

  // Stars across the upper sky.
  stars = [];
  for (let i = 0; i < 170; i += 1) {
    stars.push({ x: rand(), y: rand() ** 1.6, r: (0.35 + rand() * 0.9) * Math.min(1.3, s), p: rand() * 6.28, sp: 0.6 + rand() * 1.8 });
  }
}

function trackPoint(f) {
  const n = track.length - 1;
  const i = Math.min(n - 1, Math.floor(f * n));
  const t = f * n - i;
  const a = track[i];
  const b = track[i + 1];
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.atan2(b[1] - a[1], b[0] - a[0])];
}

/* --------------------------------------------------------- scroll state */

const story = { hour: 5.6, progress: 0, labels: 0, pointer: 0, pointerTarget: 0 };
let sections = [];
let stage = null;
let covers = [];
let covered = false;

function measure() {
  const y = window.scrollY;
  sections = [...document.querySelectorAll('[data-hours]')].map((el) => {
    const r = el.getBoundingClientRect();
    const [a, b] = el.dataset.hours.split(' ').map(Number);
    return { el, top: r.top + y, bottom: r.bottom + y, a, b, sheet: el.classList.contains('act--sheet') };
  });
  // Paper the HUD steps aside for: sheets and open legal texts.
  covers = [...document.querySelectorAll('.act--sheet, details[open] > .legal__body')].map((el) => {
    const r = el.getBoundingClientRect();
    const edge = el.querySelector('.sheet__edge');
    return [r.top + y - (edge ? edge.getBoundingClientRect().height : 0), r.bottom + y];
  });
  // The open stretch of evening where the landscape names itself.
  const st = document.querySelector('[data-scene-stage]');
  if (st) {
    const r = st.getBoundingClientRect();
    stage = { top: r.top + y, bottom: r.bottom + y };
  } else stage = null;
}

function readScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = Math.max(1, docEl.scrollHeight - vh);
  const centre = y + vh / 2;
  story.progress = clamp(y / max);
  // Map the viewport centre onto the hours of the section it is in. The
  // first and last sections are squeezed so the whole day fits the page.
  const first = vh / 2;
  const last = max + vh / 2;
  let hour = story.hour;
  covered = false;
  story.labels = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const s = sections[i];
    const top = i === 0 ? Math.min(s.top, first) : s.top;
    const bottom = i === sections.length - 1 ? Math.max(Math.min(s.bottom, last), top + 1) : s.bottom;
    if (centre >= top && (centre < bottom || i === sections.length - 1)) {
      hour = lerp(s.a, s.b, clamp((centre - top) / (bottom - top)));
    }
    if (s.sheet && s.top <= y + 1 && s.bottom >= y + vh - 1) covered = true;
  }
  story.hour = hour;
  if (stage) {
    // Names appear once the text has scrolled clear and leave before the
    // next sheet rises over the ridge.
    const top = stage.top - y;
    const bottom = stage.bottom - y;
    story.labels = clamp((vh * 0.8 - top) / (vh * 0.35)) * clamp((bottom - vh * 0.3) / (vh * 0.3));
  }
  const overSheet = covers.some(([a, b]) => a <= y + vh - 8 && b >= y + vh - 40);
  if (hud) hud.classList.toggle('is-muted', overSheet);
}

/* ---------------------------------------------------------------- draw */

let time = 0;
let labelText = {};

function sunPosition(h) {
  // Rises behind the Zugerberg (east-south-east) and climbs south. In the
  // afternoon it is behind the viewer, so only its light remains.
  const az = 104 + (h - 6) * 11.5;
  const alt = 42 * Math.sin((Math.PI * (h - 5.8)) / 14);
  return [sx(az), view.hy - alt * view.k * 1.25, alt];
}

function drawUpper(L, pan) {
  const c = uctx;
  const { w, hy } = view;
  c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

  const sky = c.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, rgb(L.top));
  sky.addColorStop(0.55, rgb(L.mid));
  sky.addColorStop(1, rgb(L.low));
  c.fillStyle = sky;
  c.fillRect(0, 0, w, hy + 4);

  // Stars.
  if (L.stars > 0.01) {
    for (const st of stars) {
      const tw = motionQuery.matches ? 1 : 0.65 + 0.35 * Math.sin(story.progress * 90 * st.sp + st.p);
      const a = L.stars * tw * (1 - st.y * 0.7);
      c.fillStyle = `rgba(235,240,255,${a})`;
      c.beginPath();
      c.arc((((st.x * w - pan * 0.3) % w) + w) % w, st.y * hy * 0.92, st.r, 0, 6.283);
      c.fill();
    }
  }

  // Moon, rising over the Zugerberg late in the evening.
  const moonT = smooth(20.6, 22.8, story.hour);
  if (moonT > 0) {
    const mx = sx(98 + moonT * 10) - pan * 0.6;
    const my = lerp(sy(9), hy * 0.22, moonT);
    const r = 7 * view.scale;
    const g = c.createRadialGradient(mx, my, 0, mx, my, r * 9);
    g.addColorStop(0, `rgba(230,236,255,${0.22 * moonT})`);
    g.addColorStop(1, 'rgba(230,236,255,0)');
    c.fillStyle = g;
    c.fillRect(mx - r * 9, my - r * 9, r * 18, r * 18);
    c.fillStyle = `rgba(244,240,228,${moonT})`;
    c.beginPath();
    c.arc(mx, my, r, 0, 6.283);
    c.fill();
  }

  // Sun glow and disc (drawn before the ridges, so the Zugerberg hides it).
  const [sunX, sunY, alt] = sunPosition(story.hour);
  const sx0 = sunX - pan * 0.6;
  if (L.glow > 0.01) {
    const gr = c.createRadialGradient(sx0, Math.max(sunY, sy(6)), 0, sx0, Math.max(sunY, sy(6)), w * 0.55);
    gr.addColorStop(0, rgb(L.sun, 0.55 * L.glow));
    gr.addColorStop(0.35, rgb(L.sun, 0.18 * L.glow));
    gr.addColorStop(1, rgb(L.sun, 0));
    c.fillStyle = gr;
    c.fillRect(0, 0, w, hy);
  }
  if (alt > 0 && story.hour < 14) {
    const r = 11 * view.scale;
    c.fillStyle = rgb(L.sun, 0.95);
    c.beginPath();
    c.arc(sx0, sunY, r, 0, 6.283);
    c.fill();
  }

  // A few long, thin clouds.
  const drift = motionQuery.matches ? 0 : story.progress * view.w * 0.25;
  for (let i = 0; i < 4; i += 1) {
    const cx = ((((i * 0.31 + 0.12) * w * 1.6 + drift * (1 + i * 0.3) - pan * (0.4 + i * 0.1)) % (w * 1.6)) + w * 1.6) % (w * 1.6) - w * 0.3;
    const cy = hy * (0.16 + i * 0.09);
    const cw = w * (0.22 + (i % 2) * 0.12);
    const ch = 5 + i * 2;
    c.save();
    c.translate(cx, cy);
    c.scale(cw / 100, ch / 10);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 50);
    g.addColorStop(0, rgb(L.cloud, 0.42 - i * 0.05));
    g.addColorStop(1, rgb(L.cloud, 0));
    c.fillStyle = g;
    c.fillRect(-50, -50, 100, 100);
    c.restore();
  }

  // Ridges, far to near, with haze rising from their feet.
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i];
    const depth = i / (layers.length - 1);
    const dx = -pan * (1 - depth) * 1.1 + story.pointer * (1 - depth) * 10;
    let crest = mix(L.near, L.far, depth ** 0.85);
    crest = mix(crest, ALPEN, L.alpen * (0.15 + 0.4 * depth));
    const foot = mix(crest, L.haze, clamp(L.mist * (0.6 + depth * 0.4) + 0.08));
    const g = c.createLinearGradient(0, layer.top, 0, hy);
    g.addColorStop(0, rgb(crest));
    g.addColorStop(1, rgb(foot));
    c.save();
    c.translate(dx, 0);
    c.fillStyle = g;
    c.fill(layer.path);
    if (i === 0) drawNear(c, L, crest, foot);
    if (i === 1) drawFunicular(c, L, crest);
    c.restore();
  }

  // Mist lying on the water at dawn.
  if (L.mist > 0.2) {
    const m = c.createLinearGradient(0, hy - 30 * view.scale, 0, hy);
    m.addColorStop(0, rgb(L.haze, 0));
    m.addColorStop(1, rgb(L.haze, (L.mist - 0.2) * 0.9));
    c.fillStyle = m;
    c.fillRect(0, hy - 30 * view.scale, w, 30 * view.scale + 4);
  }
}

function drawNear(c, L, crest, foot) {
  const { hy } = view;
  // Town.
  const body = mix(foot, L.near, 0.35);
  const lit = L.lights;
  for (const b of town) {
    c.fillStyle = rgb(mix(body, L.haze, 0.18));
    c.fillRect(b.x, hy - b.h, b.w, b.h + 2);
    if (b.roof) {
      c.beginPath();
      c.moveTo(b.x - 0.5, hy - b.h);
      c.lineTo(b.x + b.w / 2, hy - b.h - b.w * 0.45);
      c.lineTo(b.x + b.w + 0.5, hy - b.h);
      c.fill();
    }
    if (lit > 0.02) {
      c.fillStyle = rgb(WARM, lit * 0.9);
      for (const [wx, wy] of b.windows) c.fillRect(b.x + wx, hy - b.h + wy, 1, 1);
    }
  }
  // House lights on the slopes.
  if (lit > 0.02) {
    for (const l of slopeLights) {
      const fl = motionQuery.matches ? 1 : 0.85 + 0.15 * Math.sin(time * 1.7 + l.p);
      c.fillStyle = rgb(WARM, lit * l.a * fl);
      c.fillRect(l.x, l.y, 1.4, 1.4);
    }
  }
}

function drawFunicular(c, L, crest) {
  const s = view.scale;
  // The track runs through the forest in a clearing.
  c.lineCap = 'round';
  c.strokeStyle = rgb(mix(crest, L.haze, 0.35), 0.8);
  c.lineWidth = 3.2 * s;
  c.beginPath();
  track.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
  c.strokeStyle = rgb(mix(crest, L.low, 0.55), 0.9);
  c.lineWidth = 0.8 * s;
  c.stroke();

  // Two cars on one cable: as one climbs, the other descends. They pass
  // halfway, at the passing loop.
  const f = 0.04 + story.progress * 0.92;
  for (const pos of [f, 1 - f]) {
    const [x, y, ang] = trackPoint(pos);
    const away = Math.exp(-(((pos - 0.5) / 0.06) ** 2)) * 2.2 * s * (pos === f ? 1 : -1);
    c.save();
    c.translate(x - Math.sin(ang) * away, y + Math.cos(ang) * away);
    c.rotate(ang);
    c.fillStyle = rgb(mix(BRASS, L.near, 0.25 + 0.5 * (1 - L.glow) * L.stars));
    c.fillRect(-3.4 * s, -2.6 * s, 6.8 * s, 2.6 * s);
    if (L.lights > 0.05) {
      c.fillStyle = rgb(WARM, L.lights);
      c.fillRect(-2.6 * s, -2 * s, 5.2 * s, 1.1 * s);
    }
    c.restore();
  }
}

function drawLabels(c, pan) {
  const a = story.labels;
  if (a < 0.01) return;
  const s = view.scale;
  const nearDx = -pan * 1.1;
  const items = [
    ['zug', DATA.marks.zug, nearDx, 0.4],
    ['zugerberg', DATA.marks.crest, -pan * 0.85, 0],
    ['funicular', DATA.track[12], -pan * 0.85, 0.15],
    ['rigi', DATA.marks.rigi, -pan * 0.55, 0.3],
    ['pilatus', DATA.marks.pilatus, -pan * 0.3, 0.45],
  ];
  c.font = `600 ${Math.round(10.5 * Math.max(1, s * 0.9))}px Inter, system-ui, sans-serif`;
  c.textAlign = 'center';
  for (const [key, [az, th], dx, delay] of items) {
    const text = labelText[key];
    if (!text) continue;
    const x = sx(az) + dx;
    const y = sy(th);
    if (x < 30 || x > view.w - 30) continue;
    const t = clamp((a - delay * 0.5) / 0.5);
    if (t <= 0) continue;
    const len = 26 * s * t;
    c.strokeStyle = `rgba(246,243,238,${0.75 * t})`;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, y - 4);
    c.lineTo(x, y - 4 - len);
    c.stroke();
    c.fillStyle = `rgba(201,173,127,${t})`;
    c.beginPath();
    c.arc(x, y - 1, 2.2, 0, 6.283);
    c.fill();
    c.fillStyle = `rgba(246,243,238,${t})`;
    c.fillText(text.toUpperCase(), x, y - 10 - len);
  }
}

function drawLakeLabel(c) {
  const a = story.labels;
  if (a < 0.01 || !labelText.lake) return;
  c.font = `600 ${Math.round(10.5 * Math.max(1, view.scale * 0.9))}px Inter, system-ui, sans-serif`;
  c.textAlign = 'center';
  c.fillStyle = `rgba(246,243,238,${0.8 * clamp(a / 0.6)})`;
  c.fillText(labelText.lake.toUpperCase().split('').join(String.fromCharCode(8202)), view.w * 0.5, view.hy + (view.h - view.hy) * 0.42);
}

let upperAt = -1;

function draw(full) {
  const L = lightAt(story.hour);
  const pan = (story.progress * (view.c1 - view.c0)) * view.k;
  const { w, h, hy, dpr } = view;
  const c = ctx;
  // The sky and ridges move only with scroll and pointer. The canvas keeps
  // its pixels, so between those only the water is redrawn.
  if (full || upperAt < 0) {
    drawUpper(L, pan);
    mctx.drawImage(upper, 0, 0, upper.width, Math.ceil(hy * dpr), 0, 0, mirror.width, mirror.height);
    upperAt = time;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(upper, 0, 0, upper.width, Math.ceil(hy * dpr), 0, 0, upper.width, Math.ceil(hy * dpr));
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawLabels(c, pan);
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Lake: the mirrored scene, broken by ripples, under the water's own tone.
  const lakeH = h - hy;
  const lw = lake.width;
  const lh = lake.height;
  const still = motionQuery.matches;
  for (let r = 0; r < lh; r += 1) {
    const depth = r / lh;
    const src = (hy - (r / LAKE_Q) * 0.8 - 1) * LAKE_Q;
    if (src < 0) break;
    const amp = still ? depth * 2 : (0.6 + depth * 7) * Math.sin(r * 0.21 + time * 1.4) + Math.sin(r * 0.057 - time * 0.9) * depth * 3;
    lctx.drawImage(mirror, 0, Math.floor(src), mirror.width, 1, (amp - 12) * LAKE_Q, r, lw + 24 * LAKE_Q, 1);
  }
  const water = lctx.createLinearGradient(0, 0, 0, lh);
  water.addColorStop(0, rgb(mix(L.low, L.haze, 0.5), 0.38));
  water.addColorStop(1, rgb(L.lake, 0.85));
  lctx.fillStyle = water;
  lctx.fillRect(0, 0, lw, lh);
  c.drawImage(lake, 0, hy, w, lakeH);

  // Glitter beneath the sun or moon.
  const [sunX, , alt] = sunPosition(story.hour);
  const glitter = alt > 2 && story.hour < 14 ? [sunX - pan * 0.6, L.sun, 0.5 * clamp(alt / 15)] : story.hour > 21 ? [sx(98 + smooth(20.6, 22.8, story.hour) * 10) - pan * 0.6, [235, 238, 250], 0.35 * smooth(20.8, 22, story.hour)] : null;
  if (glitter) {
    const [gx, col, ga] = glitter;
    const rand = rng(Math.floor(time * (still ? 0 : 6)));
    for (let i = 0; i < 46; i += 1) {
      const d = rand() ** 1.4;
      const y = hy + 3 + d * lakeH * 0.9;
      const spread = (6 + d * 60) * view.scale;
      const x = gx + (rand() - 0.5) * spread * 2;
      c.fillStyle = rgb(col, ga * (1 - d) * rand());
      c.fillRect(x, y, (3 + rand() * 10 * d) * view.scale, 1);
    }
  }

  // Town lights stretched across the water at night.
  if (L.lights > 0.05) {
    const rand = rng(3);
    for (const b of town) {
      if (rand() > 0.3) continue;
      const len = (10 + rand() * 30) * view.scale;
      const g = c.createLinearGradient(0, hy, 0, hy + len);
      g.addColorStop(0, rgb(WARM, 0.35 * L.lights));
      g.addColorStop(1, rgb(WARM, 0));
      c.fillStyle = g;
      c.fillRect(b.x - pan * 1.1 + b.w / 2, hy + 1, 1.2, len);
    }
  }

  drawLakeLabel(c);
  updateHud();
}

/* ------------------------------------------------------------------ HUD */

const hud = document.querySelector('[data-hud]');
const hudTime = hud && hud.querySelector('[data-hud-time]');
const hudAlt = hud && hud.querySelector('[data-hud-alt]');
let lastHud = '';

function updateHud() {
  if (!hud) return;
  const h = story.hour % 24;
  const mm = Math.floor((h % 1) * 60);
  const t = `${String(Math.floor(h)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  // Valley station 561 m, top station 927 m (366 m of rise).
  const alt = `${Math.round(561 + (0.04 + story.progress * 0.92) * 366)} m`;
  if (t + alt === lastHud) return;
  lastHud = t + alt;
  hudTime.textContent = t;
  hudAlt.textContent = alt;
}

/* ---------------------------------------------------------------- loop */

let dirty = true;
let lastFrame = 0;
let lastScroll = 0;

function frame(now) {
  requestAnimationFrame(frame);
  story.pointer += (story.pointerTarget - story.pointer) * 0.06;
  const animating = !motionQuery.matches;
  const recent = now - lastScroll < 400;
  // Full rate while scrolling; a gentle 30 frames a second otherwise.
  const due = dirty || (animating && (recent || now - lastFrame > 33));
  if (!due || document.hidden) return;
  if (covered && !dirty) return;
  time = now / 1000;
  lastFrame = now;
  const full = dirty || Math.abs(story.pointerTarget - story.pointer) > 0.002;
  dirty = false;
  draw(full);
}

function onScroll() {
  readScroll();
  lastScroll = performance.now();
  dirty = true;
}

let lastW = 0;
let lastH = 0;
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Ignore the small height changes of mobile browser toolbars.
  if (w === lastW && Math.abs(h - lastH) < 120) {
    remeasure();
    return;
  }
  lastW = w;
  lastH = h;
  layout();
  measure();
  readScroll();
  dirty = true;
}

// Re-measure after layout changes; redraw only if the scene would change.
function remeasure() {
  const before = `${story.hour.toFixed(3)} ${story.progress.toFixed(4)} ${story.labels.toFixed(3)}`;
  measure();
  readScroll();
  if (`${story.hour.toFixed(3)} ${story.progress.toFixed(4)} ${story.labels.toFixed(3)}` !== before) dirty = true;
}

function readLabels() {
  labelText = {};
  document.querySelectorAll('[data-scene-label]').forEach((el) => {
    labelText[el.dataset.sceneLabel] = el.textContent.trim();
  });
}

readLabels();
onResize();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize);
window.addEventListener('load', remeasure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
if (window.ResizeObserver) new ResizeObserver(remeasure).observe(document.body);
if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    if (!motionQuery.matches) story.pointerTarget = (e.clientX / window.innerWidth - 0.5) * 2;
  }, { passive: true });
}
motionQuery.addEventListener('change', () => { dirty = true; });
requestAnimationFrame(frame);
