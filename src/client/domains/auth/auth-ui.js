/**
 * Authentication UI handlers
 * 
 * @typedef {import('../../../shared/domains/auth/types.js').AuthFormType} AuthFormType
 */

import * as supabaseModule from '../../services/supabase-client.js';
import { openModal, closeModal } from '../navigation/modal.js';
import { moduleRegistry } from '../../utils/module-registry.js';
import { getDOMElements } from '../../utils/dom-elements.js';
import { handleError, withAsyncErrorHandling, ERROR_SEVERITY } from '../../../shared/utils/error-handler.js';

/**
 * Show a specific auth form
 * @param {AuthFormType} formType - Type of form to show
 * @returns {void}
 */
export function showAuthForm(formType) {
    const dom = getDOMElements();
    const authSection = dom.authSection;
    const authForms = dom.authForms;
    if (!authForms) return;
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
            const targetForm = dom.authFormElements[formType] || 
                (formId === 'signup' ? dom.authFormElements.signup :
                 formId === 'signin' ? dom.authFormElements.signin :
                 formId === 'magic-link' ? dom.authFormElements.magicLink :
                 dom.authFormElements.resetPassword);
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
        const targetForm = dom.authFormElements[formType] || 
            (formId === 'signup' ? dom.authFormElements.signup :
             formId === 'signin' ? dom.authFormElements.signin :
             formId === 'magic-link' ? dom.authFormElements.magicLink :
             dom.authFormElements.resetPassword);
        if (targetForm) {
            targetForm.classList.remove('hidden');
            void targetForm.offsetWidth;
            targetForm.classList.add('show');
        }
    }
}

/**
 * Show authentication message
 * @param {string} message - Message to display
 * @param {boolean} [isError=false] - Whether the message is an error
 * @returns {void}
 */
export function showAuthMessage(message, isError = false) {
    const dom = getDOMElements();
    // Find all auth message divs
    const authMessages = dom.authMessages;

    // Find the currently visible form
    const visibleForm = Array.from(dom.authForms?.querySelectorAll('.auth-form') || []).find(form =>
        !form.classList.contains('hidden')
    );

    if (visibleForm) {
        const msgEl = visibleForm.querySelector('#auth-message');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.className = `auth-message ${isError ? 'error' : 'success'}`;
            msgEl.classList.remove('hidden');
        }
    }
}

/**
 * Handle sign up form submission
 */
export const handleSignUp = withAsyncErrorHandling(async function() {
    const dom = getDOMElements();
    const emailInput = dom.authInputs.signupEmail;
    const passwordInput = dom.authInputs.signupPassword;
    if (!emailInput || !passwordInput) {
        handleError('Sign up form inputs not available', {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'auth-ui.js', function: 'handleSignUp' }
        });
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', true);
        return;
    }

    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters', true);
        return;
    }

    showAuthMessage('Creating account...');

    const result = await supabaseModule.signUpWithEmail(email, password);

    if (result.success) {
        showAuthMessage(result.message);
        // Check for migration
        setTimeout(() => {
            const checkAndMigrate = moduleRegistry.get('checkAndMigrateLocalStorage') || window.checkAndMigrateLocalStorage;
            if (checkAndMigrate) {
                checkAndMigrate();
            }
        }, 1000);
    } else {
        showAuthMessage(result.error, true);
    }
}, {
    functionName: 'handleSignUp',
    module: 'auth-ui.js'
});

/**
 * Handle sign in form submission
 */
export const handleSignIn = withAsyncErrorHandling(async function() {
    const dom = getDOMElements();
    const emailInput = dom.authInputs.signinEmail;
    const passwordInput = dom.authInputs.signinPassword;
    if (!emailInput || !passwordInput) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthMessage('Please fill in all fields', true);
        return;
    }

    showAuthMessage('Signing in...');

    const result = await supabaseModule.signInWithEmail(email, password);

    if (result.success) {
        showAuthMessage(result.message);
        setTimeout(() => {
            closeModal();
            // Refresh settings modal
            const renderSettings = moduleRegistry.get('renderSettingsModal') || window.renderSettingsModal;
            if (renderSettings) {
                setTimeout(() => {
                    renderSettings();
                }, 100);
            }
        }, 1000);
    } else {
        showAuthMessage(result.error, true);
    }
}, {
    functionName: 'handleSignIn',
    module: 'auth-ui.js'
});

/**
 * Handle magic link form submission
 */
export const handleMagicLink = withAsyncErrorHandling(async function() {
    const dom = getDOMElements();
    const emailInput = dom.authInputs.magicEmail;
    if (!emailInput) return;
    
    const email = emailInput.value.trim();

    if (!email) {
        showAuthMessage('Please enter your email', true);
        return;
    }

    showAuthMessage('Sending magic link...');

    const result = await supabaseModule.signInWithMagicLink(email);

    if (result.success) {
        showAuthMessage(result.message);
    } else {
        showAuthMessage(result.error, true);
    }
}, {
    functionName: 'handleMagicLink',
    module: 'auth-ui.js'
});

/**
 * Handle password reset form submission
 */
export const handlePasswordReset = withAsyncErrorHandling(async function() {
    const dom = getDOMElements();
    const emailInput = dom.authInputs.resetEmail;
    if (!emailInput) return;
    
    const email = emailInput.value.trim();

    if (!email) {
        showAuthMessage('Please enter your email', true);
        return;
    }

    showAuthMessage('Sending reset link...');

    const result = await supabaseModule.resetPassword(email);

    if (result.success) {
        showAuthMessage(result.message);
    } else {
        showAuthMessage(result.error, true);
    }
}, {
    functionName: 'handlePasswordReset',
    module: 'auth-ui.js'
});

/**
 * Attach event listeners to auth forms
 */
export function attachAuthListeners() {
    const dom = getDOMElements();
    
    // Sign Up Form
    dom.buttons.signupSubmit?.addEventListener('click', handleSignUp);
    dom.buttons.signupToSignin?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signin');
    });

    // Sign In Form
    dom.buttons.signinSubmit?.addEventListener('click', handleSignIn);
    dom.buttons.signinToSignup?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signup');
    });
    dom.buttons.showMagicLink?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('magic-link');
    });
    dom.buttons.showResetPassword?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('reset-password');
    });

    // Magic Link Form
    dom.buttons.magicSubmit?.addEventListener('click', handleMagicLink);
    dom.buttons.magicToSignin?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signin');
    });

    // Password Reset Form
    dom.buttons.resetSubmit?.addEventListener('click', handlePasswordReset);
    dom.buttons.resetToSignin?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signin');
    });
}

