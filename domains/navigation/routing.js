/**
 * Page navigation and routing
 * 
 * @typedef {import('../../src/types/dom.js').PageName} PageName
 * @typedef {import('../../src/types/dom.js').DOMElements} DOMElements
 * @typedef {import('../../src/types/state.js').AppState} AppState
 */

import { getDOMElements } from '../../src/shared/utils/dom-elements.js';
import { state } from '../../src/shared/state/app-state.js';
import { waitForTransition, waitForAnimation, waitForTransitionsSequentially, getTransitionQueue } from '../../src/shared/utils/transitions.js';
import { CSS_CLASSES, TRANSITION_TIMEOUTS } from '../../src/shared/constants.js';

let dom = null;

/**
 * Initialize navigation module
 * @returns {void}
 */
export function initNavigation() {
    dom = getDOMElements();
}

/**
 * Show a specific page and hide all others with coordinated transitions
 * @param {PageName} pageName - Name of the page to show
 * @returns {Promise<void>}
 */
export async function showPage(pageName) {
    console.log('showPage called with:', pageName);
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.pages || !dom.pages[pageName]) {
        console.error('Cannot show page: DOM elements not available', { dom, pageName, pages: dom?.pages });
        return;
    }
    
    console.log('showPage: Starting transition queue');
    const transitionQueue = getTransitionQueue();
    
    // Use queue to serialize page transitions
    await transitionQueue.enqueue(async () => {
        console.log('showPage: Transition queue executing');
        // Find currently active page
        const currentPage = Object.values(dom.pages).find(page => 
            page && page.classList.contains(CSS_CLASSES.ACTIVE_PAGE)
        );
        
        console.log('showPage: Current active page:', currentPage?.id);
        
        // Hide current page immediately (pages don't have fade-out animation currently)
        // Remove active-page class first, then hide
        if (currentPage && currentPage !== dom.pages[pageName]) {
            console.log('showPage: Hiding current page:', currentPage.id);
            currentPage.classList.remove(CSS_CLASSES.ACTIVE_PAGE);
            // Small delay to ensure class removal is processed
            await new Promise(resolve => requestAnimationFrame(resolve));
            currentPage.classList.add('hidden-page');
        }
        
        // Show new page
        const targetPage = dom.pages[pageName];
        console.log('showPage: Showing target page:', targetPage?.id);
        if (targetPage.classList.contains('hidden-page')) {
            targetPage.classList.remove('hidden-page');
        }
        // Force reflow to ensure the page is visible before adding active-page
        void targetPage.offsetWidth;
        
        // Add active-page class which triggers fadeIn animation
        // Listen for animation before adding class to ensure we catch the event
        console.log('showPage: Setting up animation listener');
        const animationPromise = waitForAnimation(targetPage, 'fadeIn', TRANSITION_TIMEOUTS.DEFAULT);
        targetPage.classList.add(CSS_CLASSES.ACTIVE_PAGE);
        console.log('showPage: Added active-page class, waiting for animation');
        
        // Wait for page fade-in animation
        await animationPromise;
        console.log('showPage: Animation completed');
    });

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
        console.log('showPage: Handling menu page animations');
        try {
            await handleMenuPageShow();
            console.log('showPage: Menu page animations completed');
        } catch (error) {
            console.error('showPage: Error in handleMenuPageShow:', error);
            throw error;
        }
    }
    console.log('showPage: Completed successfully for:', pageName);
}

/**
 * Handle menu page show animations and setup
 * @returns {Promise<void>}
 */
