/**
 * Custom Equipment Loader
 * Auto-discovers equipment from Images/custom/ folder
 * Uses manifest.json for GitHub Pages compatibility, falls back to directory listing
 */

(function() {
    'use strict';
    
    const CUSTOM_FOLDER = './Images/custom/';
    
    /**
     * Auto-discover custom equipment from folder
     */
    async function discoverCustomEquipment() {
        try {
            let images = [];
            const imageExtensions = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
            
            // First try manifest.json (works on GitHub Pages)
            try {
                const manifestResponse = await fetch(CUSTOM_FOLDER + 'manifest.json');
                if (manifestResponse.ok) {
                    const manifest = await manifestResponse.json();
                    if (manifest.images && Array.isArray(manifest.images)) {
                        images = manifest.images.filter(name => 
                            imageExtensions.test(name) && !name.toLowerCase().includes('readme')
                        );
                    }
                }
            } catch (e) {
                // manifest.json not available, try directory listing
            }
            
            // Fall back to directory listing (works on nginx)
            if (images.length === 0) {
                const response = await fetch(CUSTOM_FOLDER);
                
                if (response.ok) {
                    const html = await response.text();
                    
                    // Parse image links from directory listing
                    const linkRegex = /href=["']([^"']+)["']/gi;
                    let match;
                    
                    while ((match = linkRegex.exec(html)) !== null) {
                        const href = match[1];
                        if (imageExtensions.test(href)) {
                            const filename = href.split('/').pop();
                            if (!filename.toLowerCase().includes('readme')) {
                                images.push(filename);
                            }
                        }
                    }
                    
                    // Also try parsing as JSON (nginx autoindex format)
                    try {
                        const json = JSON.parse(html);
                        if (Array.isArray(json)) {
                            json.forEach(item => {
                                const name = typeof item === 'string' ? item : item.name;
                                if (name && imageExtensions.test(name) && !name.toLowerCase().includes('readme')) {
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
            
            // Create equipment items
            const items = uniqueImages.map(filename => ({
                id: 'custom-' + filename.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: filenameToDisplayName(filename),
                image: filename,
                keywords: filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
            }));
            
            createCustomCategory(items);
            
        } catch (error) {
            // Custom equipment discovery failed silently
        }
    }
    
    /**
     * Convert filename to display name
     */
    function filenameToDisplayName(filename) {
        return filename
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
    
    /**
     * Create the custom equipment category in the sidebar
     */
    function createCustomCategory(items) {
        const equipmentList = document.getElementById('equipment-panel');
        if (!equipmentList) return;
        
        // Check if custom category already exists
        let customCategory = document.querySelector('.equipment-category[data-category="custom"]');
        
        if (!customCategory) {
            customCategory = document.createElement('div');
            customCategory.className = 'equipment-category';
            customCategory.setAttribute('data-category', 'custom');
            
            const header = document.createElement('h4');
            header.innerHTML = '<i class="fas fa-star" style="margin-right: 6px; color: #fbbf24;"></i>Custom';
            customCategory.appendChild(header);
            
            // Insert at the top
            equipmentList.insertBefore(customCategory, equipmentList.firstChild);
        } else {
            // Clear existing items (keep header)
            const header = customCategory.querySelector('h4');
            customCategory.innerHTML = '';
            if (header) customCategory.appendChild(header);
        }
        
        // Add items
        items.forEach(item => {
            const element = createEquipmentItem(item);
            customCategory.appendChild(element);
        });
        
        // Initialize draggable
        initializeCustomItems();
    }
    
    /**
     * Create an equipment item element
     */
    function createEquipmentItem(item) {
        const div = document.createElement('div');
        div.className = 'equipment-item';
        div.id = item.id;
        div.setAttribute('data-name', item.name);
        div.setAttribute('data-keywords', item.keywords + ' custom');
        div.setAttribute('data-custom', 'true');
        
        const img = document.createElement('img');
        img.src = CUSTOM_FOLDER + item.image;
        img.alt = item.name;
        img.draggable = false;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.onerror = function() {
            this.src = 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                    <rect fill="#374151" width="60" height="60" rx="8"/>
                    <text x="30" y="35" text-anchor="middle" fill="#9ca3af" font-size="10">?</text>
                </svg>
            `);
        };
        
        const label = document.createElement('span');
        label.className = 'item-label';
        label.textContent = item.name;
        
        div.appendChild(img);
        div.appendChild(label);
        
        return div;
    }
    
    /**
     * Initialize draggable functionality for custom items
     */
    function initializeCustomItems() {
        if (typeof $ === 'undefined' || typeof $.fn.draggable === 'undefined') {
            setTimeout(initializeCustomItems, 100);
            return;
        }
        
        const customItems = document.querySelectorAll('.equipment-item[data-custom="true"]');
        
        customItems.forEach(item => {
            const $item = $(item);
            if ($item.data('custom-initialized')) return;
            
            $item.on('click', function(event) {
                event.preventDefault();
                if (typeof addItemToStage === 'function') {
                    addItemToStage($(this));
                }
            });
            
            $item.data('custom-initialized', true);
        });
    }
    
    // Expose reload function
    window.reloadCustomEquipment = discoverCustomEquipment;
    
    // Load on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', discoverCustomEquipment);
    } else {
        setTimeout(discoverCustomEquipment, 100);
    }
    
})();
