"""Build the Interviewer avatar from the cartoon in docs/team_pic/interview.png.

Run:  python docs/make_interviewer_avatar.py
Out:  public/avatars/interviewer.png  (512x512)

Kept separate from make_avatars.py because this is an illustration, not a face:
no face-centre logic, and it needs the Google Images watermark trimmed off the
bottom-left corner before anything else.
"""

from PIL import Image
import os

SRC = 'docs/team_pic/interview.png'
DST = 'public/avatars/interviewer.png'
SIZE = 512
TRIM = 72          # px shaved off the left and bottom to remove the watermark

im = Image.open(SRC)
w, h = im.size

# 1. Drop the corner containing the Google Lens badge.
im = im.crop((TRIM, 0, w, h - TRIM))

# 2. Square it off from the RIGHT, so the robot (the subject) stays centred
#    rather than drifting out of frame.
w2, h2 = im.size
side = min(w2, h2)
im = im.crop((w2 - side, 0, w2, side))

# 3. Flatten onto white — the source is RGBA and PNG keeps alpha, but a stray
#    transparent edge would show as a hole inside a circular avatar mask.
if im.mode != 'RGB':
    im = im.convert('RGBA')
    flat = Image.new('RGB', im.size, (255, 255, 255))
    flat.paste(im, mask=im.split()[-1])
    im = flat

im = im.resize((SIZE, SIZE), Image.LANCZOS)
os.makedirs(os.path.dirname(DST), exist_ok=True)
im.save(DST, 'PNG', optimize=True)
print('  %sx%s -> %s (%d KB)' % (w, h, DST, os.path.getsize(DST) // 1024))
