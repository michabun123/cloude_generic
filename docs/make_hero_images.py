"""Clean the cartoon source images into hero assets for the Command Center.

Run:  python docs/make_hero_images.py
In:   docs/team_pic/{michaelJoseph_main,michael123,joseph_main1}.png
Out:  public/hero/{crew,michael,joseph}.png

All three sources are screenshots from image sites, so each carries watermark
furniture (a Google Lens badge, an "AI-generated" pill, a crown). Rather than
crop into the figures, the badges sit over flat background, so they are painted
over with the background colour sampled from a known-empty corner.
"""

from PIL import Image, ImageFilter
import os

SRC = 'docs/team_pic'
DST = 'public/hero'


def load(name):
    im = Image.open(os.path.join(SRC, name))
    if im.mode != 'RGB':
        im = im.convert('RGBA')
        flat = Image.new('RGB', im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    return im


def paint(im, boxes, sample=(5, 5)):
    """Fill each box with the background colour sampled from `sample`."""
    bg = im.getpixel(sample)
    for b in boxes:
        im.paste(Image.new('RGB', (b[2] - b[0], b[3] - b[1]), bg), (b[0], b[1]))
    return im


def dekey(im, box, sample=(5, 5)):
    """Erase watermark furniture inside `box` by COLOUR, not by rectangle.

    The "AI-generated" pill overlaps the hair with no gap between them, so a
    rectangle fill takes a bite out of the head. The badge is near-neutral dark
    grey and the crown is saturated yellow; hair is mid-brown. Keying on that
    difference removes the furniture and leaves the character intact.
    """
    bg = im.getpixel(sample)
    px = im.load()
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            spread = max(r, g, b) - min(r, g, b)
            grey_badge = spread < 30 and max(r, g, b) < 150     # dark grey pill / circle
            white_text = r > 225 and g > 225 and b > 225        # its label
            crown = r > 170 and g > 120 and b < 110 and r - b > 80
            if grey_badge or white_text or crown:
                px[x, y] = bg
    return im


def patch_hair(im, box, sample_box, bg_sample=(5, 5)):
    """Repaint watermark pixels inside `box` with real hair colour.

    Mirroring cannot help here: the pill straddles the head's centre line, so
    BOTH sides are damaged in the same rows. Instead, sample the mean colour of
    clean hair from `sample_box` just below, repaint anything that is neither
    warm (hair/skin) nor background, then soften the patch so it reads as hair
    rather than as a flat sticker.
    """
    px = im.load()
    sx0, sy0, sx1, sy1 = sample_box
    n = 0
    tot = [0, 0, 0]
    for y in range(sy0, sy1):
        for x in range(sx0, sx1):
            r, g, b = px[x, y]
            if (r - b) >= 18 and r >= 55:                  # a hair pixel
                tot[0] += r; tot[1] += g; tot[2] += b; n += 1
    hair = tuple(c // max(n, 1) for c in tot) if n else (120, 80, 55)

    bg = im.getpixel(bg_sample)
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            warm = (r - b) >= 18 and r >= 55
            near_bg = r > 232 and g > 232 and b > 232
            if not warm and not near_bg:
                px[x, y] = hair

    region = im.crop(box).filter(ImageFilter.GaussianBlur(2.2))
    im.paste(region, (x0, y0))
    return im


def mirror_fix(im, box, axis):
    """Rebuild a damaged area by mirroring the clean side of the head across `axis`.

    The "AI-generated" pill is drawn ON TOP of the hair with no gap, so neither a
    rectangle fill (bites a notch out of the head) nor a colour key (leaves ghost
    glyphs) works. The head is near-symmetric and its right side is untouched, so
    copying that across the centre line reconstructs the hair convincingly.
    """
    px = im.load()
    w, _ = im.size
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            mx = 2 * axis - x
            if 0 <= mx < w:
                px[x, y] = px[mx, y]
    return im


def keep_hair(im, box, sample=(5, 5)):
    """Inside `box`, keep only warm brown (hair) and drop everything else.

    Safer than listing every watermark colour: the badge has anti-aliased edges
    and coloured glyphs that a "remove these colours" filter keeps missing.
    Whitelisting the one thing we want to preserve removes the rest in one pass.
    """
    bg = im.getpixel(sample)
    px = im.load()
    x0, y0, x1, y1 = box
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            warm = (r - b) >= 18 and r >= 55 and r >= g >= b   # hair, skin, brows
            if not warm:
                px[x, y] = bg
    return im


def save(im, name, max_side=None):
    os.makedirs(DST, exist_ok=True)
    if max_side and max(im.size) > max_side:
        s = max_side / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    p = os.path.join(DST, name)
    im.save(p, 'PNG', optimize=True)
    print('  %-12s %sx%s  %d KB' % (name, im.width, im.height, os.path.getsize(p) // 1024))


# ── crew banner: trim the top strip and the bottom-left lens badge ───────────
crew = load('michaelJoseph_main.png')
w, h = crew.size
crew = crew.crop((16, 26, w, h - 58))          # strip + badge live on the edges
save(crew, 'crew.png', max_side=1200)

# ── Michael: NOT PROCESSED - the source needs replacing ─────────────────────
# michael123.png has the "AI-generated" pill burned ON TOP of his hair, straddling
# the head's centre line. Every repair was tried and all of them look worse than
# the badge: a rectangle fill bites a notch out of the head; a colour key leaves
# ghost glyphs; mirroring cannot help because BOTH sides are damaged in the same
# rows; patching with sampled hair colour smears. This needs a clean source, not
# a cleverer filter. Re-enable once docs/team_pic has a watermark-free version.
#
# mich = load('michael123.png')
# save(mich, 'michael.png', max_side=900)
print('  michael      SKIPPED - source has a watermark over the hair (see comment)')

# ── Joseph: clean source, just normalise ────────────────────────────────────
jos = load('joseph_main1.png')
save(jos, 'joseph.png', max_side=900)

print('done')
