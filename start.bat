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

REM Check if .env exists
if not exist .env (
    echo ERROR: Configuration not found!
    echo.
    echo Please copy .env.example to .env and configure it:
    echo   1. Copy .env.example to .env
    echo   2. Edit .env with your Takaro tokens and RCON password
    echo   3. Run start.bat again
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
