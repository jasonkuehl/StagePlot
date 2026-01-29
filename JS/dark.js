/**
 * Dark Mode Management
 */

// Check for saved preference or system preference
function initDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && prefersDark)) {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.checked = true;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(isDark ? 'Dark mode enabled' : 'Light mode enabled');
    }
}

// Legacy function for compatibility
function darkMode() {
    toggleDarkMode();
}

// Toggle grid
function toggleGrid() {
    const stageArea = document.querySelector('.stage-area');
    if (stageArea) {
        stageArea.classList.toggle('has-grid');
        const hasGrid = stageArea.classList.contains('has-grid');
        localStorage.setItem('showGrid', hasGrid);
        
        if (typeof showNotification === 'function') {
            showNotification(hasGrid ? 'Grid enabled' : 'Grid disabled');
        }
    }
}

// Initialize grid preference
function initGrid() {
    const savedGrid = localStorage.getItem('showGrid');
    if (savedGrid === 'true') {
        const stageArea = document.querySelector('.stage-area');
        if (stageArea) stageArea.classList.add('has-grid');
        const toggle = document.getElementById('grid-toggle');
        if (toggle) toggle.checked = true;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initGrid();
});
