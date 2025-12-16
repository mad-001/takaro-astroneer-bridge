@echo off
cd /d "C:\GameServers\astroneer bridge"
call stop.bat
timeout /t 3 /nobreak
call start.bat
