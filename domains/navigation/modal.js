/**
 * Modal management
 * 
 * @typedef {import('../../src/types/dom.js').DOMElements} DOMElements
 */

import { getDOMElements } from '../../src/shared/utils/dom-elements.js';
import { showPage } from './routing.js';
import { waitForTransition } from '../../src/shared/utils/transitions.js';
import { CSS_CLASSES, TRANSITION_TIMEOUTS } from '../../src/shared/constants.js';

let dom = null;

/**
 * Initialize modal module
 * @returns {void}
 */
export function initModal() {
    dom = getDOMElements();
    
    // Set up modal event listeners
    dom.display.closeModal.addEventListener('click', async () => {
        await closeModal();
    });

    dom.display.modalOverlay.addEventListener('click', async (e) => {
        if (e.target === dom.display.modalOverlay) {
            await closeModal();
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
 * @returns {Promise<void>}
 */
export async function closeModal() {
    // Wait for modal fade-out if needed (modal doesn't have explicit fade-out currently)
    dom.display.modalOverlay.classList.add(CSS_CLASSES.HIDDEN);
    // If we are on the menu page (which is likely if modals are open), re-trigger animations
    if (!dom.pages.menu.classList.contains('hidden-page')) {
        // Remove fade-out from menu content
        dom.menuContent.classList.remove(CSS_CLASSES.FADE_OUT);
        await showPage('menu');
    }
}

