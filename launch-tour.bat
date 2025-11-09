@echo off
setlocal ENABLEDELAYEDEXPANSION
set "DIR=D:\Work\vyhoda-tour"
set "PORT=8080"
set "URL=http://localhost:%PORT%/boykivske-mynule.html"
set "HEALTH=http://localhost:%PORT%/health"

cd /d "%DIR%"

powershell -NoProfile -Command ^
  "try{$r=Invoke-WebRequest -UseBasicParsing '%HEALTH%' -Method Head -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}"
if errorlevel 1 (
  start "" /b cmd /c "node server.js"
)

for /L %%i in (1,1,60) do (
  powershell -NoProfile -Command ^
    "try{$r=Invoke-WebRequest -UseBasicParsing '%HEALTH%' -Method Head -TimeoutSec 2; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}"
  if not errorlevel 1 goto findchrome
  timeout /t 1 >nul
)

:findchrome
set "CHROME="

where chrome.exe >"%TEMP%\_c.txt" 2>&1
if %ERRORLEVEL% EQU 0 (
  for /f "usebackq delims=" %%A in ("%TEMP%\_c.txt") do set "CHROME=%%A"
)

if not defined CHROME (
  for /f "tokens=2,*" %%A in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| find "REG_SZ"') do set "CHROME=%%B"
)
if not defined CHROME (
  for /f "tokens=2,*" %%A in ('reg query "HKLM\Software\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve 2^>nul ^| find "REG_SZ"') do set "CHROME=%%B"
)

if not defined CHROME if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if not defined CHROME exit /b 1

start "" "!CHROME!" --new-window "%URL%" --start-fullscreen --no-first-run --disable-restore-session-state
endlocal
