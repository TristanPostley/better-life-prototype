/**
 * Modal management
 */

import { getDOMElements } from '../utils/dom.js';
import { showPage } from './navigation.js';

let dom = null;

/**
 * Initialize modal module
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
 * @param {boolean} hideCloseButton - Whether to hide the close button
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
 */
export function closeModal() {
    dom.display.modalOverlay.classList.add('hidden');
    // If we are on the menu page (which is likely if modals are open), re-trigger animations
    if (!dom.pages.menu.classList.contains('hidden-page')) {
        // Remove fade-out from menu content
        dom.menuContent.classList.remove('fade-out');
        showPage('menu');
    }
}

