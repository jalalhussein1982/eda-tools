// pyodide-loader.js - Initialize Pyodide and Python environment

let pyodide = null;
let pythonReady = false;

// Educational tips to show during loading
const educationalTips = [
    "Correlation does not imply causation",
    "Always visualize your data before analyzing",
    "Check your assumptions before running tests",
    "Outliers can dramatically affect your results",
    "Larger sample sizes increase statistical power",
    "P-values tell you about significance, not importance",
    "Normal distribution is assumed by many tests",
    "Multicollinearity makes it hard to isolate effects",
    "Always report confidence intervals, not just p-values",
    "Consider both practical and statistical significance"
];

let currentTipIndex = 0;

/**
 * Rotate educational tips
 */
function rotateTips() {
    const tipsContainer = document.getElementById('rotating-tips');
    if (!tipsContainer) return;
    
    const tips = tipsContainer.querySelectorAll('.tip');
    tips.forEach((tip, index) => {
        tip.classList.toggle('active', index === currentTipIndex);
    });
    
    currentTipIndex = (currentTipIndex + 1) % tips.length;
}

/**
 * Initialize educational tips
 */
function initTips() {
    const tipsContainer = document.getElementById('rotating-tips');
    if (!tipsContainer) return;
    
    tipsContainer.innerHTML = educationalTips
        .map((tip, index) => `<p class="tip ${index === 0 ? 'active' : ''}">${tip}</p>`)
        .join('');
    
    // Rotate tips every 5 seconds
    setInterval(rotateTips, 5000);
}

/**
 * Update loading progress
 */
function updateLoadingProgress(message, percentage) {
    const progressBar = document.getElementById('init-progress');
    const loadingMessage = document.getElementById('loading-message');
    const loadingPercentage = document.getElementById('loading-percentage');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
    if (loadingPercentage) {
        loadingPercentage.textContent = `${percentage}%`;
    }
}

/**
 * Initialize Pyodide and load packages
 */
async function initializePyodide() {
    try {
        // Check browser compatibility
        const compat = checkBrowserCompatibility();
        if (!compat.compatible) {
            showModal('Browser Not Supported', 
                `<p>${compat.message}</p>
                 <p style="margin-top: 1rem;">Please upgrade your browser to use this tool.</p>`);
            return false;
        }
        
        // Initialize tips
        initTips();
        
        // Load Pyodide
        updateLoadingProgress('Loading Python runtime...', 0);
        pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });
        updateLoadingProgress('Python runtime loaded', 20);
        
        // Load required packages
        updateLoadingProgress('Installing NumPy...', 25);
        await pyodide.loadPackage('numpy');
        
        updateLoadingProgress('Installing Pandas...', 35);
        await pyodide.loadPackage('pandas');
        
        updateLoadingProgress('Installing SciPy...', 50);
        await pyodide.loadPackage('scipy');
        
        updateLoadingProgress('Installing Matplotlib...', 65);
        await pyodide.loadPackage('matplotlib');
        
        updateLoadingProgress('Installing Statsmodels...', 75);
        await pyodide.loadPackage('statsmodels');
        
        updateLoadingProgress('Installing scikit-learn...', 85);
        await pyodide.loadPackage('scikit-learn');
        
        // Load Python analysis modules
        updateLoadingProgress('Loading analysis modules...', 90);
        await loadPythonModules();
        
        updateLoadingProgress('Ready!', 100);
        
        pythonReady = true;
        
        // Wait a moment to show 100%
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Hide loading screen, show app
        document.getElementById('loading-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        
        return true;
        
    } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
        showModal('Initialization Error',
            `<p>Failed to load the analysis environment.</p>
             <p style="margin-top: 1rem; color: #ef4444;">${escapeHtml(error.message)}</p>
             <p style="margin-top: 1rem;">Please refresh the page to try again. If the problem persists, try:</p>
             <ul style="margin-top: 0.5rem; margin-left: 1.5rem;">
                <li>Clearing your browser cache</li>
                <li>Using a different browser (Chrome, Firefox, or Safari)</li>
                <li>Checking your internet connection</li>
             </ul>`);
        return false;
    }
}

