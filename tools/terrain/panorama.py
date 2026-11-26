"""Compute the real skyline seen from Lake Zug, looking east at the Zugerberg.

For every azimuth the script casts a ray over the terrain and records the
highest apparent elevation angle within each distance band (Earth curvature
and refraction included). Each band becomes one layer of the scene, drawn far
to near. The funicular track and a few landmarks are projected the same way.

Output: src/data/zugerberg.json (read by tools/build.mjs into the scene script).
"""
import json
import os

import numpy as np

from dem import R, bearing_dist, dest, elev

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "zugerberg.json")

# Viewpoint: on the lake, about 2 km west of Zug's old town.
VLA, VLO = 47.160, 8.488
LAKE = 408.8            # lake surface as it appears in the elevation data
EYE = LAKE + 4
REFRACTION = 0.13

# Distance bands (m): lower slopes and town; Zugerberg crest; Rossberg and
# Rigi; nearer Alps; distant Alps.
BANDS = [(0, 3000), (3000, 5600), (5600, 13000), (13000, 32000), (32000, 90000)]

# Zugerbergbahn: track midpoint (Wikipedia), 1,280 m long, rising to the SE.
FUN_MID = (47.147875, 8.526335)
FUN_BEARING = 132  # fitted so that the ends match the station elevations


def angle(z, d):
    return np.degrees(np.arctan2(z - d ** 2 / (2 * R) * (1 - REFRACTION) - EYE, d))


def project(lat, lon):
    b, d = bearing_dist(VLA, VLO, lat, lon)
    return [round(float(b), 3), round(float(angle(float(elev(lat, lon)), d)), 3)]


def main():
    azs = np.arange(40, 235.01, 0.25)
    d = np.concatenate([np.arange(30, 3000, 25), np.arange(3000, 15000, 60), np.arange(15000, 90000, 200)])
    AZ, D = np.meshgrid(azs, d.astype(float), indexing="ij")
    Z = elev(*dest(VLA, VLO, AZ, D))
    TH = angle(Z, D)

    layers = []
    for i, (a, b) in enumerate(BANDS):
        th = np.where((D >= a) & (D < b), TH, -90).max(1)
        th = np.maximum(th, -0.6)
        step = 1 if i < 2 else 2
        layers.append({"d": round((a + b) / 2000, 1), "step": 0.25 * step,
                       "th": [int(round(v * 100)) for v in th[::step]]})

    top = dest(*FUN_MID, FUN_BEARING, 640)
    bottom = dest(*FUN_MID, FUN_BEARING + 180, 640)
    track = [project(float(bottom[0] + (top[0] - bottom[0]) * f), float(bottom[1] + (top[1] - bottom[1]) * f))
             for f in np.linspace(0, 1, 24)]

    crest_band = np.where((D >= 3000) & (D < 5600), TH, -90).max(1)
    sel = (azs >= 112) & (azs <= 132)
    ci = int(np.argmax(np.where(sel, crest_band, -99)))

    land = Z > LAKE + 3
    shore = np.where(land.any(1), d[land.argmax(1)], 9000)

    data = {
        "source": "Terrain Tiles (Mapzen, AWS Open Data); see tools/terrain/README.md",
        "az0": float(azs[0]), "az1": float(azs[-1]),
        "layers": layers,
        "track": track,
        "marks": {
            "zug": project(47.1662, 8.5155),
            "crest": [float(azs[ci]), round(float(crest_band[ci]), 3)],
            "rigi": project(47.0567, 8.4853),
            "pilatus": project(46.9790, 8.2539),
        },
        "shore": [int(s) for s in shore[::4]],
    }
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"wrote {os.path.relpath(OUT)}")


if __name__ == "__main__":
    main()
