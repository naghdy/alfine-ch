/*
 * The view south from Zug: a fixed canvas behind the page.
 *
 * The skyline is the real one, computed from elevation data (see
 * tools/terrain/): from the lakefront across Lake Zug, the Zugerberg's flank
 * on the left, the Rigi, the Bernese Alps low on the horizon, and Pilatus on
 * the right. Scrolling moves the scene through one day, from before dawn to
 * night: the sun rises behind the Zugerberg and sets beside Pilatus, the view
 * turns slowly west with it, and a lake steamer crosses the water.
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
  { h: 4.5, top: '#060c17', mid: '#0d1729', low: '#1b2840', haze: '#1b2a40', near: '#05090f', far: '#1a283d', lake: '#03070d', cloud: '#18243a', sun: '#ffd9a8', snow: '#2a3550', stars: 1, lights: 1, mist: 0.15, glow: 0, alpen: 0 },
  { h: 5.6, top: '#0c1530', mid: '#2c3a63', low: '#9a7f98', haze: '#4b5372', near: '#0a111c', far: '#4a5878', lake: '#0a1220', cloud: '#6c5c7c', sun: '#ffb38a', snow: '#8d8fae', stars: 0.6, lights: 0.9, mist: 0.5, glow: 0.3, alpen: 0 },
  { h: 6.6, top: '#2b4a7c', mid: '#7f8fb5', low: '#f2c0a0', haze: '#c5a7a6', near: '#172230', far: '#7f8cab', lake: '#2a3550', cloud: '#f0b49a', sun: '#ffc690', snow: '#f6d2c8', stars: 0.08, lights: 0.4, mist: 0.7, glow: 0.8, alpen: 0.2 },
  // Spring morning: deep blue sky, white snow on the Alps, dark forest.
  { h: 7.7, top: '#2563ad', mid: '#5088c6', low: '#b3cce5', haze: '#b9cadb', near: '#22342a', far: '#7a93b3', lake: '#3d6488', cloud: '#f4f1ec', sun: '#fff2d8', snow: '#f2f4f8', stars: 0, lights: 0.05, mist: 0.45, glow: 0.55, alpen: 0 },
  { h: 9.6, top: '#1f5ba6', mid: '#4c86c8', low: '#bcd3e9', haze: '#c3d3e2', near: '#26392c', far: '#8099b8', lake: '#3f688c', cloud: '#ffffff', sun: '#fffaf0', snow: '#f6f8fb', stars: 0, lights: 0, mist: 0.2, glow: 0.4, alpen: 0 },
  { h: 12.6, top: '#1d58a4', mid: '#4e88cb', low: '#c6daed', haze: '#c9d7e4', near: '#2a3d2f', far: '#879fbc', lake: '#3e6a8f', cloud: '#ffffff', sun: '#ffffff', snow: '#f8f9fb', stars: 0, lights: 0, mist: 0.1, glow: 0.3, alpen: 0 },
  { h: 16.0, top: '#3f72b0', mid: '#8db0d4', low: '#e6e0d4', haze: '#d3d0c8', near: '#2f3d31', far: '#8e9cb3', lake: '#486b88', cloud: '#fff5e6', sun: '#fff1d8', snow: '#f7f1ea', stars: 0, lights: 0, mist: 0.15, glow: 0.25, alpen: 0.1 },
  // Peach dusk: lavender mountains, a silver-peach lake.
  { h: 18.2, top: '#9fa3b8', mid: '#d2b3a8', low: '#e8c4ad', haze: '#d9bfb3', near: '#33402f', far: '#7d7a92', lake: '#b9aeb0', cloud: '#f3d2bf', sun: '#ffd6a6', snow: '#efd8d3', stars: 0, lights: 0.05, mist: 0.25, glow: 0.35, alpen: 0.5 },
  // Sunset beside Pilatus: orange low sky under blue-grey, peach water.
  { h: 19.2, top: '#6f87ad', mid: '#e39a6e', low: '#f5913f', haze: '#d9997f', near: '#24303f', far: '#7d86a2', lake: '#c98f7e', cloud: '#f7b26a', sun: '#ffb340', snow: '#f0c8c0', stars: 0.02, lights: 0.3, mist: 0.3, glow: 1, alpen: 1 },
  { h: 20.2, top: '#152242', mid: '#34446e', low: '#8a6f86', haze: '#4a5577', near: '#0e1525', far: '#3f4b6c', lake: '#121a2e', cloud: '#6a5f86', sun: '#ffb38a', snow: '#6e7899', stars: 0.3, lights: 0.85, mist: 0.3, glow: 0.25, alpen: 0.15 },
  { h: 21.5, top: '#07101f', mid: '#101c32', low: '#23314c', haze: '#22304a', near: '#050a13', far: '#1e2b43', lake: '#040910', cloud: '#1a2540', sun: '#ffd9a8', snow: '#2c3755', stars: 0.9, lights: 1, mist: 0.2, glow: 0, alpen: 0 },
  { h: 23.5, top: '#050b16', mid: '#0b1527', low: '#1a2740', haze: '#1a2740', near: '#04080f', far: '#18243a', lake: '#03070d', cloud: '#141e33', sun: '#ffd9a8', snow: '#283250', stars: 1, lights: 1, mist: 0.15, glow: 0, alpen: 0 },
].map((k) => {
  const o = { ...k };
  for (const key of ['top', 'mid', 'low', 'haze', 'near', 'far', 'lake', 'cloud', 'sun', 'snow']) o[key] = hex(k[key]);
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

const view = { w: 0, h: 0, dpr: 1, k: 1, ex: 1.5, hy: 0, c0: 0, c1: 0, scale: 1 };
const layers = DATA.layers.map((l) => ({ ...l, th: l.th.map((v) => v / 100), path: null, top: 0 }));
// How much snow each layer carries near its crest: none on the forested
// hills, a little on Pilatus and the Stanserhorn, a lot on the high Alps.
const SNOW = [0, 0, 0.1, 0.55, 1];
let houses = [];
let summitLights = [];
let stars = [];

function thetaAt(layer, az) {
  const f = (az - DATA.az0) / layer.step;
  const i = Math.floor(f);
  if (i < 0) return layer.th[0];
  if (i >= layer.th.length - 1) return layer.th[layer.th.length - 1];
  return lerp(layer.th[i], layer.th[i + 1], f - i);
}

/** Distance to the far shore (m) at an azimuth. */
function shoreAt(az) {
  const f = clamp(az - DATA.az0, 0, DATA.shore.length - 1.001);
  const i = Math.floor(f);
  return lerp(DATA.shore[i], DATA.shore[Math.min(i + 1, DATA.shore.length - 1)], f - i);
}

