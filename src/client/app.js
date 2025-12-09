// Top-level log to verify module is loading
console.log('src/client/app.js module is being evaluated');

// Import modules first (these should always work)
import { initTimer, handleStartTimerClick, handleCircleClick, setTimerDisplay, updateStreak, resetTimerDisplay } from './domains/sessions/index.js';
import { initNavigation, showPage, initModal, initMenuInteractions, initTriangle } from './domains/navigation/index.js';
import { initQuestions } from './domains/reflection/index.js';
import { initSettings, loadUserData, checkAndMigrateLocalStorage, applyFont } from './domains/users/index.js';
import { getDOMElements } from './utils/dom-elements.js';
import { state, getState, setState } from './state/app-state.js';
import { handleError, withAsyncErrorHandling, ERROR_SEVERITY } from '../shared/utils/error-handler.js';
import { moduleRegistry } from './utils/module-registry.js';
import { CSS_CLASSES } from '../shared/constants.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('app.js: DOMContentLoaded fired');
    try {
        // Landing page buttons are set up in index.html inline script to ensure they work
        
        console.log('app.js: Starting initialization');
        // Try to load and initialize Supabase auth (optional, won't block if it fails)
        await withAsyncErrorHandling(
            async () => {
                const supabaseModule = await import('./services/supabase-client.js');
                if (supabaseModule.initAuth) {
                    await supabaseModule.initAuth();
                }
            },
            {
                functionName: 'initAuth',
                module: 'app.js',
                onError: () => {
                    handleError('Failed to initialize auth (continuing without it)', {
                        severity: ERROR_SEVERITY.WARNING,
                        context: { module: 'app.js', function: 'initAuth' },
                        silent: false
                    });
                }
            }
        )();

        // Initialize dark mode from state (state manager already loaded from localStorage)
        const isDarkMode = getState('darkMode');
        if (isDarkMode) {
            document.body.classList.add(CSS_CLASSES.DARK_MODE);
        }

    // Initialize font from localStorage
    applyFont();

    // Initialize DOM elements cache
    const dom = getDOMElements();

    // Load user data (timer duration, etc.)
    try {
        loadUserData();
    } catch (error) {
        handleError(error, {
            context: { module: 'app.js', function: 'loadUserData' }
        });
    }

    // Initialize all modules
    const moduleInitFunctions = [
        { fn: initTimer, name: 'initTimer' },
        { fn: initNavigation, name: 'initNavigation' },
        { fn: initModal, name: 'initModal' },
        { fn: initQuestions, name: 'initQuestions' },
        { fn: initSettings, name: 'initSettings' },
        { fn: initMenuInteractions, name: 'initMenuInteractions' },
        { fn: initTriangle, name: 'initTriangle' }
    ];

    for (const { fn, name } of moduleInitFunctions) {
        try {
            fn();
        } catch (error) {
            handleError(error, {
                context: { module: 'app.js', function: name },
                severity: ERROR_SEVERITY.WARNING
            });
        }
    }

    // Circle wrapper click handler (not a button, so needs direct listener)
    if (dom.display.circleWrapper) {
        dom.display.circleWrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                handleCircleClick();
            } catch (error) {
                handleError(error, {
                    context: { module: 'app.js', function: 'handleCircleClick' }
                });
            }
        });
    }

    // Feedback button handler is now in button-handlers.js

    // Handle session finish
    async function finishSession() {
        updateStreak();
        await showPage('menu');
    }

    // Register dependencies in module registry (replaces window.* pattern)
    console.log('app.js: Registering showPage in moduleRegistry');
    moduleRegistry.register('finishSession', finishSession);
    moduleRegistry.register('resetTimerDisplay', resetTimerDisplay);
    moduleRegistry.register('showPage', showPage);
    console.log('app.js: showPage registered, checking:', !!moduleRegistry.get('showPage'));
    moduleRegistry.register('handleStartTimerClick', handleStartTimerClick);
    moduleRegistry.register('handleCircleClick', handleCircleClick);
    moduleRegistry.register('checkAndMigrateLocalStorage', checkAndMigrateLocalStorage);

    // Window fallbacks removed - button handlers now use moduleRegistry and direct imports
    // Only keep essential window properties for backward compatibility if needed

    // checkAndMigrateLocalStorage already registered above

        // Listen for auth state changes
        window.addEventListener('auth-state-changed', (event) => {
            // Refresh settings modal if it's open
            if (!dom.display.modalOverlay.classList.contains('hidden')) {
                const renderSettings = moduleRegistry.get('renderSettingsModal') || window.renderSettingsModal;
                if (renderSettings) {
                    renderSettings();
                }
            }
        });
    } catch (error) {
        console.error('app.js: Critical error in DOMContentLoaded:', error);
        handleError(error, {
            severity: ERROR_SEVERITY.CRITICAL,
            context: { module: 'app.js', function: 'DOMContentLoaded' }
        });
    }
    console.log('app.js: DOMContentLoaded completed');
});
