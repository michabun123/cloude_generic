@echo off
title MN&J Labs - Server Control
cd /d "%~dp0"
:menu
cls
echo ============================================
echo    MN^&J Labs  -  Server Control  (port 5178)
echo ============================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" status
echo.
echo   [1] Start
echo   [2] Stop
echo   [3] Restart
echo   [4] Open in browser
echo   [5] Refresh status
echo.
echo   [6] Show all project ports
echo   [7] Kill port 5178 (force)
echo   [8] Kill ALL project ports (incl. Firebase emulators)
echo.
echo   [0] Exit
echo.
set /p choice="  Choose: "
if "%choice%"=="1" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" start
if "%choice%"=="2" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" stop
if "%choice%"=="3" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" restart
if "%choice%"=="4" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" open
if "%choice%"=="6" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" ports
if "%choice%"=="7" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" kill
if "%choice%"=="8" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server-ctl.ps1" killall
if "%choice%"=="0" exit
echo.
pause
goto menu