// Screen position for an azimuth and elevation angle, before the view turns.
const sx = (az) => view.w / 2 + (az - view.c0) * view.k;
const sy = (th) => view.hy - th * view.k * view.ex;

function layout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const portrait = w < h;
  Object.assign(view, { w, h, dpr });
  // About 64 degrees across a wide screen, 34 on a phone held upright: the
  // framing of a photograph from the shore. Heights are close to true: 1.6
  // times on wide screens, a little more on narrow ones so the range reads.
  view.k = Math.max(w / 64, Math.min(h / 48, w / 34));
  view.scale = clamp(view.k / 18, 0.6, 1.5);
  view.hy = Math.round(h * (portrait ? 0.6 : 0.7));
  view.ex = portrait ? 2.2 : 1.6;
  const fov = w / view.k;
  // Morning: the Zugerberg and the Rigi. Evening: Pilatus and the sunset.
  // Wide screens see it all and turn only a little.
  view.c0 = Math.max(184 + fov * 0.06, 168 + fov / 2);
  view.c1 = Math.max(view.c0 + 6, 226 - fov * 0.18);

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
  const fov = view.w / view.k;
  const azMin = Math.max(DATA.az0, view.c0 - fov * 0.75);
  const azMax = Math.min(DATA.az1, view.c1 + fov * 0.75);
  const s = view.scale;
  layers.forEach((layer, i) => {
    const forest = i < 2;
    const rand = rng(17 + i);
    // About 1.5 px apart, finer for the sharp alpine outline.
    const step = Math.min(layer.step / 2, (i > 2 ? 1 : 1.5) / view.k);
    const p = new Path2D();
    let top = Infinity;
    let nextTree = 0;
    p.moveTo(sx(azMin), view.hy + 2);
    for (let az = azMin; az <= azMax; az += step) {
      const x = sx(az);
      const y = sy(thetaAt(layer, az));
      if (forest && y < view.hy - 2 && x >= nextTree) {
        // A conifer: two short strokes up to a point and back down.
        const meadow = Math.sin(az * 0.9) + Math.sin(az * 2.3) > (i === 0 ? 1.5 : 1.1);
        const tw = (1.8 + rand() * 2.2) * s * (i === 0 ? 1 : 0.6);
        const th = meadow ? 0 : (1.4 + rand() * 2.8) * s * (i === 0 ? 1 : 0.55);
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
    p.lineTo(sx(azMax), view.hy + 2);
    p.closePath();
    layer.path = p;
    layer.top = top;
  });
}

function buildDetails() {
  const s = view.scale;
  const rand = rng(7);
  const fov = view.w / view.k;

  // Houses along the shores, smaller with distance: Zug's lakeside and
  // Oberwil under the Zugerberg on the left, Walchwil across the water,
  // Cham and the western shore on the right.
  houses = [];
  for (let az = Math.max(DATA.az0, view.c0 - fov * 0.7); az < Math.min(DATA.az1, view.c1 + fov * 0.7); ) {
    const d = shoreAt(az);
    const size = clamp(900 / d, 0.12, 2.4);
    const dense = d < 8000 ? 0.75 : 0;
    const bw = (2 + rand() * 4) * s * size;
    if (rand() < dense && bw > 0.6) {
      const bh = (1.5 + rand() * 3.5) * s * size;
      const windows = [];
      const n = Math.max(1, Math.round((bw * bh) / (8 * s * s)));
      for (let j = 0; j < n; j += 1) if (rand() < 0.6) windows.push([rand() * bw, rand() * Math.max(0.5, bh - 1)]);
      houses.push({ az, w: bw, h: bh, d, windows, roof: rand() < 0.35 });
    }
    az += (bw + rand() * 3 * s * size) / view.k;
  }

  // The hotels on the summits of the Rigi and Pilatus, lit at night.
  summitLights = [];
  for (const [key, depth] of [['rigi', 2], ['pilatus', 3]]) {
    const [az, th] = DATA.marks[key];
    for (let i = 0; i < 4; i += 1) summitLights.push({ depth, az: az + (rand() - 0.5) * 0.25, th: th - 0.02 - rand() * 0.05, p: rand() * 6 });
  }

  // Stars across the upper sky.
  stars = [];
  for (let i = 0; i < 170; i += 1) {
    stars.push({ x: rand(), y: rand() ** 1.6, r: (0.35 + rand() * 0.9) * Math.min(1.3, s), p: rand() * 6.28, sp: 0.6 + rand() * 1.8 });
  }
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

// How far the view has turned (px), and each layer's offset: the whole view
// turns west with the day, the near hills slide a little further.
const turn = () => story.progress * (view.c1 - view.c0) * view.k;
const layerDx = (i) => {
  const near = 1 - i / (layers.length - 1);
  return -turn() - near * story.progress * view.w * 0.04 + story.pointer * near * 10;
};

function sunPosition(h) {
  // Rises behind the Zugerberg (east-south-east), arcs over the range and
  // sets in the south-west, just right of Pilatus, as in early winter.
  const az = 116 + (h - 6.2) * (120 / 13.2);
  const alt = 30 * Math.sin((Math.PI * (h - 6.2)) / 13.2);
  return [sx(az) - turn(), view.hy - alt * view.k * 0.65, alt];
}

const moonT = () => smooth(20.6, 23, story.hour);
const moonX = () => sx(158 + moonT() * 14) - turn();

function drawUpper(L) {
  const c = uctx;
  const { w, hy } = view;
  const rot = turn();
  c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);

  const sky = c.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, rgb(L.top));
  sky.addColorStop(0.62, rgb(L.mid));
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
      c.arc((((st.x * w - rot) % w) + w) % w, st.y * hy * 0.92, st.r, 0, 6.283);
      c.fill();
    }
  }

  // Moon, rising over the Zugerberg late in the evening.
  const mt = moonT();
  if (mt > 0) {
    const mx = moonX();
    const my = lerp(sy(8), hy * 0.22, mt);
    const r = 7 * view.scale;
    const g = c.createRadialGradient(mx, my, 0, mx, my, r * 9);
    g.addColorStop(0, `rgba(230,236,255,${0.22 * mt})`);
    g.addColorStop(1, 'rgba(230,236,255,0)');
    c.fillStyle = g;
    c.fillRect(mx - r * 9, my - r * 9, r * 18, r * 18);
    c.fillStyle = `rgba(244,240,228,${mt})`;
    c.beginPath();
    c.arc(mx, my, r, 0, 6.283);
    c.fill();
  }

  // Sun glow and disc (drawn before the ridges, so the mountains hide it).
  const [sunX, sunY, alt] = sunPosition(story.hour);
  if (L.glow > 0.01) {
    const gy = Math.max(sunY, sy(4));
    const gr = c.createRadialGradient(sunX, gy, 0, sunX, gy, w * 0.6);
    gr.addColorStop(0, rgb(L.sun, 0.6 * L.glow));
    gr.addColorStop(0.3, rgb(L.sun, 0.2 * L.glow));
    gr.addColorStop(1, rgb(L.sun, 0));
    c.fillStyle = gr;
    c.fillRect(0, 0, w, hy);
  }
  if (alt > -1) {
    const r = 11 * view.scale;
    c.fillStyle = rgb(mix(L.sun, [255, 255, 255], clamp(alt / 20) * 0.6), 0.95);
    c.beginPath();
    c.arc(sunX, sunY, r, 0, 6.283);
    c.fill();
  }

  // A few long, thin clouds.
  const drift = motionQuery.matches ? 0 : story.progress * view.w * 0.25;
  for (let i = 0; i < 4; i += 1) {
    const cx = ((((i * 0.31 + 0.12) * w * 1.6 + drift * (1 + i * 0.3) - rot * (0.7 + i * 0.1)) % (w * 1.6)) + w * 1.6) % (w * 1.6) - w * 0.3;
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

  // Ridges, far to near: snow on the high crests, haze rising from the feet.
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const layer = layers[i];
    const depth = i / (layers.length - 1);
    let crest = mix(L.near, L.far, depth ** 0.85);
    crest = mix(crest, ALPEN, L.alpen * (0.12 + 0.35 * depth));
    const foot = mix(crest, L.haze, clamp(L.mist * (0.6 + depth * 0.4) + 0.08));
    const g = c.createLinearGradient(0, layer.top, 0, hy);
    if (SNOW[i]) {
      const snow = mix(mix(L.snow, crest, 0.12), ALPEN, L.alpen * 0.35);
      g.addColorStop(0, rgb(mix(crest, snow, SNOW[i])));
      g.addColorStop(0.18 + SNOW[i] * 0.2, rgb(mix(crest, snow, SNOW[i] * 0.55)));
      g.addColorStop(0.3 + SNOW[i] * 0.25, rgb(crest));
    } else g.addColorStop(0, rgb(crest));
    g.addColorStop(1, rgb(foot));
    c.save();
    c.translate(layerDx(i), 0);
    c.fillStyle = g;
    c.fill(layer.path);
    if (i === 0) drawShore(c, L, foot);
    if (L.lights > 0.05) drawSummitLights(c, L, i);
    c.restore();
  }

  drawSteamer(c, L);

  // Mist lying on the water at dawn.
  if (L.mist > 0.2) {
    const m = c.createLinearGradient(0, hy - 30 * view.scale, 0, hy);
    m.addColorStop(0, rgb(L.haze, 0));
    m.addColorStop(1, rgb(L.haze, (L.mist - 0.2) * 0.9));
    c.fillStyle = m;
    c.fillRect(0, hy - 30 * view.scale, w, 30 * view.scale + 4);
  }
}

