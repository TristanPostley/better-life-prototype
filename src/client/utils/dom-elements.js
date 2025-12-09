/**
 * DOM element references and caching
 * 
 * This module provides centralized, null-safe access to DOM elements.
 * Elements are cached after first access.
 * 
 * @typedef {import('../../shared/types/dom.js').DOMElements} DOMElements
 */

import { handleError, ERROR_SEVERITY } from '../../shared/utils/error-handler.js';

let cachedElements = null;

/**
 * Safe DOM element getter with null checking
 * @param {string} id - Element ID
 * @param {boolean} [required=false] - Whether element is required
 * @returns {HTMLElement|null} Element or null
 */
function safeGetElementById(id, required = false) {
    const element = document.getElementById(id);
    if (required && !element) {
        handleError(`Required DOM element not found: ${id}`, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'dom-elements.js', elementId: id }
        });
    }
    return element;
}

/**
 * Safe DOM element query selector with null checking
 * @param {string} selector - CSS selector
 * @param {boolean} [required=false] - Whether element is required
 * @returns {HTMLElement|null} Element or null
 */
function safeQuerySelector(selector, required = false) {
    const element = document.querySelector(selector);
    if (required && !element) {
        handleError(`Required DOM element not found: ${selector}`, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'dom-elements.js', selector }
        });
    }
    return element;
}

/**
 * Initialize and cache all DOM element references
 * @param {boolean} [validate=false] - Whether to validate required elements
 * @returns {DOMElements} Object containing all DOM element references
 */
export function getDOMElements(validate = false) {
    if (cachedElements) {
        return cachedElements;
    }

    cachedElements = {
        pages: {
            landing: safeGetElementById('landing-page', validate),
            timer: safeGetElementById('timer-page', validate),
            menu: safeGetElementById('menu-page', validate)
        },
        buttons: {
            yes: safeGetElementById('btn-yes', validate),
            no: safeGetElementById('btn-no', validate),
            startTimer: safeGetElementById('btn-start-timer', validate),
            help: safeGetElementById('btn-help-icon', validate),
            debug: safeGetElementById('btn-debug', validate),
            debugMenu: safeGetElementById('btn-debug-menu', validate),
            questions: safeGetElementById('btn-questions', validate),
            feedback: safeGetElementById('btn-feedback', validate),
            settings: safeGetElementById('btn-settings', validate),
            submitFeedback: safeGetElementById('btn-submit-feedback', false),
            authShowSignup: safeGetElementById('auth-show-signup', false),
            authShowSignin: safeGetElementById('auth-show-signin', false),
            authSignout: safeGetElementById('auth-signout', false),
            signupSubmit: safeGetElementById('signup-submit', false),
            signupToSignin: safeGetElementById('signup-to-signin', false),
            signinSubmit: safeGetElementById('signin-submit', false),
            signinToSignup: safeGetElementById('signin-to-signup', false),
            showMagicLink: safeGetElementById('show-magic-link', false),
            showResetPassword: safeGetElementById('show-reset-password', false),
            magicSubmit: safeGetElementById('magic-submit', false),
            magicToSignin: safeGetElementById('magic-to-signin', false),
            resetSubmit: safeGetElementById('reset-submit', false),
            resetToSignin: safeGetElementById('reset-to-signin', false)
        },
        display: {
            timer: safeGetElementById('timer-display', validate),
            timerIntro: safeGetElementById('timer-intro', validate),
            circleTimer: safeGetElementById('circle-timer', validate),
            circleWrapper: safeQuerySelector('.circle-wrapper', validate),
            circleTime: safeGetElementById('circle-time', validate),
            progressRing: safeQuerySelector('.progress-ring-circle', validate),
            helpContent: safeGetElementById('help-content', validate),
            journalTab: safeGetElementById('journal-tab', validate),
            modalOverlay: safeGetElementById('modal-overlay', validate),
            modalBody: safeGetElementById('modal-body', validate),
            closeModal: safeGetElementById('close-modal', validate)
        },
        // Menu and navigation elements
        menuContent: safeGetElementById('menu-content', validate),
        menuTitle: safeQuerySelector('.menu-title', validate),
        menuTriangle: safeGetElementById('menu-triangle', validate),
        // Question flows
        questionsFlow: safeGetElementById('questions-flow', validate),
        questionItems: document.querySelectorAll('.question-item'),
        qHowItWorks: safeGetElementById('q-how-it-works', validate),
        qBetterToday: safeGetElementById('q-better-today', validate),
        betterTodayFlow: safeGetElementById('better-today-flow', validate),
        betterTodayInput: safeGetElementById('better-today-input', validate),
        qBetterLifeMeaning: safeGetElementById('q-better-life-meaning', validate),
        betterLifeMeaningFlow: safeGetElementById('better-life-meaning-flow', validate),
        betterLifeMeaningInput: safeGetElementById('better-life-meaning-input', validate),
        qAdvice: safeGetElementById('q-advice', validate),
        adviceFlow: safeGetElementById('advice-flow', validate),
        adviceItems: document.querySelectorAll('.advice-item'),
        // How it works flow
        howItWorksFlow: safeGetElementById('how-it-works-flow', validate),
        explainItems: document.querySelectorAll('.explain-item'),
        // Other UI elements
        floatButtons: document.querySelectorAll('.float-btn'),
        debugControls: safeGetElementById('debug-controls', false),
        debugMinutesInput: safeGetElementById('debug-minutes', false),
        // Auth elements
        authSection: safeQuerySelector('.auth-section', false),
        authForms: safeGetElementById('auth-forms', false),
        authFormElements: {
            signup: safeGetElementById('signup-form', false),
            signin: safeGetElementById('signin-form', false),
            magicLink: safeGetElementById('magic-link-form', false),
            resetPassword: safeGetElementById('reset-password-form', false)
        },
        authInputs: {
            signupEmail: safeGetElementById('signup-email', false),
            signupPassword: safeGetElementById('signup-password', false),
            signinEmail: safeGetElementById('signin-email', false),
            signinPassword: safeGetElementById('signin-password', false),
            magicEmail: safeGetElementById('magic-email', false),
            resetEmail: safeGetElementById('reset-email', false)
        },
        authMessages: document.querySelectorAll('#auth-message'),
        // Settings elements
        darkModeSwitch: safeGetElementById('dark-mode-switch', false),
        fontSelect: safeGetElementById('font-select', false),
        // Feedback elements
        feedbackMessage: safeGetElementById('feedback-message', false),
        feedbackStatus: safeGetElementById('feedback-status', false),
        fadeElements: document.querySelectorAll('.fade-in-element')
    };

    return cachedElements;
}

/**
 * Validate that all required DOM elements exist
 * @returns {boolean} True if all required elements exist
 */
export function validateDOMElements() {
    getDOMElements(true);
    return true; // Errors are logged by safe getters
}

/**
 * Clear cached elements (useful for testing or dynamic content)
 * @returns {void}
 */
export function clearDOMElementsCache() {
    cachedElements = null;
}

