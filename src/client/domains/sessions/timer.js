/**
 * Timer logic and controls
 * 
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

import { formatTime } from '../../../shared/utils/index.js';
import { getProgressRingCircumference } from './utils/progress-ring.js';
import { getDOMElements } from '../../utils/dom-elements.js';
import { state, getState, setState, setCurrentTimer, resetTimerState } from '../../state/app-state.js';
import { CSS_CLASSES } from '../../../shared/constants.js';
import { addClass, removeClass } from '../../utils/dom-helpers.js';
import { startTimerCountdown, stopTimerCountdown, updateTimerDisplay as updateTimerDisplayService, showCircleTimer, getTimerElements, getTimerDuration } from './timer-service.js';
import { moduleRegistry } from '../../utils/module-registry.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

let circumference = null;
let dom = null;

/**
 * Initialize timer module
 * @returns {void}
 */
export function initTimer() {
    dom = getDOMElements();
    circumference = getProgressRingCircumference();
    
    // Initialize progress ring (if it exists)
    if (dom.display.progressRing) {
        dom.display.progressRing.style.strokeDasharray = circumference;
    }
}

/**
 * Reset timer display to initial state
 * @returns {void}
 */
export function resetTimerDisplay() {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.display) {
        handleError('Cannot reset timer display: DOM elements not available', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'timer.js', function: 'resetTimerDisplay' }
        });
        return;
    }
    
    resetTimerState();
    const currentTimer = getState('currentTimer');
    if (dom.display.timer) {
        dom.display.timer.textContent = formatTime(currentTimer);
    }
    if (dom.display.circleTime) {
        dom.display.circleTime.textContent = formatTime(currentTimer);
    }

    // Reset the view to show intro, hide circle
    removeClass(dom.display.timerIntro, CSS_CLASSES.FADE_OUT);
    addClass(dom.display.circleTimer, CSS_CLASSES.HIDDEN);
    removeClass(dom.display.circleTimer, CSS_CLASSES.SHOW);

    // Reset progress ring
    if (dom.display.progressRing) {
        dom.display.progressRing.style.strokeDashoffset = 0;
    }
}

/**
 * Update the progress ring visual indicator
 * @returns {void}
 */
export function updateProgressRing() {
    if (!dom.display.progressRing) return;
    const currentTimer = getState('currentTimer');
    const timerDuration = getState('timerDuration');
    const progress = currentTimer / timerDuration;
    const offset = circumference * (1 - progress);
    dom.display.progressRing.style.strokeDashoffset = offset;
}

/**
 * Start the timer countdown
 * @returns {void}
 */
export function startTimer() {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.display) {
        handleError('Cannot start timer: DOM elements not available', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'timer.js', function: 'startTimer' }
        });
        return;
    }
    
    setState('isTimerRunning', true, { persist: false });
    
    // Use shared timer service
    const currentTimer = getState('currentTimer');
    startTimerCountdown({
        initialTimer: currentTimer,
        elements: {
            timerDisplay: dom.display.timer,
            circleTime: dom.display.circleTime,
            progressRing: dom.display.progressRing
        },
        onTick: (timerValue) => {
            setCurrentTimer(timerValue);
        },
        onFinish: async () => {
            setState('isTimerRunning', false, { persist: false });
            const finishSession = moduleRegistry.get('finishSession') || window.finishSession;
            if (finishSession) {
                await finishSession();
            }
        }
    });
}

/**
 * Pause the timer
 * @returns {void}
 */
export function pauseTimer() {
    setState('isTimerRunning', false, { persist: false });
    stopTimerCountdown();
}

/**
 * Finish the current session
 * Calls the global finishSession function if available
 * @returns {void}
 */
export function finishSession() {
    pauseTimer();
    // Call the registered finishSession function from app.js
    const finishSessionFn = moduleRegistry.get('finishSession') || window.finishSession;
    if (finishSessionFn) {
        finishSessionFn();
    }
}

/**
 * Handle start timer button click
 * @returns {void}
 */
export function handleStartTimerClick() {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.display) {
        handleError('Cannot start timer: DOM elements not available', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'timer.js', function: 'startTimer' }
        });
        return;
    }
    
    // Fade out intro, fade in circle timer
    if (!dom.display.timerIntro || !dom.display.circleTimer) {
        handleError('Cannot start timer: Required DOM elements not found', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'timer.js', function: 'handleStartTimerClick' }
        });
        return;
    }
    
    addClass(dom.display.timerIntro, CSS_CLASSES.FADE_OUT);
    removeClass(dom.display.circleTimer, CSS_CLASSES.HIDDEN);

    // Force reflow then show
    void dom.display.circleTimer.offsetWidth;
    addClass(dom.display.circleTimer, CSS_CLASSES.SHOW);

    // Use shared service to show circle timer and initialize display
    showCircleTimer({
        timerIntro: dom.display.timerIntro,
        circleTimer: dom.display.circleTimer
    });
    
    const currentTimer = getState('currentTimer');
    updateTimerDisplayService(currentTimer, {
        timerDisplay: dom.display.timer,
        circleTime: dom.display.circleTime,
        progressRing: dom.display.progressRing
    });

    // Start the timer
    startTimer();
}

/**
 * Handle circle wrapper click (pause/resume)
 * @returns {void}
 */
export function handleCircleClick() {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    const isTimerRunning = getState('isTimerRunning');
    if (isTimerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

/**
 * Get current timer value
 * @returns {number} Current timer value in seconds
 */
export function getCurrentTimer() {
    return getState('currentTimer');
}

/**
 * Set timer display (for debug purposes)
 * @param {number} seconds - Timer value in seconds
 * @returns {boolean} True if timer reached zero
 */
export function setTimerDisplay(seconds) {
    // Ensure dom is initialized
    if (!dom) {
        dom = getDOMElements();
    }
    
    if (!dom || !dom.display) {
        handleError('Cannot set timer display: DOM elements not available', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'timer.js', function: 'setTimerDisplay' }
        });
        return false;
    }
    
    const newTimer = Math.max(0, seconds);
    setCurrentTimer(newTimer);
    
    // Use shared service to update display
    updateTimerDisplayService(newTimer, {
        timerDisplay: dom.display.timer,
        circleTime: dom.display.circleTime,
        progressRing: dom.display.progressRing
    });
    
    return newTimer <= 0;
}

