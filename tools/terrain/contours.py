"""Trace contour lines of the Zugerberg and the Lake Zug shore into an SVG.

Marching squares over a lightly smoothed elevation grid, every 40 m from
440 m, plus the shoreline. Lines are simplified and drawn as smooth curves.

Output: src/svg/contours.svg (inlined into the page by the templates).
"""
import os
import sys

import numpy as np

from dem import elev

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "svg", "contours.svg")
SHORE = 412
LEVELS = [SHORE] + list(range(440, 1161, 40))

N = 300
lat = np.linspace(47.185, 47.095, N)  # north at the top
lon = np.linspace(8.475, 8.615, int(N * 1.4))
LO, LA = np.meshgrid(lon, lat)
E = elev(LA, LO)
for _ in range(2):  # light box blur, edges replicated
    P = np.pad(E, 1, mode="edge")
    E = (P[1:-1, 1:-1] + P[:-2, 1:-1] + P[2:, 1:-1] + P[1:-1, :-2] + P[1:-1, 2:]) / 5
H, W = E.shape


def march(level):
    a = E >= level
    idx = a[:-1, :-1] * 8 + a[:-1, 1:] * 4 + a[1:, 1:] * 2 + a[1:, :-1] * 1

    def at(y0, x0, y1, x1):
        v0, v1 = E[y0, x0], E[y1, x1]
        t = (level - v0) / (v1 - v0) if v1 != v0 else 0.5
        return (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)

    segs = []
    for y, x in zip(*np.nonzero((idx > 0) & (idx < 15))):
        T, Rt = at(y, x, y, x + 1), at(y, x + 1, y + 1, x + 1)
        B, L = at(y + 1, x, y + 1, x + 1), at(y, x, y + 1, x)
        segs += {1: [(L, B)], 2: [(B, Rt)], 3: [(L, Rt)], 4: [(T, Rt)], 5: [(L, T), (B, Rt)],
                 6: [(T, B)], 7: [(L, T)], 8: [(L, T)], 9: [(T, B)], 10: [(T, Rt), (L, B)],
                 11: [(T, Rt)], 12: [(L, Rt)], 13: [(B, Rt)], 14: [(L, B)]}[idx[y, x]]

    key = lambda p: (round(p[0], 4), round(p[1], 4))
    ends = {}
    for i, (p, q) in enumerate(segs):
        ends.setdefault(key(p), []).append((i, 0))
        ends.setdefault(key(q), []).append((i, 1))
    used = [False] * len(segs)
    lines = []
    for i in range(len(segs)):
        if used[i]:
            continue
        used[i] = True
        line = [segs[i][0], segs[i][1]]
        for forward in (True, False):
            while True:
                end = line[-1] if forward else line[0]
                nxt = next(((j, s) for j, s in ends.get(key(end), []) if not used[j]), None)
                if not nxt:
                    break
                j, s = nxt
                used[j] = True
                p = segs[j][1 - s]
                line.append(p) if forward else line.insert(0, p)
        if len(line) > 6:
            lines.append(line)
    return lines


def simplify(pts, eps=0.5):
    if len(pts) < 3:
        return pts
    p = np.array(pts)
    a, b = p[0], p[-1]
    ab = b - a
    n = np.hypot(*ab) or 1
    dist = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / n
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return simplify(pts[:i + 1], eps)[:-1] + simplify(pts[i:], eps)
    return [pts[0], pts[-1]]


def smooth_path(pts):
    """Quadratic curves through midpoints: a smooth line with few commands."""
    f = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")
    out = [f"M{f(pts[0][0])} {f(pts[0][1])}"]
    for i in range(1, len(pts) - 1):
        mx, my = (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2
        out.append(f"Q{f(pts[i][0])} {f(pts[i][1])} {f(mx)} {f(my)}")
    out.append(f"L{f(pts[-1][0])} {f(pts[-1][1])}")
    return "".join(out)


def main():
    sys.setrecursionlimit(10000)
    paths = []
    for level in LEVELS:
        cls = "shore" if level == SHORE else ("major" if level % 200 == 0 else "minor")
        for line in march(level):
            pts = simplify(line)
            if len(pts) < 3:  # specks
                continue
            paths.append(f'<path class="c-{cls}" d="{smooth_path(pts)}" vector-effect="non-scaling-stroke"/>')
    svg = (f'<svg class="contours" viewBox="0 0 {W - 1} {H - 1}" preserveAspectRatio="xMidYMid slice" '
           f'aria-hidden="true" focusable="false">{"".join(paths)}</svg>\n')
    with open(OUT, "w") as fh:
        fh.write(svg)
    print(f"wrote {os.path.relpath(OUT)} ({len(paths)} lines, {len(svg) // 1024} KB)")


if __name__ == "__main__":
    main()
