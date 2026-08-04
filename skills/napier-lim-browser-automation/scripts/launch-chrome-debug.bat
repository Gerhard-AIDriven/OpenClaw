@echo off
echo Launching Chrome with Remote Debugging (Incognito Mode)...
echo.
echo IMPORTANT: 
echo 1. Wait for Chrome to open
echo 2. Navigate to: https://eservices.napier.govt.nz/online-services/new/lim/step/1
echo 3. Wait for the page to fully load (you should see the search box)
echo 4. Reply "READY" and I'll attach the automation
echo.
echo Closing any existing Chrome instances...
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting Chrome with remote debugging on port 9222...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-lim-debug" --incognito

echo.
echo Chrome is starting... Please wait 5 seconds then navigate to the LIM URL manually.
timeout /t 5 /nobreak >nul
echo.
echo Once you've navigated to the LIM page and it's fully loaded, type "READY" in your chat with Seb.
