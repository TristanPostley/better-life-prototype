/**
 * Transition coordination utilities
 * 
 * Provides event-based coordination for CSS transitions and animations,
 * replacing hardcoded setTimeout delays with reliable event listeners.
 * 
 * @typedef {HTMLElement} Element
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get computed transition duration for an element
 * @param {Element} element - DOM element
 * @param {string} property - CSS property name (default: 'opacity')
 * @returns {number} Duration in milliseconds
 */
function getTransitionDuration(element, property = 'opacity') {
    if (prefersReducedMotion()) {
        return 0;
    }
    
    const style = window.getComputedStyle(element);
    const duration = style.transitionDuration || style.getPropertyValue(`transition-duration`);
    
    if (!duration || duration === 'none' || duration === '0s') {
        return 0;
    }
    
    // Parse duration (e.g., "0.5s" -> 500ms)
    const seconds = parseFloat(duration);
    return seconds * 1000;
}

/**
 * Wait for a CSS transition to complete
 * @param {Element} element - DOM element to watch
 * @param {string} [property='opacity'] - CSS property name to wait for
 * @param {number} [maxMs=2000] - Maximum time to wait in milliseconds (fallback)
 * @returns {Promise<void>} Resolves when transition completes or timeout expires
 */
export function waitForTransition(element, property = 'opacity', maxMs = 2000) {
    if (!element) {
        return Promise.resolve();
    }
    
    if (prefersReducedMotion()) {
        return Promise.resolve();
    }
    
    const duration = getTransitionDuration(element, property);
    
    // If no transition is set, resolve immediately
    if (duration === 0) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        let resolved = false;
        let timeoutId = null;
        
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (!resolved) {
                element.removeEventListener('transitionend', handler);
            }
        };
        
        const handler = (e) => {
            // Only resolve if this is the transition we're waiting for
            if (e.target === element && (!property || e.propertyName === property || e.propertyName === '')) {
                resolved = true;
                cleanup();
                resolve();
            }
        };
        
        // Listen for transitionend event
        element.addEventListener('transitionend', handler);
        
        // Fallback timeout
        timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                cleanup();
                console.warn(`Transition timeout: ${property} on element`, element);
                resolve();
            }
        }, Math.max(duration + 100, maxMs));
    });
}

/**
 * Wait for a CSS animation to complete
 * @param {Element} element - DOM element to watch
 * @param {string} [animationName] - Specific animation name to wait for (optional)
 * @param {number} [maxMs=2000] - Maximum time to wait in milliseconds (fallback)
 * @returns {Promise<void>} Resolves when animation completes or timeout expires
 */
export function waitForAnimation(element, animationName, maxMs = 2000) {
    if (!element) {
        return Promise.resolve();
    }
    
    if (prefersReducedMotion()) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        let resolved = false;
        let timeoutId = null;
        
        const cleanup = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (!resolved) {
                element.removeEventListener('animationend', handler);
            }
        };
        
        const handler = (e) => {
            // Only resolve if this is the animation we're waiting for
            // animationName can be matched against e.animationName (normalized by browser)
            if (e.target === element && (!animationName || e.animationName === animationName || e.animationName.toLowerCase() === animationName.toLowerCase())) {
                resolved = true;
                cleanup();
                resolve();
            }
        };
        
        // Listen for animationend event (use capture phase to catch it earlier)
        element.addEventListener('animationend', handler, { once: true });
        
        // Fallback timeout
        timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                cleanup();
                console.warn(`Animation timeout: ${animationName || 'unknown'} on element`, element);
                resolve();
            }
        }, maxMs);
    });
}

/**
 * Wait for transition or animation with fallback timeout
 * @param {Element} element - DOM element to watch
 * @param {string} [property] - CSS property name (for transitions) or animation name
 * @param {number} [maxMs=2000] - Maximum time to wait
 * @param {boolean} [isAnimation=false] - If true, wait for animation; otherwise wait for transition
 * @returns {Promise<void>}
 */
export function waitForTransitionOrTimeout(element, property, maxMs = 2000, isAnimation = false) {
    if (isAnimation) {
        return waitForAnimation(element, property, maxMs);
    }
    return waitForTransition(element, property, maxMs);
}

/**
 * Transition queue to serialize transitions and prevent race conditions
 */
class TransitionQueue {
    constructor() {
        /** @type {Array<() => Promise<void>>} */
        this.queue = [];
        this.processing = false;
        this.cancelled = false;
    }
    
    /**
     * Add a transition operation to the queue
     * @param {() => Promise<void>} operation - Async function that performs the transition
     * @returns {Promise<void>} Resolves when the operation completes
     */
    async enqueue(operation) {
        if (this.cancelled) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    await operation();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
            
            this.process();
        });
    }
    
    /**
     * Process the queue serially
     */
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        
        while (this.queue.length > 0 && !this.cancelled) {
            const operation = this.queue.shift();
            await operation();
        }
        
        this.processing = false;
    }
    
    /**
     * Cancel all pending transitions
     */
    cancel() {
        this.cancelled = true;
        this.queue = [];
    }
    
    /**
     * Reset the queue (used when starting new navigation)
     */
    reset() {
        this.cancel();
        this.cancelled = false;
    }
    
    /**
     * Check if queue is processing
     * @returns {boolean}
     */
    isProcessing() {
        return this.processing;
    }
}

/**
 * Global transition queue instance
 */
let globalTransitionQueue = null;

/**
 * Get or create the global transition queue
 * @returns {TransitionQueue}
 */
export function getTransitionQueue() {
    if (!globalTransitionQueue) {
        globalTransitionQueue = new TransitionQueue();
    }
    return globalTransitionQueue;
}

/**
 * Clean up transition listeners and cancel pending operations
 * @param {Element} element - Element to clean up (optional, cleans all if not provided)
 */
export function cleanupTransitionListeners(element) {
    if (element) {
        // Remove any pending listeners by cloning the element (extreme but effective)
        // Actually, we can't easily remove listeners without storing references
        // This is handled by the Promise cleanup in waitForTransition/waitForAnimation
        return;
    }
    
    // Clean up global queue
    if (globalTransitionQueue) {
        globalTransitionQueue.cancel();
        globalTransitionQueue = null;
    }
}

/**
 * Wait for multiple transitions to complete in parallel
 * @param {Array<{element: Element, property?: string, isAnimation?: boolean}>} transitions
 * @returns {Promise<void>} Resolves when all transitions complete
 */
export function waitForAllTransitions(transitions) {
    const promises = transitions.map(({ element, property, isAnimation = false }) => {
        if (isAnimation) {
            return waitForAnimation(element, property);
        }
        return waitForTransition(element, property);
    });
    
    return Promise.all(promises);
}

/**
 * Wait for transitions to complete sequentially
 * @param {Array<{element: Element, property?: string, isAnimation?: boolean}>} transitions
 * @returns {Promise<void>} Resolves when all transitions complete in order
 */
export async function waitForTransitionsSequentially(transitions) {
    for (const { element, property, isAnimation = false } of transitions) {
        if (isAnimation) {
            await waitForAnimation(element, property);
        } else {
            await waitForTransition(element, property);
        }
    }
}

