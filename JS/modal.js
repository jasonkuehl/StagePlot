/**
 * Modal Management
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.querySelector('.modal') || document.getElementById('main-modal');
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeBtn = modal ? modal.querySelector('.close') : null;

    // Initialize jQuery UI tabs
    if (typeof $ !== 'undefined' && $('#tabs').length) {
        $('#tabs').tabs({
            classes: {
                'ui-tabs-nav': 'tab-nav',
                'ui-tabs-panel': 'tab-content'
            }
        });
    }

    // Open modal on menu button click
    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            modal.style.display = 'flex';
            if (typeof $ !== 'undefined') {
                $(modal).hide().fadeIn(200);
            }
        });
    }

    // Close modal on X click
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof $ !== 'undefined') {
                $(modal).fadeOut(200);
            } else {
                modal.style.display = 'none';
            }
        });
    }

    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                if (typeof $ !== 'undefined') {
                    $(modal).fadeOut(200);
                } else {
                    modal.style.display = 'none';
                }
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal && modal.style.display !== 'none') {
            if (typeof $ !== 'undefined') {
                $(modal).fadeOut(200);
            } else {
                modal.style.display = 'none';
            }
        }
    });

    // Expose functions globally
    window.showModal = function() {
        if (modal) {
            modal.style.display = 'flex';
            if (typeof $ !== 'undefined') {
                $(modal).hide().fadeIn(200);
            }
        }
    };

    window.hideModal = function() {
        if (modal) {
            if (typeof $ !== 'undefined') {
                $(modal).fadeOut(200);
            } else {
                modal.style.display = 'none';
            }
        }
    };
});