function drawShore(c, L, foot) {
  const { hy } = view;
  const lit = L.lights;
  for (const b of houses) {
    const x = sx(b.az);
    const fade = clamp(b.d / 9000);
    c.fillStyle = rgb(mix(mix(foot, L.near, 0.3), L.haze, 0.15 + fade * 0.5));
    c.fillRect(x, hy - b.h, b.w, b.h + 2);
    if (b.roof) {
      c.beginPath();
      c.moveTo(x - 0.4, hy - b.h);
      c.lineTo(x + b.w / 2, hy - b.h - b.w * 0.45);
      c.lineTo(x + b.w + 0.4, hy - b.h);
      c.fill();
    }
    if (lit > 0.02) {
      c.fillStyle = rgb(WARM, lit * (0.95 - fade * 0.4));
      const px = b.d < 3000 ? 1 : 0.8;
      for (const [wx, wy] of b.windows) c.fillRect(x + wx, hy - b.h + wy, px, px);
    }
  }
}

function drawSummitLights(c, L, i) {
  for (const l of summitLights) {
    if (l.depth !== i) continue;
    const fl = motionQuery.matches ? 1 : 0.8 + 0.2 * Math.sin(time * 1.3 + l.p);
    c.fillStyle = rgb(WARM, L.lights * fl);
    c.fillRect(sx(l.az), sy(l.th), 1.2, 1.2);
  }
}

