@echo off
setlocal
cd /d %~dp0
start "eihracat-backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "eihracat-frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
