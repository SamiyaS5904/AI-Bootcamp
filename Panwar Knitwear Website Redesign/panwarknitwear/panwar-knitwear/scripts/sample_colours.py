"""Sample the colour-run stacks out of each product photograph.

Each frame is a hero garment on a dark charcoal floor with a stacked run of the
same style in 4-6 colourways beside it. We quantise the frame, drop the charcoal
ground and near-neutrals, merge near-duplicates, and keep the strongest runs.
"""
import colorsys, json, os, glob

from PIL import Image

SRC = "public/img"
OUT = "src/data/colourways.json"


def luminance(c):
    r, g, b = c
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def to_hls(c):
    r, g, b = [v / 255 for v in c]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, l, s


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def sample(path):
    im = Image.open(path).convert("RGB")
    im = im.resize((246, 287))
    # Adaptive palette gives us the dominant runs in the frame.
    q = im.quantize(colors=40, method=Image.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), key=lambda t: -t[0])
    total = sum(c for c, _ in counts)

    picked = []
    for count, idx in counts:
        rgb = tuple(pal[idx * 3 : idx * 3 + 3])
        share = count / total
        lum = luminance(rgb)
        _, l, s = to_hls(rgb)

        # The charcoal ground and its shadows.
        if lum < 58:
            continue
        # Speckled concrete reads as a mid-grey neutral. Cream, white and pale
        # grey garments are real colourways, so only reject dim neutrals.
        if s < 0.12 and lum < 165:
            continue
        # Too small to be a garment in the run.
        if share < 0.005:
            continue
        # Merge near-duplicates.
        if any(dist(rgb, p) < 50 for p in picked):
            continue
        picked.append(rgb)
        if len(picked) == 6:
            break

    return ["#%02x%02x%02x" % c for c in picked]


def main():
    out = {}
    for path in sorted(glob.glob(os.path.join(SRC, "p*.jpg"))):
        key = os.path.splitext(os.path.basename(path))[0]
        out[key] = sample(path)
        print(key, len(out[key]), " ".join(out[key]))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(out, fh, indent=2, sort_keys=True)
        fh.write("\n")
    print("\nwrote", OUT)


if __name__ == "__main__":
    main()
