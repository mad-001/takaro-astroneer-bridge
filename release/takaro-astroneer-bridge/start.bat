@echo off
echo Starting Takaro Astroneer Bridge...
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure it.
    pause
    exit /b 1
)

REM Start the bridge
node dist/index.js

pause
