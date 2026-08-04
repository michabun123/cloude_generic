# MN&J Labs - mail credentials.  THIS FILE IS GITIGNORED. Do not commit or paste it.
#
# ONE THING TO DO: replace PASTE_APP_PASSWORD_HERE below with a Google App Password.
#
#   1. Go to  https://myaccount.google.com/apppasswords   (as michaelbu@mnjlabs.com)
#   2. Requires 2-Step Verification to be ON for that account.
#      If the page says it is unavailable, the Workspace admin must allow App Passwords.
#   3. Create one (name it "MNJ Command Center"). Google shows 16 chars: "abcd efgh ijkl mnop".
#   4. Paste it below WITHOUT the spaces.
#
# This is NOT your normal Google password - plain passwords cannot log in to Gmail SMTP.
#
# Then start the server FROM THIS FOLDER, in one command so the vars reach it:
#
#   cd C:\claude\generic; . .\mail-env.ps1; npm start
#
# Verify without sending anything:   curl "http://localhost:5178/mail/status?verify=1"
#
# NOTE: keep this file plain ASCII. PowerShell 5.1 reads it as ANSI, and a UTF-8
# dash or curly quote decodes into a character it treats as a string delimiter.

$env:MAIL_USER = "michaelbu@mnjlabs.com"
$env:MAIL_PASS = "yqmcllvbsnuoznpb"
$env:MAIL_FROM = "MN&J Labs <michaelbu@mnjlabs.com>"

if ($env:MAIL_PASS -eq "PASTE_APP_PASSWORD_HERE") {
  Write-Host "  mail-env.ps1: MAIL_PASS is still the placeholder - the send button will fail." -ForegroundColor Yellow
} else {
  Write-Host "  mail credentials loaded for $($env:MAIL_USER)" -ForegroundColor Green
}
