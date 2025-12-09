/**
 * Questions flow and interactions
 * 
 * @typedef {import('./types.js').QuestionType} QuestionType
 * @typedef {import('./types.js').HistoryEntry} HistoryEntry
 */

import { getDOMElements } from '../../src/shared/utils/dom-elements.js';
import { showPage } from '../navigation/routing.js';
import * as supabaseModule from '../../supabase-client.js';
import { waitForTransition, waitForTransitionsSequentially } from '../../src/shared/utils/transitions.js';
import { CSS_CLASSES, TRANSITION_TIMEOUTS } from '../../src/shared/constants.js';

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
async function resetToMenuPage() {
    // Clear all pending timeouts
    questionsTimeouts.forEach(id => clearTimeout(id));
    questionsTimeouts = [];
    // Hide all flows
    dom.questionsFlow.classList.add(CSS_CLASSES.HIDDEN);
    dom.questionsFlow.classList.remove(CSS_CLASSES.FADE_OUT);
    dom.questionsFlow.classList.remove('fade-others');
    dom.howItWorksFlow.classList.add(CSS_CLASSES.HIDDEN);
    dom.betterTodayFlow.classList.add(CSS_CLASSES.HIDDEN);
    dom.betterLifeMeaningFlow.classList.add(CSS_CLASSES.HIDDEN);
    dom.adviceFlow.classList.add(CSS_CLASSES.HIDDEN);

    // Reset all question/explain items
    dom.questionItems.forEach(item => {
        item.classList.remove(CSS_CLASSES.SHOW);
        item.classList.remove('slide-to-top');
        item.classList.remove('keep-visible');
        item.classList.remove('at-top');
        // Reset all inline styles
        item.style.cssText = '';
    });
    dom.explainItems.forEach(item => item.classList.remove(CSS_CLASSES.SHOW));
    dom.adviceItems.forEach(item => item.classList.remove(CSS_CLASSES.SHOW));
    dom.betterTodayInput.classList.remove(CSS_CLASSES.SHOW);
    dom.betterLifeMeaningInput.classList.remove(CSS_CLASSES.SHOW);

    // Remove fade-out from menu content
    dom.menuContent.classList.remove(CSS_CLASSES.FADE_OUT);

    // Show menu content with animation
    await showPage('menu');
}

/**
 * Handle questions button click
 */
async function handleQuestionsClick() {
    // Clear any pending timeouts from previous interactions
    questionsTimeouts.forEach(id => clearTimeout(id));
    questionsTimeouts = [];

    // Reset questions state before starting
    dom.questionsFlow.classList.remove(CSS_CLASSES.FADE_OUT);
    dom.questionsFlow.classList.remove('fade-others');
    dom.questionItems.forEach(item => {
        item.classList.remove(CSS_CLASSES.SHOW);
        item.classList.remove('slide-to-top');
        item.classList.remove('keep-visible');
        item.classList.remove('at-top');
        // Reset all inline styles
        item.style.cssText = '';
    });

    // Fade out menu content
    dom.menuContent.classList.add(CSS_CLASSES.FADE_OUT);
    await waitForTransition(dom.menuContent, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);

    // Show questions flow
    dom.questionsFlow.classList.remove(CSS_CLASSES.HIDDEN);
    void dom.questionsFlow.offsetWidth;

    // Force reflow on each item
    dom.questionItems.forEach(item => {
        void item.offsetWidth;
    });

    // Fade in questions sequentially
    for (const item of dom.questionItems) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        item.classList.add(CSS_CLASSES.SHOW);
        await waitForTransition(item, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
    }
}

/**
 * Handle "How does this work?" question click
 */
async function handleHowItWorksClick() {
    // Fade out questions
    dom.questionsFlow.classList.add(CSS_CLASSES.FADE_OUT);
    await waitForTransition(dom.questionsFlow, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);

    // Show how it works flow
    dom.questionsFlow.classList.add(CSS_CLASSES.HIDDEN);
    dom.howItWorksFlow.classList.remove(CSS_CLASSES.HIDDEN);

    // Fade in explanation lines sequentially
    for (const item of dom.explainItems) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        item.classList.add(CSS_CLASSES.SHOW);
        await waitForTransition(item, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
    }
}

/**
 * Handle "How did you make your life better today?" question click
 */
