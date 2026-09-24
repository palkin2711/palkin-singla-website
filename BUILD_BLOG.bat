@echo off
setlocal
cd /d "%~dp0"

echo ========================================
echo   Palkin Singla - Blog Builder

echo ========================================

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: Node.js is not installed on this computer.
  echo Install Node.js 20 or newer from https://nodejs.org/ and run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo Building blog pages from blog-posts folder...
call npm run build
if errorlevel 1 (
  echo.
  echo BUILD FAILED. Please take a screenshot of this window and share it.
  echo.
  pause
  exit /b 1
)

echo.
echo SUCCESS: Blog pages are ready.
echo Next: Upload this COMPLETE folder to your Netlify site's Deploys page.
echo Do not upload only the blog HTML file to Netlify.
echo.
pause