async function handleMenuPageShow() {
    try {
        // Ensure menu-content is visible (remove fade-out if present)
        if (dom.menuContent) {
            dom.menuContent.classList.remove(CSS_CLASSES.FADE_OUT);
        }
        
        // Reset button positions
        // This will be handled by menu-interactions module, but we trigger it here
        // We'll need to import or call the init function from menu-interactions
        
        // Always reset and fade in buttons
        dom.floatButtons.forEach(btn => {
            btn.classList.remove(CSS_CLASSES.FADE_IN);
        });

        // Force reflow to reset the transition state
        dom.floatButtons.forEach(btn => void btn.offsetWidth);

        // Wait for page fade-in to complete, then fade in buttons
        // Use requestAnimationFrame to ensure DOM is ready
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Fade in buttons - ensure they become visible even if transition fails
        dom.floatButtons.forEach(btn => {
            btn.classList.add(CSS_CLASSES.FADE_IN);
        });
        
        // Wait a short time for buttons to become visible, then continue
        // This ensures buttons are visible even if transition events don't fire
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Wait for all button transitions to complete (but don't block if it fails)
        try {
            const buttonTransitions = dom.floatButtons.map(btn => ({
                element: btn,
                property: 'opacity'
            }));
            await Promise.race([
                waitForTransitionsSequentially(buttonTransitions),
                new Promise(resolve => setTimeout(resolve, 1000)) // Max 1 second wait
            ]);
        } catch (error) {
            console.warn('Button transition waiting failed, continuing anyway:', error);
        }

        // Only reset triangle position if it's hidden (first time showing menu page)
        // Don't reset if triangle is already visible (user has moved it)
        if (dom.triangle) {
            // Only reset position if triangle is hidden (hasn't been shown yet)
            if (dom.triangle.classList.contains(CSS_CLASSES.HIDDEN)) {
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
            dom.menuTitle.classList.remove(CSS_CLASSES.FADE_OUT);
            dom.menuTitle.classList.remove(CSS_CLASSES.FADE_IN);
            void dom.menuTitle.offsetWidth;

            // Clear any existing timeout
            if (state.menuTitleTimeout) {
                clearTimeout(state.menuTitleTimeout);
            }

            // Fade in title
            await new Promise(resolve => requestAnimationFrame(resolve));
            dom.menuTitle.classList.add(CSS_CLASSES.FADE_IN);
            await waitForTransition(dom.menuTitle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);

            // Fade out title after 5 seconds
            state.menuTitleTimeout = setTimeout(() => {
                // Use async IIFE since setTimeout callback can't be async
                (async () => {
                    try {
                        dom.menuTitle.classList.remove(CSS_CLASSES.FADE_IN);
                        dom.menuTitle.classList.add(CSS_CLASSES.FADE_OUT);
                        await waitForTransition(dom.menuTitle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
                        state.menuTitleHasBeenDismissed = true; // Mark as dismissed
                        
                        // Fade in triangle after title fades out
                        if (dom.triangle) {
                            dom.triangle.classList.remove(CSS_CLASSES.HIDDEN);
                            // Apply rotation transform if triangle has been rotated
                            dom.triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;
                            // Force reflow for animation
                            void dom.triangle.offsetWidth;
                            dom.triangle.classList.add(CSS_CLASSES.FADE_IN);
                            await waitForTransition(dom.triangle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
                        }
                    } catch (error) {
                        console.warn('Error in title fade-out sequence:', error);
                    }
                })();
            }, 5000);
        } else {
            // Title already dismissed, show triangle immediately
            if (dom.triangle) {
                try {
                    dom.triangle.classList.remove(CSS_CLASSES.HIDDEN);
                    // Apply rotation transform if triangle has been rotated
                    dom.triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;
                    void dom.triangle.offsetWidth;
                    dom.triangle.classList.add(CSS_CLASSES.FADE_IN);
                    await waitForTransition(dom.triangle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
                } catch (error) {
                    console.warn('Error showing triangle:', error);
                }
            }
        }
        
        // Setup triangle movement when menu page is shown
        // This will be handled by menu-interactions module
        if (window.setupTriangleMovement) {
            window.setupTriangleMovement();
        }
    } catch (error) {
        console.error('Error in handleMenuPageShow:', error);
        // Ensure menu content is at least visible even if animations fail
        if (dom.menuContent) {
            dom.menuContent.classList.remove(CSS_CLASSES.FADE_OUT);
        }
        // Make buttons visible as fallback
        dom.floatButtons.forEach(btn => {
            btn.classList.add(CSS_CLASSES.FADE_IN);
        });
    }
}

