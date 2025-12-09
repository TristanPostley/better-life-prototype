/**
 * Questions flow and interactions
 * 
 * @typedef {import('../../../shared/domains/reflection/types.js').QuestionType} QuestionType
 * @typedef {import('../../../shared/domains/reflection/types.js').HistoryEntry} HistoryEntry
 */

import { getDOMElements } from '../../utils/dom-elements.js';
import { showPage } from '../navigation/routing.js';
import * as supabaseModule from '../../services/supabase-client.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

let dom = null;
let questionsTimeouts = [];

/**
 * Initialize questions module
 * @returns {void}
 */
export function initQuestions() {
    dom = getDOMElements();
    
    // Set up event listeners
    dom.buttons.questions.addEventListener('click', handleQuestionsClick);
    dom.qHowItWorks.addEventListener('click', handleHowItWorksClick);
    dom.qBetterToday.addEventListener('click', handleBetterTodayClick);
    dom.qBetterLifeMeaning.addEventListener('click', handleBetterLifeMeaningClick);
    dom.qAdvice.addEventListener('click', handleAdviceClick);
    
    // Add background click listeners to all flows
    [dom.questionsFlow, dom.howItWorksFlow, dom.betterTodayFlow, dom.betterLifeMeaningFlow, dom.adviceFlow].forEach(flow => {
        flow.addEventListener('click', (e) => {
            // Only trigger if clicking the background (the flow container itself)
            if (e.target === flow) {
                resetToMenuPage();
            }
        });
    });
    
    // Handle input submissions
    dom.betterTodayInput.addEventListener('blur', handleBetterTodaySubmit);
    dom.betterTodayInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleBetterTodaySubmit();
        }
    });
    
    dom.betterLifeMeaningInput.addEventListener('blur', handleBetterLifeMeaningSubmit);
    dom.betterLifeMeaningInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleBetterLifeMeaningSubmit();
        }
    });
}

/**
 * Reset to initial menu page view
 */
function resetToMenuPage() {
    // Clear all pending timeouts
    questionsTimeouts.forEach(id => clearTimeout(id));
    questionsTimeouts = [];
    // Hide all flows
    dom.questionsFlow.classList.add('hidden');
    dom.questionsFlow.classList.remove('fade-out');
    dom.questionsFlow.classList.remove('fade-others');
    dom.howItWorksFlow.classList.add('hidden');
    dom.betterTodayFlow.classList.add('hidden');
    dom.betterLifeMeaningFlow.classList.add('hidden');
    dom.adviceFlow.classList.add('hidden');

    // Reset all question/explain items
    dom.questionItems.forEach(item => {
        item.classList.remove('show');
        item.classList.remove('slide-to-top');
        item.classList.remove('keep-visible');
        item.classList.remove('at-top');
        // Reset all inline styles
        item.style.cssText = '';
    });
    dom.explainItems.forEach(item => item.classList.remove('show'));
    dom.adviceItems.forEach(item => item.classList.remove('show'));
    dom.betterTodayInput.classList.remove('show');
    dom.betterLifeMeaningInput.classList.remove('show');

    // Remove fade-out from menu content
    dom.menuContent.classList.remove('fade-out');

    // Show menu content with animation
    showPage('menu');
}

/**
 * Handle questions button click
 */
function handleQuestionsClick() {
    // Clear any pending timeouts from previous interactions
    questionsTimeouts.forEach(id => clearTimeout(id));
    questionsTimeouts = [];

    // Reset questions state before starting
    dom.questionsFlow.classList.remove('fade-out');
    dom.questionsFlow.classList.remove('fade-others');
    dom.questionItems.forEach(item => {
        item.classList.remove('show');
        item.classList.remove('slide-to-top');
        item.classList.remove('keep-visible');
        item.classList.remove('at-top');
        // Reset all inline styles
        item.style.cssText = '';
    });

    // Fade out menu content
    dom.menuContent.classList.add('fade-out');

    // After fade out, show questions flow
    const mainTimeout = setTimeout(() => {
        dom.questionsFlow.classList.remove('hidden');

        // Force reflow before adding show classes
        void dom.questionsFlow.offsetWidth;

        // Force reflow on each item too
        dom.questionItems.forEach(item => {
            void item.offsetWidth;
        });

        // Fade in questions one at a time (start with 50ms delay for first)
        dom.questionItems.forEach((item, index) => {
            const itemTimeout = setTimeout(() => {
                item.classList.add('show');
            }, 50 + index * 800); // 800ms delay between each question
            questionsTimeouts.push(itemTimeout);
        });
    }, 1000); // Wait for fade out to complete
    questionsTimeouts.push(mainTimeout);
}

/**
 * Handle "How does this work?" question click
 */
function handleHowItWorksClick() {
    // Fade out questions
    dom.questionsFlow.classList.add('fade-out');

    // After fade out, show how it works flow
    setTimeout(() => {
        dom.questionsFlow.classList.add('hidden');
        dom.howItWorksFlow.classList.remove('hidden');

        // Fade in explanation lines one at a time
        dom.explainItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 1000); // 1s delay between each line
        });
    }, 1000); // Wait for fade out to complete
}

