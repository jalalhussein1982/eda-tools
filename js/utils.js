// utils.js - Utility functions

/**
 * Format numbers with appropriate precision
 */
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return Number(num).toFixed(decimals);
}

/**
 * Format p-values with appropriate precision
 */
function formatPValue(p) {
    if (p === null || p === undefined || isNaN(p)) return 'N/A';
    if (p < 0.001) return 'p < 0.001';
    if (p < 0.01) return `p < 0.01`;
    return `p = ${p.toFixed(3)}`;
}

/**
 * Get significance stars based on p-value
 */
function getSignificanceStars(p, alpha = 0.05) {
    if (p === null || p === undefined || isNaN(p)) return '';
    if (p < 0.001) return '***';
    if (p < 0.01) return '**';
    if (p < alpha) return '*';
    return '';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show modal dialog
 */
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus management
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.focus();
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('modal');
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Parse CSV string to array
 */
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i];
        });
        return obj;
    });
    return { headers, rows };
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if browser is compatible
 */
function checkBrowserCompatibility() {
    const hasWebAssembly = typeof WebAssembly === 'object';
    const hasIndexedDB = typeof indexedDB !== 'undefined';
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    if (!hasWebAssembly) {
        return {
            compatible: false,
            message: 'Your browser does not support WebAssembly, which is required for this tool. Please use Chrome 90+, Firefox 89+, or Safari 15.2+.'
        };
    }
    
    return { compatible: true };
}

/**
 * Get current timestamp
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file
 */
function validateFile(file) {
    const maxSize = 500 * 1024 * 1024; // 500 MB
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (file.size > maxSize) {
        return {
            valid: false,
            message: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size of 500 MB.`
        };
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
        return {
            valid: false,
            message: 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).'
        };
    }
    
    return { valid: true };
}

/**
 * Generate unique ID
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculate confidence level based on various factors
 */
function calculateConfidence(params) {
    const {
        pValue,
        effectSize,
        sampleSize,
        assumptionsMet,
        normalityOk = true,
        outliersRemoved = false
    } = params;
    
    let confidence = 100;
    
    // P-value impact
    if (pValue > 0.05) confidence -= 50;
    else if (pValue > 0.01) confidence -= 10;
    else if (pValue > 0.001) confidence -= 5;
    
    // Effect size impact
    if (Math.abs(effectSize) < 0.2) confidence -= 20;
    else if (Math.abs(effectSize) < 0.4) confidence -= 10;
    
    // Sample size impact
    if (sampleSize < 30) confidence -= 20;
    else if (sampleSize < 100) confidence -= 10;
    
    // Assumptions impact
    if (!normalityOk) confidence -= 10;
    if (outliersRemoved) confidence -= 5;
    if (!assumptionsMet) confidence -= 15;
    
    return Math.max(0, Math.min(100, confidence));
}

/**
 * Get confidence label
 */
function getConfidenceLabel(confidence) {
    if (confidence >= 80) return { label: 'HIGH CONFIDENCE', color: '#10b981' };
    if (confidence >= 60) return { label: 'MODERATE CONFIDENCE', color: '#f59e0b' };
    if (confidence >= 40) return { label: 'LOW CONFIDENCE', color: '#ef4444' };
    return { label: 'VERY LOW CONFIDENCE', color: '#dc2626' };
}

/**
 * Create download link
 */
function createDownloadLink(data, filename, label) {
    const button = document.createElement('button');
    button.className = 'btn btn-primary';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        ${label}
    `;
    button.onclick = () => {
        const blob = new Blob([data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    return button;
}