/**
 * Load Python analysis modules
 */
async function loadPythonModules() {
    try {
        // Load preprocessing module
        const preprocessingCode = await fetch('python/preprocessing.py').then(r => r.text());
        await pyodide.runPythonAsync(preprocessingCode);
        
        // Load distribution module
        const distributionCode = await fetch('python/distribution.py').then(r => r.text());
        await pyodide.runPythonAsync(distributionCode);
        
        // Load correlation module
        const correlationCode = await fetch('python/correlation.py').then(r => r.text());
        await pyodide.runPythonAsync(correlationCode);
        
        // Load modeling module
        const modelingCode = await fetch('python/modeling.py').then(r => r.text());
        await pyodide.runPythonAsync(modelingCode);
        
        // Load assumptions module
        const assumptionsCode = await fetch('python/assumptions.py').then(r => r.text());
        await pyodide.runPythonAsync(assumptionsCode);
        
        // Load report generator
        const reportCode = await fetch('python/report_generator.py').then(r => r.text());
        await pyodide.runPythonAsync(reportCode);
        
        // Load main EDA core
        const edaCoreCode = await fetch('python/eda_core.py').then(r => r.text());
        await pyodide.runPythonAsync(edaCoreCode);
        
        return true;
    } catch (error) {
        console.error('Failed to load Python modules:', error);
        throw new Error('Could not load analysis modules: ' + error.message);
    }
}

/**
 * Run Python code
 */
async function runPython(code) {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    
    try {
        return await pyodide.runPythonAsync(code);
    } catch (error) {
        console.error('Python execution error:', error);
        throw error;
    }
}

/**
 * Pass JavaScript data to Python
 */
function setPythonVariable(name, value) {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    pyodide.globals.set(name, value);
}

/**
 * Get Python variable in JavaScript
 */
function getPythonVariable(name) {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    return pyodide.globals.get(name);
}

/**
 * Check if Python is ready
 */
function isPythonReady() {
    return pythonReady;
}

/**
 * Load CSV data into Python pandas DataFrame
 */
async function loadCSVtoPython(csvText) {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    
    try {
        setPythonVariable('csv_text', csvText);
        
        await runPython(`
import pandas as pd
import io

df = pd.read_csv(io.StringIO(csv_text))
        `);
        
        return true;
    } catch (error) {
        console.error('Failed to load CSV to Python:', error);
        throw new Error('Failed to parse CSV file: ' + error.message);
    }
}

/**
 * Load Excel data into Python pandas DataFrame
 */
async function loadExceltoPython(arrayBuffer) {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    
    try {
        // Convert ArrayBuffer to Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer);
        setPythonVariable('excel_data', uint8Array);
        
        await runPython(`
import pandas as pd
import io

df = pd.read_excel(io.BytesIO(excel_data.tobytes()))
        `);
        
        return true;
    } catch (error) {
        console.error('Failed to load Excel to Python:', error);
        throw new Error('Failed to parse Excel file: ' + error.message);
    }
}

/**
 * Get DataFrame info from Python
 */
async function getDataFrameInfo() {
    if (!pythonReady) {
        throw new Error('Python environment not ready');
    }
    
    try {
        const result = await runPython(`
import json

info = {
    'shape': df.shape,
    'columns': df.columns.tolist(),
    'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
    'head': df.head(10).to_dict('records'),
    'missing': df.isnull().sum().to_dict(),
    'numeric_columns': df.select_dtypes(include=['int64', 'float64']).columns.tolist()
}

json.dumps(info)
        `);
        
        return JSON.parse(result);
    } catch (error) {
        console.error('Failed to get DataFrame info:', error);
        throw error;
    }
}

// Initialize Pyodide on page load
window.addEventListener('DOMContentLoaded', () => {
    initializePyodide();
});
