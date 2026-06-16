# Bone Fracture Detection System (FractureAI)

Bone Fracture Detection using Deep Learning. This repository contains a Computer Vision pipeline and web interface designed to automate the detection and localization of fractures in musculoskeletal X-rays.

## 🚀 Overview

**FractureAI** is an AI-powered diagnostic tool that assists healthcare professionals by analyzing X-ray images to identify potential bone fractures. The system provides a modern, intuitive clinical web dashboard for uploading images and viewing detailed diagnostic results, complete with confidence levels and risk assessments.

> **Disclaimer:** This is an AI-assisted diagnostic tool intended for research, educational purposes, and preliminary screening. It should not replace professional medical judgment.

## ✨ Features

- **X-Ray Image Validation:** Built-in heuristics using OpenCV to prevent non-X-ray images (like colorful photographs or bright text documents) from being mistakenly processed.
- **Automated AI Analysis:** Fast processing utilizing a pre-trained HuggingFace Image Classification pipeline (`prithivMLmods/Bone-Fracture-Detection`) to detect musculoskeletal fractures.
- **Detailed Diagnostic Reports:**
  - Visual image preview with simulated scanning overlays.
  - Overall diagnosis (e.g., **Fracture Detected** / **No Fracture Detected**).
  - Model confidence level (with dynamic counting animations) and risk assessment.
  - Processing inference time metrics.
- **Premium Clinical Dashboard Interface:** A sleek, modern frontend designed with responsive CSS grids, deep glassmorphism, and dark-mode medical aesthetics.
- **Flask-Ready:** Frontend templates are served by a lightweight Flask backend API.

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Python, Flask
- **Machine Learning:** HuggingFace `transformers`, PyTorch, OpenCV, Pillow

## 📂 Project Structure

```text
Bone-fracture-detection-system/
├── app.py                     # Main Flask application and AI inference logic
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
├── frontend/                  
│   └── templates/
│       └── index.html         # Main web application dashboard
├── static/
│   ├── css/
│   │   └── styles.css         # Dashboard styling and animations
│   └── js/
│       └── app.js             # UI interaction and API communication
└── uploads/                   # Temporary storage for uploaded X-rays
```

## 💻 Getting Started

### Prerequisites
- Python 3.8+
- Requirements listed in `requirements.txt` (Flask, PyTorch, Transformers, OpenCV, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/darshanacharya2/Bone-fracture-detection-system.git
   cd Bone-fracture-detection-system
   ```

2. **Set up a virtual environment (recommended):**
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application:**
   ```bash
   python app.py
   ```
   *Note: The first time you run this, it will download the pre-trained HuggingFace model (~300MB).*

5. **Access the Web Interface:** 
   Open your web browser and navigate to [http://localhost:5000](http://localhost:5000)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is created for research and educational purposes.
