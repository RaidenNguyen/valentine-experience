@echo off
echo ========================================================
echo   VALENTINE EXPERIENCE - DEPLOY TO GITHUB
echo ========================================================
echo.
echo Please create a new repository on GitHub first:
echo 1. Go to https://github.com/new
echo 2. Name it 'valentine-experience' (or anything you like)
echo 3. Do NOT initialize with README, license, or gitignore
echo 4. Click 'Create repository'
echo.
set /p REPO_URL="Paste your new repository URL here (e.g., https://github.com/YourUser/repo.git): "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b
)

echo.
echo Linking repository to %REPO_URL%...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Renaming branch to 'main'...
git branch -M main

echo.
echo Pushing code to GitHub...
echo (You may be asked to log in to GitHub in a browser window)
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! YOUR CODE IS ON GITHUB! 🚀
    echo ========================================================
    echoNow go to your repository settings:
    echo 1. Settings -> Pages
    echo 2. Source: Deploy from a branch
    echo 3. Branch: main / (root) -> Save
    echo.
    echo Your site will be live in ~2 minutes!
) else (
    echo.
    echo Something went wrong. Please check the error message above.
)
pause
