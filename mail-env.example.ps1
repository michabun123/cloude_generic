# MN&J Labs - mail credentials template for the Command Center "Send to Naum" button.
#
# Copy to mail-env.ps1 (that name is gitignored - this one is not), then fill in
# a Google App Password from https://myaccount.google.com/apppasswords
#
# Start the server with:   cd C:\claude\generic; . .\mail-env.ps1; npm start
#
# Keep this file plain ASCII - PowerShell 5.1 reads it as ANSI and a UTF-8 dash
# or curly quote decodes into a character it treats as a string delimiter.

$env:MAIL_USER = "michaelbu@mnjlabs.com"
$env:MAIL_PASS = "xxxxxxxxxxxxxxxx"          # 16-char App Password, no spaces
$env:MAIL_FROM = "MN&J Labs <michaelbu@mnjlabs.com>"
