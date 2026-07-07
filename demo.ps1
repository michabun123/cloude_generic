# demo.ps1 - expose the generic-agent web app over a temporary Cloudflare tunnel.
# Usage:   ./demo.ps1                    (auto-generates a password)
#          ./demo.ps1 -Password mypass
#          ./demo.ps1 -Port 5178
# Ctrl+C stops BOTH the tunnel and the server.
param([string]$Password = "", [int]$Port = 5178)

if (-not $Password) {
  $Password = -join ((48..57) + (97..122) | Get-Random -Count 10 | ForEach-Object { [char]$_ })
}
$env:DEMO_PASSWORD = $Password
$env:PORT = "$Port"

$cf = "C:\tools\cloudflared\cloudflared.exe"
if (-not (Test-Path $cf)) {
  Write-Host "cloudflared not found at $cf" -ForegroundColor Red
  exit 1
}

# Safety: refuse to run if the port is already taken - a pre-existing server may be
# UNGATED, and the tunnel would expose it without the password.
$inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
  Write-Host "[X] Port $Port is already in use (PID $($inUse[0].OwningProcess))." -ForegroundColor Red
  Write-Host "    Stop that server first - tunnelling now could expose it WITHOUT the password." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "==================== DEMO LOGIN ====================" -ForegroundColor Cyan
Write-Host "   user:     demo"
Write-Host "   password: $Password" -ForegroundColor Green
Write-Host "   (share these + the trycloudflare URL below)"
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Start the gated server in the background
$srv = Start-Process node -ArgumentList "server.js" -PassThru -NoNewWindow -WorkingDirectory $PSScriptRoot
Start-Sleep -Seconds 2

try {
  Write-Host "Opening Cloudflare tunnel - look for the https://<random>.trycloudflare.com URL:" -ForegroundColor Yellow
  & $cf tunnel --url "http://localhost:$Port"
}
finally {
  Write-Host ""
  Write-Host "Stopping server (PID $($srv.Id))..." -ForegroundColor Yellow
  Stop-Process -Id $srv.Id -ErrorAction SilentlyContinue
}