// A lake steamer crossing from Zug towards Cham as the day goes on, about
// two kilometres out: a white hull with two decks, lit after dusk.
function drawSteamer(c, L) {
  const s = view.scale;
  const az = lerp(193, 236, story.progress);
  const x = sx(az) + layerDx(0) * 0.9;
  if (x < -60 || x > view.w + 60) return;
  const y = view.hy + 0.5;
  const len = 34 * s;
  const hull = mix([246, 243, 236], L.near, 0.25 + 0.6 * L.lights);
  c.fillStyle = rgb(hull);
  c.beginPath();
  c.moveTo(x - len / 2, y - 3.2 * s);
  c.lineTo(x + len / 2 + 2.5 * s, y - 3.2 * s);
  c.lineTo(x + len / 2 - 1 * s, y);
  c.lineTo(x - len / 2 + 1 * s, y);
  c.closePath();
  c.fill();
  c.fillRect(x - len * 0.32, y - 5.6 * s, len * 0.62, 2.6 * s);
  c.fillStyle = rgb(mix(hull, L.near, 0.35));
  c.fillRect(x - len * 0.05, y - 8.2 * s, 2.2 * s, 2.8 * s);
  if (L.lights > 0.05) {
    c.fillStyle = rgb(WARM, L.lights);
    for (let k = 0; k < 9; k += 1) c.fillRect(x - len * 0.28 + k * len * 0.065, y - 4.9 * s, 1.4 * s, 1.1 * s);
    for (let k = 0; k < 12; k += 1) c.fillRect(x - len * 0.42 + k * len * 0.07, y - 2.3 * s, 1.2 * s, 1 * s);
  }
}

