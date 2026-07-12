# =============================================================
#  SocialPulse AI — MongoDB Password Setup + Backend Restart
#  Run this from:  c:\Users\Vaibhav\OneDrive\Desktop\IBM\
#  Command:  .\socialPulse-ai\setup_password.ps1
# =============================================================

$envFile = "$PSScriptRoot\backend\.env"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SocialPulse AI — MongoDB Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enter your MongoDB Atlas password for user:" -ForegroundColor Yellow
Write-Host "  vaibhavdamor2512_db_user" -ForegroundColor White
Write-Host ""
Write-Host "How to find it:" -ForegroundColor DarkGray
Write-Host "  1. Go to https://cloud.mongodb.com" -ForegroundColor DarkGray
Write-Host "  2. Click 'Database Access' (left sidebar)" -ForegroundColor DarkGray
Write-Host "  3. Click 'Edit' next to vaibhavdamor2512_db_user" -ForegroundColor DarkGray
Write-Host "  4. Click 'Edit Password' -> 'Autogenerate' -> Copy it" -ForegroundColor DarkGray
Write-Host ""

$password = Read-Host "Paste your Atlas password here"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "ERROR: No password entered. Exiting." -ForegroundColor Red
    exit 1
}

# URL-encode the password (handles @, #, /, etc.)
$encoded = [System.Uri]::EscapeDataString($password)

# Build the new MongoDB URL
$newUrl = "MONGODB_URL=mongodb+srv://vaibhavdamor2512_db_user:${encoded}@cluster0.sltwebz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Replace the line in .env
$content = Get-Content $envFile
$updated = $content -replace '^MONGODB_URL=.*', $newUrl
Set-Content -Path $envFile -Value $updated -Encoding UTF8

Write-Host ""
Write-Host "OK: .env updated with real password." -ForegroundColor Green

# Kill any stuck Python processes
$old = Get-Process python -ErrorAction SilentlyContinue
if ($old) {
    $old | Stop-Process -Force
    Write-Host "OK: Killed $($old.Count) old Python process(es)." -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# Start backend
Write-Host ""
Write-Host "Starting backend (uvicorn)..." -ForegroundColor Cyan
$uvicorn = "$PSScriptRoot\backend\.venv\Scripts\uvicorn.exe"
$backendDir = "$PSScriptRoot\backend"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$backendDir`" && `"$uvicorn`" main:app --reload --port 8000" -WindowStyle Normal

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Backend starting in a new window." -ForegroundColor Cyan
Write-Host "  Watch for:" -ForegroundColor Cyan
Write-Host "    MongoDB connected — database: 'socialpulse'" -ForegroundColor Green
Write-Host "    Demo user created: demo@socialpulse.ai / Demo1234!" -ForegroundColor Green
Write-Host ""
Write-Host "  Then open: http://localhost:3006/login" -ForegroundColor Yellow
Write-Host "  Click 'Demo credentials' to log in." -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
