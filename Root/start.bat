@echo off
REM FractureAI - Quick Start Script for Windows
REM This script sets up and runs the Bone Fracture Detection application

echo ================================================
echo 🦴 FractureAI - Bone Fracture Detection Setup
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ Python found: %PYTHON_VERSION%
echo.

REM Navigate to backend directory
cd /d "%~dp0..\backend"

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
    echo.
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

REM Check if requirements are installed
if not exist "venv\.installed" (
    echo 📥 Installing dependencies (this may take a few minutes^)...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    
    if %errorlevel% equ 0 (
        echo. > venv\.installed
        echo ✅ Dependencies installed successfully
        echo.
    ) else (
        echo ❌ Error: Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
    echo.
)

REM Start the application
echo ================================================
echo 🚀 Starting FractureAI Server
echo ================================================
echo.
echo The AI model will be downloaded on first run (~500MB^)
echo This may take a few minutes depending on your connection
echo.
echo Once started, open your browser to:
echo 👉 http://127.0.0.1:5000
echo.
echo Press CTRL+C to stop the server
echo ================================================
echo.

python app.py

pause