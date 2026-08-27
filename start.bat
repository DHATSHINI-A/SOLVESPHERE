@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo               STARTING SOLUTIONHUB PLATFORM
echo ========================================================
echo.

echo [1/3] Launching Backend Server on port 5000...
start "SolutionHub Backend Server" cmd.exe /k "cd /d "%~dp0Backend" && npm.cmd start"

echo [2/3] Launching Frontend Server on port 5173...
start "SolutionHub Frontend App" cmd.exe /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo [3/3] Opening browser at http://localhost:5173 ...
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173/

echo.
echo ========================================================
echo   Backend  : http://localhost:5000/
echo   Frontend : http://localhost:5173/
echo ========================================================
echo.
pause
