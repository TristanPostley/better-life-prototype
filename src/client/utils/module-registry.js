/**
 * Module Dependency Registry
 * 
 * Provides a centralized way for modules to register and access dependencies
 * without polluting the global window object. This replaces the window.* pattern
 * for cross-module communication.
 * 
 * Usage:
 *   // Register a dependency
 *   moduleRegistry.register('finishSession', finishSession);
 * 
 *   // Access a dependency
 *   const finishSession = moduleRegistry.get('finishSession');
 */

class ModuleRegistry {
    constructor() {
        /** @type {Map<string, any>} */
        this.registry = new Map();
        
        /** @type {Map<string, Array<(value: any) => void>>} */
        this.waiters = new Map();
    }

    /**
     * Register a module dependency
     * @param {string} name - Name of the dependency
     * @param {*} value - The value to register
     * @returns {void}
     */
    register(name, value) {
        this.registry.set(name, value);
        
        // Notify any waiters
        const waiters = this.waiters.get(name);
        if (waiters) {
            waiters.forEach(waiter => waiter(value));
            this.waiters.delete(name);
        }
    }

    /**
     * Get a registered dependency
     * @param {string} name - Name of the dependency
     * @returns {*} The registered value, or undefined if not registered
     */
    get(name) {
        return this.registry.get(name);
    }

    /**
     * Check if a dependency is registered
     * @param {string} name - Name of the dependency
     * @returns {boolean} True if registered
     */
    has(name) {
        return this.registry.has(name);
    }

    /**
     * Wait for a dependency to be registered
     * @param {string} name - Name of the dependency
     * @returns {Promise<any>} Promise that resolves when dependency is registered
     */
    async waitFor(name) {
        // If already registered, return immediately
        if (this.registry.has(name)) {
            return this.registry.get(name);
        }

        // Otherwise, wait for it
        return new Promise((resolve) => {
            if (!this.waiters.has(name)) {
                this.waiters.set(name, []);
            }
            this.waiters.get(name).push(resolve);
        });
    }

    /**
     * Unregister a dependency
     * @param {string} name - Name of the dependency
     * @returns {void}
     */
    unregister(name) {
        this.registry.delete(name);
    }

    /**
     * Clear all registered dependencies
     * @returns {void}
     */
    clear() {
        this.registry.clear();
        this.waiters.clear();
    }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();

// Also expose on window for inline script compatibility (temporary)
// This will be removed once inline script is converted to module
if (typeof window !== 'undefined') {
    window.moduleRegistry = moduleRegistry;
}

