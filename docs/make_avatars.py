"""Crop the team photos into square avatars.

Run:  python docs/make_avatars.py
In:   docs/team_pic/*.jpg      Out:  public/avatars/*.jpg  (320x320)

A plain centre-crop does not work here: the three photos are framed very
differently (Michael is a car selfie with the face low-right, Naum is a studio
portrait with the face high, Vadim is nearly square and face-filling). So each
gets its own face centre, expressed as a fraction of width/height, plus how much
of the frame the square should span.
"""

from PIL import Image, ImageOps
import os

SRC = 'docs/team_pic'
DST = 'public/avatars'
SIZE = 320

# name: (face centre x, face centre y, square side as a fraction of the SHORT edge)
SPEC = {
    'michael': (0.56, 0.46, 1.00),
    'naum':    (0.50, 0.34, 0.92),
    'vadim':   (0.50, 0.45, 0.98),
}


def crop(name, cx, cy, span):
    im = Image.open(os.path.join(SRC, name + '.jpg'))
    im = ImageOps.exif_transpose(im)          # honour phone rotation metadata
    w, h = im.size
    side = int(min(w, h) * span)

    left = int(w * cx - side / 2)
    top = int(h * cy - side / 2)
    # Keep the square inside the image rather than letting PIL pad with black.
    left = max(0, min(left, w - side))
    top = max(0, min(top, h - side))

    out = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(DST, name + '.jpg')
    out.save(path, 'JPEG', quality=88, optimize=True)
    print('  %-8s %sx%s -> %s (%d KB)' % (name, w, h, path, os.path.getsize(path) // 1024))


os.makedirs(DST, exist_ok=True)
for n, (cx, cy, span) in SPEC.items():
    crop(n, cx, cy, span)
print('done')
