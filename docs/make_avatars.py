"""Crop the team photos into square avatars.

Run:  python docs/make_avatars.py
In:   docs/team_pic/*.jpg      Out:  public/avatars/*.jpg  (320x320)

A plain centre-crop does not work here: the three photos are framed very
differently (Michael is a car selfie with the face low-right, Naum is a studio
portrait with the face high, Vadim is nearly square and face-filling). So each
gets its own face centre, expressed as a fraction of width/height, plus how much
of the frame the square should span.
"""

from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import os

SRC = 'docs/team_pic'
DST = 'public/avatars'
SIZE = 320

# name: (source file, face centre x, face centre y, square side as a fraction of the
#        SHORT edge, fit mode)
#
# fit='crop'    cut a square out of the photo. Fine when there is spare room around
#               the head.
# fit='contain' the head already fills the frame edge to edge, so ANY square crop
#               would slice off hair or chin. Instead keep the whole photo and pad
#               the sides with a blurred copy of itself.
SPEC = {
    'michael': ('michael1.png', 0.48, 0.45, 1.00, 'contain'),
    'naum':    ('naum.jpg',     0.50, 0.34, 0.92, 'crop'),
    'vadim':   ('vadim.jpg',    0.50, 0.45, 0.98, 'crop'),
}


def contain(im, side):
    """Whole photo, centred on a square, sides filled with a blurred copy of itself.

    Nothing of the face is lost, and the padding reads as depth of field rather
    than as empty bars.
    """
    w, h = im.size
    scale = side / min(w, h)
    bg = im.resize((max(side, int(w * scale)), max(side, int(h * scale))), Image.LANCZOS)
    bw, bh = bg.size
    bg = bg.crop(((bw - side) // 2, (bh - side) // 2,
                  (bw - side) // 2 + side, (bh - side) // 2 + side))
    bg = bg.filter(ImageFilter.GaussianBlur(22))
    bg = ImageEnhance.Brightness(bg).enhance(0.82)

    fs = side / max(w, h)
    fw, fh = int(w * fs), int(h * fs)
    bg.paste(im.resize((fw, fh), Image.LANCZOS), ((side - fw) // 2, (side - fh) // 2))
    return bg


def crop(name, src_file, cx, cy, span, fit='crop'):
    im = Image.open(os.path.join(SRC, src_file))
    im = ImageOps.exif_transpose(im)          # honour phone rotation metadata
    # PNGs come in as RGBA; JPEG has no alpha channel, so flatten onto white
    # rather than letting PIL raise "cannot write mode RGBA as JPEG".
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        flat = Image.new('RGB', im.size, (255, 255, 255))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    elif im.mode != 'RGB':
        im = im.convert('RGB')
    w, h = im.size

    if fit == 'contain':
        out = contain(im, SIZE)
    else:
        side = int(min(w, h) * span)
        left = int(w * cx - side / 2)
        top = int(h * cy - side / 2)
        # Keep the square inside the image rather than letting PIL pad with black.
        left = max(0, min(left, w - side))
        top = max(0, min(top, h - side))
        out = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)

    path = os.path.join(DST, name + '.jpg')
    out.save(path, 'JPEG', quality=88, optimize=True)
    print('  %-8s %-14s %sx%s -> %s (%d KB)' % (name, src_file, w, h, path, os.path.getsize(path) // 1024))


os.makedirs(DST, exist_ok=True)
for n, (src_file, cx, cy, span, fit) in SPEC.items():
    crop(n, src_file, cx, cy, span, fit)
print('done')
