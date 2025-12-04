@echo off
echo ╔════════════════════════════════════════════════════════╗
echo ║     TAKARO ASTRONEER BRIDGE                           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js 18+ from: https://nodejs.org/
    echo After installing, restart your computer and try again.
    pause
    exit /b 1
)

REM Check if TakaroConfig.txt exists
if not exist TakaroConfig.txt (
    echo ERROR: Configuration file not found!
    echo.
    echo Please edit TakaroConfig.txt with your settings:
    echo   1. Open TakaroConfig.txt in Notepad
    echo   2. Replace the placeholder values with your actual settings:
    echo      - IDENTITY_TOKEN: Your server name
    echo      - REGISTRATION_TOKEN: From Takaro dashboard
    echo      - RCON_PASSWORD: Same as ConsolePassword in Astroneer settings
    echo   3. Save and run start.bat again
    echo.
    echo TIP: Right-click TakaroConfig.txt and select "Edit" or "Open with Notepad"
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies... (one-time setup)
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if built
if not exist dist\index.js (
    echo Building bridge... (one-time setup)
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to build
        pause
        exit /b 1
    )
)

REM Start the bridge
echo.
echo Starting bridge server...
echo ────────────────────────────────────────────────────────
node dist/index.js

pause
