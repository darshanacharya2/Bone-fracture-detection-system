import os
import time
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder='frontend/templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

try:
    from transformers import pipeline
    from PIL import Image
    print("Loading model...")
    pipe = pipeline("image-classification", model="prithivMLmods/Bone-Fracture-Detection")
    print("Model loaded.")
except ImportError:
    print("WARNING: transformers not installed. Running in mock mode.")
    pipe = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        start_time = time.time()
        
        try:
            # Validate if it's an X-ray
            import cv2
            import numpy as np
            
            img_color = cv2.imread(filepath)
            is_valid = True
            invalid_reason = ""
            
            if img_color is not None:
                # Check for color
                b, g, r = cv2.split(img_color.astype(np.float32))
                color_diff = np.mean(np.abs(r - g)) + np.mean(np.abs(r - b)) + np.mean(np.abs(g - b))
                
                img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)
                white_pixels = np.sum(img_gray > 240)
                total_pixels = img_gray.shape[0] * img_gray.shape[1]
                
                if color_diff > 30:
                    is_valid = False
                    invalid_reason = "Image appears to be a color photograph. Please upload a grayscale X-ray."
                elif (white_pixels / total_pixels) > 0.4:
                    is_valid = False
                    invalid_reason = "Image has a bright/white background, suggesting it is a document or text."
            
            if not is_valid:
                return jsonify({"error": invalid_reason}), 400

            # Run inference
            if pipe:
                results = pipe(filepath)
                top_result = results[0]
                label = top_result['label']
                score = top_result['score']
            else:
                # Mock Mode
                time.sleep(2)
                label = "fractured"
                score = 0.95
                
            end_time = time.time()
            processing_time = round(end_time - start_time, 2)
            
            # Formatting results
            confidence_percentage = round(score * 100, 1)
            
            label_lower = label.lower()
            if "not" in label_lower or "normal" in label_lower:
                risk = "Low Risk"
            else:
                risk = "High Risk"
            
            # Map technical label to user friendly message
            diagnosis_message = "AI analysis indicates a possible fracture in the uploaded image." if risk == "High Risk" else "The AI analysis indicates no visible bone fractures."
            diagnosis_result = "Fracture Detected" if risk == "High Risk" else "No Fracture Detected"

            return jsonify({
                "status": "success",
                "diagnosis": diagnosis_result,
                "message": diagnosis_message,
                "confidence": confidence_percentage,
                "risk": risk,
                "time": f"{processing_time}s",
                "raw_label": label
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
