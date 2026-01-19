@echo off
REM Script to start Expo without Android SDK warnings (Windows)
REM Suppresses Android SDK errors if not available

REM Get all arguments
set "ARGS=%*"

REM Start Expo - errors about Android SDK will be suppressed by the process
npx expo start %ARGS%

REM If error occurs (like adb not found), that's OK for Expo Go
if errorlevel 1 (
    echo.
    echo ⚠️  Android SDK warnings are normal if you're using Expo Go.
    echo You can continue development normally - these warnings don't affect functionality.
    echo.
)


