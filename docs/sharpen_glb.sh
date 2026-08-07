#!/usr/bin/env bash
# Sharpen a Tripo/Meshy GLB for web use without destroying the mesh.
#
# Why this exists: `gltf-transform optimize --simplify-error 0.01` took our character
# models from ~1,000,000 triangles to ~1,200-4,500 (>99% loss). Faces collapsed.
# This runs the steps explicitly so the triangle target is a decision, not a side effect.
#
# usage: ./sharpen_glb.sh <src.glb> <out.glb> [ratio] [basecolor_px] [normal_px] [rm_px]
# hero face:   ./sharpen_glb.sh in.glb out.glb 0.06 2048 2048 1024   (~4 MB)
# banner/wide: ./sharpen_glb.sh in.glb out.glb 0.06 2048 1024 1024   (~3 MB)
# small avatar: the old `optimize --simplify-error 0.004 --texture-size 1024` is still fine.
set -euo pipefail

SRC="$1"; OUT="$2"
RATIO="${3:-0.06}"; BC="${4:-2048}"; NRM="${5:-2048}"; RM="${6:-1024}"
GT="npx --yes @gltf-transform/cli@latest"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

echo "== $(basename "$SRC") -> $(basename "$OUT")  ratio=$RATIO tex=$BC/$NRM/$RM"

$GT weld     "$SRC"      "$TMP/w.glb"                              >/dev/null 2>&1
$GT simplify "$TMP/w.glb" "$TMP/s.glb" --ratio "$RATIO" --error 0.0008 >/dev/null 2>&1
mkdir -p "$TMP/u"
$GT copy     "$TMP/s.glb" "$TMP/u/x.gltf"                          >/dev/null 2>&1

# Textures: Lanczos downscale; a light unsharp on the base colour only.
# Never sharpen the normal map -- it would fake surface detail and read as noise.
python - "$TMP/u" "$BC" "$NRM" "$RM" <<'PY'
import sys, os, glob
from PIL import Image, ImageFilter
d, bc, nrm, rm = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
for f in glob.glob(os.path.join(d, "*.jpg")) + glob.glob(os.path.join(d, "*.png")):
    n = os.path.basename(f).lower()
    if   "basecolor" in n or "basecolour" in n: size, q, sharp = bc,  94, True
    elif "normal"    in n:                      size, q, sharp = nrm, 94, False
    else:                                       size, q, sharp = rm,  90, False
    im = Image.open(f); before = im.size
    if im.size[0] > size:
        im = im.convert("RGB").resize((size, size), Image.LANCZOS)
        if sharp:
            im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=45, threshold=3))
        im.save(f, quality=q, subsampling=0, optimize=True)
    print(f"   {os.path.basename(f):42s} {before} -> {im.size}")
PY

# position 14 (default 11 stair-steps on curved faces), normal 10, texcoord 14
$GT quantize "$TMP/u/x.gltf" "$OUT" \
  --quantize-position 14 --quantize-normal 10 --quantize-texcoord 14 >/dev/null 2>&1

$GT inspect "$OUT" 2>/dev/null | sed 's/\x1b\[[0-9;]*m//g' \
  | grep "TRIANGLES" | awk -F'│' '{gsub(/ /,"",$6); gsub(/ /,"",$7);
      printf "   result: %s triangles (%s vertices)",$7,$6}'
echo ", $(du -h "$OUT" | cut -f1)"
