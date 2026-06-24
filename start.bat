@echo off
cd /d "%~dp0"
echo Building frontend...
cd frontend
call npx.cmd vite build
cd ..
echo.
echo Starting server at http://localhost:5000
cd backend
node server.js
pause
