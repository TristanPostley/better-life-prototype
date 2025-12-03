// Import Supabase configuration and auth functions
import {
    supabase,
    initAuth,
    signUpWithEmail,
    signInWithEmail,
    signInWithOAuth,
    signInWithMagicLink,
    signOut,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    saveSession,
    saveResponse,
    currentUser,
    isAuthenticated
} from './supabase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Supabase auth first
    await initAuth();

    // State
    let timerDuration = 10 * 60; // 10 minutes in seconds
    let currentTimer = timerDuration;
    let timerInterval = null;
    let isTimerRunning = false;

    // DOM Elements
    const pages = {
        landing: document.getElementById('landing-page'),
        timer: document.getElementById('timer-page'),
        finish: document.getElementById('finish-page')
    };

    const buttons = {
        yes: document.getElementById('btn-yes'),
        no: document.getElementById('btn-no'),
        startTimer: document.getElementById('btn-start-timer'),
        help: document.getElementById('btn-help-icon'),
        debug: document.getElementById('btn-debug'),
        debugFinish: document.getElementById('btn-debug-finish'),
        questions: document.getElementById('btn-questions'),
        feedback: document.getElementById('btn-feedback'),
        settings: document.getElementById('btn-settings')
    };

    const display = {
        timer: document.getElementById('timer-display'),
        timerIntro: document.getElementById('timer-intro'),
        circleTimer: document.getElementById('circle-timer'),
        circleWrapper: document.querySelector('.circle-wrapper'),
        circleTime: document.getElementById('circle-time'),
        progressRing: document.querySelector('.progress-ring-circle'),
        helpContent: document.getElementById('help-content'),
        journalTab: document.getElementById('journal-tab'),
        modalOverlay: document.getElementById('modal-overlay'),
        modalBody: document.getElementById('modal-body'),
        closeModal: document.getElementById('close-modal')
    };

    // Progress ring circumference (2 * PI * radius)
    const circumference = 2 * Math.PI * 130;

    // Initialization
    loadUserData();

    // Initialize progress ring
    display.progressRing.style.strokeDasharray = circumference;

    // Debug controls
    const debugControls = document.getElementById('debug-controls');

    // Navigation
    const finishTitle = document.querySelector('.finish-title');
    const floatButtons = document.querySelectorAll('.float-btn');
    let finishTitleTimeout = null;

    function showPage(pageName) {
        Object.values(pages).forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        });
        pages[pageName].classList.remove('hidden-page');
        pages[pageName].classList.add('active-page');

        // Show debug controls only on timer page
        if (pageName === 'timer') {
            debugControls.classList.remove('hidden');
        } else {
            debugControls.classList.add('hidden');
        }

        // Handle finish page animations
        if (pageName === 'finish') {
            // Reset button positions
            initButtonPositions();

            // Reset all elements and ensure they're hidden
            finishTitle.classList.remove('fade-out');
            finishTitle.classList.remove('fade-in');
            floatButtons.forEach(btn => {
                btn.classList.remove('fade-in');
            });

            // Force reflow to reset the transition state
            void finishTitle.offsetWidth;
            floatButtons.forEach(btn => void btn.offsetWidth);

            // Clear any existing timeout
            if (finishTitleTimeout) {
                clearTimeout(finishTitleTimeout);
            }

            // Fade in title and buttons together (after a brief delay to let page settle)
            setTimeout(() => {
                finishTitle.classList.add('fade-in');

                // Fade in all buttons at the same time
                floatButtons.forEach(btn => btn.classList.add('fade-in'));
            }, 100);

            // Fade out title after 5 seconds
            finishTitleTimeout = setTimeout(() => {
                finishTitle.classList.remove('fade-in');
                finishTitle.classList.add('fade-out');
            }, 5000);
        }
    }

    // Event Listeners
    buttons.yes.addEventListener('click', () => {
        showPage('timer');
        resetTimerDisplay();
    });

    buttons.no.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling up
        const landingContent = pages.landing.querySelector('.center-content');
        landingContent.innerHTML = '<h1>Ok.</h1>';
        pages.landing.style.cursor = 'pointer';

        const resetPage = () => location.reload();

        // Add listener after a brief delay to ensure the original click event has finished
        setTimeout(() => {
            pages.landing.addEventListener('click', resetPage);
        }, 100);
    });

    buttons.startTimer.addEventListener('click', () => {
        // Fade out intro, fade in circle timer
        display.timerIntro.classList.add('fade-out');
        display.circleTimer.classList.remove('hidden');

        // Force reflow then show
        void display.circleTimer.offsetWidth;
        display.circleTimer.classList.add('show');

        // Initialize circle timer display
        display.circleTime.textContent = formatTime(currentTimer);
        updateProgressRing();

        // Start the timer
        startTimer();
    });

    // Click on circle to pause/resume
    display.circleWrapper.addEventListener('click', () => {
        if (isTimerRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    buttons.help.addEventListener('click', () => {
        display.helpContent.classList.toggle('hidden');

        // Make page scrollable to accommodate content
        if (!display.helpContent.classList.contains('hidden')) {
            document.body.classList.add('scrollable');
        }

        // Fade out the help button when clicked (from Backend logic, keeping it as it seems nice)
        // buttons.help.classList.add('fade-out'); 

        // Auto-reveal journal after 3 seconds when help is shown
        if (!display.helpContent.classList.contains('hidden')) {
            setTimeout(() => {
                display.journalTab.classList.remove('hidden');
                // Force a reflow to ensure the transition works
                void display.journalTab.offsetWidth;
                // Add show class in next frame
                requestAnimationFrame(() => {
                    display.journalTab.classList.add('show');
                });
            }, 3000);
        }
    });

    // DEBUG button - subtracts specified minutes from the timer
    const debugMinutesInput = document.getElementById('debug-minutes');
    buttons.debug.addEventListener('click', () => {
        const minutes = parseInt(debugMinutesInput.value, 10) || 1;
        const subtractAmount = minutes * 60; // convert minutes to seconds
        currentTimer = Math.max(0, currentTimer - subtractAmount);
        display.timer.textContent = formatTime(currentTimer);
        display.circleTime.textContent = formatTime(currentTimer);
        updateProgressRing();

        // If timer reaches 0, finish the session
        if (currentTimer <= 0) {
            finishSession();
        }
    });

    // DEBUG FINISH button - go directly to finish page
    buttons.debugFinish.addEventListener('click', () => {
        showPage('finish');
    });

    // Modal Logic
    function openModal(content) {
        display.modalBody.innerHTML = content;
        display.modalOverlay.classList.remove('hidden');
    }

    display.closeModal.addEventListener('click', () => {
        display.modalOverlay.classList.add('hidden');
    });

    display.modalOverlay.addEventListener('click', (e) => {
        if (e.target === display.modalOverlay) {
            display.modalOverlay.classList.add('hidden');
        }
    });

    // Menu Buttons
    const finishContent = document.getElementById('finish-content');
    const questionsFlow = document.getElementById('questions-flow');
    const questionItems = document.querySelectorAll('.question-item');
    const howItWorksFlow = document.getElementById('how-it-works-flow');
    const explainItems = document.querySelectorAll('.explain-item');
    const qHowItWorks = document.getElementById('q-how-it-works');
    const qBetterToday = document.getElementById('q-better-today');
    const betterTodayFlow = document.getElementById('better-today-flow');
    const betterTodayInput = document.getElementById('better-today-input');
    const qBetterLifeMeaning = document.getElementById('q-better-life-meaning');
    const betterLifeMeaningFlow = document.getElementById('better-life-meaning-flow');
    const betterLifeMeaningInput = document.getElementById('better-life-meaning-input');
    const qAdvice = document.getElementById('q-advice');
    const adviceFlow = document.getElementById('advice-flow');
    const adviceItems = document.querySelectorAll('.advice-item');
    const finishHomeBtn = document.getElementById('btn-finish-home');

    // Track pending timeouts for cleanup
    let questionsTimeouts = [];

    // Home button - reset to initial finish page view
    finishHomeBtn.addEventListener('click', () => {
        // Clear all pending timeouts
        questionsTimeouts.forEach(id => clearTimeout(id));
        questionsTimeouts = [];
        // Hide all flows
        questionsFlow.classList.add('hidden');
        questionsFlow.classList.remove('fade-out');
        questionsFlow.classList.remove('fade-others');
        howItWorksFlow.classList.add('hidden');
        betterTodayFlow.classList.add('hidden');
        betterLifeMeaningFlow.classList.add('hidden');
        adviceFlow.classList.add('hidden');

        // Reset all question/explain items
        questionItems.forEach(item => {
            item.classList.remove('show');
            item.classList.remove('slide-to-top');
            item.classList.remove('keep-visible');
            item.classList.remove('at-top');
            // Reset all inline styles
            item.style.cssText = '';
        });
        explainItems.forEach(item => item.classList.remove('show'));
        adviceItems.forEach(item => item.classList.remove('show'));
        betterTodayInput.classList.remove('show');
        betterLifeMeaningInput.classList.remove('show');

        // Show finish content
        finishContent.classList.remove('fade-out');
    });

    buttons.questions.addEventListener('click', () => {
        // Clear any pending timeouts from previous interactions
        questionsTimeouts.forEach(id => clearTimeout(id));
        questionsTimeouts = [];

        // Reset questions state before starting
        questionsFlow.classList.remove('fade-out');
        questionsFlow.classList.remove('fade-others');
        questionItems.forEach(item => {
            item.classList.remove('show');
            item.classList.remove('slide-to-top');
            item.classList.remove('keep-visible');
            item.classList.remove('at-top');
            // Reset all inline styles
            item.style.cssText = '';
        });

        // Fade out finish content
        finishContent.classList.add('fade-out');

        // After fade out, show questions flow
        const mainTimeout = setTimeout(() => {
            questionsFlow.classList.remove('hidden');

            // Force reflow before adding show classes
            void questionsFlow.offsetWidth;

            // Force reflow on each item too
            questionItems.forEach(item => {
                void item.offsetWidth;
            });

            // Fade in questions one at a time (start with 50ms delay for first)
            questionItems.forEach((item, index) => {
                const itemTimeout = setTimeout(() => {
                    item.classList.add('show');
                }, 50 + index * 800); // 800ms delay between each question
                questionsTimeouts.push(itemTimeout);
            });
        }, 1000); // Wait for fade out to complete
        questionsTimeouts.push(mainTimeout);
    });

    // "How does this work?" question click
    qHowItWorks.addEventListener('click', () => {
        // Fade out questions
        questionsFlow.classList.add('fade-out');

        // After fade out, show how it works flow
        setTimeout(() => {
            questionsFlow.classList.add('hidden');
            howItWorksFlow.classList.remove('hidden');

            // Fade in explanation lines one at a time
            explainItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('show');
                }, index * 1000); // 1s delay between each line
            });
        }, 1000); // Wait for fade out to complete
    });

    // "How did you make your life better today?" question click
    qBetterToday.addEventListener('click', () => {
        // Keep this question visible while fading others
        qBetterToday.classList.add('keep-visible');
        questionsFlow.classList.add('fade-others');

        // After other questions fade out, slide this one to top
        setTimeout(() => {
            // Get current position before changing to fixed
            const rect = qBetterToday.getBoundingClientRect();

            // Set to fixed at current position
            qBetterToday.style.top = rect.top + 'px';
            qBetterToday.classList.add('slide-to-top');

            // Force reflow, then animate to top
            void qBetterToday.offsetWidth;
            qBetterToday.classList.add('at-top');

            // After slide animation, show input
            setTimeout(() => {
                betterTodayFlow.classList.remove('hidden');

                // Fade in the input
                setTimeout(() => {
                    betterTodayInput.classList.add('show');
                    betterTodayInput.focus();
                }, 100);
            }, 1000); // Wait for slide to complete
        }, 1000); // Wait for fade out to complete
    });

    // "What does a better life mean to you?" question click
    qBetterLifeMeaning.addEventListener('click', () => {
        // Keep this question visible while fading others
        qBetterLifeMeaning.classList.add('keep-visible');
        questionsFlow.classList.add('fade-others');

        // After other questions fade out, slide this one to top
        setTimeout(() => {
            // Get current position before changing to fixed
            const rect = qBetterLifeMeaning.getBoundingClientRect();

            // Set to fixed at current position
            qBetterLifeMeaning.style.top = rect.top + 'px';
            qBetterLifeMeaning.classList.add('slide-to-top');

            // Force reflow, then animate to top
            void qBetterLifeMeaning.offsetWidth;
            qBetterLifeMeaning.classList.add('at-top');

            // After slide animation, show input
            setTimeout(() => {
                betterLifeMeaningFlow.classList.remove('hidden');

                // Fade in the input
                setTimeout(() => {
                    betterLifeMeaningInput.classList.add('show');
                    betterLifeMeaningInput.focus();
                }, 100);
            }, 1000); // Wait for slide to complete
        }, 1000); // Wait for fade out to complete
    });

    // "Looking for advice?" question click
    qAdvice.addEventListener('click', () => {
        // Keep this question visible while fading others
        qAdvice.classList.add('keep-visible');
        questionsFlow.classList.add('fade-others');

        // After other questions fade out, slide this one to top
        setTimeout(() => {
            // Get current position before changing to fixed
            const rect = qAdvice.getBoundingClientRect();

            // Set to fixed at current position
            qAdvice.style.top = rect.top + 'px';
            qAdvice.classList.add('slide-to-top');

            // Force reflow, then animate to top
            void qAdvice.offsetWidth;
            qAdvice.classList.add('at-top');

            // After slide animation, show advice items
            setTimeout(() => {
                adviceFlow.classList.remove('hidden');

                // Fade in the advice items one at a time
                adviceItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('show');
                    }, index * 300); // 300ms delay between each item
                });
            }, 1000); // Wait for slide to complete
        }, 1000); // Wait for fade out to complete
    });

    buttons.feedback.addEventListener('click', () => {
        openModal(`<h2>Feedback</h2><p>Send us your thoughts!</p><textarea style="width:100%"></textarea><button>Submit</button>`);
    });

    buttons.settings.addEventListener('click', () => {
        renderSettingsModal();
    });

    // Settings Modal Rendering
    function renderSettingsModal() {
        // Check current auth state directly from the imported module
        import('./supabase-config.js').then(module => {
            // Check if user is authenticated by looking at currentUser
            const isUserAuthenticated = module.currentUser !== null;

            if (isUserAuthenticated) {
                renderAuthenticatedSettings();
            } else {
                renderAnonymousSettings();
            }
        }).catch(error => {
            console.error('Error loading auth module:', error);
            // Fallback to anonymous settings if there's an error
            renderAnonymousSettings();
        });
    }

    function renderAnonymousSettings() {
        openModal(`
            <h2>Settings</h2>
            
            <div class="auth-section">
                <h3>Account</h3>
                <p class="auth-info">Sign up to sync your progress across devices</p>
                <div class="auth-button-group">
                    <button id="auth-show-signup" class="auth-btn primary">Sign Up</button>
                    <button id="auth-show-signin" class="auth-btn secondary">Sign In</button>
                </div>
            </div>

            <div id="auth-forms" class="hidden">
                <!-- Sign Up Form -->
                <div id="signup-form" class="auth-form hidden">
                    <h3>Create Account</h3>
                    
                    <div class="oauth-buttons">
                        <button id="oauth-google-signup" class="oauth-btn google">
                            <span class="oauth-icon">G</span>
                            Continue with Google
                        </button>
                        <button id="oauth-facebook-signup" class="oauth-btn facebook">
                            <span class="oauth-icon">f</span>
                            Continue with Facebook
                        </button>
                    </div>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <input type="email" id="signup-email" class="auth-input" placeholder="Email" />
                    <input type="password" id="signup-password" class="auth-input" placeholder="Password (min 6 characters)" />
                    <button id="signup-submit" class="auth-btn primary full-width">Create Account</button>
                    
                    <div class="auth-links">
                        <a href="#" id="signup-to-signin">Already have an account? Sign in</a>
                    </div>
                    
                    <div id="auth-message" class="auth-message hidden"></div>
                </div>

                <!-- Sign In Form -->
                <div id="signin-form" class="auth-form hidden">
                    <h3>Sign In</h3>
                    
                    <div class="oauth-buttons">
                        <button id="oauth-google-signin" class="oauth-btn google">
                            <span class="oauth-icon">G</span>
                            Continue with Google
                        </button>
                        <button id="oauth-apple-signin" class="oauth-btn apple">
                            <span class="oauth-icon"><i class="fab fa-apple"></i></span>
                            Continue with Apple
                        </button>
                        <button id="oauth-facebook-signin" class="oauth-btn facebook">
                            <span class="oauth-icon">f</span>
                            Continue with Facebook
                        </button>
                    </div>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <input type="email" id="signin-email" class="auth-input" placeholder="Email" />
                    <input type="password" id="signin-password" class="auth-input" placeholder="Password" />
                    <button id="signin-submit" class="auth-btn primary full-width">Sign In</button>
                    
                    <div class="auth-links">
                        <a href="#" id="show-magic-link">Send me a magic link instead</a>
                        <span class="divider">•</span>
                        <a href="#" id="show-reset-password">Forgot password?</a>
                    </div>
                    <div class="auth-links">
                        <a href="#" id="signin-to-signup">Don't have an account? Sign up</a>
                    </div>
                    
                    <div id="auth-message" class="auth-message hidden"></div>
                </div>

                <!-- Magic Link Form -->
                <div id="magic-link-form" class="auth-form hidden">
                    <h3>Magic Link</h3>
                    <p class="auth-info">We'll send you a link to sign in without a password</p>
                    
                    <input type="email" id="magic-email" class="auth-input" placeholder="Email" />
                    <button id="magic-submit" class="auth-btn primary full-width">Send Magic Link</button>
                    
                    <div class="auth-links">
                        <a href="#" id="magic-to-signin">Back to sign in</a>
                    </div>
                    
                    <div id="auth-message" class="auth-message hidden"></div>
                </div>

                <!-- Password Reset Form -->
                <div id="reset-password-form" class="auth-form hidden">
                    <h3>Reset Password</h3>
                    <p class="auth-info">We'll send you a link to reset your password</p>
                    
                    <input type="email" id="reset-email" class="auth-input" placeholder="Email" />
                    <button id="reset-submit" class="auth-btn primary full-width">Send Reset Link</button>
                    
                    <div class="auth-links">
                        <a href="#" id="reset-to-signin">Back to sign in</a>
                    </div>
                    
                    <div id="auth-message" class="auth-message hidden"></div>
                </div>
            </div>

            <hr class="settings-divider" />

            <h3>Appearance</h3>
            <p>Theme: Light/Dark (Coming soon)</p>
            
            <h3>Timer</h3>
            <p>Customize Journal, Fonts, Timer Style (Coming soon)</p>
        `);

        // Attach event listeners after modal is created
        setTimeout(() => {
            attachAnonymousSettingsListeners();
        }, 0);
    }

    function renderAuthenticatedSettings() {
        import('./supabase-config.js').then(async module => {
            const profileResult = await module.getUserProfile();
            const user = module.currentUser;

            const email = user?.email || 'Unknown';
            const timerMins = profileResult.success ? Math.floor(profileResult.profile.timer_duration / 60) : 10;

            openModal(`
                <h2>Settings</h2>
                
                <div class="auth-section">
                    <h3>Account</h3>
                    <div class="account-card">
                        <div class="account-info">
                            <div class="account-email">${email}</div>
                            <div class="account-meta">Current timer: ${timerMins} minutes</div>
                        </div>
                        <button id="auth-signout" class="auth-btn secondary">Sign Out</button>
                    </div>
                </div>

                <hr class="settings-divider" />

                <h3>Appearance</h3>
                <p>Theme: Light/Dark (Coming soon)</p>
                
                <h3>Timer</h3>
                <p>Customize Journal, Fonts, Timer Style (Coming soon)</p>
            `);

            // Attach event listeners
            setTimeout(() => {
                attachAuthenticatedSettingsListeners();
            }, 0);
        });
    }

    // Event Listeners for Anonymous Settings
    function attachAnonymousSettingsListeners() {
        const showSignupBtn = document.getElementById('auth-show-signup');
        const showSigninBtn = document.getElementById('auth-show-signin');
        const authForms = document.getElementById('auth-forms');

        showSignupBtn?.addEventListener('click', () => showAuthForm('signup'));
        showSigninBtn?.addEventListener('click', () => showAuthForm('signin'));

        // Sign Up Form
        document.getElementById('signup-submit')?.addEventListener('click', handleSignUp);
        document.getElementById('oauth-google-signup')?.addEventListener('click', () => handleOAuth('google'));
        document.getElementById('oauth-apple-signup')?.addEventListener('click', () => handleOAuth('apple'));
        document.getElementById('oauth-facebook-signup')?.addEventListener('click', () => handleOAuth('facebook'));
        document.getElementById('signup-to-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signin');
        });

        // Sign In Form
        document.getElementById('signin-submit')?.addEventListener('click', handleSignIn);
        document.getElementById('oauth-google-signin')?.addEventListener('click', () => handleOAuth('google'));
        document.getElementById('oauth-apple-signin')?.addEventListener('click', () => handleOAuth('apple'));
        document.getElementById('oauth-facebook-signin')?.addEventListener('click', () => handleOAuth('facebook'));
        document.getElementById('signin-to-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signup');
        });
        document.getElementById('show-magic-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('magic-link');
        });
        document.getElementById('show-reset-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('reset-password');
        });

        // Magic Link Form
        document.getElementById('magic-submit')?.addEventListener('click', handleMagicLink);
        document.getElementById('magic-to-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signin');
        });

        // Password Reset Form
        document.getElementById('reset-submit')?.addEventListener('click', handlePasswordReset);
        document.getElementById('reset-to-signin')?.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthForm('signin');
        });
    }

    function showAuthForm(formType) {
        const authSection = document.querySelector('.auth-section');
        const authForms = document.getElementById('auth-forms');
        const allForms = authForms.querySelectorAll('.auth-form');

        // Fade out the auth section (Sign Up/Sign In buttons)
        if (authSection && !authSection.classList.contains('fade-out')) {
            authSection.classList.add('fade-out');

            // Wait for fade out to complete before showing form
            setTimeout(() => {
                authSection.classList.add('hidden');

                // Hide all forms first
                allForms.forEach(form => form.classList.add('hidden'));

                // Show auth forms container
                authForms.classList.remove('hidden');

                // Show specific form
                const formMap = {
                    'signup': 'signup-form',
                    'signin': 'signin-form',
                    'magic-link': 'magic-link-form',
                    'reset-password': 'reset-password-form'
                };

                const formId = formMap[formType];
                const targetForm = document.getElementById(formId);
                if (targetForm) {
                    targetForm.classList.remove('hidden');
                    // Trigger reflow for animation
                    void targetForm.offsetWidth;
                    targetForm.classList.add('show');
                }
            }, 500); // Match CSS transition time
        } else {
            // Already showing forms, just switch between them
            allForms.forEach(form => {
                form.classList.add('hidden');
                form.classList.remove('show');
            });

            const formMap = {
                'signup': 'signup-form',
                'signin': 'signin-form',
                'magic-link': 'magic-link-form',
                'reset-password': 'reset-password-form'
            };

            const formId = formMap[formType];
            const targetForm = document.getElementById(formId);
            if (targetForm) {
                targetForm.classList.remove('hidden');
                void targetForm.offsetWidth;
                targetForm.classList.add('show');
            }
        }
    }

    function showAuthMessage(message, isError = false) {
        // Find all auth message divs
        const authMessages = document.querySelectorAll('#auth-message');

        // Find the currently visible form
        const visibleForm = Array.from(document.querySelectorAll('.auth-form')).find(form =>
            !form.classList.contains('hidden')
        );

        if (visibleForm) {
            const msgEl = visibleForm.querySelector('#auth-message');
            if (msgEl) {
                msgEl.textContent = message;
                msgEl.className = `auth-message ${isError ? 'error' : 'success'}`;
            }
        }
    }

    async function handleSignUp() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        if (!email || !password) {
            showAuthMessage('Please fill in all fields', true);
            return;
        }

        if (password.length < 6) {
            showAuthMessage('Password must be at least 6 characters', true);
            return;
        }

        showAuthMessage('Creating account...');

        const result = await signUpWithEmail(email, password);

        if (result.success) {
            showAuthMessage(result.message);
            // Check for migration
            setTimeout(() => checkAndMigrateLocalStorage(), 1000);
        } else {
            showAuthMessage(result.error, true);
        }
    }

    async function handleSignIn() {
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            showAuthMessage('Please fill in all fields', true);
            return;
        }

        showAuthMessage('Signing in...');

        const result = await signInWithEmail(email, password);

        if (result.success) {
            showAuthMessage(result.message);
            setTimeout(() => {
                display.modalOverlay.classList.add('hidden');
                renderSettingsModal(); // Refresh to show authenticated state
            }, 1000);
        } else {
            showAuthMessage(result.error, true);
        }
    }

    async function handleOAuth(provider) {
        showAuthMessage(`Redirecting to ${provider}...`);
        const result = await signInWithOAuth(provider);

        if (!result.success) {
            showAuthMessage(result.error, true);
        }
    }

    async function handleMagicLink() {
        const email = document.getElementById('magic-email').value.trim();

        if (!email) {
            showAuthMessage('Please enter your email', true);
            return;
        }

        showAuthMessage('Sending magic link...');

        const result = await signInWithMagicLink(email);

        if (result.success) {
            showAuthMessage(result.message);
        } else {
            showAuthMessage(result.error, true);
        }
    }

    async function handlePasswordReset() {
        const email = document.getElementById('reset-email').value.trim();

        if (!email) {
            showAuthMessage('Please enter your email', true);
            return;
        }

        showAuthMessage('Sending reset link...');

        const result = await resetPassword(email);

        if (result.success) {
            showAuthMessage(result.message);
        } else {
            showAuthMessage(result.error, true);
        }
    }

    // Event Listeners for Authenticated Settings
    function attachAuthenticatedSettingsListeners() {
        document.getElementById('auth-signout')?.addEventListener('click', async () => {
            const result = await signOut();
            if (result.success) {
                display.modalOverlay.classList.add('hidden');
                // Reload to reset state
                location.reload();
            }
        });
    }

    // Migration Logic
    function checkAndMigrateLocalStorage() {
        const hasLocalData = localStorage.getItem('bl_timerDuration') ||
            localStorage.getItem('bl_lastDate') ||
            localStorage.getItem('bl_history');

        if (hasLocalData) {
            const migrate = confirm('We found existing data on this device. Would you like to import it to your account?');
            if (migrate) {
                migrateToSupabase();
            } else {
                console.log('User declined migration');
            }
        }
    }

    async function migrateToSupabase() {
        import('./supabase-config.js').then(async module => {
            try {
                const timerDuration = parseInt(localStorage.getItem('bl_timerDuration') || '600', 10);
                const lastDate = localStorage.getItem('bl_lastDate');

                // Update profile with timer duration and last session date
                await module.updateUserProfile({
                    timer_duration: timerDuration,
                    last_session_date: lastDate
                });

                // Migrate question history if exists
                const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
                for (const entry of history) {
                    if (entry.betterToday) {
                        await module.saveResponse('better_today', entry.betterToday);
                    }
                    if (entry.meaning) {
                        await module.saveResponse('life_meaning', entry.meaning);
                    }
                }

                alert('Data imported successfully!');

                // Clear localStorage after successful migration
                localStorage.removeItem('bl_timerDuration');
                localStorage.removeItem('bl_lastDate');
                localStorage.removeItem('bl_history');
            } catch (error) {
                console.error('Migration error:', error);
                alert('Error importing data. Please try again.');
            }
        });
    }

    // Listen for auth state changes
    window.addEventListener('auth-state-changed', (event) => {
        console.log('Auth state changed in app:', event.detail);
        // Refresh settings modal if it's open
        if (!display.modalOverlay.classList.contains('hidden')) {
            renderSettingsModal();
        }
    });

    // Timer Logic
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function resetTimerDisplay() {
        currentTimer = timerDuration;
        display.timer.textContent = formatTime(currentTimer);
        display.circleTime.textContent = formatTime(currentTimer);

        // Reset the view to show intro, hide circle
        display.timerIntro.classList.remove('fade-out');
        display.circleTimer.classList.add('hidden');
        display.circleTimer.classList.remove('show');

        // Reset progress ring
        display.progressRing.style.strokeDashoffset = 0;
    }

    function updateProgressRing() {
        const progress = currentTimer / timerDuration;
        const offset = circumference * (1 - progress);
        display.progressRing.style.strokeDashoffset = offset;
    }

    function startTimer() {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            currentTimer--;
            display.timer.textContent = formatTime(currentTimer);
            display.circleTime.textContent = formatTime(currentTimer);
            updateProgressRing();

            if (currentTimer <= 0) {
                finishSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        isTimerRunning = false;
        clearInterval(timerInterval);
    }

    function finishSession() {
        pauseTimer();
        updateStreak();
        showPage('finish');
    }

    // Persistence
    function loadUserData() {
        const storedDuration = localStorage.getItem('bl_timerDuration');
        const lastDate = localStorage.getItem('bl_lastDate');

        // Default 10 minutes
        if (storedDuration) {
            timerDuration = parseInt(storedDuration, 10);
        }

        // Check for missed days
        if (lastDate) {
            const today = new Date();
            const last = new Date(lastDate);
            const diffTime = Math.abs(today - last);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If it's been more than 2 days since last session (e.g. played Monday, now Wednesday = missed Tuesday)
            // We apply a penalty. To avoid re-applying on refresh, we rely on a separate 'lastPenalty' flag or just accept the limitation for now.
            // For this prototype, we will skip the complex date math penalty to avoid bugs, 
            // and focus on the "Increase" reward which is safer.
        }
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('bl_lastDate');

        if (lastDate !== today) {
            // It's a new day, reward the user
            timerDuration += (10 * 60); // Add 10 minutes
            localStorage.setItem('bl_timerDuration', timerDuration);
            localStorage.setItem('bl_lastDate', today);
            console.log(`Streak updated! New duration: ${timerDuration / 60} mins`);
        } else {
            console.log('Already completed today. No extra time added.');
        }
    }

    // Save Questions
    window.saveQuestions = function () {
        const betterToday = document.getElementById('q-better-today').value;
        const meaning = document.getElementById('q-meaning').value;

        const entry = {
            date: new Date().toISOString(),
            betterToday,
            meaning
        };

        const history = JSON.parse(localStorage.getItem('bl_history') || '[]');
        history.push(entry);
        localStorage.setItem('bl_history', JSON.stringify(history));

        alert('Saved!');
        document.getElementById('modal-overlay').classList.add('hidden');
    };

    // Draggable Buttons
    const BUTTON_SIZE = 100;

    // Initialize button positions - Questions at top, Settings/Feedback at bottom
    function initButtonPositions() {
        const centerX = window.innerWidth / 2;
        const BUTTON_HALF = BUTTON_SIZE / 2;

        floatButtons.forEach((btn) => {
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

    initButtonPositions();
    window.addEventListener('resize', initButtonPositions);

    // Drag functionality
    let draggedBtn = null;
    let offsetX = 0;
    let offsetY = 0;
    let wasDragged = false;

    floatButtons.forEach(btn => {
        btn.addEventListener('mousedown', startDrag);
        btn.addEventListener('touchstart', startDrag, { passive: false });

        // Block click events that occur after dragging
        btn.addEventListener('click', (e) => {
            if (wasDragged) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true); // Use capture phase to intercept before other handlers
    });

    function startDrag(e) {
        e.preventDefault();
        draggedBtn = e.currentTarget;
        draggedBtn.classList.add('dragging');
        wasDragged = false;

        const rect = draggedBtn.getBoundingClientRect();
        if (e.type === 'touchstart') {
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        } else {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!draggedBtn) return;
        e.preventDefault();
        wasDragged = true;

        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Keep within bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - BUTTON_SIZE));
        newY = Math.max(0, Math.min(newY, window.innerHeight - BUTTON_SIZE));

        draggedBtn.style.left = newX + 'px';
        draggedBtn.style.top = newY + 'px';
    }

    function stopDrag(e) {
        if (!draggedBtn) return;

        draggedBtn.classList.remove('dragging');
        draggedBtn = null;

        // Reset wasDragged flag after a brief delay to allow click event to be blocked
        setTimeout(() => {
            wasDragged = false;
        }, 10);

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', stopDrag);
    }
});
