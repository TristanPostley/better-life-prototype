/**
 * DOM helper utilities
 * 
 * Encapsulates common DOM operations to reduce direct manipulation
 * and improve maintainability
 * 
 * @typedef {import('../../shared/types/dom.js').PageName} PageName
 */

import { CSS_CLASSES, PAGES } from '../../shared/constants.js';
import { getDOMElements } from './dom-elements.js';

/**
 * Show an element by removing hidden class
 * @param {HTMLElement|null|undefined} element - Element to show
 * @returns {void}
 */
export function showElement(element) {
    if (!element) return;
    element.classList.remove(CSS_CLASSES.HIDDEN);
}

/**
 * Hide an element by adding hidden class
 * @param {HTMLElement|null|undefined} element - Element to hide
 * @returns {void}
 */
export function hideElement(element) {
    if (!element) return;
    element.classList.add(CSS_CLASSES.HIDDEN);
}

/**
 * Toggle element visibility
 * @param {HTMLElement|null|undefined} element - Element to toggle
 * @returns {boolean} True if element is now visible, false if hidden
 */
export function toggleElement(element) {
    if (!element) return false;
    const isHidden = element.classList.contains(CSS_CLASSES.HIDDEN);
    if (isHidden) {
        element.classList.remove(CSS_CLASSES.HIDDEN);
        return true;
    } else {
        element.classList.add(CSS_CLASSES.HIDDEN);
        return false;
    }
}

/**
 * Add a CSS class to an element
 * @param {HTMLElement|null|undefined} element - Element to modify
 * @param {string} className - Class name to add
 * @returns {void}
 */
export function addClass(element, className) {
    if (!element) return;
    element.classList.add(className);
}

/**
 * Remove a CSS class from an element
 * @param {HTMLElement|null|undefined} element - Element to modify
 * @param {string} className - Class name to remove
 * @returns {void}
 */
export function removeClass(element, className) {
    if (!element) return;
    element.classList.remove(className);
}

/**
 * Toggle a CSS class on an element
 * @param {HTMLElement|null|undefined} element - Element to modify
 * @param {string} className - Class name to toggle
 * @returns {boolean} True if class was added, false if removed
 */
export function toggleClass(element, className) {
    if (!element) return false;
    return element.classList.toggle(className);
}

/**
 * Get a page element by page name
 * @param {PageName} pageName - Name of the page
 * @returns {HTMLElement|null} Page element or null
 */
export function getPageElement(pageName) {
    const pageIdMap = {
        [PAGES.LANDING]: 'landing-page',
        [PAGES.TIMER]: 'timer-page',
        [PAGES.MENU]: 'menu-page'
    };
    
    const pageId = pageIdMap[pageName];
    return pageId ? document.getElementById(pageId) : null;
}

/**
 * Navigate to a specific page (hide all pages, show target page)
 * @param {PageName} pageName - Name of the page to show
 * @returns {void}
 */
export function navigateToPage(pageName) {
    const dom = getDOMElements();
    
    // Hide all pages
    if (dom.pages.landing) {
        removeClass(dom.pages.landing, CSS_CLASSES.ACTIVE_PAGE);
        addClass(dom.pages.landing, CSS_CLASSES.HIDDEN);
    }
    if (dom.pages.timer) {
        removeClass(dom.pages.timer, CSS_CLASSES.ACTIVE_PAGE);
        addClass(dom.pages.timer, CSS_CLASSES.HIDDEN);
    }
    if (dom.pages.menu) {
        removeClass(dom.pages.menu, CSS_CLASSES.ACTIVE_PAGE);
        addClass(dom.pages.menu, CSS_CLASSES.HIDDEN);
    }
    
    // Show target page
    const targetPage = getPageElement(pageName);
    if (targetPage) {
        removeClass(targetPage, CSS_CLASSES.HIDDEN);
        addClass(targetPage, CSS_CLASSES.ACTIVE_PAGE);
    }
}

/**
 * Force a browser reflow (useful for triggering transitions)
 * @param {HTMLElement} element - Element to trigger reflow on
 * @returns {void}
 */
export function forceReflow(element) {
    if (!element) return;
    void element.offsetWidth;
}

