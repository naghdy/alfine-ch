# Terrain

These scripts turn open elevation data into the two pieces of artwork the
site draws from:

- `src/data/skyline.json`: the view south from Zug's lakefront, in five
  layers, with the summits that get labels and the distance to the far shore.
  The build inlines it into the scene script, and the paper panels' top edge,
  the still backdrop and the social image are drawn from it too.
- `src/svg/contours.svg`: the contour map of the Zugerberg in the Principles
  section (40 m interval, shore line included).

Both outputs are committed. The site build never runs these scripts, so you
only need them to change the view.

## Run

Python 3 with NumPy and Pillow.

```sh
python3 tools/terrain/fetch.py       # downloads the tiles into tools/terrain/.tiles (git-ignored)
python3 tools/terrain/panorama.py    # writes src/data/skyline.json
python3 tools/terrain/contours.py    # writes src/svg/contours.svg
node tools/build.mjs
```

## How it works

- `fetch.py` downloads Terrarium-encoded elevation tiles (zoom 12 from the
  Zugerberg south to Pilatus, zoom 10 out to the Bernese and Glarus Alps). Elevation in metres is
  `R * 256 + G + B / 256 - 32768`.
- `dem.py` mosaics the tiles and samples elevation at any latitude and
  longitude, with bilinear interpolation.
- `panorama.py` stands on the lakefront by Zug's old town (47.1658 N,
  8.5128 E), 2 m above the water, and casts a ray every tenth of a degree from
  azimuth 140 to 270. Along each ray it keeps the highest apparent elevation
  angle within each distance band (0 to 4 km, 4 to 10, 10 to 22, 22 to 45 and
  45 to 130 km), allowing for the Earth's curvature and atmospheric refraction
  (k = 0.13). From there the Rigi Kulm stands at 189 degrees, the Mönch at 210
  and Pilatus at 224; the Titlis and Uri-Rotstock are hidden behind the Rigi.
- `contours.py` samples a grid over the mountain, smooths it lightly, traces
  the contour lines with marching squares and simplifies them.

## Data and attribution

[Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) on the AWS Open
Data registry, originally produced by Mapzen. Over Switzerland they draw on
EU-DEM. Attribution, as the terms ask, is in the Impressum in both languages:

> EU-DEM layers produced using Copernicus data and information funded by the
> European Union.
