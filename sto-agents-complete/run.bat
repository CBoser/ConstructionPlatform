@echo off
title STO Agents - Sales Team One
color 0A

:: Change to script directory
cd /d "%~dp0"

echo.
echo =========================================================================
echo    STO AGENTS - Sales Team One PDX
echo    Builder's FirstSource - Richmond, Holt ^& Manor Operations
echo =========================================================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: If arguments provided, run directly
if not "%~1"=="" (
    python run.py %*
    pause
    exit /b
)

:menu
echo.
echo Select an option:
echo.
echo   === DAILY ROUTINES ===
echo   [1] Morning Routine (Portal check + Completeness + PDSS + SupplyPro)
echo   [2] Evening Routine (PDSS sync + Nightly backup)
echo.
echo   === PORTAL REPORTS ===
echo   [S] SupplyPro Daily Report (EPOs + Documents)
echo.
echo   === INDIVIDUAL AGENTS ===
echo   [3] Plan Intake Monitor
echo   [4] Completeness Checker (Richmond American)
echo   [5] Completeness Checker (Holt Homes)
echo   [6] PDSS Sync
echo   [7] Nightly Backup
echo.
echo   === NEW PROJECTS ===
echo   [I] Process New Project Intakes
echo   [N] New Project (Interactive Form)
echo.
echo   === FOLDER MANAGEMENT ===
echo   [F] Folder Manager (Check/Create Structure)
echo.
echo   === BACKUPS ===
echo   [8] Weekly Backup
echo   [9] Monthly Archive
echo   [H] View Backup History
echo.
echo   === UTILITIES ===
echo   [T] Test Teams Webhook
echo   [C] Check Configuration
echo.
echo   [0] Exit
echo.

set /p choice="Enter choice: "

if "%choice%"=="1" goto morning
if "%choice%"=="2" goto evening
if /i "%choice%"=="S" goto supplypro
if "%choice%"=="3" goto intake
if "%choice%"=="4" goto complete_rah
if "%choice%"=="5" goto complete_holt
if "%choice%"=="6" goto pdss
if "%choice%"=="7" goto backup_night
if /i "%choice%"=="F" goto folders
if /i "%choice%"=="I" goto new_intakes
if /i "%choice%"=="N" goto new_project
if "%choice%"=="8" goto backup_week
if "%choice%"=="9" goto backup_month
if /i "%choice%"=="H" goto history
if /i "%choice%"=="T" goto test_teams
if /i "%choice%"=="C" goto check_config
if "%choice%"=="0" goto end

echo Invalid choice. Try again.
goto menu

:morning
echo.
echo Running morning routine...
python run.py --morning
pause
goto menu

:evening
echo.
echo Running evening routine...
python run.py --evening
pause
goto menu

:supplypro
echo.
echo Running SupplyPro Daily Report...
echo Monitored Communities: Luden Estates, North Haven, Reserve at Battle Creek, Verona Heights
echo.
python -m agents.supplypro_reporter --no-teams
pause
goto menu

:intake
echo.
echo Running Plan Intake Monitor...
python run.py --agent plan_intake
pause
goto menu

:complete_rah
echo.
echo Running Completeness Checker for Richmond American...
python run.py --agent completeness --builder richmond_american
pause
goto menu

:complete_holt
echo.
echo Running Completeness Checker for Holt Homes...
python run.py --agent completeness --builder holt_homes
pause
goto menu

:pdss
echo.
echo Running PDSS Sync...
python run.py --agent pdss_sync
pause
goto menu

:backup_night
echo.
echo Running Nightly Backup...
python run.py --agent backup --type nightly
pause
goto menu

:folders
echo.
echo Opening Folder Manager...
python folder_manager.py
goto menu

:new_intakes
echo.
echo Processing New Project Intakes...
echo Place intake JSON files in: 00_Intake/_NewProjects/
echo.
python -m agents.intake_processor
pause
goto menu

:new_project
echo.
echo Starting New Project Intake Form...
echo.
python -m agents.interactive_intake
pause
goto menu

:backup_week
echo.
echo Running Weekly Backup...
python run.py --agent backup --type weekly
pause
goto menu

:backup_month
echo.
echo Running Monthly Archive...
python run.py --agent backup --type monthly
pause
goto menu

:history
echo.
echo Backup History:
python -m agents.backup_agent --history
pause
goto menu

:test_teams
echo.
echo Testing Teams Webhook...
python -m services.teams_notify --test
pause
goto menu

:check_config
echo.
echo Checking Configuration...
echo.
echo Root Path:
python -c "from config.settings import LOCAL_SYNC_ROOT; print(f'  {LOCAL_SYNC_ROOT}')"
echo.
echo Builders:
python -c "from config.settings import BUILDERS; [print(f'  - {b}: {d[\"name\"]}') for b,d in BUILDERS.items() if d.get('active')]"
echo.
echo Teams Webhook:
python -c "from config.settings import TEAMS_WEBHOOK_URL; print(f'  Configured: {bool(TEAMS_WEBHOOK_URL)}')"
echo.
pause
goto menu

:end
echo.
echo Goodbye!
exit /b 0
