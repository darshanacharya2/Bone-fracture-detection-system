from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
try:
    import torch
    from transformers import AutoImageProcessor, AutoModelForImageClassification
    TORCH_AVAILABLE = True
except Exception as e:
    print("⚠️ Torch or transformers not available:", e)
    torch = None
    AutoImageProcessor = None
    AutoModelForImageClassification = None
    TORCH_AVAILABLE = False
from PIL import Image
import io
import base64
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)

# Configuration
MODEL_NAME = "prithivMLmods/Bone-Fracture-Detection"
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variables for model and processor (load once)
model = None
processor = None

def load_model():
    """Load the model and processor once at startup"""
    global model, processor
    if not TORCH_AVAILABLE:
        print("⚠️ Skipping model load because torch/transformers are unavailable.")
        return
    print("🔄 Loading model... This may take a moment on first run.")
    processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
    model = AutoModelForImageClassification.from_pretrained(MODEL_NAME)
    
    # Move to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"✅ Model loaded successfully on {device}!")

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def predict_fracture(image):
    """Perform fracture detection on an image"""
    try:
        # If model or processor is not available (e.g. torch not installed), return a simulated response
        if model is None or processor is None:
            return {
                'success': True,
                'prediction': 'No Model (stub)',
                'confidence': 50.0,
                'risk_level': 'medium',
                'all_predictions': [
                    {'label': 'Fractured', 'confidence': 50.0},
                    {'label': 'Healthy', 'confidence': 50.0}
                ],
                'message': 'Model not loaded; this is a simulated response.'
            }
        # Ensure image is in RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess
        inputs = processor(images=image, return_tensors="pt")
        
        # Move to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Inference
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Process results
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
        
        # Get predictions for all classes
        all_predictions = []
        for idx, prob in enumerate(probabilities[0]):
            label = model.config.id2label[idx]
            all_predictions.append({
                'label': label,
                'confidence': float(prob.item() * 100)
            })
        
        # Sort by confidence
        all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Get top prediction
        predicted_class_idx = logits.argmax(-1).item()
        predicted_label = model.config.id2label[predicted_class_idx]
        confidence = probabilities[0][predicted_class_idx].item() * 100
        
        # Determine risk level based on confidence
        if confidence > 85:
            risk_level = "high"
        elif confidence > 65:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            'success': True,
            'prediction': predicted_label,
            'confidence': float(confidence),
            'risk_level': risk_level,
            'all_predictions': all_predictions,
            'message': 'Fracture detected. Medical attention recommended.' if predicted_label == 'Fractured' 
                      else 'No fracture detected.'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint for fracture prediction"""
    try:
        # Check if image was uploaded
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400
        
        file = request.files['image']
        
        # Check if file has a filename
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Perform prediction
        result = predict_fracture(image)
        
        # Convert image to base64 for preview
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        result['image_preview'] = f"data:image/png;base64,{img_str}"
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(next(model.parameters()).device) if model else 'not loaded'
    })

if __name__ == '__main__':
    # Load model before starting server
    load_model()
    
    # Run the app
    print("\n" + "="*50)
    print("🦴 Bone Fracture Detection API Server")
    print("="*50)
    print("Server running at: http://127.0.0.1:5000")
    print("Press CTRL+C to stop the server")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)