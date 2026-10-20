@echo off
setlocal enabledelayedexpansion
title NutriCloudMonitor - Git Push & Deploy Helper

echo ========================================================
echo  NutriCloudMonitor - GitHub Sync & Deployment Tool
echo  Repository: https://github.com/Vinod-chereddy/NutriCloudMonitor
echo ========================================================
echo.

:: 1. Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

:: 2. Check if we are inside a Git repository
git rev-parse --is-inside-work-tree >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Current directory is not a Git repository.
    pause
    exit /b 1
)

:: 3. Detect current branch
for /f "tokens=*" %%b in ('git branch --show-current') do set CURRENT_BRANCH=%%b
if "%CURRENT_BRANCH%"=="" set CURRENT_BRANCH=main

echo [INFO] Active branch: %CURRENT_BRANCH%
echo.

:: 4. Check for uncommitted changes
echo [INFO] Checking repository status...
git status --short

:: 5. Stage all modifications, new files, and deletions
git add -A

:: Check if there are staged changes
git diff --cached --quiet
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [INFO] No new local changes to commit.
) else (
    echo.
    echo --------------------------------------------------------
    set /p "USER_MSG=Enter commit message (or press Enter for auto-message): "
    if "!USER_MSG!"=="" (
        for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
        set "TIMESTAMP=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2! !datetime:~8,2!:!datetime:~10,2!"
        set "USER_MSG=Update NutriCloudMonitor - !TIMESTAMP!"
    )
    echo.
    echo [INFO] Committing changes with message: "!USER_MSG!"
    git commit -m "!USER_MSG!"
)

:: 6. Pull latest remote changes to avoid push rejections
echo.
echo [INFO] Syncing with remote origin/%CURRENT_BRANCH%...
git pull --rebase origin %CURRENT_BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Automatic rebase encountered an issue. Proceeding with push check...
)

:: 7. Push to GitHub
echo.
echo ========================================================
echo  Pushing to GitHub: origin/%CURRENT_BRANCH%
echo ========================================================
git push -u origin %CURRENT_BRANCH%

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS: Code pushed to GitHub successfully!
    echo ========================================================
    echo.
    echo  GitHub:  https://github.com/Vinod-chereddy/NutriCloudMonitor
    echo  Vercel:  https://nutricloudmonitor.vercel.app
    echo  Render:  https://nutricloudmonitor.onrender.com
    echo.
    echo Auto-deployment triggers will now build and update the live app.
) else (
    echo ========================================================
    echo  PUSH FAILED!
    echo ========================================================
    echo.
    echo Possible causes:
    echo  1. You need to authenticate with GitHub (Personal Access Token or GitHub CLI).
    echo  2. Remote branch has conflicting changes.
    echo  3. Internet connection issue.
    echo.
    echo Run 'git status' and 'git push' manually to inspect the error.
)

echo.
pause
