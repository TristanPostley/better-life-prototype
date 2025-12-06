/**
 * DOM element references and helpers
 * 
 * This module provides centralized access to DOM elements.
 * Elements are cached after first access.
 */

let cachedElements = null;

/**
 * Initialize and cache all DOM element references
 * @returns {Object} Object containing all DOM element references
 */
export function getDOMElements() {
    if (cachedElements) {
        return cachedElements;
    }

    cachedElements = {
        pages: {
            landing: document.getElementById('landing-page'),
            timer: document.getElementById('timer-page'),
            menu: document.getElementById('menu-page')
        },
        buttons: {
            yes: document.getElementById('btn-yes'),
            no: document.getElementById('btn-no'),
            startTimer: document.getElementById('btn-start-timer'),
            help: document.getElementById('btn-help-icon'),
            debug: document.getElementById('btn-debug'),
            debugMenu: document.getElementById('btn-debug-menu'),
            questions: document.getElementById('btn-questions'),
            feedback: document.getElementById('btn-feedback'),
            settings: document.getElementById('btn-settings')
        },
        display: {
            timer: document.getElementById('timer-display'),
            timerIntro: document.getElementById('timer-intro'),
            circleTimer: document.getElementById('circle-timer'),
            circleWrapper: document.querySelector('.circle-wrapper'),
            circleTime: document.getElementById('circle-time'),
            progressRing: document.querySelector('.progress-ring-circle'),
            helpContent: document.getElementById('help-content'),
            journalTab: document.getElementById('journal-tab'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalBody: document.getElementById('modal-body'),
            closeModal: document.getElementById('close-modal')
        },
        // Additional elements that may be needed
        menuContent: document.getElementById('menu-content'),
        questionsFlow: document.getElementById('questions-flow'),
        questionItems: document.querySelectorAll('.question-item'),
        howItWorksFlow: document.getElementById('how-it-works-flow'),
        explainItems: document.querySelectorAll('.explain-item'),
        qHowItWorks: document.getElementById('q-how-it-works'),
        qBetterToday: document.getElementById('q-better-today'),
        betterTodayFlow: document.getElementById('better-today-flow'),
        betterTodayInput: document.getElementById('better-today-input'),
        qBetterLifeMeaning: document.getElementById('q-better-life-meaning'),
        betterLifeMeaningFlow: document.getElementById('better-life-meaning-flow'),
        betterLifeMeaningInput: document.getElementById('better-life-meaning-input'),
        qAdvice: document.getElementById('q-advice'),
        adviceFlow: document.getElementById('advice-flow'),
        adviceItems: document.querySelectorAll('.advice-item'),
        floatButtons: document.querySelectorAll('.float-btn'),
        menuTitle: document.querySelector('.menu-title'),
        triangle: document.getElementById('menu-triangle'),
        debugControls: document.getElementById('debug-controls'),
        debugMinutesInput: document.getElementById('debug-minutes')
    };

    return cachedElements;
}

/**
 * Get progress ring circumference
 * @returns {number} Circumference value
 */
export function getProgressRingCircumference() {
    // Progress ring circumference (2 * PI * radius)
    return 2 * Math.PI * 130;
}

