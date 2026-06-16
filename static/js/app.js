document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadView = document.getElementById('uploadView');
    const loadingView = document.getElementById('loadingView');
    const resultsView = document.getElementById('resultsView');
    const resetBtn = document.getElementById('resetBtn');

    // Nav elements
    const navItems = document.querySelectorAll('.nav-item');
    const navViews = {
        'Dashboard': uploadView,
        'Recent Scans': document.getElementById('recentScansView'),
        'Annotations': document.getElementById('annotationsView'),
        'Settings': document.getElementById('settingsView')
    };

    // Nav Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active class
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide all views
            Object.values(navViews).forEach(view => {
                if (view) view.classList.add('hidden');
            });
            loadingView.classList.add('hidden');
            resultsView.classList.add('hidden');

            // Show selected view
            const label = item.textContent.trim();
            if (navViews[label]) {
                navViews[label].classList.remove('hidden');
            }
        });
    });

    // Drag and Drop Effects
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('dragover');
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    }

    // Sequence Simulation for Loading View
    function playLoadingSequence() {
        const steps = [
            document.getElementById('step1'),
            document.getElementById('step2'),
            document.getElementById('step3'),
            document.getElementById('step4')
        ];
        
        let currentStep = 0;
        
        // Reset steps
        steps.forEach(s => {
            s.classList.remove('active', 'done');
        });
        steps[0].classList.add('active');

        // We want to simulate the steps visually. Since inference might take time, 
        // we just fake a quick sequence and pause at step 3.
        return new Promise(resolve => {
            setTimeout(() => {
                steps[0].classList.remove('active');
                steps[0].classList.add('done');
                steps[1].classList.add('active');
                
                setTimeout(() => {
                    steps[1].classList.remove('active');
                    steps[1].classList.add('done');
                    steps[2].classList.add('active');
                    
                    // Stop simulated timing here, let actual API response trigger the end
                    resolve();
                }, 800);
            }, 600);
        });
    }

    function finalizeLoadingSequence() {
        const steps = [
            document.getElementById('step3'),
            document.getElementById('step4')
        ];
        
        return new Promise(resolve => {
            steps[0].classList.remove('active');
            steps[0].classList.add('done');
            steps[1].classList.add('active');
            
            setTimeout(() => {
                steps[1].classList.remove('active');
                steps[1].classList.add('done');
                setTimeout(resolve, 300);
            }, 600);
        });
    }

    function uploadFile(file) {
        // Show loading state
        uploadView.classList.add('hidden');
        loadingView.classList.remove('hidden');

        // Set image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
        }
        reader.readAsDataURL(file);

        // Start UI sequence
        playLoadingSequence().then(() => {
            const formData = new FormData();
            formData.append('file', file);

            // Real API Call
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    alert("Error: " + data.error);
                    resetUI();
                    return;
                }

                finalizeLoadingSequence().then(() => {
                    showResults(data);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred during analysis.");
                resetUI();
            });
        });
    }

    function showResults(data) {
        loadingView.classList.add('hidden');
        resultsView.classList.remove('hidden');

        // Populate Results
        const diagRes = document.getElementById('diagnosisResult');
        const diagCard = document.getElementById('diagnosisCard');
        
        diagRes.textContent = data.diagnosis;
        document.getElementById('diagnosisMessage').textContent = data.message;
        document.getElementById('processingTime').textContent = data.time;
        
        // Styling based on risk
        diagRes.className = 'metric-value';
        diagCard.className = 'metric-card';
        if (data.risk === 'High Risk') {
            diagRes.classList.add('critical');
            diagCard.classList.add('critical');
        } else {
            diagRes.classList.add('safe');
            diagCard.classList.add('safe');
        }

        // Animate confidence bar and number
        const confidenceVal = parseFloat(data.confidence) || 0;
        const targetFill = confidenceVal + '%';
        
        let currentConf = 0;
        const confElement = document.getElementById('confidenceValue');
        
        // Restart scanner line animation
        const scannerLine = document.getElementById('scanLine');
        scannerLine.style.animation = 'none';
        scannerLine.offsetHeight; /* trigger reflow */
        scannerLine.style.animation = null; 
        
        const interval = setInterval(() => {
            currentConf += 1.5;
            if(currentConf >= confidenceVal) {
                confElement.textContent = confidenceVal.toFixed(1);
                clearInterval(interval);
            } else {
                confElement.textContent = currentConf.toFixed(1);
            }
        }, 15);

        // Slide the bar
        setTimeout(() => {
            document.getElementById('confidenceFill').style.width = targetFill;
        }, 50);
    }

    resetBtn.addEventListener('click', resetUI);

    function resetUI() {
        resultsView.classList.add('hidden');
        loadingView.classList.add('hidden');
        uploadView.classList.remove('hidden');
        fileInput.value = '';
        
        document.getElementById('confidenceFill').style.width = '0%';
        document.getElementById('confidenceValue').textContent = '0';
        document.getElementById('previewImage').src = '';
    }
});
