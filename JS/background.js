/**
 * Background Image Management
 */

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('bg-image');
    const stageArea = document.querySelector('.stage-area');

    if (fileInput && stageArea) {
        fileInput.addEventListener('change', function() {
            const file = fileInput.files[0];
            
            if (!file) return;
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                if (typeof showNotification === 'function') {
                    showNotification('Please select an image file', 'error');
                }
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                if (typeof showNotification === 'function') {
                    showNotification('Image too large (max 10MB)', 'error');
                }
                return;
            }
            
            const reader = new FileReader();

            reader.addEventListener('load', function() {
                stageArea.style.backgroundImage = `url(${reader.result})`;
                stageArea.style.backgroundSize = '100% 100%';
                stageArea.style.backgroundPosition = 'center';
                stageArea.style.backgroundRepeat = 'no-repeat';
                
                if (typeof showNotification === 'function') {
                    showNotification('Background image set');
                }
            });

            reader.addEventListener('error', function() {
                if (typeof showNotification === 'function') {
                    showNotification('Failed to load image', 'error');
                }
            });

            reader.readAsDataURL(file);
        });
    }
});

/**
 * Clear background image
 */
function clearBackground() {
    const stageArea = document.querySelector('.stage-area');
    if (stageArea) {
        stageArea.style.backgroundImage = '';
        
        // Reset file input
        const fileInput = document.getElementById('bg-image');
        if (fileInput) fileInput.value = '';
        
        if (typeof showNotification === 'function') {
            showNotification('Background cleared');
        }
    }
}