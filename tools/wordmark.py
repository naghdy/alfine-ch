"""Draw the Alfine wordmark as outlines from the self-hosted Marcellus font.

    python3 tools/wordmark.py            # writes src/svg/wordmark.svg

Needs fontTools (pip install fonttools brotli). The font file is committed, so
this runs offline. Pair kerning is read from the font's GPOS table, and a
little extra tracking opens the word up at display sizes.
"""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'src/assets/fonts/marcellus-latin.woff2'
OUT = ROOT / 'src/svg/wordmark.svg'
TEXT = 'Alfine'
TRACKING = 40  # font units added between letters


def pair_kerning(font):
    """Return {(left, right): x advance adjustment} from GPOS PairPos lookups."""
    kern = {}
    if 'GPOS' not in font:
        return kern
    gpos = font['GPOS'].table
    for lookup in gpos.LookupList.Lookup:
        subtables = lookup.SubTable
        if lookup.LookupType == 9:
            subtables = [s.ExtSubTable for s in subtables]
        for st in subtables:
            if getattr(st, 'LookupType', 2) != 2 and lookup.LookupType != 9:
                continue
            if not hasattr(st, 'Format') or not hasattr(st, 'Coverage'):
                continue
            firsts = st.Coverage.glyphs
            if st.Format == 1:
                for g1, ps in zip(firsts, st.PairSet):
                    for rec in ps.PairValueRecord:
                        v = rec.Value1
                        if v is not None and getattr(v, 'XAdvance', 0):
                            kern.setdefault((g1, rec.SecondGlyph), v.XAdvance)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs
                c2 = st.ClassDef2.classDefs
                for g1 in firsts:
                    row = st.Class1Record[c1.get(g1, 0)]
                    for g2 in font.getGlyphOrder():
                        rec = row.Class2Record[c2.get(g2, 0)]
                        v = rec.Value1
                        if v is not None and getattr(v, 'XAdvance', 0):
                            kern.setdefault((g1, g2), v.XAdvance)
    return kern


def main():
    font = TTFont(FONT)
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    hmtx = font['hmtx']
    kern = pair_kerning(font)
    names = [cmap[ord(c)] for c in TEXT]

    pen = SVGPathPen(glyphs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    x = 0
    lsb0 = hmtx[names[0]][1]
    for i, name in enumerate(names):
        # Flip y so the baseline sits at 0 and the letters rise into negative y.
        glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, x - lsb0, 0)))
        x += hmtx[name][0]
        if i + 1 < len(names):
            x += kern.get((name, names[i + 1]), 0) + TRACKING

    # Tight box around the ink.
    from fontTools.pens.boundsPen import BoundsPen

    bp = BoundsPen(glyphs)
    x = 0
    for i, name in enumerate(names):
        glyphs[name].draw(TransformPen(bp, (1, 0, 0, 1, x - lsb0, 0)))
        x += hmtx[name][0]
        if i + 1 < len(names):
            x += kern.get((name, names[i + 1]), 0) + TRACKING
    xmin, ymin, xmax, ymax = bp.bounds
    pad = 10
    vb = f'{round(xmin) - pad} {-round(ymax) - pad} {round(xmax - xmin) + 2 * pad} {round(ymax - ymin) + 2 * pad}'
    OUT.write_text(
        f'<svg class="wordmark" viewBox="{vb}" aria-hidden="true" focusable="false">'
        f'<path fill="currentColor" d="{pen.getCommands()}"/></svg>\n'
    )
    print(f'wrote {OUT.relative_to(ROOT)} viewBox {vb}, {len(kern)} kerning pairs')


if __name__ == '__main__':
    main()