async function handleBetterTodayClick() {
    // Keep this question visible while fading others
    dom.qBetterToday.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');
    
    // Wait for other questions to fade out
    const otherQuestions = dom.questionItems.filter(item => item !== dom.qBetterToday);
    const fadeOutTransitions = otherQuestions.map(item => ({
        element: item,
        property: 'opacity'
    }));
    await waitForTransitionsSequentially(fadeOutTransitions);

    // Get current position before changing to fixed
    const rect = dom.qBetterToday.getBoundingClientRect();

    // Set to fixed at current position
    dom.qBetterToday.style.top = rect.top + 'px';
    dom.qBetterToday.classList.add('slide-to-top');

    // Force reflow, then animate to top
    void dom.qBetterToday.offsetWidth;
    dom.qBetterToday.classList.add('at-top');

    // Wait for slide animation to complete
    await waitForTransition(dom.qBetterToday, 'top', TRANSITION_TIMEOUTS.DEFAULT);

    // Show input
    dom.betterTodayFlow.classList.remove(CSS_CLASSES.HIDDEN);
    
    // Fade in the input
    await new Promise(resolve => requestAnimationFrame(resolve));
    dom.betterTodayInput.classList.add(CSS_CLASSES.SHOW);
    dom.betterTodayInput.focus();
    await waitForTransition(dom.betterTodayInput, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
}

/**
 * Handle "What does a better life mean to you?" question click
 */
async function handleBetterLifeMeaningClick() {
    // Keep this question visible while fading others
    dom.qBetterLifeMeaning.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');
    
    // Wait for other questions to fade out
    const otherQuestions = dom.questionItems.filter(item => item !== dom.qBetterLifeMeaning);
    const fadeOutTransitions = otherQuestions.map(item => ({
        element: item,
        property: 'opacity'
    }));
    await waitForTransitionsSequentially(fadeOutTransitions);

    // Get current position before changing to fixed
    const rect = dom.qBetterLifeMeaning.getBoundingClientRect();

    // Set to fixed at current position
    dom.qBetterLifeMeaning.style.top = rect.top + 'px';
    dom.qBetterLifeMeaning.classList.add('slide-to-top');

    // Force reflow, then animate to top
    void dom.qBetterLifeMeaning.offsetWidth;
    dom.qBetterLifeMeaning.classList.add('at-top');

    // Wait for slide animation to complete
    await waitForTransition(dom.qBetterLifeMeaning, 'top', TRANSITION_TIMEOUTS.DEFAULT);

    // Show input
    dom.betterLifeMeaningFlow.classList.remove(CSS_CLASSES.HIDDEN);
    
    // Fade in the input
    await new Promise(resolve => requestAnimationFrame(resolve));
    dom.betterLifeMeaningInput.classList.add(CSS_CLASSES.SHOW);
    dom.betterLifeMeaningInput.focus();
    await waitForTransition(dom.betterLifeMeaningInput, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
}

/**
 * Handle "Looking for advice?" question click
 */
async function handleAdviceClick() {
    // Keep this question visible while fading others
    dom.qAdvice.classList.add('keep-visible');
    dom.questionsFlow.classList.add('fade-others');
    
    // Wait for other questions to fade out
    const otherQuestions = dom.questionItems.filter(item => item !== dom.qAdvice);
    const fadeOutTransitions = otherQuestions.map(item => ({
        element: item,
        property: 'opacity'
    }));
    await waitForTransitionsSequentially(fadeOutTransitions);

    // Get current position before changing to fixed
    const rect = dom.qAdvice.getBoundingClientRect();

    // Set to fixed at current position
    dom.qAdvice.style.top = rect.top + 'px';
    dom.qAdvice.classList.add('slide-to-top');

    // Force reflow, then animate to top
    void dom.qAdvice.offsetWidth;
    dom.qAdvice.classList.add('at-top');

    // Wait for slide animation to complete
    await waitForTransition(dom.qAdvice, 'top', TRANSITION_TIMEOUTS.DEFAULT);

    // Show advice items
    dom.adviceFlow.classList.remove(CSS_CLASSES.HIDDEN);
    
    // Fade in the advice items sequentially
    for (const item of dom.adviceItems) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        item.classList.add(CSS_CLASSES.SHOW);
        await waitForTransition(item, 'opacity', TRANSITION_TIMEOUTS.SHORT);
    }
}

/**
 * Handle better today input submission
 * @returns {Promise<void>}
 */
async function handleBetterTodaySubmit() {
    const value = dom.betterTodayInput.value.trim();
    if (value) {
        try {
            await supabaseModule.saveResponse('better_today', value);
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
        } catch (error) {
            console.error('Error saving response:', error);
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
        try {
            await supabaseModule.saveResponse('life_meaning', value);
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
        } catch (error) {
            console.error('Error saving response:', error);
        }
    }
}

