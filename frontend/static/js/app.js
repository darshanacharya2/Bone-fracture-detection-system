// ================================================
// FractureAI - Main Application Logic
// ================================================

class FractureDetectionApp {
    constructor() {
        this.apiUrl = 'http://127.0.0.1:5000/api';
        this.currentFile = null;
        this.startTime = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkServerHealth();
    }
    
    // Initialize DOM elements
    initializeElements() {
        this.uploadSection = document.getElementById('uploadSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.statusBadge = document.getElementById('statusBadge');
        this.newAnalysisBtn = document.getElementById('newAnalysisBtn');
        
        // Results elements
        this.previewImg = document.getElementById('previewImg');
        this.diagnosisCard = document.getElementById('diagnosisCard');
        this.diagnosisIcon = document.getElementById('diagnosisIcon');
        this.diagnosisResult = document.getElementById('diagnosisResult');
        this.diagnosisMessage = document.getElementById('diagnosisMessage');
        this.confidenceBadge = document.getElementById('confidenceBadge');
        this.riskFill = document.getElementById('riskFill');
        this.riskValue = document.getElementById('riskValue');
        this.riskIndicator = document.getElementById('riskIndicator');
        
        // Detail elements
        this.detailConfidence = document.getElementById('detailConfidence');
        this.detailRisk = document.getElementById('detailRisk');
        this.detailTime = document.getElementById('detailTime');
        this.chartBars = document.getElementById('chartBars');
    }
    
    // Attach event listeners
    attachEventListeners() {
        // Upload zone click
        this.uploadZone.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelection(file);
            }
        });
        
        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });
        
        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('dragover');
        });
        
        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && this.isValidImageFile(file)) {
                this.handleFileSelection(file);
            } else {
                this.showError('Please upload a valid image file (JPG, PNG, GIF, BMP)');
            }
        });
        
        // New analysis button
        this.newAnalysisBtn.addEventListener('click', () => {
            this.resetApp();
        });
    }
    
    // Check if file is valid image
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
        return validTypes.includes(file.type);
    }
    
    // Handle file selection
    async handleFileSelection(file) {
        if (!this.isValidImageFile(file)) {
            this.showError('Invalid file type. Please upload JPG, PNG, GIF, or BMP.');
            return;
        }
        
        this.currentFile = file;
        this.startTime = Date.now();
        
        // Show loading overlay
        this.showLoading();
        
        // Upload and analyze
        await this.uploadAndAnalyze(file);
    }
    
    // Upload and analyze image
    async uploadAndAnalyze(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`${this.apiUrl}/predict`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayResults(data);
            } else {
                this.showError(data.error || 'Analysis failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Network error. Please check if the server is running.');
        } finally {
            this.hideLoading();
        }
    }
    
    // Display results
    displayResults(data) {
        // Calculate processing time
        const processingTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        // Hide upload, show results
        this.uploadSection.classList.add('hidden');
        this.resultsSection.classList.remove('hidden');
        
        // Set image preview
        this.previewImg.src = data.image_preview;
        
        // Set diagnosis
        const isFractured = data.prediction === 'Fractured';
        this.diagnosisResult.textContent = data.prediction === 'Fractured' 
            ? 'Fracture Detected' 
            : 'No Fracture Detected';
        this.diagnosisMessage.textContent = data.message;
        
        // Update confidence badge
        this.confidenceBadge.textContent = `${data.confidence.toFixed(1)}%`;
        
        // Update diagnosis icon
        if (isFractured) {
            this.diagnosisIcon.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" stroke-width="3"/>
                    <path d="M25 25L55 55M55 25L25 55" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
            `;
            this.diagnosisIcon.classList.add('fractured');
            this.diagnosisCard.style.borderColor = 'var(--color-danger)';
        } else {
            this.diagnosisIcon.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="35" stroke="currentColor" stroke-width="3"/>
                    <path d="M25 40L35 50L55 30" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            this.diagnosisIcon.classList.remove('fractured');
            this.diagnosisCard.style.borderColor = 'var(--color-success)';
        }
        
        // Update risk indicator
        this.riskFill.style.width = `${data.confidence}%`;
        this.riskValue.textContent = `${data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1)} Confidence`;
        
        if (data.risk_level === 'high') {
            this.riskFill.classList.add('high');
            this.riskValue.classList.add('high');
        } else {
            this.riskFill.classList.remove('high');
            this.riskValue.classList.remove('high');
        }
        
        // Update details
        this.detailConfidence.textContent = `${data.confidence.toFixed(2)}%`;
        this.detailRisk.textContent = data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1);
        this.detailTime.textContent = `${processingTime}s`;
        
        // Update probability chart
        this.updateProbabilityChart(data.all_predictions);
    }
    
    // Update probability chart
    updateProbabilityChart(predictions) {
        this.chartBars.innerHTML = '';
        
        predictions.forEach((pred, index) => {
            const barElement = document.createElement('div');
            barElement.className = 'chart-bar';
            barElement.style.animationDelay = `${index * 0.1}s`;
            
            barElement.innerHTML = `
                <span class="chart-label">${pred.label}</span>
                <div class="chart-track">
                    <div class="chart-fill" style="width: ${pred.confidence}%">
                        <span class="chart-value">${pred.confidence.toFixed(1)}%</span>
                    </div>
                </div>
            `;
            
            this.chartBars.appendChild(barElement);
        });
    }
    
    // Show loading overlay
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }
    
    // Hide loading overlay
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }
    
    // Show error message
    showError(message) {
        alert(`Error: ${message}`);
        this.hideLoading();
    }
    
    // Reset app to initial state
    resetApp() {
        this.uploadSection.classList.remove('hidden');
        this.resultsSection.classList.add('hidden');
        this.fileInput.value = '';
        this.currentFile = null;
    }
    
    // Check server health
    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiUrl}/health`);
            const data = await response.json();
            
            if (data.status === 'healthy') {
                this.updateStatus('System Ready', 'success');
            } else {
                this.updateStatus('System Error', 'error');
            }
        } catch (error) {
            this.updateStatus('Server Offline', 'error');
            console.error('Server health check failed:', error);
        }
    }
    
    // Update status badge
    updateStatus(text, status) {
        const statusText = this.statusBadge.querySelector('.status-text');
        const statusDot = this.statusBadge.querySelector('.status-dot');
        
        statusText.textContent = text;
        
        if (status === 'success') {
            statusDot.style.background = 'var(--color-success)';
        } else if (status === 'error') {
            statusDot.style.background = 'var(--color-danger)';
        } else {
            statusDot.style.background = 'var(--color-warning)';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FractureDetectionApp();
});