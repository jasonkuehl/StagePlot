/**
 * Stage Plot - Drag and Drop Functionality
 * Handles equipment placement, selection, rotation, and deletion
 */

// Track selected item for rotation/deletion
let selectedItem = null;
let copiedItem = null;
let itemCounter = 0;

$(function() {
    // List of equipment IDs
    const equipmentIds = [
        'drums-1-tom', 'drums-3-tom', 'e-guitar', 'b-guitar', 
        'mic-stand', 'mic', 'g-amp', 'b-amp', 'p-board', 
        'keyboard', 'stage-monitor', 'person'
    ];
    
    const equipmentSelector = equipmentIds.map(id => '#' + id).join(', ');
    
    // Click on equipment in sidebar to add to stage
    $(equipmentSelector).on('click', function(event) {
        event.preventDefault();
        addItemToStage($(this));
    });
    
    // Click on text tool to add text to stage
    $('#add-text').on('click', function(event) {
        event.preventDefault();
        addTextToStage();
    });
    
    // Make sidebar a drop zone for deletion
    $('.sidebar, .equipment-list').droppable({
        accept: '.stage-item',
        hoverClass: 'delete-hover',
        tolerance: 'pointer',
        drop: function(event, ui) {
            ui.draggable.fadeOut(200, function() {
                $(this).remove();
                showNotification('Item removed');
            });
        }
    });
    
    // Click on stage to deselect
    $('.stage-area, .drop-zone').on('click', function(e) {
        if (e.target === this || $(e.target).hasClass('stage-area') || $(e.target).hasClass('drop-zone')) {
            deselectAll();
        }
    });
    
    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        // Delete or Backspace to remove selected item
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem && !$(e.target).is('input, textarea, [contenteditable]')) {
            e.preventDefault();
            deleteSelected();
        }
        
        // Escape to deselect
        if (e.key === 'Escape') {
            deselectAll();
        }
        
        // Ctrl+C to copy selected item
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedItem && !$(e.target).is('input, textarea, [contenteditable]')) {
            e.preventDefault();
            copySelected();
        }
        
        // Ctrl+V to paste copied item
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedItem && !$(e.target).is('input, textarea, [contenteditable]')) {
            e.preventDefault();
            pasteItem();
        }
        
        // Arrow keys to nudge selected item
        if (selectedItem && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const nudgeAmount = e.shiftKey ? 10 : 1;
            const pos = $(selectedItem).position();
            
            switch(e.key) {
                case 'ArrowUp':
                    $(selectedItem).css('top', pos.top - nudgeAmount);
                    break;
                case 'ArrowDown':
                    $(selectedItem).css('top', pos.top + nudgeAmount);
                    break;
                case 'ArrowLeft':
                    $(selectedItem).css('left', pos.left - nudgeAmount);
                    break;
                case 'ArrowRight':
                    $(selectedItem).css('left', pos.left + nudgeAmount);
                    break;
            }
        }
        
        // R to rotate selected item
        if (e.key === 'r' || e.key === 'R') {
            if (selectedItem && !$(e.target).is('input, textarea, [contenteditable]')) {
                e.preventDefault();
                rotateSelected(e.shiftKey ? -15 : 15);
            }
        }
    });
});
/**
 * Add a new item to the stage
 */
