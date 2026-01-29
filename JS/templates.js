/**
 * Stage Templates - Auto-loads from Images/stages/ folder
 * Just drop images in the folder and refresh - no scripts needed!
 */

// Built-in stage template (blank)
const stageTemplates = {
    'blank': {
        name: 'Blank Stage',
        description: 'Plain stage - no background',
        image: null
    }
};

/**
 * Load a stage template (changes background image)
 */
function loadStageTemplate(templateId) {
    const template = stageTemplates[templateId];
    
    if (!template) {
        // Try loading as a direct image path for dynamically discovered stages
        setStageBackground(templateId, templateId);
        return;
    }
    
    if (template.image) {
        setStageBackground(template.image, template.name);
    } else {
        clearStageBackground();
    }
}

/**
 * Set stage background image
 */
function setStageBackground(imagePath, name) {
    const dropZone = document.getElementById('drop-zone');
    const stageArea = document.querySelector('.stage-area');
    const target = dropZone || stageArea;
    
    if (!target) return;
    
    target.style.backgroundImage = `url('${imagePath}')`;
    target.style.backgroundSize = '100% 100%';
    target.style.backgroundPosition = 'center';
    target.style.backgroundRepeat = 'no-repeat';
    
    if (typeof showNotification === 'function') {
        showNotification(`Stage: ${name}`);
    }
    
    localStorage.setItem('stageplot-template', imagePath);
}

/**
 * Clear stage background
 */
function clearStageBackground() {
    const dropZone = document.getElementById('drop-zone');
    const stageArea = document.querySelector('.stage-area');
    const target = dropZone || stageArea;
    
    if (target) {
        target.style.backgroundImage = '';
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Blank stage selected');
    }
    
    localStorage.setItem('stageplot-template', 'blank');
}

/**
 * Auto-discover stages from Images/stages/ folder
 * Uses manifest.json for GitHub Pages compatibility, falls back to directory listing
 */
async function discoverStages() {
    const select = document.getElementById('stage-select');
    if (!select) return;
    
    try {
        // First try manifest.json (works on GitHub Pages)
        let images = [];
        
        try {
            const manifestResponse = await fetch('./Images/stages/manifest.json');
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                if (manifest.images && Array.isArray(manifest.images)) {
                    images = manifest.images;
                }
            }
        } catch (e) {
            // manifest.json not available, try directory listing
        }
        
        // Fall back to directory listing (works on nginx)
        if (images.length === 0) {
            const response = await fetch('./Images/stages/');
            
            if (response.ok) {
                const html = await response.text();
                
                // Parse image links from directory listing
                const imageExtensions = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
                const linkRegex = /href=["']([^"']+)["']/gi;
                let match;
                
                while ((match = linkRegex.exec(html)) !== null) {
                    const href = match[1];
                    if (imageExtensions.test(href)) {
                        const filename = href.split('/').pop();
                        images.push(filename);
                    }
                }
                
                // Also try parsing as JSON (nginx autoindex format)
                try {
                    const json = JSON.parse(html);
                    if (Array.isArray(json)) {
                        json.forEach(item => {
                            const name = typeof item === 'string' ? item : item.name;
                            if (name && imageExtensions.test(name)) {
                                images.push(name);
                            }
                        });
                    }
                } catch (e) {
                    // Not JSON, that's fine
                }
            }
        }
        
        if (images.length === 0) {
            return;
        }
        
        // Remove duplicates
        const uniqueImages = [...new Set(images)];
        
        // Add separator if we have stages
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '── Stages ──';
        select.appendChild(separator);
        
        // Add each discovered stage
        uniqueImages.sort().forEach(filename => {
            const name = filenameToDisplayName(filename);
            const path = `./Images/stages/${filename}`;
            
            // Add to templates object
            stageTemplates[path] = {
                name: name,
                image: path
            };
            
            // Add to dropdown
            const option = document.createElement('option');
            option.value = path;
            option.textContent = name;
            select.appendChild(option);
        });
        
    } catch (error) {
        // Stage discovery failed silently
    }
}

/**
 * Convert filename to display name
 * "my-cool-stage.png" -> "My Cool Stage"
 */
function filenameToDisplayName(filename) {
    return filename
        .replace(/\.[^.]+$/, '')  // Remove extension
        .replace(/[-_]/g, ' ')     // Replace dashes/underscores with spaces
        .replace(/\b\w/g, c => c.toUpperCase());  // Title case
}

/**
 * Equipment Search Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('equipment-search');
    const clearBtn = document.getElementById('search-clear');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        filterEquipment(query);
        if (clearBtn) {
            clearBtn.style.display = query ? 'flex' : 'none';
        }
    });
    
    if (clearBtn) {
        clearBtn.style.display = 'none';
        clearBtn.addEventListener('click', function() {
            searchInput.value = '';
            filterEquipment('');
            this.style.display = 'none';
            searchInput.focus();
        });
    }
    
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            filterEquipment('');
            if (clearBtn) clearBtn.style.display = 'none';
            this.blur();
        }
    });
    
    // Ctrl+F or / to focus search
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && e.key === 'f') || (e.key === '/' && !e.target.matches('input, textarea, [contenteditable]'))) {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });
});

/**
 * Filter equipment items based on search query
 */
function filterEquipment(query) {
    const items = document.querySelectorAll('.equipment-item');
    const categories = document.querySelectorAll('.equipment-category');
    
    if (!query) {
        items.forEach(item => {
            item.style.display = '';
            item.classList.remove('search-highlight');
        });
        categories.forEach(cat => cat.style.display = '');
        return;
    }
    
    const visibleCategories = new Set();
    
    items.forEach(item => {
        const name = (item.getAttribute('data-name') || '').toLowerCase();
        const keywords = (item.getAttribute('data-keywords') || '').toLowerCase();
        const label = (item.querySelector('.item-label')?.textContent || '').toLowerCase();
        
        const matches = name.includes(query) || keywords.includes(query) || label.includes(query);
        
        if (matches) {
            item.style.display = '';
            item.classList.add('search-highlight');
            const category = item.closest('.equipment-category');
            if (category) visibleCategories.add(category);
        } else {
            item.style.display = 'none';
            item.classList.remove('search-highlight');
        }
    });
    
    categories.forEach(cat => {
        cat.style.display = visibleCategories.has(cat) ? '' : 'none';
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Discover stages from folder
    discoverStages();
    
    // Restore saved template
    setTimeout(() => {
        const savedTemplate = localStorage.getItem('stageplot-template');
        const select = document.getElementById('stage-select');
        
        if (savedTemplate && savedTemplate !== 'blank' && select) {
            // Try to select it
            const option = select.querySelector(`option[value="${savedTemplate}"]`);
            if (option) {
                select.value = savedTemplate;
                loadStageTemplate(savedTemplate);
            }
        }
    }, 500);
});
