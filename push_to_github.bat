@echo off
echo ========================================================
echo  🚀 Pushing NutriCloudMonitor to GitHub (Vinod-chereddy)
echo ========================================================
echo.
echo Make sure you have created the repository on GitHub:
echo https://github.com/new (Name: NutriCloudMonitor)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully pushed to https://github.com/Vinod-chereddy/NutriCloudMonitor
) else (
    echo ❌ Push failed. Please verify repository exists and you are signed in to GitHub.
)
pause
