"""MN&J Labs - command reference PDF.

Run:  python docs/gen_commands_pdf.py
Out:  docs/MNJ-Labs-Commands.pdf

Deliberately ASCII-only in the flowables: the built-in Helvetica/Courier fonts
are latin-1, and an em dash or middle dot renders as a black box.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

CLAY   = colors.HexColor('#FF7A4A')
GOLD   = colors.HexColor('#F5B133')
PURPLE = colors.HexColor('#8B82F5')
INK    = colors.HexColor('#1D2B2F')
MUTED  = colors.HexColor('#7C8B93')
LINE   = colors.HexColor('#E4E9EC')
CODEBG = colors.HexColor('#F4F7F8')
GREEN  = colors.HexColor('#0EA37F')
REDBG  = colors.HexColor('#FCEBEB')
RED    = colors.HexColor('#A32D2D')

S = {
    'h1':   ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=21, leading=25, textColor=INK, spaceAfter=2),
    'sub':  ParagraphStyle('sub', fontName='Helvetica', fontSize=10, leading=14, textColor=MUTED, spaceAfter=12),
    'h2':   ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=INK,
                           spaceBefore=15, spaceAfter=6),
    'h3':   ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=GREEN,
                           spaceBefore=9, spaceAfter=4),
    'p':    ParagraphStyle('p', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=INK, spaceAfter=5),
    'note': ParagraphStyle('note', fontName='Helvetica-Oblique', fontSize=9, leading=12.5, textColor=MUTED, spaceAfter=5),
    'code': ParagraphStyle('code', fontName='Courier', fontSize=8.8, leading=12, textColor=INK,
                           alignment=TA_LEFT, spaceAfter=0),
    'th':   ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=INK),
    'td':   ParagraphStyle('td', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=INK),
    'tdm':  ParagraphStyle('tdm', fontName='Courier', fontSize=8.3, leading=11.5, textColor=INK),
}

story = []


def h1(t, s):
    story.append(Paragraph(t, S['h1']))
    story.append(Paragraph(s, S['sub']))
    story.append(HRFlowable(width='100%', thickness=2, color=GOLD, spaceAfter=10))


def h2(t):
    story.append(Paragraph(t, S['h2']))
    story.append(HRFlowable(width='100%', thickness=0.6, color=LINE, spaceAfter=7))


def h3(t):
    story.append(Paragraph(t, S['h3']))


def p(t):
    story.append(Paragraph(t, S['p']))


def note(t):
    story.append(Paragraph(t, S['note']))


def code(lines, bg=CODEBG):
    """A shaded command block. lines: list of strings (ASCII)."""
    rows = [[Paragraph(l.replace('&', '&amp;').replace('<', '&lt;'), S['code'])] for l in lines]
    t = Table(rows, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), bg),
        ('LEFTPADDING',  (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING',   (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 3),
        ('LINEBEFORE',   (0, 0), (0, -1), 2, GREEN),
    ]))
    story.append(t)
    story.append(Spacer(1, 7))


def table(header, rows, widths):
    data = [[Paragraph(c, S['th']) for c in header]]
    for r in rows:
        data.append([Paragraph(c, S['tdm'] if i == 0 else S['td']) for i, c in enumerate(r)])
    t = Table(data, colWidths=[w * mm for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0), colors.HexColor('#F0F4F5')),
        ('LINEBELOW',    (0, 0), (-1, 0), 0.8, LINE),
        ('GRID',         (0, 0), (-1, -1), 0.4, LINE),
        ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING',  (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING',   (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))


def warn(t):
    tb = Table([[Paragraph(t, S['td'])]], colWidths=[165 * mm])
    tb.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), REDBG),
        ('LINEBEFORE',   (0, 0), (0, -1), 2, RED),
        ('LEFTPADDING',  (0, 0), (-1, -1), 9),
        ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING',   (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 6),
    ]))
    story.append(tb)
    story.append(Spacer(1, 8))


# ============================================================== page 1
h1('MN&amp;J Labs - Command Reference',
   'Command Center, Firebase, Proofly, mail and ports. Generated 2026-08-04.')

h2('1. Ports at a glance')
table(
    ['Port', 'What', 'Started by'],
    [
        ['5178', 'Command Center (generic web app)', 'IntelliJ run config, Server.bat, or server-ctl.ps1 start'],
        ['4000', 'Firebase Emulator UI - browse Firestore + Auth, read function logs', 'firebase emulators:start'],
        ['5000', 'Firebase Hosting - the Proofly console page', 'firebase emulators:start'],
        ['5001', 'Cloud Functions (the REST API lives here)', 'firebase emulators:start'],
        ['8181', 'Firestore emulator (Java process). 8181 avoids the usual 8080 clash', 'firebase emulators:start'],
        ['9099', 'Firebase Auth emulator', 'firebase emulators:start'],
        ['9199', 'Firebase Storage emulator', 'firebase emulators:start'],
        ['8098', 'Proofly Kotlin API - LOCAL only (AWS still uses 8090)', 'java -jar / IntelliJ'],
    ],
    [14, 86, 65])
note('Only these ports can be killed by the tooling. Anything else is refused by design.')

h2('2. Command Center (generic)')
p('Location: <font face="Courier">C:\\claude\\generic</font> - the web app on port 5178.')

h3('Control script - all actions')
code([
    'cd C:\\claude\\generic',
    '',
    '.\\server-ctl.ps1 status      # running? which PID',
    '.\\server-ctl.ps1 start       # launch if not already up',
    '.\\server-ctl.ps1 stop        # graceful stop',
    '.\\server-ctl.ps1 restart     # stop then start',
    '.\\server-ctl.ps1 open        # start if needed + open the browser',
    '.\\server-ctl.ps1 ports       # every project port and what holds it',
    '.\\server-ctl.ps1 kill        # FORCE-free port 5178',
    '.\\server-ctl.ps1 killall     # free 5178 AND all Firebase emulator ports',
])
note('kill vs stop: "stop" asks nicely and can miss an orphan; "kill" frees the port whatever is holding it.')

h3('Start with mail credentials (one command - the vars must reach the same process)')
code([
    'cd C:\\claude\\generic; . .\\mail-env.ps1; npm start',
])
p('Since the server also parses <font face="Courier">mail-env.ps1</font> itself at startup, a bare '
  '<font face="Courier">npm start</font> or <font face="Courier">node server.js</font> now works too.')

h3('Other ways to run it')
table(
    ['How', 'What to do', 'Notes'],
    [
        ['IntelliJ', 'Run config "MyTeam" (Node.js) or "Generic server" (Shell Script)', 'Leave Environment variables EMPTY - server.js reads mail-env.ps1'],
        ['Server.bat', 'Double-click; menu 1-8', '6 = show ports, 7 = kill 5178, 8 = kill all'],
        ['In-app', 'Server menu in the header', 'Status, Restart, Stop, per-port "free", "kill all"'],
    ],
    [22, 66, 77])

h2('3. Firebase - everyday commands')
h3('Install / login (one time)')
code([
    'npm install -g firebase-tools',
    'firebase --version',
    'firebase login                       # only needed to DEPLOY, not for emulators',
])

h3('The dev loop (Proofly example)')
code([
    'cd C:\\myPrograms\\mnjlabs\\firebase\\proofly-fb',
    '',
    'npm --prefix functions run build     # 1. compile the TypeScript functions',
    'firebase emulators:start             # 2. the WHOLE backend, offline',
    '',
    '# --- second terminal ---',
    'npm run seed                         # 3. seed Firestore + Auth (idempotent)',
    'node seed/smoke.js                   # 4. 15 contract + tenant-isolation tests',
])
warn('<b>Emulator data lives in memory.</b> Every restart wipes Firestore and Auth - re-run '
     '<font face="Courier">npm run seed</font>. To keep it: '
     '<font face="Courier">firebase emulators:start --import=./data --export-on-exit=./data</font>')

h3('Useful variations')
code([
    'firebase emulators:start --only functions,firestore,auth',
    'firebase emulators:start --project demo-foo   # "demo-" prefix skips all cloud calls',
    'npm --prefix functions run watch              # recompile TS on save',
    'firebase deploy                               # everything (needs Blaze plan)',
    'firebase deploy --only functions',
    'firebase deploy --only firestore:rules,firestore:indexes',
    'firebase functions:log',
    'firebase projects:list',
])

h3('Where things are while the emulators run')
table(
    ['URL', 'What'],
    [
        ['http://localhost:5000', 'Proofly console (Hosting)'],
        ['http://localhost:4000', 'Emulator UI - data browser, auth users, logs'],
        ['http://localhost:4000/firestore', 'Browse/edit Firestore directly'],
        ['http://localhost:5001/proofly-mnjlabs/europe-west1/api/health', 'API health'],
        ['http://localhost:5001/proofly-mnjlabs/europe-west1/api/templates', 'API (needs a Bearer token)'],
    ],
    [78, 87])
note('Function URL shape: http://localhost:5001/&lt;projectId&gt;/&lt;region&gt;/&lt;functionName&gt;')

h3('Demo sign-ins (emulator only)')
table(
    ['Email', 'Password / org'],
    [
        ['s.braun@hausverwaltung.de', 'proofly123 - org-hausverwaltung (owner)'],
        ['yusuf@markt-demir.de', 'proofly123 - org-markt-demir (owner)'],
    ],
    [62, 103])
note('Two different orgs on purpose: sign in as each and watch the report list change. That is '
     'firestore.rules doing the work, not app code.')

h2('4. Mail (Command Center -> Naum)')
h3('Check it without sending anything')
code([
    'curl "http://localhost:5178/mail/status"            # configured?',
    'curl "http://localhost:5178/mail/status?verify=1"   # real SMTP login, sends nothing',
    '',
    '# compose a message and inspect it without sending:',
    'curl -X POST "http://localhost:5178/mail/send?dry=1" -H "Content-Type: application/json" ^',
    '     -d "{\\"to\\":\\"x@y.com\\",\\"subject\\":\\"s\\",\\"body\\":\\"b\\"}"',
])
p('Credentials live only in <font face="Courier">C:\\claude\\generic\\mail-env.ps1</font> (gitignored). '
  'It holds a Google <b>App Password</b>, not the account password - Gmail SMTP rejects normal passwords.')
warn('If the send button says <b>"MAIL_USER / MAIL_PASS are not set"</b>, the server process was started '
     'before the credentials existed. Restart it - env vars are read at launch and never picked up later.')

h2('5. Proofly - the two backends')
table(
    ['Stack', 'How to run', 'Base URL'],
    [
        ['Kotlin + Mongo', 'java -jar target\\proofly-api-0.1.0.jar', 'http://localhost:8098'],
        ['Firebase', 'firebase emulators:start', 'http://localhost:5001/.../api'],
        ['AWS (live)', 'already deployed', 'http://mnjlabs-alb-...elb.amazonaws.com'],
    ],
    [30, 62, 73])

h3('Flutter app (Android Studio)')
code([
    'cd C:\\myPrograms\\mnjlabs\\frontend\\proofly-app',
    'flutter devices                      # what is connected',
    'flutter emulators                    # available AVDs',
    'flutter emulators --launch Pixel_10_Pro',
    '',
    'flutter run -d chrome                          # web, against AWS',
    'flutter run -d chrome --dart-define=API_BASE=http://localhost:8098',
    'flutter run -d <deviceId> --dart-define=API_BASE=http://10.0.2.2:8098',
])
warn('<b>10.0.2.2, not localhost.</b> Inside the Android emulator "localhost" means the emulated phone '
     'itself. 10.0.2.2 is your PC. This is the number-one reason a Flutter app "cannot reach the API".')
note('IntelliJ/Android Studio run configs already exist: "Proofly - AWS (live)" and "Proofly - local Kotlin API".')

h2('6. Troubleshooting - things that actually bit us')
table(
    ['Symptom', 'Cause and fix'],
    [
        ['Port already in use',
         'A previous run is still holding it. .\\server-ctl.ps1 ports to see who, then kill / killall.'],
        ['Mail says not configured',
         'Server started before mail-env.ps1 existed. Restart the server.'],
        ['Page behaves like old code',
         'Browser cached the HTML. Ctrl+Shift+R once (HTML is now served no-store).'],
        ['Emulator data gone',
         'Expected - it is in memory. Re-run npm run seed.'],
        ['Functions "does not exist"',
         'The functions codebase failed to LOAD. Read the emulator log, not the HTTP 404.'],
        ['FieldValue is undefined',
         'import * as admin + esModuleInterop. Use modular imports: getFirestore, FieldValue, getAuth.'],
        ['Cannot find module @firebase/app',
         'npm did not hoist an admin peer dep: npm i @firebase/app inside functions/.'],
        ['Flutter cannot reach API',
         'Android emulator: use 10.0.2.2, not localhost.'],
        ['Client gets 401 after role change',
         'ID token is stale. Call getIdToken(true) to refresh custom claims.'],
        ['firebase deploy asks for billing',
         'Cloud Functions need the Blaze plan. Expected; a card must be on file.'],
    ],
    [50, 115])

doc = SimpleDocTemplate(
    'docs/MNJ-Labs-Commands.pdf', pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm, topMargin=18 * mm, bottomMargin=16 * mm,
    title='MN&J Labs - Command Reference', author='MN&J Labs',
)


def footer(canvas, doc_):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 10 * mm, 'MN&J Labs - humans + AI, shipping together')
    canvas.drawRightString(A4[0] - 22 * mm, 10 * mm, 'page %d' % doc_.page)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(22 * mm, 13 * mm, A4[0] - 22 * mm, 13 * mm)
    canvas.restoreState()


doc.build(story, onFirstPage=footer, onLaterPages=footer)
print('wrote docs/MNJ-Labs-Commands.pdf')
