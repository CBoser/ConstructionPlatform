@echo off
REM ========================================================
REM HOLT HOMES BAT PRICING UPDATER
REM ========================================================
REM This batch file updates the Holt Homes BAT pricing
REM ========================================================

echo.
echo ========================================================
echo           HOLT HOMES BAT PRICING UPDATER
echo ========================================================
echo.

REM Set the file path - UPDATED TO LOCAL PATH
set "BAT_FILE=C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"

REM Check if file exists
if not exist "%BAT_FILE%" (
    echo ERROR: BAT file not found!
    echo Looking for: %BAT_FILE%
    echo.
    echo Please check the file path and try again.
    pause
    exit /b 1
)

echo File found: HOLT BAT OCTOBER 2025 9-29-25.xlsm
echo.
echo Starting update process...
echo --------------------------------------------------------

REM Run the Python script
python holt_updater.py "%BAT_FILE%"

REM Check if successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo                  UPDATE SUCCESSFUL!
    echo ========================================================
    echo.
    echo Check your folder for the updated file with timestamp.
) else (
    echo.
    echo ========================================================
    echo                    UPDATE FAILED
    echo ========================================================
    echo.
    echo Please check the error messages above.
)

echo.
pause
