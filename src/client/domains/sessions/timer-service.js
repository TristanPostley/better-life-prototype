/**
 * Shared timer service
 * 
 * Core timer logic that can be used by both inline scripts and modules
 * Works with or without DOM cache for maximum flexibility
 * 
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 */

import { formatTime, calculateProgressRingOffset } from '../../../shared/utils/index.js';
import { TIMER, STORAGE_KEYS, PAGES } from '../../../shared/constants.js';
import { addClass, removeClass, showElement } from '../../utils/dom-helpers.js';
import { moduleRegistry } from '../../utils/module-registry.js';
import { state, getState, setState } from '../../state/app-state.js';
import { getDOMElements } from '../../utils/dom-elements.js';

/**
 * Update timer display elements with formatted time
 * @param {number} seconds - Time in seconds
 * @param {Object} elements - Object with timer display elements
 * @param {HTMLElement|null} [elements.timerDisplay] - Timer display element
 * @param {HTMLElement|null} [elements.circleTime] - Circle time element
 * @returns {void}
 */
function updateTimerDisplays(seconds, elements) {
    const formatted = formatTime(seconds);
    if (elements.timerDisplay) {
        elements.timerDisplay.textContent = formatted;
    }
    if (elements.circleTime) {
        elements.circleTime.textContent = formatted;
    }
}

/**
 * Update progress ring visual indicator
 * @param {number} currentTimer - Current timer value in seconds
 * @param {number} totalDuration - Total duration in seconds
 * @param {HTMLElement|null} progressRing - Progress ring element
 * @returns {void}
 */
function updateProgressRing(currentTimer, totalDuration, progressRing) {
    if (!progressRing) return;
    const offset = calculateProgressRingOffset(currentTimer, totalDuration, TIMER.PROGRESS_RING_RADIUS);
    progressRing.style.strokeDashoffset = offset;
}

/**
 * Get timer duration from localStorage or use default
 * @returns {number} Timer duration in seconds
 */
export function getTimerDuration() {
    // Get from state (automatically loaded from localStorage on init)
    return getState('timerDuration');
}

/**
 * Get timer display elements (works without DOM cache)
 * @returns {Object} Object with timer display elements
 */
export function getTimerElements() {
    const dom = getDOMElements();
    return {
        timerDisplay: dom.display.timer,
        circleTime: dom.display.circleTime,
        timerIntro: dom.display.timerIntro,
        circleTimer: dom.display.circleTimer,
        progressRing: dom.display.progressRing,
        circleWrapper: dom.display.circleWrapper
    };
}

/**
 * Show the circle timer UI (fade out intro, show circle)
 * @param {Object} elements - Timer display elements
 * @returns {void}
 */
export function showCircleTimer(elements) {
    if (!elements.timerIntro || !elements.circleTimer) return;
    
    // Fade out intro
    addClass(elements.timerIntro, 'fade-out');
    
    // Show circle timer
    removeClass(elements.circleTimer, 'hidden');
    void elements.circleTimer.offsetWidth; // Force reflow
    addClass(elements.circleTimer, 'show');
}

/**
 * Start timer countdown
 * @param {Object} options - Timer options
 * @param {number} options.initialTimer - Initial timer value in seconds
 * @param {Function} [options.onTick] - Callback called on each tick (receives currentTimer)
 * @param {Function} [options.onFinish] - Callback called when timer reaches 0
 * @param {Object} [options.elements] - Timer display elements (auto-detected if not provided)
 * @returns {Function} Function to stop the timer
 */
export function startTimerCountdown({ initialTimer, onTick, onFinish, elements }) {
    const timerElements = elements || getTimerElements();
    const totalDuration = getTimerDuration();
    
    // Sync initial timer to state (state is source of truth)
    setState('currentTimer', initialTimer, { persist: false, notify: false });
    
    // Initialize displays from state
    let currentTimer = getState('currentTimer');
    updateTimerDisplays(currentTimer, timerElements);
    updateProgressRing(currentTimer, totalDuration, timerElements.progressRing);
    
    // Clear any existing interval and reset state
    const existingInterval = getState('timerInterval');
    if (existingInterval) {
        clearInterval(existingInterval);
        setState('timerInterval', null, { persist: false, notify: false });
    }
    
    // Create and store interval in state
    // Read from state each tick to ensure we're always using the current value
    const intervalId = setInterval(() => {
        // Read current timer from state (source of truth)
        currentTimer = getState('currentTimer');
        
        // Decrement timer
        currentTimer = Math.max(0, currentTimer - 1);
        
        // Update state first (this is the source of truth)
        setState('currentTimer', currentTimer, { persist: false, notify: false });
        
        // Update displays from state value
        updateTimerDisplays(currentTimer, timerElements);
        updateProgressRing(currentTimer, totalDuration, timerElements.progressRing);
        
        // Call tick callback if provided (pass state value)
        if (onTick) {
            onTick(currentTimer);
        }
        
        // Check if finished
        if (currentTimer <= 0) {
            clearInterval(intervalId);
            setState('timerInterval', null, { persist: false, notify: false });
            
            // Call finish callback
            if (onFinish) {
                onFinish();
            } else {
                // Default: navigate to menu
                const finishSession = moduleRegistry.get('finishSession') || window.finishSession;
                const showPageFn = moduleRegistry.get('showPage') || window.showPage;
                
                if (finishSession) {
                    finishSession();
                } else if (showPageFn) {
                    showPageFn(PAGES.MENU);
                } else {
                    // Fallback navigation
                    const dom = getDOMElements();
                    const timerPage = dom.pages.timer;
                    const menuPage = dom.pages.menu;
                    if (timerPage && menuPage) {
                        removeClass(timerPage, 'active-page');
                        addClass(timerPage, 'hidden');
                        removeClass(menuPage, 'hidden');
                        addClass(menuPage, 'active-page');
                    }
                }
            }
        }
    }, TIMER.UPDATE_INTERVAL);
    
    // Store interval in state (after creation)
    setState('timerInterval', intervalId, { persist: false, notify: false });
    
    // Return stop function
    return () => {
        const currentInterval = getState('timerInterval');
        if (currentInterval) {
            clearInterval(currentInterval);
            setState('timerInterval', null, { persist: false, notify: false });
        }
    };
}

/**
 * Stop the current timer countdown
 * @returns {void}
 */
export function stopTimerCountdown() {
    const currentInterval = getState('timerInterval');
    if (currentInterval) {
        clearInterval(currentInterval);
        setState('timerInterval', null, { persist: false, notify: false });
    }
}

/**
 * Update timer display without starting countdown
 * @param {number} seconds - Time in seconds to display
 * @param {Object} [elements] - Timer display elements (auto-detected if not provided)
 * @returns {void}
 */
export function updateTimerDisplay(seconds, elements) {
    const timerElements = elements || getTimerElements();
    const totalDuration = getTimerDuration();
    
    updateTimerDisplays(seconds, timerElements);
    updateProgressRing(seconds, totalDuration, timerElements.progressRing);
}

