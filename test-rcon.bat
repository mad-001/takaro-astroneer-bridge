@echo off
title Astroneer RCON Test Utility
echo ========================================================
echo      ASTRONEER RCON TEST UTILITY
echo ========================================================
echo.

if "%1"=="" (
    echo Usage: test-rcon.bat [command]
    echo.
    echo Available commands:
    echo   players    - List all players
    echo   info       - Get server information
    echo   saves      - List save games
    echo   raw ^<cmd^>  - Send raw RCON command
    echo.
    echo Examples:
    echo   test-rcon.bat players
    echo   test-rcon.bat info
    echo   test-rcon.bat raw "DSServerStatistics"
    echo.
    pause
    exit /b 1
)

node test-rcon.js %*

echo.
pause
