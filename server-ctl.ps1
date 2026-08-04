# MN&J Labs - server control
# Usage:  .\server-ctl.ps1 start | stop | restart | status | open | ports | kill | killall
#
#   start    launch server.js if not already running
#   stop     stop the generic server (port 5178)
#   restart  stop then start
#   status   is it running, and on which PID
#   open     start if needed, then open the browser
#   ports    show every project port and what is holding it
#   kill     force-free port 5178 (use when 'stop' cannot find it)
#   killall  free 5178 AND the Firebase emulator ports
#
# Keep this file plain ASCII - PowerShell 5.1 reads it as ANSI.

param(
  [Parameter(Position = 0)]
  [ValidateSet('start', 'stop', 'restart', 'status', 'open', 'ports', 'kill', 'killall')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'SilentlyContinue'
$Dir  = Split-Path -Parent $MyInvocation.MyCommand.Definition
$Port = 5178
$Url  = "http://localhost:$Port"
$Log  = Join-Path $Dir 'server.log'

# Every port this project is allowed to touch. Nothing else is ever killed.
# A list, not an [ordered] hashtable: indexing an ordered dictionary with an int
# looks up by POSITION, not by key, which silently returns the wrong entry.
$ProjectPorts = @(
  [pscustomobject]@{ Port = 5178; What = 'Command Center (generic)' }
  [pscustomobject]@{ Port = 4000; What = 'Firebase Emulator UI' }
  [pscustomobject]@{ Port = 5000; What = 'Firebase Hosting (Proofly console)' }
  [pscustomobject]@{ Port = 5001; What = 'Firebase Functions' }
  [pscustomobject]@{ Port = 8181; What = 'Firestore' }
  [pscustomobject]@{ Port = 9099; What = 'Firebase Auth' }
  [pscustomobject]@{ Port = 9199; What = 'Firebase Storage' }
)
function Get-PortLabel([int]$p) {
  $row = $ProjectPorts | Where-Object { $_.Port -eq $p } | Select-Object -First 1
  if ($row) { return $row.What } else { return '' }
}

function Get-PortPid([int]$p) {
  $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) { return $conn.OwningProcess }
  return $null
}
function Get-ServerPid { Get-PortPid $Port }

function Show-Status {
  $procId = Get-ServerPid
  if ($procId) {
    Write-Host "  RUNNING" -ForegroundColor Green -NoNewline
    Write-Host "  $Url  (PID $procId)"
  } else {
    Write-Host "  STOPPED" -ForegroundColor Yellow -NoNewline
    Write-Host "  nothing listening on port $Port"
  }
}

function Show-Ports {
  Write-Host ""
  Write-Host "  PORT   STATE        PID     WHAT" -ForegroundColor DarkGray
  foreach ($row in $ProjectPorts) {
    $p = $row.Port
    $procId = Get-PortPid $p
    if ($procId) {
      $name = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
      Write-Host ("  {0,-6} " -f $p) -NoNewline
      Write-Host ("{0,-12}" -f 'LISTENING') -ForegroundColor Green -NoNewline
      Write-Host ("{0,-8}{1}" -f $procId, "$($row.What) [$name]")
    } else {
      Write-Host ("  {0,-6} " -f $p) -NoNewline
      Write-Host ("{0,-12}" -f 'free') -ForegroundColor DarkGray -NoNewline
      Write-Host ("{0,-8}{1}" -f '-', $row.What) -ForegroundColor DarkGray
    }
  }
  Write-Host ""
}

function Clear-ProjectPort([int]$p) {
  if ($ProjectPorts.Port -notcontains $p) {
    Write-Host "  refusing to touch port $p - not a project port" -ForegroundColor Red
    return
  }
  $label = Get-PortLabel $p
  $ids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
         Select-Object -ExpandProperty OwningProcess -Unique
  if (-not $ids) { Write-Host ("  {0,-6} already free" -f $p) -ForegroundColor DarkGray; return }
  foreach ($procId in $ids) {
    $name = (Get-Process -Id $procId -ErrorAction SilentlyContinue).ProcessName
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host ("  {0,-6} killed PID {1} ({2}) - {3}" -f $p, $procId, $name, $label) -ForegroundColor Yellow
  }
}

function Start-Server {
  if (Get-ServerPid) { Write-Host "Already running." -ForegroundColor Yellow; Show-Status; return }
  Write-Host "Starting server..." -ForegroundColor Cyan
  Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory $Dir `
    -WindowStyle Hidden -RedirectStandardOutput $Log -RedirectStandardError (Join-Path $Dir 'server.err.log')
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 200
    if (Get-ServerPid) { break }
  }
  Show-Status
}

function Stop-Server {
  $procId = Get-ServerPid
  if (-not $procId) { Write-Host "Not running." -ForegroundColor Yellow; return }
  Write-Host "Stopping server (PID $procId)..." -ForegroundColor Cyan
  Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object { $_.CommandLine -match 'server\.js' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Milliseconds 400
  Show-Status
}

switch ($Action) {
  'start'   { Start-Server }
  'stop'    { Stop-Server }
  'restart' { Stop-Server; Start-Sleep -Milliseconds 500; Start-Server }
  'status'  { Show-Status }
  'open'    { if (-not (Get-ServerPid)) { Start-Server }; Start-Process $Url }
  'ports'   { Show-Ports }
  'kill'    { Clear-ProjectPort $Port; Show-Status }
  'killall' {
    Write-Host "`n  freeing all project ports..." -ForegroundColor Cyan
    foreach ($row in $ProjectPorts) { Clear-ProjectPort $row.Port }
    Show-Ports
  }
}
