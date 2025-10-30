// main.js - Application entry point

// Application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Statistical EDA Tool v1.0.0');
    console.log('Initializing...');
});

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
});

// Warn before leaving if analysis in progress
window.addEventListener('beforeunload', (event) => {
    const stage = stateManager.getStage();
    if (stage === 6) {
        event.preventDefault();
        event.returnValue = 'Analysis in progress. Are you sure you want to leave?';
    }
});
