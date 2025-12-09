/**
 * Page navigation and routing
 * 
 * @typedef {import('../../../shared/types/dom.js').PageName} PageName
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

import { getDOMElements } from '../../utils/dom-elements.js';
import { state, getState, setState } from '../../state/app-state.js';
import { CSS_CLASSES, PAGES, TRANSITION_TIMEOUTS } from '../../../shared/constants.js';
import { showElement, hideElement, removeClass, addClass } from '../../utils/dom-helpers.js';
import { waitForTransition, waitForAnimation, waitForTransitionsSequentially, getTransitionQueue } from '../../../shared/utils/transitions.js';
import { moduleRegistry } from '../../utils/module-registry.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

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
        handleError('Cannot show page: DOM elements not available', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'routing.js', function: 'showPage', data: { pageName, pages: dom?.pages } }
        });
        return;
    }
    
    const transitionQueue = getTransitionQueue();
    
    // Use queue to serialize page transitions
    await transitionQueue.enqueue(async () => {
        console.log('showPage: Transition queue executing');
        // Find currently active page
        const currentPage = Object.values(dom.pages).find(page => 
            page && page.classList.contains(CSS_CLASSES.ACTIVE_PAGE)
        );
        
        console.log('showPage: Current active page:', currentPage?.id);
        
        // Hide current page
        if (currentPage && currentPage !== dom.pages[pageName]) {
            console.log('showPage: Hiding current page:', currentPage.id);
            removeClass(currentPage, CSS_CLASSES.ACTIVE_PAGE);
            await new Promise(resolve => requestAnimationFrame(resolve));
            // Check if page uses 'hidden-page' class or 'hidden' class
            if (currentPage.classList.contains('hidden-page')) {
                // Already has hidden-page, do nothing
            } else {
                addClass(currentPage, 'hidden-page');
            }
        }
        
        // Show new page
        const targetPage = dom.pages[pageName];
        console.log('showPage: Showing target page:', targetPage?.id);
        console.log('showPage: Target page classes before:', targetPage?.className);
        if (targetPage.classList.contains('hidden-page')) {
            console.log('showPage: Removing hidden-page class');
            removeClass(targetPage, 'hidden-page');
        } else if (targetPage.classList.contains(CSS_CLASSES.HIDDEN)) {
            console.log('showPage: Removing hidden class');
            removeClass(targetPage, CSS_CLASSES.HIDDEN);
        }
        // Force reflow
        void targetPage.offsetWidth;
        console.log('showPage: Adding active-page class');
        addClass(targetPage, CSS_CLASSES.ACTIVE_PAGE);
        console.log('showPage: Target page classes after:', targetPage?.className);
        console.log('showPage: Target page computed display:', window.getComputedStyle(targetPage).display);
        
        // Wait for page fade-in animation
        console.log('showPage: Setting up animation listener');
        const animationPromise = waitForAnimation(targetPage, 'fadeIn', TRANSITION_TIMEOUTS.DEFAULT);
        // Don't block on animation - use race with shorter timeout for menu page
        if (pageName === PAGES.MENU) {
            // For menu page, don't wait for animation - proceed immediately to show content
            console.log('showPage: Menu page - skipping animation wait');
            await Promise.race([
                animationPromise,
                new Promise(resolve => setTimeout(resolve, 100)) // Max 100ms wait
            ]);
        } else {
            await animationPromise;
        }
        console.log('showPage: Animation completed');
    });

    // Handle timer page reset
    if (pageName === PAGES.TIMER) {
        // Reset timer display when navigating to timer page
        const resetTimerDisplay = moduleRegistry.get('resetTimerDisplay') || window.resetTimerDisplay;
        if (resetTimerDisplay) {
            resetTimerDisplay();
        }
        
        // Force animations to restart by removing and re-adding them
        // This ensures elements are visible even if animations don't run
        requestAnimationFrame(() => {
            const timerPage = dom.pages[pageName];
            if (timerPage) {
                const h2 = timerPage.querySelector('h2');
                const timerControls = timerPage.querySelector('#timer-controls');
                const iconBtn = timerPage.querySelector('.icon-btn');
                
                // Force reflow to reset animation state and restart animations
                if (h2) {
                    h2.style.animation = 'none';
                    void h2.offsetWidth; // Force reflow
                    h2.style.animation = null; // Remove inline style to reapply CSS
                }
                if (timerControls) {
                    timerControls.style.animation = 'none';
                    void timerControls.offsetWidth; // Force reflow
                    timerControls.style.animation = null; // Remove inline style to reapply CSS
                }
                if (iconBtn) {
                    iconBtn.style.animation = 'none';
                    void iconBtn.offsetWidth; // Force reflow
                    iconBtn.style.animation = null; // Remove inline style to reapply CSS
                }
            }
        });
    }

    // Handle menu page animations
    if (pageName === PAGES.MENU) {
        console.log('showPage: Handling menu page animations');
        try {
            await handleMenuPageShow();
            console.log('showPage: Menu page animations completed');
        } catch (error) {
            handleError(error, {
                severity: ERROR_SEVERITY.ERROR,
                context: { module: 'routing.js', function: 'showPage.handleMenuPageShow' }
            });
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
    console.log('handleMenuPageShow: Starting');
    try {
        // Refresh DOM elements to ensure we have the latest references
        // This is important in case elements were added dynamically or DOM wasn't ready initially
        dom = getDOMElements();
        console.log('handleMenuPageShow: DOM refreshed', {
            menuContent: !!dom.menuContent,
            menuTitle: !!dom.menuTitle,
            floatButtonsCount: dom.floatButtons?.length || 0
        });
        
        // Ensure menu-content is visible (remove fade-out if present)
        if (dom.menuContent) {
            console.log('handleMenuPageShow: Removing fade-out from menu-content');
            removeClass(dom.menuContent, CSS_CLASSES.FADE_OUT);
            console.log('handleMenuPageShow: menu-content classes:', dom.menuContent.className);
        } else {
            console.error('handleMenuPageShow: menuContent is null!');
        }
        
        // Reset button positions
        // This will be handled by menu-interactions module, but we trigger it here
        // We'll need to import or call the init function from menu-interactions
        
        // Always reset and fade in buttons - check if buttons exist
        if (dom.floatButtons && dom.floatButtons.length > 0) {
            console.log('handleMenuPageShow: Found', dom.floatButtons.length, 'float buttons');
            dom.floatButtons.forEach(btn => {
                removeClass(btn, CSS_CLASSES.FADE_IN);
            });

            // Force reflow to reset the transition state
            dom.floatButtons.forEach(btn => void btn.offsetWidth);

            // Wait for page fade-in to complete, then fade in buttons
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Fade in buttons
            console.log('handleMenuPageShow: Adding fade-in to buttons');
            dom.floatButtons.forEach(btn => {
                addClass(btn, CSS_CLASSES.FADE_IN);
                console.log('handleMenuPageShow: Button', btn.id, 'classes:', btn.className);
            });
            
            // Wait a short time for buttons to become visible
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Wait for all button transitions to complete (but don't block if it fails)
            try {
                const buttonTransitions = Array.from(dom.floatButtons).map(btn => ({
                    element: btn,
                    property: 'opacity'
                }));
                await Promise.race([
                    waitForTransitionsSequentially(buttonTransitions),
                    new Promise(resolve => setTimeout(resolve, 1000)) // Max 1 second wait
                ]);
            } catch (error) {
                handleError(error, {
                    severity: ERROR_SEVERITY.WARNING,
                    context: { module: 'routing.js', function: 'showPage.waitForButtonTransitions' }
                });
            }
        }

    // Only show title if it hasn't been dismissed yet
    if (!getState('menuTitleHasBeenDismissed')) {
        console.log('handleMenuPageShow: Title not dismissed, showing it');
        // Reset title - check if title exists
        if (dom.menuTitle) {
            console.log('handleMenuPageShow: Resetting title, current classes:', dom.menuTitle.className);
            removeClass(dom.menuTitle, CSS_CLASSES.FADE_OUT);
            removeClass(dom.menuTitle, CSS_CLASSES.FADE_IN);
            void dom.menuTitle.offsetWidth;

            // Clear any existing timeout
            const existingTimeout = getState('menuTitleTimeout');
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            // Fade in title
            await new Promise(resolve => requestAnimationFrame(resolve));
            console.log('handleMenuPageShow: Adding fade-in to title');
            addClass(dom.menuTitle, CSS_CLASSES.FADE_IN);
            console.log('handleMenuPageShow: Title classes after fade-in:', dom.menuTitle.className);
            await waitForTransition(dom.menuTitle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);

            // Fade out title after 5 seconds
            const timeoutId = setTimeout(() => {
                // Use async IIFE since setTimeout callback can't be async
                (async () => {
                    try {
                        // Refresh DOM to ensure we have latest references
                        const currentDom = getDOMElements();
                        if (currentDom.menuTitle) {
                            removeClass(currentDom.menuTitle, CSS_CLASSES.FADE_IN);
                            addClass(currentDom.menuTitle, CSS_CLASSES.FADE_OUT);
                            await waitForTransition(currentDom.menuTitle, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
                        }
                        setState('menuTitleHasBeenDismissed', true, { persist: false }); // Mark as dismissed
                    } catch (error) {
                        handleError(error, {
                            severity: ERROR_SEVERITY.WARNING,
                            context: { module: 'routing.js', function: 'showPage.titleFadeOut' }
                        });
                    }
                })();
            }, 5000);
            setState('menuTitleTimeout', timeoutId, { persist: false });
        }
    }
    } catch (error) {
        console.error('handleMenuPageShow: Error caught:', error);
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'routing.js', function: 'handleMenuPageShow' }
        });
        // Ensure menu content is at least visible even if animations fail
        // Refresh DOM to ensure we have latest references
        console.log('handleMenuPageShow: Applying fallback visibility');
        const currentDom = getDOMElements();
        if (currentDom.menuContent) {
            removeClass(currentDom.menuContent, CSS_CLASSES.FADE_OUT);
        }
        // Make buttons visible as fallback
        if (currentDom.floatButtons && currentDom.floatButtons.length > 0) {
            currentDom.floatButtons.forEach(btn => {
                addClass(btn, CSS_CLASSES.FADE_IN);
            });
        }
        // Make title visible as fallback
        if (currentDom.menuTitle) {
            addClass(currentDom.menuTitle, CSS_CLASSES.FADE_IN);
        }
    }
    console.log('handleMenuPageShow: Completed');
}

