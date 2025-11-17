@echo off
REM ========================================================
REM QUICK MARGIN CHANGER - PRICING GENERATOR
REM ========================================================

echo.
echo ========================================================
echo         QUICK MARGIN CHANGER - PRICING GENERATOR
echo ========================================================
echo.

REM File path
set BAT_FILE="C:\Users\corey.boser\Documents\Holt Monthly Pricing\QUICK_MARGIN_CHANGER.xlsm"

REM Check if file exists
if not exist %BAT_FILE% (
    echo [X] QUICK_MARGIN_CHANGER.xlsm not found!
    echo     Looking for: %BAT_FILE%
    echo.
    echo Please check the file path and try again.
    pause
    exit /b 1
)

echo [✓] File found: QUICK_MARGIN_CHANGER.xlsm
echo.
echo Starting pricing generation process...
echo --------------------------------------------------------

REM Run the Python script
python quick_margin_changer.py %BAT_FILE%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo              GENERATION SUCCESSFUL!
    echo ========================================================
    echo.
    echo Check your folder for the output file with timestamp.
    echo.
    echo Next steps:
    echo 1. Open the output file
    echo 2. Select the appropriate sheet for your BAT
    echo 3. Copy and paste to your BAT file
    echo.
) else (
    echo.
    echo ========================================================
    echo                GENERATION FAILED
    echo ========================================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
