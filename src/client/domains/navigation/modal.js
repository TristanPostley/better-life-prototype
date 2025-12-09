/**
 * Modal management
 * 
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 */

import { getDOMElements } from '../../utils/dom-elements.js';
import { showPage } from './routing.js';

let dom = null;

/**
 * Initialize modal module
 * @returns {void}
 */
export function initModal() {
    dom = getDOMElements();
    
    // Set up modal event listeners
    dom.display.closeModal.addEventListener('click', () => {
        closeModal();
    });

    dom.display.modalOverlay.addEventListener('click', (e) => {
        if (e.target === dom.display.modalOverlay) {
            closeModal();
        }
    });
}

/**
 * Open a modal with the given content
 * @param {string} content - HTML content to display in the modal
 * @param {boolean} [hideCloseButton=false] - Whether to hide the close button
 * @returns {void}
 */
export function openModal(content, hideCloseButton = false) {
    // Always get fresh DOM elements to ensure we have the latest references
    const freshDom = getDOMElements();
    
    // Safety check: ensure we got a valid DOM object
    if (!freshDom || typeof freshDom !== 'object') {
        console.error('getDOMElements() returned invalid value', { freshDom });
        return;
    }
    
    dom = freshDom;
    
    // Check if modal elements exist (using optional chaining for safety)
    if (!dom?.display?.modalBody || !dom?.display?.modalOverlay || !dom?.display?.closeModal) {
        console.error('Modal elements not found', { dom, display: dom?.display });
        return;
    }
    
    dom.display.modalBody.innerHTML = content;
    dom.display.modalOverlay.classList.remove('hidden');

    if (hideCloseButton) {
        dom.display.closeModal.classList.add('hidden');
    } else {
        dom.display.closeModal.classList.remove('hidden');
    }
}

/**
 * Close the modal
 * @returns {void}
 */
export function closeModal() {
    // Get DOM elements if not already cached
    if (!dom) {
        dom = getDOMElements();
    }
    
    // Check if modal elements exist
    if (!dom || !dom.display || !dom.display.modalOverlay) {
        console.error('Modal overlay element not found');
        return;
    }
    
    dom.display.modalOverlay.classList.add('hidden');
    // If we are on the menu page (which is likely if modals are open), re-trigger animations
    if (dom.pages && dom.pages.menu && !dom.pages.menu.classList.contains('hidden-page')) {
        // Remove fade-out from menu content
        if (dom.menuContent) {
            dom.menuContent.classList.remove('fade-out');
        }
        showPage('menu');
    }
}

