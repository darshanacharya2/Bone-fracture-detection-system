# 🚀 Quick Start Guide

Get FractureAI running in 3 simple steps!

## For Windows Users

1. **Double-click** `start.bat`
2. Wait for setup to complete
3. Open browser to `http://127.0.0.1:5000`

## For macOS/Linux Users

1. **Run** in terminal:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
2. Wait for setup to complete
3. Open browser to `http://127.0.0.1:5000`

## Manual Setup (All Platforms)

If the scripts don't work, follow these steps:

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run the Server
```bash
python app.py
```

### Step 3: Access the App
Open your browser to: **http://127.0.0.1:5000**

## First Time Setup

⏳ **The first run will download the AI model (~500MB)**
- This takes 3-10 minutes depending on internet speed
- Subsequent runs will be instant

## Using the Application

1. **Upload** an X-ray image (drag & drop or click)
2. **Wait** 2-5 seconds for analysis
3. **Review** the diagnosis and confidence score
4. **Click** "New Analysis" to test another image

## Troubleshooting

### Port Already in Use
```bash
# In app.py, change the port number:
app.run(port=5001)  # Use 5001 instead of 5000
```

### Python Not Found
- Install Python 3.8+ from [python.org](https://www.python.org/)
- Make sure to check "Add Python to PATH" during installation

### Module Not Found Errors
```bash
pip install --upgrade -r requirements.txt
```

### GPU Not Detected (Optional)
The app works fine on CPU. For GPU acceleration:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Need Help?

Check the full [README.md](README.md) for detailed documentation.

---

**Happy analyzing! 🦴**