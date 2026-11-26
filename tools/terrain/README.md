# Terrain

These scripts turn open elevation data into the two pieces of artwork the
site draws from:

- `src/data/zugerberg.json`: the skyline seen from Lake Zug, in five layers,
  with the funicular track and a few landmarks. The build inlines it into the
  scene script, and the paper panels' top edge and the social image are drawn
  from it too.
- `src/svg/contours.svg`: the contour map of the Zugerberg in the Principles
  section (40 m interval, shore line included).

Both outputs are committed. The site build never runs these scripts, so you
only need them to change the view.

## Run

Python 3 with NumPy and Pillow.

```sh
python3 tools/terrain/fetch.py       # downloads the tiles into tools/terrain/.tiles (git-ignored)
python3 tools/terrain/panorama.py    # writes src/data/zugerberg.json
python3 tools/terrain/contours.py    # writes src/svg/contours.svg
node tools/build.mjs
```

## How it works

- `fetch.py` downloads Terrarium-encoded elevation tiles (zoom 12 around the
  lake, zoom 10 for the far Alps). Elevation in metres is
  `R * 256 + G + B / 256 - 32768`.
- `dem.py` mosaics the tiles and samples elevation at any latitude and
  longitude, with bilinear interpolation.
- `panorama.py` stands at 47.160 N, 8.488 E, 4 m above the lake, and casts a
  ray every quarter degree from azimuth 40 to 235. Along each ray it keeps the
  highest apparent elevation angle within each distance band (0 to 3 km, 3 to
  5.6, 5.6 to 13, 13 to 32 and 32 to 90 km), allowing for the Earth's
  curvature and atmospheric refraction (k = 0.13). The Zugerbergbahn's track
  is a straight line through its midpoint, with its bearing fitted so that the
  ends match the station heights.
- `contours.py` samples a grid over the mountain, smooths it lightly, traces
  the contour lines with marching squares and simplifies them.

## Data and attribution

[Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) on the AWS Open
Data registry, originally produced by Mapzen. Over Switzerland they draw on
EU-DEM. Attribution, as the terms ask, is in the Impressum in both languages:

> EU-DEM layers produced using Copernicus data and information funded by the
> European Union.
