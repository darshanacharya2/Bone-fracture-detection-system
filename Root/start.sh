#!/bin/bash

# FractureAI - Quick Start Script
# This script sets up and runs the Bone Fracture Detection application

echo "================================================"
echo "🦴 FractureAI - Bone Fracture Detection Setup"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed"
    echo "Please install Python 3.8 or higher from https://www.python.org/"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Python found: $($PYTHON_CMD --version)"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    $PYTHON_CMD -m venv venv
    echo "✅ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
echo "✅ Virtual environment activated"
echo ""

# Check if requirements are installed
if [ ! -f "venv/.installed" ]; then
    echo "📥 Installing dependencies (this may take a few minutes)..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        touch venv/.installed
        echo "✅ Dependencies installed successfully"
        echo ""
    else
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Start the application
echo "================================================"
echo "🚀 Starting FractureAI Server"
echo "================================================"
echo ""
echo "The AI model will be downloaded on first run (~500MB)"
echo "This may take a few minutes depending on your connection"
echo ""
echo "Once started, open your browser to:"
echo "👉 http://127.0.0.1:5000"
echo ""
echo "Press CTRL+C to stop the server"
echo "================================================"
echo ""

$PYTHON_CMD app.py