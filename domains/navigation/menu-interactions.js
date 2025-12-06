/**
 * Menu page interactions (draggable buttons and triangle movement)
 */

import { getDOMElements } from '../utils/dom.js';
import { state } from '../state/app-state.js';

let dom = null;
const BUTTON_SIZE = 100;
let triangleClickHandler = null; // Store locally, not in state module

/**
 * Initialize menu interactions module
 */
export function initMenuInteractions() {
    dom = getDOMElements();

    // Initialize button positions
    initButtonPositions();
    window.addEventListener('resize', initButtonPositions);

    // Setup drag functionality
    setupDragFunctionality();

    // Setup triangle movement
    setupTriangleMovement();
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
            if (state.wasDragged) {
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
    state.draggedBtn = e.currentTarget;
    state.draggedBtn.classList.add('dragging');
    state.wasDragged = false;

    const rect = state.draggedBtn.getBoundingClientRect();
    if (e.type === 'touchstart') {
        state.offsetX = e.touches[0].clientX - rect.left;
        state.offsetY = e.touches[0].clientY - rect.top;
    } else {
        state.offsetX = e.clientX - rect.left;
        state.offsetY = e.clientY - rect.top;
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
    if (!state.draggedBtn) return;
    e.preventDefault();
    state.wasDragged = true;

    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    let newX = clientX - state.offsetX;
    let newY = clientY - state.offsetY;

    // Keep within bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - BUTTON_SIZE));
    newY = Math.max(0, Math.min(newY, window.innerHeight - BUTTON_SIZE));

    state.draggedBtn.style.left = newX + 'px';
    state.draggedBtn.style.top = newY + 'px';
}

/**
 * Stop dragging
 */
function stopDrag(e) {
    if (!state.draggedBtn) return;

    state.draggedBtn.classList.remove('dragging');
    state.draggedBtn = null;

    // Reset wasDragged flag after a brief delay to allow click event to be blocked
    setTimeout(() => {
        state.wasDragged = false;
    }, 10);

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
}

/**
 * Setup triangle movement on menu page
 */
export function setupTriangleMovement() {
    const triangle = dom.triangle;
    const menuPage = dom.pages.menu;

    if (!triangle || !menuPage) return;

    // Remove existing handler if any
    if (triangleClickHandler) {
        menuPage.removeEventListener('click', triangleClickHandler);
    }

    // Create new handler
    triangleClickHandler = (e) => {
        console.log('Menu page clicked', e.target);

        // Don't move if clicking on buttons or other interactive elements
        if (e.target.closest('.float-btn') ||
            e.target.closest('#modal-overlay') ||
            e.target.closest('#questions-flow') ||
            e.target.closest('#better-today-flow') ||
            e.target.closest('#better-life-meaning-flow') ||
            e.target.closest('#how-it-works-flow') ||
            e.target.closest('#advice-flow')) {
            console.log('Click ignored: interactive element');
            return;
        }

        // Only move if triangle is visible
        console.log('Triangle classes:', triangle.className);
        if (triangle.classList.contains('hidden') || !triangle.classList.contains('fade-in')) {
            console.log('Click ignored: triangle hidden or not faded in');
            return;
        }

        const clickX = e.clientX;
        const clickY = e.clientY;

        // Get triangle's current position
        const rect = triangle.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;

        // Calculate distance to move (move 80% of the way toward click)
        const moveRatio = 0.8;
        const deltaX = clickX - currentX;
        const deltaY = clickY - currentY;
        const newX = currentX + deltaX * moveRatio;
        const newY = currentY + deltaY * moveRatio;

        // Calculate angle to destination (in degrees)
        // atan2 gives angle from positive x-axis (0° = right, 90° = down)
        // Triangle points up by default (toward -90° or 270°), so we need to adjust
        // atan2(deltaY, deltaX) gives: right=0°, down=90°, left=180°, up=-90° (or 270°)
        // We want triangle to point toward destination, so we add 90° to align with CSS rotation
        // This makes: right=90°, down=180°, left=270°, up=0° (or 360°)
        const angleRad = Math.atan2(deltaY, deltaX);
        const targetRotation = angleRad * (180 / Math.PI) + 90;

        // Get current rotation from state
        const currentRotation = state.triangleRotation || 0;

        // Calculate shortest path for rotation
        let diff = targetRotation - currentRotation;

        // Normalize diff to be between -180 and 180 to take the shortest path
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        // Apply the difference to the current rotation
        // This allows the rotation value to go beyond 0-360 (e.g. 720, -90)
        // which ensures smooth CSS transitions without spinning the long way
        state.triangleRotation = currentRotation + diff;

        console.log('Triangle movement:', {
            deltaX,
            deltaY,
            angleRad: angleRad * (180 / Math.PI),
            targetRotation,
            diff,
            newRotation: state.triangleRotation
        });

        // Convert to percentage for responsive positioning
        const newXPercent = (newX / window.innerWidth) * 100;
        const newYPercent = (newY / window.innerHeight) * 100;

        // Update triangle position and rotation together
        // The CSS transition will animate both position and rotation smoothly
        triangle.style.left = newXPercent + '%';
        triangle.style.top = newYPercent + '%';
        triangle.style.transform = `translate(-50%, -50%) rotate(${state.triangleRotation}deg)`;

        console.log('Triangle transform applied:', triangle.style.transform);
    };

    menuPage.addEventListener('click', triangleClickHandler);
}

// Make setupTriangleMovement available globally for navigation module
window.setupTriangleMovement = setupTriangleMovement;

