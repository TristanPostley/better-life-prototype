/**
 * Triangle interaction on menu page
 * 
 * Triangle starts in upper left corner and moves toward click points,
 * rotating to face the direction of movement.
 * 
 * @typedef {import('../../../shared/types/dom.js').DOMElements} DOMElements
 */

import { getDOMElements } from '../../utils/dom-elements.js';
import { handleError, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

let dom = null;
let triangleElement = null;
let animationFrameId = null;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let isMoving = false;

const TRIANGLE_SIZE = 20;
const SPEED = 3; // pixels per frame
const ROTATION_OFFSET = 90; // Adjust so triangle point faces click direction (triangle points up by default, so +90 to point right)

/**
 * Initialize triangle module
 * @returns {void}
 */
export function initTriangle() {
    dom = getDOMElements();
    triangleElement = dom.menuTriangle;
    
    if (!triangleElement) {
        handleError('Triangle element not found', {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'triangle.js', function: 'initTriangle' }
        });
        return;
    }

    // Initialize position to upper left corner
    currentX = 0;
    currentY = 0;
    triangleElement.style.left = currentX + 'px';
    triangleElement.style.top = currentY + 'px';
    triangleElement.style.transform = 'rotate(0deg)';

    // Add click listener to menu page (only on empty space)
    const menuPage = dom.pages.menu;
    if (menuPage) {
        menuPage.addEventListener('click', handleMenuClick);
    }
}

/**
 * Handle click on menu page
 * @param {MouseEvent} e - Click event
 * @returns {void}
 */
function handleMenuClick(e) {
    const target = e.target;
    
    // Ignore clicks on interactive elements
    if (target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('.float-btn') ||
        target.tagName === 'H1' ||
        target.closest('h1') ||
        (target.tagName === 'SVG' && target.id === 'menu-triangle')) {
        return;
    }

    // Only respond to clicks on empty space:
    // - Direct clicks on menu-page or menu-content
    // - Clicks on floating-buttons container (empty space between buttons)
    const isMenuPage = target.id === 'menu-page';
    const isMenuContent = target.id === 'menu-content';
    const isFloatingButtons = target.classList.contains('floating-buttons');
    
    if (!isMenuPage && !isMenuContent && !isFloatingButtons) {
        // If clicking on a child element, ignore it
        return;
    }

    // Get click position relative to menu page
    const menuPage = dom.pages.menu;
    if (!menuPage) return;

    const rect = menuPage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Set target position (account for triangle center)
    targetX = clickX - TRIANGLE_SIZE / 2;
    targetY = clickY - TRIANGLE_SIZE / 2;

    // Calculate rotation angle to face the click point
    const angle = Math.atan2(clickY - (currentY + TRIANGLE_SIZE / 2), 
                            clickX - (currentX + TRIANGLE_SIZE / 2)) * 180 / Math.PI;
    
    // Apply rotation immediately
    triangleElement.style.transform = `rotate(${angle + ROTATION_OFFSET}deg)`;

    // Start or continue movement animation
    if (!isMoving) {
        isMoving = true;
        animate();
    }
    // If already moving, the animate() function will use the new targetX/targetY
}

/**
 * Animate triangle movement toward target
 * @returns {void}
 */
function animate() {
    if (!triangleElement) return;

    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If close enough, stop
    if (distance < SPEED) {
        currentX = targetX;
        currentY = targetY;
        triangleElement.style.left = currentX + 'px';
        triangleElement.style.top = currentY + 'px';
        isMoving = false;
        return;
    }

    // Move toward target
    const moveX = (dx / distance) * SPEED;
    const moveY = (dy / distance) * SPEED;
    
    currentX += moveX;
    currentY += moveY;

    // Keep within bounds
    const menuPage = dom.pages.menu;
    if (menuPage) {
        const maxX = menuPage.offsetWidth - TRIANGLE_SIZE;
        const maxY = menuPage.offsetHeight - TRIANGLE_SIZE;
        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));
    }

    triangleElement.style.left = currentX + 'px';
    triangleElement.style.top = currentY + 'px';

    // Continue animation
    animationFrameId = requestAnimationFrame(animate);
}

/**
 * Cleanup triangle module
 * @returns {void}
 */
export function cleanupTriangle() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isMoving = false;
    
    const menuPage = dom?.pages?.menu;
    if (menuPage) {
        menuPage.removeEventListener('click', handleMenuClick);
    }
}

