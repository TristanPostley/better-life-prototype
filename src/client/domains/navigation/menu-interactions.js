/**
 * Menu page interactions (draggable buttons)
 * 
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 * @typedef {import('../../../shared/types/state.js').AppState} AppState
 */

import { getDOMElements } from '../../utils/dom-elements.js';
import { getState, setState } from '../../state/app-state.js';

let dom = null;
const BUTTON_SIZE = 100;

/**
 * Initialize menu interactions module
 * @returns {void}
 */
export function initMenuInteractions() {
    dom = getDOMElements();

    // Initialize button positions
    initButtonPositions();
    window.addEventListener('resize', initButtonPositions);

    // Setup drag functionality
    setupDragFunctionality();
}

/**
 * Initialize button positions - Questions at top, Settings/Feedback at bottom
 */
function initButtonPositions() {
    const centerX = window.innerWidth / 2;
    const BUTTON_HALF = BUTTON_SIZE / 2;

    dom.floatButtons.forEach((btn) => {
        const btnId = btn.id;
        let x, y;

        if (btnId === 'btn-questions') {
            // Questions at top center
            x = centerX - BUTTON_HALF;
            y = window.innerHeight * 0.15;
        } else if (btnId === 'btn-settings') {
            // Settings at bottom left
            x = centerX - BUTTON_SIZE - 30;
            y = window.innerHeight * 0.7;
        } else if (btnId === 'btn-feedback') {
            // Feedback at bottom right
            x = centerX + 30;
            y = window.innerHeight * 0.7;
        } else {
            // Fallback: center
            x = centerX - BUTTON_HALF;
            y = window.innerHeight / 2;
        }

        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
    });
}

/**
 * Setup drag functionality for floating buttons
 */
function setupDragFunctionality() {
    dom.floatButtons.forEach(btn => {
        btn.addEventListener('mousedown', startDrag);
        btn.addEventListener('touchstart', startDrag, { passive: false });

        // Block click events that occur after dragging
        btn.addEventListener('click', (e) => {
            if (getState('wasDragged')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true); // Use capture phase to intercept before other handlers
    });
}

/**
 * Start dragging a button
 */
function startDrag(e) {
    e.preventDefault();
    const draggedBtn = e.currentTarget;
    setState('draggedBtn', draggedBtn, { persist: false });
    draggedBtn.classList.add('dragging');
    setState('wasDragged', false, { persist: false });

    const rect = draggedBtn.getBoundingClientRect();
    if (e.type === 'touchstart') {
        setState('offsetX', e.touches[0].clientX - rect.left, { persist: false });
        setState('offsetY', e.touches[0].clientY - rect.top, { persist: false });
    } else {
        setState('offsetX', e.clientX - rect.left, { persist: false });
        setState('offsetY', e.clientY - rect.top, { persist: false });
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

/**
 * Handle dragging
 */
function drag(e) {
    const draggedBtn = getState('draggedBtn');
    if (!draggedBtn) return;
    e.preventDefault();
    setState('wasDragged', true, { persist: false });

    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const offsetX = getState('offsetX');
    const offsetY = getState('offsetY');
    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    // Keep within bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - BUTTON_SIZE));
    newY = Math.max(0, Math.min(newY, window.innerHeight - BUTTON_SIZE));

    draggedBtn.style.left = newX + 'px';
    draggedBtn.style.top = newY + 'px';
}

/**
 * Stop dragging
 */
function stopDrag(e) {
    const draggedBtn = getState('draggedBtn');
    if (!draggedBtn) return;

    draggedBtn.classList.remove('dragging');
    setState('draggedBtn', null, { persist: false });

    // Reset wasDragged flag after a brief delay to allow click event to be blocked
    setTimeout(() => {
        setState('wasDragged', false, { persist: false });
    }, 10);

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
}

