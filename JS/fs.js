/**
 * Fullscreen Management
 */

function updateFullscreenButton() {
    const button = document.getElementById("fs-button");
    const icon = button ? button.querySelector('i') : null;
    
    if (document.fullscreenElement) {
        if (button) {
            if (icon) {
                icon.className = 'fas fa-compress';
            }
            // Update text if button has text content
            const textNode = Array.from(button.childNodes).find(node => node.nodeType === 3);
            if (textNode) {
                textNode.textContent = ' Exit Fullscreen';
            }
        }
    } else {
        if (button) {
            if (icon) {
                icon.className = 'fas fa-expand';
            }
            const textNode = Array.from(button.childNodes).find(node => node.nodeType === 3);
            if (textNode) {
                textNode.textContent = ' Fullscreen';
            }
        }
    }
}

document.addEventListener("fullscreenchange", updateFullscreenButton);

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
            if (typeof showNotification === 'function') {
                showNotification('Exited fullscreen');
            }
        }).catch(err => {
            console.error('Exit fullscreen failed:', err);
        });
    } else {
        document.documentElement.requestFullscreen().then(() => {
            if (typeof showNotification === 'function') {
                showNotification('Entered fullscreen (press Esc to exit)');
            }
        }).catch(err => {
            console.error('Fullscreen failed:', err);
            if (typeof showNotification === 'function') {
                showNotification('Fullscreen not supported', 'error');
            }
        });
    }
}