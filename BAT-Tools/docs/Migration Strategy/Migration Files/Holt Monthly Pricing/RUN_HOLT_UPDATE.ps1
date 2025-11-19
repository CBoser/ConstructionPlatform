# HOLT HOMES BAT PRICING UPDATER - PowerShell Version
# ========================================================

Clear-Host
Write-Host "========================================================"
Write-Host "         HOLT HOMES BAT PRICING UPDATER"
Write-Host "========================================================"
Write-Host ""

# File path
$BatFile = "I:\FOREST-GROVE\SALES\I_Corey Boser\Customer Files\HOLT HOMES\3 Resources\3BAT\HOLT BAT OCTOBER 2025 9-29-25.xlsm"

# Check if file exists
if (-not (Test-Path $BatFile)) {
    Write-Host "ERROR: BAT file not found!" -ForegroundColor Red
    Write-Host "Looking for: $BatFile"
    Write-Host ""
    Write-Host "Please check the file path and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "File found: " -NoNewline
Write-Host (Split-Path $BatFile -Leaf) -ForegroundColor Green
Write-Host ""
Write-Host "Starting update process..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------------"

# Run the Python script
try {
    python holt_updater.py "$BatFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================================"
        Write-Host "              UPDATE SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================================"
        Write-Host ""
        Write-Host "Check your folder for the updated file with timestamp."
    } else {
        Write-Host ""
        Write-Host "========================================================"
        Write-Host "                UPDATE FAILED" -ForegroundColor Red
        Write-Host "========================================================"
        Write-Host ""
        Write-Host "Please check the error messages above."
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Could not run Python script" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Make sure Python is installed and in your PATH"
}

Write-Host ""
Read-Host "Press Enter to exit"
