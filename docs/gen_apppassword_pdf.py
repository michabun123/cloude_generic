"""MN&J Labs - how to add a Google App Password for a new application.

Run:  python docs/gen_apppassword_pdf.py
Out:  docs/MNJ-Labs-App-Password.pdf

ASCII-only in the flowables: reportlab's built-in Helvetica/Courier are latin-1,
so an em dash or middle dot renders as a black box.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

GOLD   = colors.HexColor('#F5B133')
INK    = colors.HexColor('#1D2B2F')
MUTED  = colors.HexColor('#7C8B93')
LINE   = colors.HexColor('#E4E9EC')
CODEBG = colors.HexColor('#F4F7F8')
GREEN  = colors.HexColor('#0EA37F')
REDBG  = colors.HexColor('#FCEBEB')
RED    = colors.HexColor('#A32D2D')
AMBBG  = colors.HexColor('#FEF6E7')
AMBER  = colors.HexColor('#B7791F')

S = {
    'h1':   ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=21, leading=25, textColor=INK, spaceAfter=2),
    'sub':  ParagraphStyle('sub', fontName='Helvetica', fontSize=10, leading=14, textColor=MUTED, spaceAfter=12),
    'h2':   ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=INK,
                           spaceBefore=15, spaceAfter=6),
    'h3':   ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=10.5, leading=13, textColor=GREEN,
                           spaceBefore=9, spaceAfter=4),
    'p':    ParagraphStyle('p', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=INK, spaceAfter=5),
    'step': ParagraphStyle('step', fontName='Helvetica', fontSize=9.5, leading=14, textColor=INK,
                           spaceAfter=6, leftIndent=16, firstLineIndent=-16),
    'note': ParagraphStyle('note', fontName='Helvetica-Oblique', fontSize=9, leading=12.5, textColor=MUTED, spaceAfter=5),
    'code': ParagraphStyle('code', fontName='Courier', fontSize=8.8, leading=12, textColor=INK, alignment=TA_LEFT),
    'th':   ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=INK),
    'td':   ParagraphStyle('td', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=INK),
    'tdm':  ParagraphStyle('tdm', fontName='Courier', fontSize=8.3, leading=11.5, textColor=INK),
}

story = []
def h1(t, s):
    story.append(Paragraph(t, S['h1'])); story.append(Paragraph(s, S['sub']))
    story.append(HRFlowable(width='100%', thickness=2, color=GOLD, spaceAfter=10))
def h2(t):
    story.append(Paragraph(t, S['h2']))
    story.append(HRFlowable(width='100%', thickness=0.6, color=LINE, spaceAfter=7))
def h3(t): story.append(Paragraph(t, S['h3']))
def p(t):  story.append(Paragraph(t, S['p']))
def step(n, t): story.append(Paragraph('<b>%s.</b>&nbsp;&nbsp;%s' % (n, t), S['step']))
def note(t): story.append(Paragraph(t, S['note']))

def code(lines):
    rows = [[Paragraph(l.replace('&', '&amp;').replace('<', '&lt;'), S['code'])] for l in lines]
    t = Table(rows, colWidths=[165 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CODEBG),
        ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBEFORE', (0, 0), (0, -1), 2, GREEN),
    ]))
    story.append(t); story.append(Spacer(1, 7))

def box(t, bg, bar):
    tb = Table([[Paragraph(t, S['td'])]], colWidths=[165 * mm])
    tb.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg), ('LINEBEFORE', (0, 0), (0, -1), 2, bar),
        ('LEFTPADDING', (0, 0), (-1, -1), 9), ('RIGHTPADDING', (0, 0), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(tb); story.append(Spacer(1, 8))

def warn(t): box(t, REDBG, RED)
def tip(t):  box(t, AMBBG, AMBER)

def table(header, rows, widths):
    data = [[Paragraph(c, S['th']) for c in header]]
    for r in rows:
        data.append([Paragraph(c, S['tdm'] if i == 0 else S['td']) for i, c in enumerate(r)])
    t = Table(data, colWidths=[w * mm for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F0F4F5')),
        ('LINEBELOW', (0, 0), (-1, 0), 0.8, LINE), ('GRID', (0, 0), (-1, -1), 0.4, LINE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t); story.append(Spacer(1, 8))


# ============================================================================
h1('Adding a Google App Password for a new application',
   'One 16-character password per application, for michaelbu@mnjlabs.com. Generated 2026-08-04.')

h2('What this is (and what it is not)')
p('An <b>App Password</b> is a 16-character password that lets a program log in to your Google '
  'account without a phone prompt. Programs cannot tap "approve" on your phone, so Google issues '
  'this instead.')

table(
    ['', 'The truth'],
    [
        ['It IS', 'A second password for your account, usable by any program that has the string.'],
        ['It is NOT', 'Restricted to one app. The name you type is only a LABEL for your own bookkeeping - '
                      'Google does not enforce it.'],
        ['It is NOT', 'A key "pair". It is a single string. Nothing to pair it with.'],
        ['It is NOT', 'Per-app 2FA. You switch 2-Step Verification on ONCE for the account; it is only the '
                      'gate that unlocks this page.'],
    ],
    [22, 143])

warn('<b>Treat it as a full mailbox credential.</b> Anyone holding the string can not only SEND as you - '
     'they can READ your whole mailbox over IMAP/POP, bypassing 2FA. That is the point of it. Never commit '
     'it, never paste it into a chat, never screenshot it.')

p('So why use one at all? Because it is <b>independently revocable</b>: kill that one string and your real '
  'password, your phone and your other App Passwords are untouched. If a program used your REAL password '
  'and it leaked, the attacker owns the account - and the domain.')

h2('Rule: one App Password per application')
p('Do not reuse the Command Center string for a new app. If one leaks you want to revoke it without '
  'breaking everything else.')
code([
    'michaelbu@mnjlabs.com   "MNJ Command Center"   ->  <16 chars>   (existing)',
    'michaelbu@mnjlabs.com   "<new app name>"       ->  <16 chars>   (new, different)',
])
note('Name it after the application, exactly as you will remember it in six months. The name is how you '
     'know which string to revoke.')

h2('Steps')
step(1, 'Check 2-Step Verification is ON for <font face="Courier">michaelbu@mnjlabs.com</font>. '
        'You did this already - it stays on, you never repeat it per app. '
        '(<font face="Courier">myaccount.google.com/signinoptions/two-step-verification</font>)')
step(2, 'Go to <b><font face="Courier">myaccount.google.com/apppasswords</font></b> . '
        'Sign in again if asked.')
step(3, 'Type the <b>new application name</b> in the "App name" box. Nothing else to choose - there is no '
        'app or device dropdown any more.')
step(4, 'Click <b>Create</b>. Google shows 16 characters in four groups, e.g. '
        '<font face="Courier">abcd efgh ijkl mnop</font> .')
step(5, 'Copy it <b>now</b>. Google will never show it again. If you lose it, delete that entry and '
        'create another - there is no "reveal".')
step(6, 'Paste it into the new application config <b>without the spaces</b>: '
        '<font face="Courier">abcdefghijklmnop</font> .')
step(7, '<b>Restart the application.</b> Environment variables are read at start-up, so a running process '
        'never picks up a credential added afterwards.')

tip('<b>If the App Passwords page says the option is unavailable</b>, it is one of two things, both '
    'admin-side because mnjlabs.com is Google Workspace: (a) Admin console -> Security -> Authentication -> '
    'Less secure apps / App passwords is blocked, or (b) the account has Advanced Protection on. '
    'You are the domain owner, so you can change it.')

h2('Where to put it - the Command Center pattern')
p('Copy this shape for any new app. The secret lives in ONE gitignored file; nothing else holds it.')
code([
    '# mail-env.ps1   (gitignored - never commit)',
    '$env:MAIL_USER = "michaelbu@mnjlabs.com"',
    '$env:MAIL_PASS = "abcdefghijklmnop"          # the 16 chars, no spaces',
    '$env:MAIL_FROM = "MN&J Labs <michaelbu@mnjlabs.com>"',
])
p('Then add the filename to <font face="Courier">.gitignore</font> <b>before</b> you paste the password in, '
  'not after. A secret that reached one commit is in the history for good.')

h2('Verify - without sending anything')
p('A real SMTP login that transmits no mail:')
code([
    'curl "http://localhost:5178/mail/status?verify=1"',
    '',
    '{"configured":true,"verified":true,"user":"michaelbu@mnjlabs.com"}',
])
p('<b>verified: true</b> means the password works. <b>false</b> comes with the reason.')

h2('Rotating or revoking')
step(1, 'Go back to <font face="Courier">myaccount.google.com/apppasswords</font> .')
step(2, 'Delete the old entry by name. It stops working immediately.')
step(3, 'Create a replacement, update the config file, restart the app.')
note('Rotate whenever the string may have been exposed - a screenshot, a chat, a shared screen, a laptop '
     'someone else used. It costs 30 seconds.')

h2('If it does not work')
table(
    ['Symptom', 'Cause and fix'],
    [
        ['MAIL_USER / MAIL_PASS are not set',
         'The app started BEFORE the file existed, or you edited it in a different window. Restart the app.'],
        ['Username and Password not accepted',
         'Spaces left in the password, or the real account password was used instead of the App Password.'],
        ['Could not resolve authentication method',
         'The variable is present but EMPTY. An empty value also shadows a real one - check the value, not '
         'just that the line exists.'],
        ['App passwords page unavailable',
         '2-Step Verification is off, or the Workspace admin blocks app passwords, or Advanced Protection is on.'],
        ['Mail sends but From is wrong',
         'Gmail silently rewrites From to the authenticated mailbox unless the alias is verified in '
         'Gmail -> Settings -> Accounts -> Send mail as. Check the RECEIVED header, not the send result.'],
    ],
    [52, 113])

doc = SimpleDocTemplate(
    'docs/MNJ-Labs-App-Password.pdf', pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm, topMargin=18 * mm, bottomMargin=16 * mm,
    title='MN&J Labs - Adding a Google App Password', author='MN&J Labs',
)

def footer(canvas, doc_):
    canvas.saveState()
    canvas.setFont('Helvetica', 7.5); canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 10 * mm, 'MN&J Labs - humans + AI, shipping together')
    canvas.drawRightString(A4[0] - 22 * mm, 10 * mm, 'page %d' % doc_.page)
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.5)
    canvas.line(22 * mm, 13 * mm, A4[0] - 22 * mm, 13 * mm)
    canvas.restoreState()

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print('wrote docs/MNJ-Labs-App-Password.pdf')
