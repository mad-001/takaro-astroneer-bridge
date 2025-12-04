@echo off
echo ╔════════════════════════════════════════════════════════╗
echo ║     STOPPING TAKARO ASTRONEER BRIDGE                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Find and kill the bridge process
echo Searching for bridge process...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo list ^| find "PID:"') do (
    wmic process where "ProcessId=%%i" get CommandLine 2>nul | find "takaro-astroneer-bridge" >nul
    if not errorlevel 1 (
        echo Found bridge process: PID %%i
        taskkill /PID %%i /F >nul 2>&1
        if not errorlevel 1 (
            echo ✓ Bridge stopped successfully
        ) else (
            echo ✗ Failed to stop bridge
        )
    )
)

echo.
echo Bridge has been stopped.
pause
