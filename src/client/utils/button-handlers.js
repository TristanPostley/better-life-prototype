/**
 * Centralized button handler system
 * 
 * Uses event delegation to handle all button clicks in the application.
 * This module replaces the inline script in index.html.
 * 
 * @typedef {import('../../shared/types/dom.js').PageName} PageName
 */

import { CSS_CLASSES, TIMER, STORAGE_KEYS, PAGES, ANIMATION_DELAYS } from '../../shared/constants.js';
import { formatTime, parseTime, calculateProgressRingOffset } from '../../shared/utils/index.js';
import { navigateToPage, addClass, removeClass, toggleElement } from './dom-helpers.js';
import { moduleRegistry } from './module-registry.js';
import { getDOMElements, clearDOMElementsCache } from './dom-elements.js';
import { handleError, ERROR_SEVERITY } from '../../shared/utils/error-handler.js';
import { getState, setState, setCurrentTimer } from '../state/app-state.js';
import {
    startTimerCountdown,
    stopTimerCountdown,
    showCircleTimer,
    getTimerElements,
    getTimerDuration,
    updateTimerDisplay,
    setTimerDisplay
} from '../domains/sessions/index.js';

/**
 * Initialize button handlers using event delegation
 * @returns {void}
 */
export function initButtonHandlers() {
    // Centralized button handler registry
    // Maps button IDs to handler functions
    const buttonHandlers = {
        // Landing page buttons
        'btn-yes': async function(e) {
            e.preventDefault();
            e.stopPropagation();
            const showPage = moduleRegistry.get('showPage');
            if (showPage) {
                await showPage(PAGES.TIMER);
            } else {
                navigateToPage(PAGES.TIMER);
            }
        },
        
        'btn-no': function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dom = getDOMElements();
            const landingPage = dom.pages.landing;
            const landingContent = landingPage?.querySelector('.center-content');
            if (landingContent) {
                landingContent.innerHTML = '<h1>Ok.</h1>';
            }
            if (landingPage) {
                landingPage.style.cursor = 'pointer';
                setTimeout(() => {
                    landingPage.addEventListener('click', () => location.reload());
                }, 100);
            }
        },
        
        // Timer page buttons
        'btn-start-timer': function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Use enhanced handler from module registry
            const handleStartTimerClick = moduleRegistry.get('handleStartTimerClick');
            if (handleStartTimerClick) {
                try {
                    handleStartTimerClick();
                } catch (err) {
                    handleError(err, {
                        severity: ERROR_SEVERITY.ERROR,
                        context: { module: 'button-handlers.js', function: 'btn-start-timer' },
                        onError: () => startTimerFallback()
                    });
                }
            } else {
                // Fallback to timer service
                startTimerFallback();
            }
        },
        
        'btn-help-icon': function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dom = getDOMElements();
            const helpContent = dom.display.helpContent;
            if (helpContent) {
                const isVisible = toggleElement(helpContent);
                if (isVisible) {
                    document.body.classList.add(CSS_CLASSES.SCROLLABLE);
                    const journalTab = dom.display.journalTab;
                    if (journalTab) {
                        setTimeout(() => {
                            removeClass(journalTab, CSS_CLASSES.HIDDEN);
                            void journalTab.offsetWidth; // Force reflow
                            requestAnimationFrame(() => {
                                addClass(journalTab, CSS_CLASSES.SHOW);
                            });
                        }, ANIMATION_DELAYS.JOURNAL_REVEAL);
                    }
                }
            }
        },
        
        // Debug buttons
        'btn-debug': async function(e) {
            e.preventDefault();
            e.stopPropagation();
            const dom = getDOMElements();
            const timerDisplay = dom.display.timer;
            const circleTime = dom.display.circleTime;
            const debugMinutesInput = dom.debugMinutesInput;
            
            if (!timerDisplay && !circleTime) return;
            
            const minutes = parseInt(debugMinutesInput?.value || '1', 10) || 1;
            const subtractAmount = minutes * 60;
            
            // Get current timer from state (more reliable than parsing DOM)
            const currentTimerState = getState('currentTimer');
            let newTimer = currentTimerState - subtractAmount;
            newTimer = Math.max(0, newTimer);
            
            // Check if timer is running
            const isTimerRunning = getState('isTimerRunning');
            
            try {
                if (isTimerRunning) {
                    // Timer is running: stop it completely, update state, then restart with new value
                    setState('isTimerRunning', false, { persist: false });
                    stopTimerCountdown();
                    setCurrentTimer(newTimer);
                    
                    // Small delay to ensure interval is fully cleared before restarting
                    // This prevents race conditions where the old interval might still be active
                    await new Promise(resolve => setTimeout(resolve, 0));
                    
                    // Restart timer with new value
                    // Timer service now manages state directly, so we don't need onTick callback
                    const timerElements = getTimerElements();
                    startTimerCountdown({
                        initialTimer: newTimer,
                        elements: timerElements,
                        onFinish: async () => {
                            setState('isTimerRunning', false, { persist: false });
                            const finishSession = moduleRegistry.get('finishSession');
                            const showPage = moduleRegistry.get('showPage');
                            
                            if (finishSession) {
                                await finishSession();
                            } else if (showPage) {
                                await showPage(PAGES.MENU);
                            } else {
                                navigateToPage(PAGES.MENU);
                            }
                        }
                    });
                    
                    // Update state to reflect timer is still running
                    setState('isTimerRunning', true, { persist: false });
                    
                    // If timer reached 0, onFinish will handle navigation
                    // Don't navigate here to avoid double navigation
                } else {
                    // Timer is not running: just update state and display
                    setTimerDisplay(newTimer);
                    
                    // Finish if timer reaches 0 (only when not running)
                    if (newTimer <= 0) {
                        const finishSession = moduleRegistry.get('finishSession');
                        const showPage = moduleRegistry.get('showPage');
                        
                        if (finishSession) {
                            await finishSession();
                        } else if (showPage) {
                            await showPage(PAGES.MENU);
                        } else {
                            navigateToPage(PAGES.MENU);
                        }
                    }
                }
            } catch (err) {
                handleError(err, {
                    severity: ERROR_SEVERITY.ERROR,
                    context: { module: 'button-handlers.js', function: 'btn-debug' }
                });
            }
        },
        
        'btn-debug-menu': async function(e) {
            console.log('btn-debug-menu: Button clicked');
            e.preventDefault();
            e.stopPropagation();
            const showPage = moduleRegistry.get('showPage');
            console.log('btn-debug-menu: showPage from registry:', !!showPage);
            if (showPage) {
                try {
                    console.log('btn-debug-menu: Calling showPage with PAGES.MENU:', PAGES.MENU);
                    await showPage(PAGES.MENU);
                    console.log('btn-debug-menu: showPage completed');
                } catch (error) {
                    console.error('btn-debug-menu: Error calling showPage:', error);
                    handleError(error, {
                        severity: ERROR_SEVERITY.ERROR,
                        context: { module: 'button-handlers.js', function: 'btn-debug-menu' },
                        onError: () => {
                            console.log('btn-debug-menu: Fallback to navigateToPage');
                            navigateToPage(PAGES.MENU);
                        }
                    });
                }
            } else {
                console.log('btn-debug-menu: showPage not in registry, using navigateToPage');
                navigateToPage(PAGES.MENU);
            }
        },
        
        // Settings button
        'btn-settings': async function(e) {
            // Check if button was dragged - if so, don't trigger click action
            if (getState('wasDragged')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            const dom = getDOMElements();
            
            // Fade out menu content
            if (dom.menuContent) {
                dom.menuContent.classList.add('fade-out');
            }

            // Wait for fade-out animation before showing modal
            setTimeout(async () => {
                try {
                    // Clear DOM cache to ensure fresh elements are found
                    clearDOMElementsCache();
                    
                    const { renderSettingsModal } = await import('../domains/users/preferences/settings-ui.js');
                    renderSettingsModal();
                } catch (error) {
                    handleError(error, {
                        severity: ERROR_SEVERITY.ERROR,
                        context: { module: 'button-handlers.js', function: 'btn-settings' }
                    });
                }
            }, 1000); // Wait for fade-out animation to complete
        },
        
        // Feedback button
        'btn-feedback': async function(e) {
            // Check if button was dragged - if so, don't trigger click action
            if (getState('wasDragged')) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            const dom = getDOMElements();
            
            // Fade out menu content
            if (dom.menuContent) {
                dom.menuContent.classList.add('fade-out');
            }

            // Wait for fade-out animation before showing modal
            setTimeout(async () => {
                try {
                    const { openModal, closeModal } = await import('../domains/navigation/index.js');
                    const { submitFeedback } = await import('../services/supabase-client.js');
                    const { withAsyncErrorHandling } = await import('../../shared/utils/error-handler.js');
                    
                    openModal(`
                        <h2 class="fade-in-element">Feedback</h2>
                        <textarea id="feedback-message" class="feedback-textarea fade-in-element" style="animation-delay: 0.2s" placeholder="Your feedback..."></textarea>
                        <button id="btn-submit-feedback" class="auth-btn primary full-width fade-in-element" style="animation-delay: 0.9s">Submit</button>
                        <div id="feedback-status" class="auth-message hidden fade-in-element" style="animation-delay: 0.4s"></div>
                    `, true); // Hide close button for feedback modal

                    // Clear DOM cache to ensure new elements are found
                    clearDOMElementsCache();

                    // Attach listener to the new button and trigger fade-in
                    setTimeout(() => {
                        const dom = getDOMElements();
                        const submitBtn = dom.buttons.submitFeedback;
                        const messageInput = dom.feedbackMessage;
                        const statusDiv = dom.feedbackStatus;
                        const fadeElements = dom.fadeElements;

                        // Check if required elements exist
                        if (!submitBtn || !messageInput || !statusDiv) {
                            handleError('Feedback modal elements not found', {
                                severity: ERROR_SEVERITY.ERROR,
                                context: { module: 'button-handlers.js', function: 'btn-feedback' }
                            });
                            return;
                        }

                        // Trigger fade-in
                        requestAnimationFrame(() => {
                            fadeElements.forEach(el => el.classList.add('show'));
                        });

                        submitBtn.addEventListener('click', withAsyncErrorHandling(async () => {
                            const message = messageInput.value.trim();
                            if (!message) {
                                statusDiv.textContent = 'Please enter a message';
                                statusDiv.className = 'auth-message error fade-in-element show';
                                statusDiv.classList.remove('hidden');
                                return;
                            }

                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Sending...';
                            statusDiv.classList.add('hidden');

                            const result = await submitFeedback(message);

                            if (result.success) {
                                statusDiv.textContent = result.message;
                                statusDiv.className = 'auth-message success fade-in-element show';
                                statusDiv.classList.remove('hidden');
                                messageInput.value = '';
                                submitBtn.textContent = 'Sent!';

                                // Close modal after a delay
                                setTimeout(() => {
                                    closeModal();
                                }, 2000);
                            } else {
                                statusDiv.textContent = result.error || 'Failed to send feedback';
                                statusDiv.className = 'auth-message error fade-in-element show';
                                statusDiv.classList.remove('hidden');
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Submit';
                            }
                        }, {
                            functionName: 'feedbackSubmit',
                            module: 'button-handlers.js'
                        }));
                    }, 50); // Small delay to ensure DOM is ready and transition works
                } catch (error) {
                    handleError(error, {
                        severity: ERROR_SEVERITY.ERROR,
                        context: { module: 'button-handlers.js', function: 'btn-feedback' }
                    });
                }
            }, 1000); // Wait for fade-out animation to complete
        }
    };
    
    // Helper function for timer fallback
    function startTimerFallback() {
        try {
            const elements = getTimerElements();
            if (!elements.timerIntro || !elements.circleTimer || !elements.circleTime) {
                handleError('Timer elements not found', {
                    severity: ERROR_SEVERITY.ERROR,
                    context: { module: 'button-handlers.js', function: 'startTimerFallback' }
                });
                return;
            }
            
            showCircleTimer(elements);
            const initialTimer = getTimerDuration();
            
            startTimerCountdown({
                initialTimer: initialTimer,
                elements: elements,
                onFinish: async () => {
                    const finishSession = moduleRegistry.get('finishSession');
                    const showPage = moduleRegistry.get('showPage');
                    
                    if (finishSession) {
                        await finishSession();
                    } else if (showPage) {
                        await showPage(PAGES.MENU);
                    } else {
                        navigateToPage(PAGES.MENU);
                    }
                }
            });
            } catch (err) {
                handleError(err, {
                    severity: ERROR_SEVERITY.ERROR,
                    context: { module: 'button-handlers.js', function: 'startTimerFallback' }
                });
            }
    }
    
    // Use event delegation - one listener handles all button clicks
    document.addEventListener('click', function(e) {
        try {
            // Find the closest button with an ID
            const button = e.target.closest('button[id]');
            if (!button || !button.id) return;
            
            console.log('button-handlers: Button clicked:', button.id);
            
            // Check if we have a handler for this button
            const handler = buttonHandlers[button.id];
            if (handler) {
                console.log('button-handlers: Handler found for', button.id);
                handler(e);
            } else {
                console.log('button-handlers: No handler found for', button.id);
            }
        } catch (error) {
            console.error('button-handlers: Error in click handler:', error);
            handleError(error, {
                severity: ERROR_SEVERITY.ERROR,
                context: { module: 'button-handlers.js', function: 'clickEventListener' }
            });
        }
    }, true); // Use capture phase for early handling
    
    // Initialize debug controls keyboard handler
    initDebugControlsKeyboard();
    
    console.log('Button handlers initialized via event delegation');
    
    // Export handler registry for potential future enhancements
    return buttonHandlers;
}

/**
 * Initialize keyboard handlers for debug controls
 * Debug controls are only visible while the "D" key is held down
 * @returns {void}
 */
function initDebugControlsKeyboard() {
    const dom = getDOMElements();
    if (!dom.debugControls) return;
    
    let isDKeyPressed = false;
    
    // Handle keydown - show debug controls when "D" is pressed
    document.addEventListener('keydown', function(e) {
        // Only handle "D" key (case-insensitive, but check for both)
        if ((e.key === 'd' || e.key === 'D') && !isDKeyPressed) {
            isDKeyPressed = true;
            removeClass(dom.debugControls, CSS_CLASSES.HIDDEN);
        }
    });
    
    // Handle keyup - hide debug controls when "D" is released
    document.addEventListener('keyup', function(e) {
        if (e.key === 'd' || e.key === 'D') {
            isDKeyPressed = false;
            addClass(dom.debugControls, CSS_CLASSES.HIDDEN);
        }
    });
    
    // Handle blur (when window loses focus) - hide debug controls
    window.addEventListener('blur', function() {
        isDKeyPressed = false;
        addClass(dom.debugControls, CSS_CLASSES.HIDDEN);
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonHandlers);
} else {
    initButtonHandlers();
}

