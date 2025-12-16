@echo off
title Astroneer Bridge - Stop
echo ========================================================
echo      STOPPING TAKARO ASTRONEER BRIDGE
echo ========================================================
echo.

REM Find and kill the bridge process
echo Searching for bridge process...
set found=0
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo list ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "dist\index.js" >nul
    if not errorlevel 1 (
        echo Found bridge process: PID %%i
        taskkill /PID %%i /F >nul 2>&1
        if not errorlevel 1 (
            echo   Successfully stopped bridge
            set found=1
        ) else (
            echo   Failed to stop bridge
        )
    )
)

if %found%==0 (
    echo No bridge process found.
    echo.
    echo TIP: If the bridge is still running, check for node.exe processes
    echo      in Task Manager and end them manually.
) else (
    echo.
    echo Bridge has been stopped.
)

echo.
pause