function drawLabels(c) {
  const a = story.labels;
  if (a < 0.01) return;
  const s = view.scale;
  const items = [
    ['zugerberg', DATA.marks.zugerberg, 0, 0],
    ['rigi', DATA.marks.rigi, 2, 0.15],
    ['alps', DATA.marks.alps, 4, 0.3],
    ['pilatus', DATA.marks.pilatus, 3, 0.45],
  ];
  c.font = `600 ${Math.round(10.5 * Math.max(1, s * 0.9))}px Inter, system-ui, sans-serif`;
  c.textAlign = 'center';
  for (const [key, [az, th], layer, delay] of items) {
    const text = labelText[key];
    if (!text) continue;
    const x = sx(az) + layerDx(layer);
    const y = sy(th);
    const half = c.measureText(text.toUpperCase()).width / 2 + 8;
    if (x < half || x > view.w - half) continue;
    const t = clamp((a - delay * 0.5) / 0.5);
    if (t <= 0) continue;
    const len = (layer === 4 ? 44 : 26) * s * t;
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
  const { w, h, hy, dpr } = view;
  const c = ctx;
  // The sky and ridges move only with scroll and pointer. The canvas keeps
  // its pixels, so between those only the water is redrawn.
  if (full || upperAt < 0) {
    drawUpper(L);
    mctx.drawImage(upper, 0, 0, upper.width, Math.ceil(hy * dpr), 0, 0, mirror.width, mirror.height);
    upperAt = time;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(upper, 0, 0, upper.width, Math.ceil(hy * dpr), 0, 0, upper.width, Math.ceil(hy * dpr));
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawLabels(c);
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
  water.addColorStop(0, rgb(mix(L.low, L.haze, 0.5), 0.32));
  water.addColorStop(1, rgb(L.lake, 0.82));
  lctx.fillStyle = water;
  lctx.fillRect(0, 0, lw, lh);
  c.drawImage(lake, 0, hy, w, lakeH);

  // A path of light on the water beneath a low sun, or the moon.
  const [sunX, , alt] = sunPosition(story.hour);
  const glitter = alt > -0.5 && alt < 24 ? [sunX, mix(L.sun, [255, 255, 255], 0.2), 0.6 * (1 - clamp(alt / 24)) * clamp((alt + 0.5) / 3)]
    : story.hour > 21 ? [moonX(), [235, 238, 250], 0.35 * smooth(20.8, 22, story.hour)] : null;
  if (glitter) {
    const [gx, col, ga] = glitter;
    const rand = rng(Math.floor(time * (still ? 0 : 6)));
    for (let i = 0; i < 60; i += 1) {
      const d = rand() ** 1.4;
      const y = hy + 2 + d * lakeH * 0.92;
      const spread = (5 + d * 70) * view.scale;
      const x = gx + (rand() - 0.5) * spread * 2;
      c.fillStyle = rgb(col, ga * (1 - d * 0.7) * rand());
      c.fillRect(x, y, (3 + rand() * 12 * d) * view.scale, 1);
    }
  }

  // Shore lights stretched across the water at night.
  if (L.lights > 0.05) {
    const rand = rng(3);
    const dx = layerDx(0);
    for (const b of houses) {
      if (rand() > 0.25 || b.d > 7000) continue;
      const len = (8 + rand() * 30) * view.scale * clamp(2000 / b.d, 0.4, 1.4);
      const g = c.createLinearGradient(0, hy, 0, hy + len);
      g.addColorStop(0, rgb(WARM, 0.35 * L.lights));
      g.addColorStop(1, rgb(WARM, 0));
      c.fillStyle = g;
      c.fillRect(sx(b.az) + dx + b.w / 2, hy + 1, 1.2, len);
    }
  }

  drawLakeLabel(c);
  updateHud();
}

/* ------------------------------------------------------------------ HUD */

const hud = document.querySelector('[data-hud]');
const hudTime = hud && hud.querySelector('[data-hud-time]');
const hudDir = hud && hud.querySelector('[data-hud-dir]');
const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
let lastHud = '';

function updateHud() {
  if (!hud) return;
  const h = story.hour % 24;
  const mm = Math.floor((h % 1) * 60);
  const t = `${String(Math.floor(h)).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  // The compass bearing of the middle of the view.
  const b = Math.round(lerp(view.c0, view.c1, story.progress));
  const dir = `${b}° ${POINTS[Math.round(b / 22.5) % 16]}`;
  if (t + dir === lastHud) return;
  lastHud = t + dir;
  hudTime.textContent = t;
  hudDir.textContent = dir;
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
