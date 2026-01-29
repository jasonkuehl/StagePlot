/**
 * Capture only the stage area and download as PNG
 * Pre-converts images to data URLs to avoid CORS issues
 */
function capture(options = {}) {
    const defaults = {
        filename: 'stage-plot.png',
        format: 'png',
        quality: 1.0,
        backgroundColor: '#e2e8f0',
        scale: 2
    };
    
    const settings = { ...defaults, ...options };
    const stageArea = document.querySelector('.stage-area') || document.querySelector('.main') || document.querySelector('#stage');
    const modal = document.querySelector('.modal');
    
    if (!stageArea) {
        showNotification('Could not find stage area', 'error');
        return;
    }
    
    const modalWasVisible = modal && modal.style.display !== 'none';
    if (modal) modal.style.display = 'none';
    
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) toolbar.style.opacity = '0';
    
    showNotification('Preparing screenshot...', 'info');
    
    // First, convert all images to data URLs to avoid CORS issues
    convertImagesToDataURLs(stageArea).then(() => {
        setTimeout(() => {
            html2canvas(stageArea, {
                backgroundColor: settings.backgroundColor,
                scale: settings.scale,
                useCORS: true,
                allowTaint: true,
                logging: false,
                imageTimeout: 0,
                ignoreElements: (element) => {
                    return element.classList.contains('no-capture') || 
                           element.classList.contains('item-controls') ||
                           element.classList.contains('toolbar');
                }
            }).then(function(canvas) {
                const link = document.createElement('a');
                link.download = settings.filename;
                
                if (settings.format === 'jpeg' || settings.format === 'jpg') {
                    link.href = canvas.toDataURL('image/jpeg', settings.quality);
                } else {
                    link.href = canvas.toDataURL('image/png');
                }
                
                link.click();
                showNotification('Stage plot saved as ' + settings.filename);
                
            }).catch(function(error) {
                console.error('Screenshot failed:', error);
                showNotification('Screenshot failed: ' + error.message, 'error');
            }).finally(function() {
                if (modalWasVisible && modal) modal.style.display = 'flex';
                if (toolbar) toolbar.style.opacity = '1';
            });
        }, 100);
    });
}

/**
 * Convert all images in an element to inline data URLs
 * This avoids CORS/tainted canvas issues
 */
async function convertImagesToDataURLs(container) {
    const images = container.querySelectorAll('img');
    const promises = [];
    
    images.forEach(img => {
        // Skip if already a data URL
        if (img.src.startsWith('data:')) return;
        
        const promise = new Promise((resolve) => {
            // Create a new image with crossOrigin to try loading
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = tempImg.naturalWidth || tempImg.width || 60;
                    canvas.height = tempImg.naturalHeight || tempImg.height || 60;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImg, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    img.src = dataURL;
                } catch (e) {
                    console.log('Could not convert image:', img.src);
                }
                resolve();
            };
            
            tempImg.onerror = function() {
                // If crossOrigin fails, try without it (same-origin)
                const tempImg2 = new Image();
                tempImg2.onload = function() {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = tempImg2.naturalWidth || tempImg2.width || 60;
                        canvas.height = tempImg2.naturalHeight || tempImg2.height || 60;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempImg2, 0, 0);
                        const dataURL = canvas.toDataURL('image/png');
                        img.src = dataURL;
                    } catch (e) {
                        console.log('Could not convert image:', img.src);
                    }
                    resolve();
                };
                tempImg2.onerror = () => resolve();
                tempImg2.src = img.src;
            };
            
            // Add cache buster to force fresh load with CORS
            const separator = img.src.includes('?') ? '&' : '?';
            tempImg.src = img.src + separator + '_t=' + Date.now();
        });
        
        promises.push(promise);
    });
    
    await Promise.all(promises);
}

/**
 * Show a temporary notification message
 */
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Capture with custom filename prompt
 */
function captureWithName() {
    const filename = prompt('Enter filename:', 'stage-plot');
    if (filename) {
        capture({ filename: filename + '.png' });
    }
}

/**
 * Copy stage image to clipboard
 */
async function captureToClipboard() {
    const stageArea = document.querySelector('.stage-area') || document.querySelector('.main') || document.querySelector('#stage');
    const modal = document.querySelector('.modal');
    
    if (!stageArea) {
        showNotification('Could not find stage area', 'error');
        return;
    }
    
    if (modal) modal.style.display = 'none';
    
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) toolbar.style.opacity = '0';
    
    showNotification('Preparing...', 'info');
    
    await convertImagesToDataURLs(stageArea);
    
    try {
        const canvas = await html2canvas(stageArea, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#e2e8f0',
            ignoreElements: (element) => {
                return element.classList.contains('no-capture') || 
                       element.classList.contains('toolbar');
            }
        });
        
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showNotification('Stage plot copied to clipboard!');
            } catch (err) {
                console.error('Clipboard write failed:', err);
                showNotification('Failed to copy to clipboard', 'error');
            }
            
            if (modal) modal.style.display = 'flex';
            if (toolbar) toolbar.style.opacity = '1';
        }, 'image/png');
        
    } catch (error) {
        console.error('Capture failed:', error);
        showNotification('Failed to capture: ' + error.message, 'error');
        if (modal) modal.style.display = 'flex';
        if (toolbar) toolbar.style.opacity = '1';
    }
}
