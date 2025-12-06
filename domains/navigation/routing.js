/**
 * Page navigation and routing
 */

import { getDOMElements } from '../utils/dom.js';
import { state } from '../state/app-state.js';

let dom = null;

/**
 * Initialize navigation module
 */
export function initNavigation() {
    dom = getDOMElements();
}

/**
 * Show a specific page and hide all others
 * @param {string} pageName - Name of the page to show ('landing', 'timer', 'menu')
 */
export function showPage(pageName) {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.pages || !dom.pages[pageName]) {
        console.error('Cannot show page: DOM elements not available');
        return;
    }
    
    Object.values(dom.pages).forEach(page => {
        if (page) {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        }
    });
    dom.pages[pageName].classList.remove('hidden-page');
    dom.pages[pageName].classList.add('active-page');

    // Show debug controls only on timer page
    if (dom.debugControls) {
        if (pageName === 'timer') {
            dom.debugControls.classList.remove('hidden');
        } else {
            dom.debugControls.classList.add('hidden');
        }
    }

    // Handle menu page animations
    if (pageName === 'menu') {
        handleMenuPageShow();
    }
}

/**
 * Handle menu page show animations and setup
 */
function handleMenuPageShow() {
    // Reset button positions
    // This will be handled by menu-interactions module, but we trigger it here
    // We'll need to import or call the init function from menu-interactions
    
    // Always reset and fade in buttons
    dom.floatButtons.forEach(btn => {
        btn.classList.remove('fade-in');
    });

    // Force reflow to reset the transition state
    dom.floatButtons.forEach(btn => void btn.offsetWidth);

    // Fade in buttons after a brief delay
    setTimeout(() => {
        dom.floatButtons.forEach(btn => btn.classList.add('fade-in'));
    }, 100);

    // Only reset triangle position if it's hidden (first time showing menu page)
    // Don't reset if triangle is already visible (user has moved it)
    if (dom.triangle) {
        // Only reset position if triangle is hidden (hasn't been shown yet)
        if (dom.triangle.classList.contains('hidden')) {
            dom.triangle.style.left = '50%';
            dom.triangle.style.top = '50%';
            state.triangleRotation = 0;
            dom.triangle.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        } else {
            // Triangle is already visible - preserve its rotation by reapplying the transform
            // The position (left/top) is already preserved in the style, but we need to reapply the rotation
            dom.triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;
        }
    }

    // Only show title if it hasn't been dismissed yet
    if (!state.menuTitleHasBeenDismissed) {
        // Reset title
        dom.menuTitle.classList.remove('fade-out');
        dom.menuTitle.classList.remove('fade-in');
        void dom.menuTitle.offsetWidth;

        // Clear any existing timeout
        if (state.menuTitleTimeout) {
            clearTimeout(state.menuTitleTimeout);
        }

        // Fade in title after a brief delay
        setTimeout(() => {
            dom.menuTitle.classList.add('fade-in');
        }, 100);

        // Fade out title after 5 seconds
        state.menuTitleTimeout = setTimeout(() => {
            dom.menuTitle.classList.remove('fade-in');
            dom.menuTitle.classList.add('fade-out');
            state.menuTitleHasBeenDismissed = true; // Mark as dismissed
            
                    // Fade in triangle after title fades out
                    setTimeout(() => {
                        if (dom.triangle) {
                            dom.triangle.classList.remove('hidden');
                            // Apply rotation transform if triangle has been rotated
                            dom.triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;
                            // Force reflow for animation
                            void dom.triangle.offsetWidth;
                            dom.triangle.classList.add('fade-in');
                        }
                    }, 800); // Wait for fade-out animation to complete
        }, 5000);
            } else {
                // Title already dismissed, show triangle immediately
                if (dom.triangle) {
                    dom.triangle.classList.remove('hidden');
                    // Apply rotation transform if triangle has been rotated
                    dom.triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;
                    void dom.triangle.offsetWidth;
                    dom.triangle.classList.add('fade-in');
                }
            }
    
    // Setup triangle movement when menu page is shown
    // This will be handled by menu-interactions module
    if (window.setupTriangleMovement) {
        window.setupTriangleMovement();
    }
}

