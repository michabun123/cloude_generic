# MN&J Labs - start the Command Center server.
#
# Loads mail credentials, frees the port if a previous run is still holding it,
# then runs the server in the foreground so IntelliJ's stop button works.
#
# Use from IntelliJ: Run > "Generic server (Command Center)"
# Use from a terminal:  .\start-generic.ps1
#
# Keep this file plain ASCII - PowerShell 5.1 reads it as ANSI.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# 1. Mail credentials. The secret lives ONLY in mail-env.ps1 (gitignored), never
#    in a run configuration, so this script is safe to commit.
$envFile = Join-Path $PSScriptRoot "mail-env.ps1"
if (Test-Path $envFile) {
  . $envFile
} else {
  Write-Host "  mail-env.ps1 not found - the 'Send to Naum' button will report" -ForegroundColor Yellow
  Write-Host "  'MAIL_USER / MAIL_PASS are not set'. Copy mail-env.example.ps1 to" -ForegroundColor Yellow
  Write-Host "  mail-env.ps1 and add a Google App Password." -ForegroundColor Yellow
}

# 2. Free the port. Starting a second server on a held port is the other way to
#    end up talking to a stale process that has no credentials.
$port = if ($env:PORT) { [int]$env:PORT } else { 5178 }
try {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
  foreach ($procId in ($conns.OwningProcess | Sort-Object -Unique)) {
    Write-Host "  port $port was held by PID $procId - stopping it" -ForegroundColor DarkGray
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
} catch {
  # nothing listening - normal
}

# 3. Run in the foreground (do not use Start-Process; IntelliJ needs to own it).
Write-Host "  starting Command Center on http://localhost:$port" -ForegroundColor Cyan
node server.js
