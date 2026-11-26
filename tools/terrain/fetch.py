"""Download the Terrain Tiles needed for the panorama and contour map.

Terrain Tiles (Mapzen, hosted on AWS Open Data) use the terrarium encoding.
About 70 tiles, roughly 9 MB, cached in tools/terrain/.tiles (git-ignored).
"""
import math
import os
import urllib.request

from dem import TILES

URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"


def tile(lat, lon, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def tiles(z, lat0, lat1, lon0, lon1):
    xa, ya = tile(lat1, lon0, z)
    xb, yb = tile(lat0, lon1, z)
    for x in range(int(xa), int(xb) + 1):
        for y in range(int(ya), int(yb) + 1):
            yield z, x, y


if __name__ == "__main__":
    os.makedirs(TILES, exist_ok=True)
    jobs = list(tiles(12, 47.0, 47.30, 8.30, 8.75)) + list(tiles(10, 46.5, 47.7, 7.6, 9.4))
    for z, x, y in jobs:
        path = os.path.join(TILES, f"{z}_{x}_{y}.png")
        if not os.path.exists(path):
            urllib.request.urlretrieve(URL.format(z=z, x=x, y=y), path)
    print(f"{len(jobs)} tiles in {TILES}")