/**
 * Handle "How did you make your life better today?" question click
 */
function handleBetterTodayClick() {
    // Keep this question visible while fading others
    dom.qBetterToday.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');

    // After other questions fade out, slide this one to top
    setTimeout(() => {
        // Get current position before changing to fixed
        const rect = dom.qBetterToday.getBoundingClientRect();

        // Set to fixed at current position
        dom.qBetterToday.style.top = rect.top + 'px';
        dom.qBetterToday.classList.add('slide-to-top');

        // Force reflow, then animate to top
        void dom.qBetterToday.offsetWidth;
        dom.qBetterToday.classList.add('at-top');

        // After slide animation, show input
        setTimeout(() => {
            dom.betterTodayFlow.classList.remove('hidden');

            // Fade in the input
            setTimeout(() => {
                dom.betterTodayInput.classList.add('show');
                dom.betterTodayInput.focus();
            }, 100);
        }, 1000); // Wait for slide to complete
    }, 1000); // Wait for fade out to complete
}

/**
 * Handle "What does a better life mean to you?" question click
 */
function handleBetterLifeMeaningClick() {
    // Keep this question visible while fading others
    dom.qBetterLifeMeaning.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');

    // After other questions fade out, slide this one to top
    setTimeout(() => {
        // Get current position before changing to fixed
        const rect = dom.qBetterLifeMeaning.getBoundingClientRect();

        // Set to fixed at current position
        dom.qBetterLifeMeaning.style.top = rect.top + 'px';
        dom.qBetterLifeMeaning.classList.add('slide-to-top');

        // Force reflow, then animate to top
        void dom.qBetterLifeMeaning.offsetWidth;
        dom.qBetterLifeMeaning.classList.add('at-top');

        // After slide animation, show input
        setTimeout(() => {
            dom.betterLifeMeaningFlow.classList.remove('hidden');

            // Fade in the input
            setTimeout(() => {
                dom.betterLifeMeaningInput.classList.add('show');
                dom.betterLifeMeaningInput.focus();
            }, 100);
        }, 1000); // Wait for slide to complete
    }, 1000); // Wait for fade out to complete
}

/**
 * Handle "Looking for advice?" question click
 */
function handleAdviceClick() {
    // Keep this question visible while fading others
    dom.qAdvice.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');

    // After other questions fade out, slide this one to top
    setTimeout(() => {
        // Get current position before changing to fixed
        const rect = dom.qAdvice.getBoundingClientRect();

        // Set to fixed at current position
        dom.qAdvice.style.top = rect.top + 'px';
        dom.qAdvice.classList.add('slide-to-top');

        // Force reflow, then animate to top
        void dom.qAdvice.offsetWidth;
        dom.qAdvice.classList.add('at-top');

        // After slide animation, show advice items
        setTimeout(() => {
            dom.adviceFlow.classList.remove('hidden');

            // Fade in the advice items one at a time
            dom.adviceItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('show');
                }, index * 300); // 300ms delay between each item
            });
        }, 1000); // Wait for slide to complete
    }, 1000); // Wait for fade out to complete
}

/**
 * Handle better today input submission
 * @returns {Promise<void>}
 */
async function handleBetterTodaySubmit() {
    const value = dom.betterTodayInput.value.trim();
    if (value) {
        const result = await supabaseModule.saveResponse('better_today', value);
        
        if (result.success) {
            // Save to localStorage as backup
            /** @type {HistoryEntry[]} */
            const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
            /** @type {HistoryEntry} */
            const entry = {
                date: new Date().toISOString(),
                betterToday: value
            };
            history.push(entry);
            localStorage.setItem('bl_history', JSON.stringify(history));
            
            // Clear input and reset
            dom.betterTodayInput.value = '';
            resetToMenuPage();
        } else {
            handleError(`Error saving response: ${result.error}`, {
                severity: ERROR_SEVERITY.ERROR,
                context: { module: 'questions-ui.js', function: 'handleBetterTodaySubmit' }
            });
        }
    }
}

/**
 * Handle better life meaning input submission
 * @returns {Promise<void>}
 */
async function handleBetterLifeMeaningSubmit() {
    const value = dom.betterLifeMeaningInput.value.trim();
    if (value) {
        const result = await supabaseModule.saveResponse('life_meaning', value);
        
        if (result.success) {
            // Save to localStorage as backup
            /** @type {HistoryEntry[]} */
            const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
            /** @type {HistoryEntry} */
            const entry = {
                date: new Date().toISOString(),
                meaning: value
            };
            history.push(entry);
            localStorage.setItem('bl_history', JSON.stringify(history));
            
            // Clear input and reset
            dom.betterLifeMeaningInput.value = '';
            resetToMenuPage();
        } else {
            handleError(`Error saving response: ${result.error}`, {
                severity: ERROR_SEVERITY.ERROR,
                context: { module: 'questions-ui.js', function: 'handleBetterTodaySubmit' }
            });
        }
    }
}

