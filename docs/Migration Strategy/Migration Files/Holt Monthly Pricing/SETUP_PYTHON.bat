@echo off
REM ========================================================
REM PYTHON SETUP HELPER FOR HOLT HOMES BAT UPDATER
REM ========================================================
REM This helps set up Python and required libraries
REM ========================================================

echo.
echo ========================================================
echo      PYTHON SETUP FOR HOLT HOMES BAT UPDATER
echo ========================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python is NOT installed!
    echo.
    echo Please install Python from: https://python.org
    echo.
    echo IMPORTANT: During installation, check the box:
    echo    "Add Python to PATH"
    echo.
    echo After installing Python, run this script again.
    echo.
    pause
    exit /b 1
) else (
    echo [✓] Python is installed!
    python --version
)

echo.
echo --------------------------------------------------------
echo Checking for required library: openpyxl
echo --------------------------------------------------------

REM Check if openpyxl is installed
python -c "import openpyxl" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] openpyxl is NOT installed
    echo.
    echo Installing openpyxl...
    echo.
    pip install openpyxl
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [✓] openpyxl installed successfully!
    ) else (
        echo.
        echo [X] Failed to install openpyxl
        echo.
        echo Try running this command manually:
        echo    pip install openpyxl
    )
) else (
    echo [✓] openpyxl is already installed!
    python -c "import openpyxl; print(f'    Version: {openpyxl.__version__}')"
)

echo.
echo ========================================================
echo                    SETUP COMPLETE!
echo ========================================================
echo.
echo You're ready to use the Holt Homes BAT updater!
echo.
echo Quick start:
echo   1. Double-click RUN_HOLT_UPDATE.bat to update from Excel
echo   2. Double-click IMPORT_CSV_TO_BAT.bat to import from CSV
echo.
pause
