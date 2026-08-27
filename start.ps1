# SolutionHub 1-Click PowerShell Launcher
Set-Location $PSScriptRoot

Write-Host "Starting SolutionHub Backend Server..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList '/k', "cd /d `"$PSScriptRoot\Backend`" && npm.cmd start"

Write-Host "Starting SolutionHub Frontend Server..." -ForegroundColor Cyan
Start-Process cmd.exe -ArgumentList '/k', "cd /d `"$PSScriptRoot\frontend`" && npm.cmd run dev"

Start-Sleep -Seconds 3

Write-Host "Opening SolutionHub in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"

