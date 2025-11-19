@echo off
REM ========================================================
REM UNCONVERTED PRICING UPDATER
REM ========================================================
REM This batch file updates the Unconverted pricing
REM ========================================================

echo.
echo ========================================================
echo           UNCONVERTED PRICING UPDATER
echo ========================================================
echo.

REM Set the file path - UPDATED TO LOCAL PATH
set "BAT_FILE="C:\Users\corey.boser\Documents\Holt Monthly Pricing\Unconverted_Pricing_Update_File.xlsm"

REM Check if file exists
if not exist "%BAT_FILE%" (
    echo ERROR: BAT file not found!
    echo Looking for: %BAT_FILE%
    echo.
    echo Please check the file path and try again.
    pause
    exit /b 1
)

echo File found: Unconverted_Pricing_Update_File.xlsm
echo.
echo Starting update process...
echo --------------------------------------------------------

REM Run the Python script
python pricing_updater.py "%BAT_FILE%"

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
