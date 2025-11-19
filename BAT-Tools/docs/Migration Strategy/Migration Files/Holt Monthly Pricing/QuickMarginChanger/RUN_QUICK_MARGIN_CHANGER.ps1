# QUICK MARGIN CHANGER - PRICING GENERATOR (PowerShell Version)
# ========================================================

Clear-Host
Write-Host "========================================================"
Write-Host "        QUICK MARGIN CHANGER - PRICING GENERATOR"
Write-Host "========================================================"
Write-Host ""

# File path
$QMCFile = "C:\Users\corey.boser\Documents\Holt Monthly Pricing\QUICK_MARGIN_CHANGER.xlsm"

# Check if file exists
if (-not (Test-Path $QMCFile)) {
    Write-Host "ERROR: QUICK_MARGIN_CHANGER.xlsm not found!" -ForegroundColor Red
    Write-Host "Looking for: $QMCFile"
    Write-Host ""
    Write-Host "Please check the file path and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "File found: " -NoNewline
Write-Host (Split-Path $QMCFile -Leaf) -ForegroundColor Green
Write-Host ""
Write-Host "Starting pricing generation process..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------------"

# Run the Python script
try {
    python quick_margin_changer.py "$QMCFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================================"
        Write-Host "              GENERATION SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================================"
        Write-Host ""
        Write-Host "Check your folder for the output file with timestamp."
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Open the output file"
        Write-Host "2. Select the appropriate sheet for your BAT"
        Write-Host "3. Copy and paste to your BAT file"
    } else {
        Write-Host ""
        Write-Host "========================================================"
        Write-Host "               GENERATION FAILED" -ForegroundColor Red
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
