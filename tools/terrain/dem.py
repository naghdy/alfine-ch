"""Elevation sampling from Terrain Tiles (terrarium PNG encoding).

Tiles are cached in tools/terrain/.tiles by fetch.py. Zoom 12 (about 26 m per
pixel here) covers the area around Lake Zug; zoom 10 covers the distant Alps.
"""
import glob
import os

import numpy as np
from PIL import Image

TILES = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tiles")
R = 6371000.0


class Mosaic:
    def __init__(self, z):
        self.z = z
        files = glob.glob(os.path.join(TILES, f"{z}_*.png"))
        if not files:
            raise SystemExit("No tiles found: run tools/terrain/fetch.py first.")
        coords = [tuple(int(v) for v in os.path.basename(f)[:-4].split("_")[1:]) for f in files]
        xs = sorted({x for x, _ in coords})
        ys = sorted({y for _, y in coords})
        self.x0, self.y0 = xs[0], ys[0]
        self.a = np.zeros((len(ys) * 256, len(xs) * 256), np.float32)
        for f, (x, y) in zip(files, coords):
            im = np.asarray(Image.open(f).convert("RGB")).astype(np.float32)
            e = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
            oy, ox = (y - self.y0) * 256, (x - self.x0) * 256
            self.a[oy:oy + 256, ox:ox + 256] = e

    def sample(self, lat, lon):
        n = 2 ** self.z
        x = (lon + 180) / 360 * n
        y = (1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n
        X, Y = (x - self.x0) * 256 - 0.5, (y - self.y0) * 256 - 0.5
        H, W = self.a.shape
        ok = (X >= 0) & (Y >= 0) & (X < W - 1) & (Y < H - 1)
        X = np.clip(X, 0, W - 1.001)
        Y = np.clip(Y, 0, H - 1.001)
        x0, y0 = np.floor(X).astype(int), np.floor(Y).astype(int)
        fx, fy = X - x0, Y - y0
        a = self.a
        v = (a[y0, x0] * (1 - fx) * (1 - fy) + a[y0, x0 + 1] * fx * (1 - fy)
             + a[y0 + 1, x0] * (1 - fx) * fy + a[y0 + 1, x0 + 1] * fx * fy)
        return v, ok


_m12 = _m10 = None


def elev(lat, lon):
    global _m12, _m10
    if _m12 is None:
        _m12, _m10 = Mosaic(12), Mosaic(10)
    lat, lon = np.asarray(lat, float), np.asarray(lon, float)
    v12, ok12 = _m12.sample(lat, lon)
    v10, _ = _m10.sample(lat, lon)
    return np.where(ok12, v12, v10)


def dest(lat, lon, az, d):
    """Point at distance d (m) and bearing az (deg) from lat/lon."""
    la, lo, b = np.radians(lat), np.radians(lon), np.radians(az)
    dr = d / R
    la2 = np.arcsin(np.sin(la) * np.cos(dr) + np.cos(la) * np.sin(dr) * np.cos(b))
    lo2 = lo + np.arctan2(np.sin(b) * np.sin(dr) * np.cos(la), np.cos(dr) - np.sin(la) * np.sin(la2))
    return np.degrees(la2), np.degrees(lo2)


def bearing_dist(lat, lon, lat2, lon2):
    la, lo, la2, lo2 = map(np.radians, (lat, lon, lat2, lon2))
    y = np.sin(lo2 - lo) * np.cos(la2)
    x = np.cos(la) * np.sin(la2) - np.sin(la) * np.cos(la2) * np.cos(lo2 - lo)
    b = (np.degrees(np.arctan2(y, x)) + 360) % 360
    h = np.sin((la2 - la) / 2) ** 2 + np.cos(la) * np.cos(la2) * np.sin((lo2 - lo) / 2) ** 2
    return b, 2 * R * np.arcsin(np.sqrt(h))
