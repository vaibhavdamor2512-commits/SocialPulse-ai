# ============================================================
# SocialPulse AI — One-click startup script
# Run this from the socialPulse-ai folder:
#   Right-click → "Run with PowerShell"
#   OR in a terminal: .\start.ps1
# ============================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SocialPulse AI — Starting up" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Backend ──────────────────────────────────────────────────────────────────
Write-Host "[1/2] Starting Backend (FastAPI on port 8000)..." -ForegroundColor Yellow
$backendPath = Join-Path $root "backend"
$uvicorn = Join-Path $backendPath ".venv\Scripts\uvicorn.exe"

if (-not (Test-Path $uvicorn)) {
    Write-Host "ERROR: .venv not found. Run: cd backend && python -m venv .venv && .venv\Scripts\pip install -r requirements.txt" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Backend ^& cd /d `"$backendPath`" ^& .venv\Scripts\uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

Write-Host "  Backend window opened." -ForegroundColor Green
Start-Sleep -Seconds 3

# ── Frontend ─────────────────────────────────────────────────────────────────
Write-Host "[2/2] Starting Frontend (Next.js on port 3006)..." -ForegroundColor Yellow
$frontendPath = Join-Path $root "frontend"
$npm = "npm"

if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "ERROR: node_modules not found. Run: cd frontend && npm install" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Frontend ^& cd /d `"$frontendPath`" ^& npm run dev" -WindowStyle Normal

Write-Host "  Frontend window opened." -ForegroundColor Green
Start-Sleep -Seconds 5

# ── Open browser ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Opening http://localhost:3006" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo login:" -ForegroundColor White
Write-Host "    Email:    demo@socialpulse.ai" -ForegroundColor Gray
Write-Host "    Password: Demo1234!" -ForegroundColor Gray
Write-Host ""

# Wait a moment for the dev server to start, then open browser
Start-Sleep -Seconds 4
Start-Process "http://localhost:3006"

Write-Host "Both servers are running in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this launcher"
