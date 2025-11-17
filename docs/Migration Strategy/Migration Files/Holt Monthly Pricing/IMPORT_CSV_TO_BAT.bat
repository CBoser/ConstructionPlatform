@echo off
REM ========================================================
REM HOLT HOMES CSV TO BAT IMPORTER
REM ========================================================
REM This imports Price_Update.csv into the Holt BAT file
REM ========================================================

echo.
echo ========================================================
echo        HOLT HOMES CSV TO BAT IMPORTER
echo ========================================================
echo.

REM Set file paths - UPDATED TO LOCAL PATH
set "CSV_FILE=Price_Update.csv"
set "BAT_FILE=C:\Users\corey.boser\Documents\Holt Monthly Pricing\HOLT BAT OCTOBER 2025 9-29-25.xlsm"

REM Check if CSV exists in current folder
if not exist "%CSV_FILE%" (
    echo ERROR: Price_Update.csv not found in current folder!
    echo.
    echo Please make sure Price_Update.csv is in the same folder as this script.
    pause
    exit /b 1
)

REM Check if BAT file exists
if not exist "%BAT_FILE%" (
    echo ERROR: BAT file not found!
    echo Looking for: %BAT_FILE%
    echo.
    pause
    exit /b 1
)

echo Found files:
echo CSV: %CSV_FILE%
echo BAT: HOLT BAT OCTOBER 2025 9-29-25.xlsm
echo.
echo Starting import and update process...
echo --------------------------------------------------------

REM Run the import script
python holt_csv_importer.py "%CSV_FILE%" "%BAT_FILE%"

REM Check result
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo           IMPORT AND UPDATE SUCCESSFUL!
    echo ========================================================
    echo.
    echo Check your folder for:
    echo 1. BAT file with imported CSV data (WITH_CSV timestamp)
    echo 2. BAT file with updated pricing (UPDATED timestamp)
) else (
    echo.
    echo ========================================================
    echo              IMPORT FAILED
    echo ========================================================
    echo.
    echo Please check the error messages above.
)

echo.
pause
