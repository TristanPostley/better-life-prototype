// Top-level log to verify module is loading
console.log('app.js module is being evaluated');

// Import modules first (these should always work)
import { initTimer, resetTimerDisplay, handleStartTimerClick, handleCircleClick, setTimerDisplay, updateStreak } from './domains/sessions/index.js';
import { initNavigation, showPage, initModal, initMenuInteractions } from './domains/navigation/index.js';
import { initQuestions } from './domains/reflection/index.js';
import { initSettings, loadUserData, checkAndMigrateLocalStorage, applyFont } from './domains/users/index.js';
import { getDOMElements, state } from './domains/shared/index.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('app.js: DOMContentLoaded fired, initializing app...');
    // Landing page buttons are set up in index.html inline script to ensure they work
    
    // Try to load and initialize Supabase auth (optional, won't block if it fails)
    try {
        const supabaseModule = await import('./supabase-config.js');
        if (supabaseModule.initAuth) {
            await supabaseModule.initAuth();
            console.log('Supabase auth initialized');
        }
    } catch (error) {
        console.error('Failed to initialize auth (continuing without it):', error);
        // Continue anyway - app can work without auth
    }

    // Initialize dark mode from localStorage
    const isDarkMode = localStorage.getItem('bl_darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Initialize font from localStorage
    applyFont();

    // Initialize DOM elements cache
    const dom = getDOMElements();

    // Load user data (timer duration, etc.)
    try {
        loadUserData();
    } catch (error) {
        console.error('Error loading user data:', error);
    }

    // Initialize all modules
    try {
        initTimer();
        initNavigation();
        initModal();
        initQuestions();
        initSettings();
        initMenuInteractions();
    } catch (error) {
        console.error('Error initializing modules:', error);
    }

    // Timer controls
    if (dom.buttons.startTimer) {
        dom.buttons.startTimer.addEventListener('click', handleStartTimerClick);
        console.log('Start timer button listener attached');
    } else {
        console.warn('Start timer button not found');
    }
    if (dom.display.circleWrapper) {
        dom.display.circleWrapper.addEventListener('click', handleCircleClick);
        console.log('Circle wrapper click listener attached');
    } else {
        console.warn('Circle wrapper not found');
    }

    // Help button
    if (dom.buttons.help) {
        dom.buttons.help.addEventListener('click', () => {
            console.log('Help button clicked');
            if (dom.display.helpContent) {
                dom.display.helpContent.classList.toggle('hidden');

        // Make page scrollable to accommodate content
                if (!dom.display.helpContent.classList.contains('hidden')) {
            document.body.classList.add('scrollable');
        }

        // Auto-reveal journal after 3 seconds when help is shown
                if (!dom.display.helpContent.classList.contains('hidden') && dom.display.journalTab) {
            setTimeout(() => {
                        dom.display.journalTab.classList.remove('hidden');
                // Force a reflow to ensure the transition works
                        void dom.display.journalTab.offsetWidth;
                // Add show class in next frame
                requestAnimationFrame(() => {
                            dom.display.journalTab.classList.add('show');
                });
            }, 3000);
                }
        }
    });
    }

    // DEBUG button - subtracts specified minutes from the timer
    if (dom.buttons.debug && dom.debugMinutesInput) {
        console.log('DEBUG button found, attaching listener');
        dom.buttons.debug.addEventListener('click', () => {
            const minutes = parseInt(dom.debugMinutesInput.value, 10) || 1;
        const subtractAmount = minutes * 60; // convert minutes to seconds
            const shouldFinish = setTimerDisplay(state.currentTimer - subtractAmount);

        // If timer reaches 0, finish the session
            if (shouldFinish) {
            finishSession();
        }
    });
    }

    // DEBUG MENU button - go directly to menu page
    if (dom.buttons.debugMenu) {
        console.log('DEBUG MENU button found, attaching listener');
        dom.buttons.debugMenu.addEventListener('click', () => {
        showPage('menu');
    });
    }

    // Feedback button
    if (dom.buttons.feedback) {
        dom.buttons.feedback.addEventListener('click', async () => {
            // Fade out menu content
            if (dom.menuContent) {
                dom.menuContent.classList.add('fade-out');
            }

        // Wait for fade-out animation before showing modal
            setTimeout(async () => {
            const { openModal, closeModal } = await import('./domains/navigation/index.js');
            const { submitFeedback } = await import('./supabase-config.js');
            
            openModal(`
                <h2 class="fade-in-element">Feedback</h2>
                <textarea id="feedback-message" class="feedback-textarea fade-in-element" style="animation-delay: 0.2s" placeholder="Your feedback..."></textarea>
                <button id="btn-submit-feedback" class="auth-btn primary full-width fade-in-element" style="animation-delay: 0.9s">Submit</button>
                <div id="feedback-status" class="auth-message hidden fade-in-element" style="animation-delay: 0.4s"></div>
            `, true); // Hide close button for feedback modal

            // Attach listener to the new button and trigger fade-in
            setTimeout(() => {
                const submitBtn = document.getElementById('btn-submit-feedback');
                const messageInput = document.getElementById('feedback-message');
                const statusDiv = document.getElementById('feedback-status');
                const fadeElements = document.querySelectorAll('.fade-in-element');

                // Trigger fade-in
                requestAnimationFrame(() => {
                    fadeElements.forEach(el => el.classList.add('show'));
                });

                submitBtn.addEventListener('click', async () => {
                    const message = messageInput.value.trim();
                    if (!message) {
                        statusDiv.textContent = 'Please enter a message';
                        statusDiv.className = 'auth-message error fade-in-element show';
                        statusDiv.classList.remove('hidden');
                        return;
                    }

                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                    statusDiv.classList.add('hidden');

                    const result = await submitFeedback(message);

                    if (result.success) {
                        statusDiv.textContent = result.message;
                        statusDiv.className = 'auth-message success fade-in-element show';
                        statusDiv.classList.remove('hidden');
                        messageInput.value = '';
                        submitBtn.textContent = 'Sent!';

                        // Close modal after a delay
                        setTimeout(() => {
                            closeModal();
                        }, 2000);
                    } else {
                        statusDiv.textContent = result.error || 'Failed to send feedback';
                        statusDiv.className = 'auth-message error fade-in-element show';
                        statusDiv.classList.remove('hidden');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit';
                    }
                });
            }, 50); // Small delay to ensure DOM is ready and transition works
        }, 1000); // Wait for fade-out animation to complete
        });
    }

    // Handle session finish
    function finishSession() {
        updateStreak();
        showPage('menu');
    }

    // Make finishSession available to timer module
    window.finishSession = finishSession;

    // Make checkAndMigrateLocalStorage available globally for auth-ui module
    window.checkAndMigrateLocalStorage = checkAndMigrateLocalStorage;

    // Listen for auth state changes
    window.addEventListener('auth-state-changed', (event) => {
        console.log('Auth state changed in app:', event.detail);
        // Refresh settings modal if it's open
        if (!dom.display.modalOverlay.classList.contains('hidden')) {
            if (window.renderSettingsModal) {
                window.renderSettingsModal();
            }
        }
    });
});
