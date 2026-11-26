"""Compute the real skyline seen from Zug's lakefront, looking south.

The classic view across Lake Zug: the Zugerberg's flank on the left, the Rigi,
the Bernese Alps low on the horizon in the middle (Finsteraarhorn, Schreckhorn,
Eiger, Mönch, Jungfrau), the Stanserhorn and Bürgenstock in front of them and
Pilatus on the right.

For every azimuth the script casts a ray over the terrain and records the
highest apparent elevation angle within each distance band (Earth curvature
and refraction included). Each band becomes one layer of the scene, drawn far
to near. A few summits are projected the same way, for the labels.

Output: src/data/skyline.json (read by tools/build.mjs into the scene script).
"""
import json
import os

import numpy as np

from dem import R, bearing_dist, dest, elev

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "skyline.json")

# Viewpoint: the lakefront promenade by Zug's old town, 2 m above the water.
VLA, VLO = 47.1658, 8.5128
LAKE = 413.5            # lake surface as it appears in the elevation data
EYE = LAKE + 2
REFRACTION = 0.13
AZ0, AZ1 = 140.0, 270.0

# Distance bands (m): the Zugerberg's flank and the near shore; the far shore
# and the Walchwilerberg; the Rigi and Rossberg; Pilatus and the Stanserhorn;
# the Bernese and Uri Alps. Step (degrees) per layer: finer where the
# outline is sharp.
BANDS = [(0, 4000), (4000, 10000), (10000, 22000), (22000, 45000), (45000, 130000)]
STEPS = [0.2, 0.2, 0.2, 0.1, 0.1]

PEAKS = {
    "rigi": (47.0565, 8.4851),
    "alps": (46.5584, 7.9975),      # Mönch, between Eiger and Jungfrau
    "pilatus": (46.9793, 8.2533),
}


def angle(z, d):
    return np.degrees(np.arctan2(z - d ** 2 / (2 * R) * (1 - REFRACTION) - EYE, d))


def summit(lat, lon):
    """Bearing and apparent angle of the highest point within 400 m."""
    pts = [dest(lat, lon, a, r) for a in range(0, 360, 30) for r in (0, 150, 300, 400)]
    z, (la, lo) = max((float(elev(*p)), p) for p in pts)
    b, d = bearing_dist(VLA, VLO, la, lo)
    return [round(float(b), 2), round(float(angle(z, d)), 3)]


def main():
    azs = np.arange(AZ0, AZ1 + 1e-6, 0.1)
    d = np.concatenate([np.arange(20, 4000, 20), np.arange(4000, 20000, 50), np.arange(20000, 130000, 150)]).astype(float)
    AZ, D = np.meshgrid(azs, d, indexing="ij")
    Z = elev(*dest(VLA, VLO, AZ, D))
    TH = angle(Z, D)

    layers = []
    for (a, b), step in zip(BANDS, STEPS):
        th = np.maximum(np.where((D >= a) & (D < b), TH, -90).max(1), -0.4)
        n = int(round(step / 0.1))
        layers.append({"d": round((a + b) / 2000, 1), "step": step, "th": [int(round(v * 100)) for v in th[::n]]})

    # The Zugerberg's flank: where it leaves the left edge of a wide view.
    near = np.maximum(layers[0]["th"], 0)
    zi = int(np.argmin(np.abs(azs[::2] - 172)))

    # Distance to the far shore every degree, for placing lights along it.
    land = Z > LAKE + 2
    land[:, d < 150] = False
    shore = np.where(land.any(1), d[land.argmax(1)], 20000)

    data = {
        "source": "Terrain Tiles (Mapzen, AWS Open Data); see tools/terrain/README.md",
        "az0": AZ0, "az1": AZ1,
        "layers": layers,
        "marks": {"zugerberg": [172.0, round(near[zi] / 100, 3)], **{k: summit(*v) for k, v in PEAKS.items()}},
        "shore": [int(s) for s in shore[::10]],
    }
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"wrote {os.path.relpath(OUT)}: {os.path.getsize(OUT)} bytes, marks {data['marks']}")


if __name__ == "__main__":
    main()
