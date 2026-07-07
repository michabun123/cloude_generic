import re, base64, io
from fontTools import subset
from fontTools.ttLib import TTFont

ICONS = """
ti-adjustments ti-affiliate ti-api ti-arrow-left ti-arrows-exchange
ti-brand-flutter ti-brand-nodejs ti-brand-python ti-brand-react
ti-clipboard-check ti-cloud-cog ti-coffee ti-components ti-database
ti-database-cog ti-device-desktop-code ti-folder ti-git-pull-request
ti-leaf ti-lock ti-lock-check ti-package ti-plus ti-robot ti-rocket
ti-route ti-shield-check ti-sitemap ti-stack-2 ti-trash
ti-user-heart ti-user-search
ti-server-2 ti-tools ti-accessible ti-browser ti-brand-apple
ti-test-pipe ti-snowflake ti-clipboard-data ti-brand-docker ti-anchor ti-flame
""".split()

css = open("tabler.css", encoding="utf-8").read()
# map: .ti-name:before{content:"\eXXX"}
pairs = dict(re.findall(r'\.ti-([a-z0-9-]+):before\{content:"\\([0-9a-fA-F]+)"\}', css))

codepoints, rules = [], []
missing = []
for cls in ICONS:
    name = cls[3:]
    hexcp = pairs.get(name)
    if not hexcp:
        missing.append(name); continue
    cp = int(hexcp, 16)
    codepoints.append(cp)
    rules.append('.%s:before{content:"\\%s"}' % (cls, hexcp))

if missing:
    print("MISSING:", missing)

# subset TTF -> woff
font = TTFont("tabler.ttf")
ss = subset.Subsetter()
ss.populate(unicodes=codepoints)
ss.subset(font)
font.flavor = "woff"
buf = io.BytesIO(); font.save(buf)
b64 = base64.b64encode(buf.getvalue()).decode()

out = []
out.append("/* Tabler subset (%d glyphs) — local, no CDN */" % len(codepoints))
out.append('@font-face{font-family:"ti-sub";font-style:normal;font-weight:400;'
           'src:url(data:font/woff;base64,%s) format("woff")}' % b64)
out.append('.ti{font-family:"ti-sub"!important;font-style:normal;font-weight:400;'
           '-webkit-font-smoothing:antialiased;display:inline-block;line-height:1;'
           'vertical-align:middle}')
out.append("\n".join(rules))
open("../public/icons.css", "w", encoding="utf-8").write("\n".join(out))
print("wrote public/icons.css  glyphs=%d  woff=%d bytes" % (len(codepoints), len(buf.getvalue())))
