# Quick Deployment Verification

Write-Host "🚀 MGT System - Deployment Readiness Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not installed. Please install from https://git-scm.com/" -ForegroundColor Red
    exit
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not installed. Please install Node.js which includes npm" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ All prerequisites installed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
Write-Host "2. Follow PHASE 2: GITHUB SETUP" -ForegroundColor White
Write-Host "3. Use DEPLOYMENT_GUIDE_RENDER.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Start with this command:" -ForegroundColor Yellow
Write-Host "   git init" -ForegroundColor White
Write-Host ""
