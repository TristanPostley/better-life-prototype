/**
 * Error handling utilities
 * 
 * Standardizes error handling patterns across the application
 */

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
    /** Critical errors that break functionality */
    CRITICAL: 'critical',
    /** Errors that affect functionality but don't break the app */
    ERROR: 'error',
    /** Warnings for non-critical issues */
    WARNING: 'warning',
    /** Info messages for debugging */
    INFO: 'info'
};

/**
 * Error context information
 * @typedef {Object} ErrorContext
 * @property {string} [module] - Module or file where error occurred
 * @property {string} [function] - Function name where error occurred
 * @property {Object} [data] - Additional context data
 */

/**
 * Handle an error with standardized logging and optional recovery
 * @param {Error|string} error - Error object or error message
 * @param {Object} options - Error handling options
 * @param {string} [options.severity] - Error severity (default: 'error')
 * @param {ErrorContext} [options.context] - Additional context about the error
 * @param {Function} [options.onError] - Callback to execute on error
 * @param {boolean} [options.silent] - If true, don't log to console (default: false)
 * @returns {void}
 */
export function handleError(error, options = {}) {
    const {
        severity = ERROR_SEVERITY.ERROR,
        context = {},
        onError,
        silent = false
    } = options;

    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Build context string
    const contextParts = [];
    if (context.module) contextParts.push(`Module: ${context.module}`);
    if (context.function) contextParts.push(`Function: ${context.function}`);
    
    const contextStr = contextParts.length > 0 ? ` [${contextParts.join(', ')}]` : '';

    // Log based on severity (unless silent)
    if (!silent) {
        switch (severity) {
            case ERROR_SEVERITY.CRITICAL:
                console.error(`[CRITICAL]${contextStr}`, errorMessage, errorStack || '');
                break;
            case ERROR_SEVERITY.ERROR:
                console.error(`[ERROR]${contextStr}`, errorMessage, errorStack || '');
                break;
            case ERROR_SEVERITY.WARNING:
                console.warn(`[WARNING]${contextStr}`, errorMessage);
                break;
            case ERROR_SEVERITY.INFO:
                console.info(`[INFO]${contextStr}`, errorMessage);
                break;
            default:
                console.error(`[ERROR]${contextStr}`, errorMessage);
        }
    }

    // Call custom error handler if provided
    if (onError && typeof onError === 'function') {
        try {
            onError(error, context);
        } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
        }
    }
}

/**
 * Wrap a function with error handling
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Error handling options
 * @param {string} [options.functionName] - Name of the function for context
 * @param {string} [options.module] - Module name for context
 * @param {*} [options.defaultReturn] - Default value to return on error
 * @param {Function} [options.onError] - Callback on error
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, options = {}) {
    const {
        functionName = fn.name || 'anonymous',
        module,
        defaultReturn,
        onError
    } = options;

    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            handleError(error, {
                context: { module, function: functionName },
                onError
            });
            
            return defaultReturn;
        }
    };
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Error handling options
 * @param {string} [options.functionName] - Name of the function for context
 * @param {string} [options.module] - Module name for context
 * @param {*} [options.defaultReturn] - Default value to return on error
 * @param {Function} [options.onError] - Callback on error
 * @returns {Function} Wrapped async function
 */
export function withAsyncErrorHandling(fn, options = {}) {
    const {
        functionName = fn.name || 'anonymous',
        module,
        defaultReturn,
        onError
    } = options;

    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            handleError(error, {
                context: { module, function: functionName },
                onError
            });
            
            return defaultReturn;
        }
    };
}

/**
 * Safely execute a function with error handling
 * @param {Function} fn - Function to execute
 * @param {*} [defaultReturn] - Default return value on error
 * @param {ErrorContext} [context] - Error context
 * @returns {*} Function result or defaultReturn on error
 */
export function safeExecute(fn, defaultReturn = undefined, context = {}) {
    try {
        return fn();
    } catch (error) {
        handleError(error, { context });
        return defaultReturn;
    }
}

/**
 * Safely execute an async function with error handling
 * @param {Function} fn - Async function to execute
 * @param {*} [defaultReturn] - Default return value on error
 * @param {ErrorContext} [context] - Error context
 * @returns {Promise<*>} Promise resolving to function result or defaultReturn on error
 */
export async function safeExecuteAsync(fn, defaultReturn = undefined, context = {}) {
    try {
        return await fn();
    } catch (error) {
        handleError(error, { context });
        return defaultReturn;
    }
}