function addItemToStage($sourceItem) {
    itemCounter++;
    const itemId = $sourceItem.attr('id');
    const itemName = $sourceItem.data('name') || $sourceItem.find('.item-label').text() || itemId;
    
    // Clone the item
    const $clone = $sourceItem.clone();
    
    // Set up the clone as a stage item
    $clone
        .removeAttr('id')
        .addClass('stage-item')
        .attr('data-item-id', itemCounter)
        .attr('data-item-type', itemId)
        .attr('data-rotation', 0)
        .css({
            position: 'absolute',
            cursor: 'move',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            zIndex: itemCounter
        });
    
    // Update label styling for stage
    $clone.find('.item-label').remove();
    
    // Add to drop zone
    const $dropZone = $('#drop-zone');
    if ($dropZone.length) {
        $dropZone.append($clone);
    } else {
        $('.stage-area').append($clone);
    }
    
    // Center position after append
    setTimeout(() => {
        const stageWidth = $dropZone.width() || $('.stage-area').width();
        const stageHeight = $dropZone.height() || $('.stage-area').height();
        const itemWidth = $clone.outerWidth();
        const itemHeight = $clone.outerHeight();
        
        $clone.css({
            left: (stageWidth / 2 - itemWidth / 2) + 'px',
            top: (stageHeight / 2 - itemHeight / 2) + 'px',
            transform: 'none'
        });
    }, 10);
    
    // Make draggable
    $clone.draggable({
        containment: 'parent',
        scroll: false,
        start: function(event, ui) {
            $(this).addClass('dragging');
            selectItem(this);
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });
    
    // Make resizable
    $clone.resizable({
        aspectRatio: true,
        handles: 'se',
        minWidth: 30,
        minHeight: 30,
        start: function(event, ui) {
            selectItem(this);
        }
    });
    
    // Click to select
    $clone.on('click', function(e) {
        e.stopPropagation();
        selectItem(this);
    });
    
    // Double-click to rotate
    $clone.on('dblclick', function(e) {
        e.stopPropagation();
        selectItem(this);
        rotateSelected(15);
    });
    
    // Select the new item
    selectItem($clone[0]);
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Added ${itemName}`);
    }
}

/**
 * Select an item
 */
function selectItem(item) {
    deselectAll();
    selectedItem = item;
    $(item).addClass('selected');
}

/**
 * Deselect all items
 */
function deselectAll() {
    $('.stage-item').removeClass('selected');
    selectedItem = null;
}

/**
 * Rotate selected item by degrees
 */
function rotateSelected(degrees) {
    if (!selectedItem) {
        if (typeof showNotification === 'function') {
            showNotification('Select an item to rotate', 'warning');
        }
        return;
    }
    
    const $item = $(selectedItem);
    let currentRotation = parseInt($item.attr('data-rotation')) || 0;
    currentRotation += degrees;
    
    // Normalize rotation to 0-360
    currentRotation = ((currentRotation % 360) + 360) % 360;
    
    $item.attr('data-rotation', currentRotation);
    $item.css('transform', `rotate(${currentRotation}deg)`);
}

/**
 * Resize selected item by scale factor
 */
function resizeSelected(scale) {
    if (!selectedItem) {
        if (typeof showNotification === 'function') {
            showNotification('Select an item to resize', 'warning');
        }
        return;
    }
    
    const $item = $(selectedItem);
    const currentWidth = $item.width();
    const currentHeight = $item.height();
    
    const newWidth = Math.max(30, currentWidth * scale);
    const newHeight = Math.max(30, currentHeight * scale);
    
    $item.css({
        width: newWidth + 'px',
        height: newHeight + 'px'
    });
}

/**
 * Copy selected item
 */
function copySelected() {
    if (!selectedItem) {
        if (typeof showNotification === 'function') {
            showNotification('Select an item to copy', 'warning');
        }
        return;
    }
    
    // Store the item data for pasting
    const $item = $(selectedItem);
    copiedItem = {
        html: $item.clone().removeClass('selected ui-draggable ui-draggable-handle ui-resizable')[0].outerHTML,
        width: $item.width(),
        height: $item.height(),
        rotation: $item.attr('data-rotation') || 0
    };
    
    if (typeof showNotification === 'function') {
        showNotification('Item copied (Ctrl+V to paste)');
    }
}

/**
 * Paste copied item
 */
function pasteItem() {
    if (!copiedItem) {
        if (typeof showNotification === 'function') {
            showNotification('Nothing to paste', 'warning');
        }
        return;
    }
    
    itemCounter++;
    
    // Create new item from copied data
    const $newItem = $(copiedItem.html);
    
    // Remove any existing jQuery UI classes/wrappers
    $newItem.find('.ui-resizable-handle').remove();
    
    // Set new position (offset from original)
    const $dropZone = $('#drop-zone');
    const stageWidth = $dropZone.width() || $('.stage-area').width();
    const stageHeight = $dropZone.height() || $('.stage-area').height();
    
    $newItem
        .attr('data-item-id', itemCounter)
        .css({
            position: 'absolute',
            left: (stageWidth / 2 - copiedItem.width / 2 + 20) + 'px',
            top: (stageHeight / 2 - copiedItem.height / 2 + 20) + 'px',
            width: copiedItem.width + 'px',
            height: copiedItem.height + 'px',
            transform: `rotate(${copiedItem.rotation}deg)`,
            zIndex: itemCounter
        });
    
    // Add to drop zone
    if ($dropZone.length) {
        $dropZone.append($newItem);
    } else {
        $('.stage-area').append($newItem);
    }
    
    // Make draggable
    $newItem.draggable({
        containment: 'parent',
        scroll: false,
        start: function(event, ui) {
            $(this).addClass('dragging');
            selectItem(this);
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });
    
    // Make resizable if not a text item
    if (!$newItem.hasClass('text-item')) {
        $newItem.resizable({
            aspectRatio: true,
            handles: 'se',
            minWidth: 30,
            minHeight: 30,
            start: function(event, ui) {
                selectItem(this);
            }
        });
    }
    
    // Click to select
    $newItem.on('click', function(e) {
        e.stopPropagation();
        selectItem(this);
    });
    
    // Double-click behavior
    if ($newItem.hasClass('text-item')) {
        $newItem.on('dblclick', function(e) {
            e.stopPropagation();
            const $content = $(this).find('.text-content');
            $content.focus();
            const range = document.createRange();
            range.selectNodeContents($content[0]);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
    } else {
        $newItem.on('dblclick', function(e) {
            e.stopPropagation();
            selectItem(this);
            rotateSelected(15);
        });
    }
    
    // Select the new item
    selectItem($newItem[0]);
    
    if (typeof showNotification === 'function') {
        showNotification('Item pasted');
    }
}

/**
 * Delete selected item
 */
function deleteSelected() {
    if (!selectedItem) {
        if (typeof showNotification === 'function') {
            showNotification('Select an item to delete', 'warning');
        }
        return;
    }
    
    $(selectedItem).fadeOut(200, function() {
        $(this).remove();
        if (typeof showNotification === 'function') {
            showNotification('Item deleted');
        }
    });
    
    selectedItem = null;
}

/**
 * Clear all items from the stage
 */
function clearStage() {
    const $items = $('.stage-item');
    
    if ($items.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('Stage is already empty');
        }
        return;
    }
    
    if (confirm('Remove all items from the stage?')) {
        $items.fadeOut(200, function() {
            $(this).remove();
        });
        
        selectedItem = null;
        
        if (typeof showNotification === 'function') {
            showNotification('Stage cleared');
        }
    }
}

/**
 * Clear background image
 */
function clearBackground() {
    const stageArea = document.querySelector('.stage-area');
    if (stageArea) {
        stageArea.style.backgroundImage = '';
        if (typeof showNotification === 'function') {
            showNotification('Background removed');
        }
    }
}

/**
 * Add text label to the stage
 */
function addTextToStage(defaultText) {
    // Prompt for text if not provided
    const text = defaultText || prompt('Enter text label:', 'Label');
    
    if (!text || text.trim() === '') {
        return;
    }
    
    itemCounter++;
    
    // Create text item
    const $textItem = $('<div>')
        .addClass('stage-item text-item')
        .attr('data-item-id', itemCounter)
        .attr('data-item-type', 'text-label')
        .attr('data-rotation', 0)
        .css({
            position: 'absolute',
            cursor: 'move',
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            zIndex: itemCounter
        });
    
    // Create editable text content
    const $textContent = $('<span>')
        .addClass('text-content')
        .attr('contenteditable', 'true')
        .text(text);
    
    $textItem.append($textContent);
    
    // Add to drop zone
    const $dropZone = $('#drop-zone');
    if ($dropZone.length) {
        $dropZone.append($textItem);
    } else {
        $('.stage-area').append($textItem);
    }
    
    // Center position after append
    setTimeout(() => {
        const stageWidth = $dropZone.width() || $('.stage-area').width();
        const stageHeight = $dropZone.height() || $('.stage-area').height();
        const itemWidth = $textItem.outerWidth();
        const itemHeight = $textItem.outerHeight();
        
        $textItem.css({
            left: (stageWidth / 2 - itemWidth / 2) + 'px',
            top: (stageHeight / 2 - itemHeight / 2) + 'px',
            transform: 'none'
        });
    }, 10);
    
    // Make draggable
    $textItem.draggable({
        containment: 'parent',
        scroll: false,
        cancel: '.text-content:focus', // Don't drag when editing text
        start: function(event, ui) {
            $(this).addClass('dragging');
            selectItem(this);
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });
    
    // Click to select
    $textItem.on('click', function(e) {
        e.stopPropagation();
        selectItem(this);
    });
    
    // Double-click to edit text
    $textItem.on('dblclick', function(e) {
        e.stopPropagation();
        const $content = $(this).find('.text-content');
        $content.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents($content[0]);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });
    
    // Prevent drag when editing
    $textContent.on('mousedown', function(e) {
        if (document.activeElement === this) {
            e.stopPropagation();
        }
    });
    
    // Stop editing on Enter (but allow Shift+Enter for line breaks)
    $textContent.on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            $(this).blur();
        }
    });
    
    // Select the new item
    selectItem($textItem[0]);
    
    if (typeof showNotification === 'function') {
        showNotification('Text label added');
    }
}

// Expose functions to global scope for onclick handlers
window.addTextToStage = addTextToStage;
window.rotateSelected = rotateSelected;
window.resizeSelected = resizeSelected;
window.copySelected = copySelected;
window.pasteItem = pasteItem;
window.deleteSelected = deleteSelected;
window.clearStage = clearStage;
window.clearBackground = clearBackground;

// Add delete hover style (wrapped in document ready)
$(function() {
    $('<style>')
        .text(`
            .sidebar.delete-hover,
            .equipment-list.delete-hover {
                background: linear-gradient(180deg, #7f1d1d 0%, #450a0a 100%) !important;
            }
            .sidebar.delete-hover::after {
                content: 'Drop to delete';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 1rem;
                font-weight: 600;
                pointer-events: none;
                z-index: 1000;
            }
        `)
        .appendTo('head');
});