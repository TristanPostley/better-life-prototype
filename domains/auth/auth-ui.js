/**
 * Authentication UI handlers
 */

import * as supabaseModule from '../../supabase-config.js';
import { openModal, closeModal } from './modal.js';

/**
 * Show a specific auth form
 * @param {string} formType - Type of form to show ('signup', 'signin', 'magic-link', 'reset-password')
 */
export function showAuthForm(formType) {
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

/**
 * Show authentication message
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether the message is an error
 */
export function showAuthMessage(message, isError = false) {
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
            msgEl.classList.remove('hidden');
        }
    }
}

/**
 * Handle sign up form submission
 */
export async function handleSignUp() {
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

    const result = await supabaseModule.signUpWithEmail(email, password);

    if (result.success) {
        showAuthMessage(result.message);
        // Check for migration
        setTimeout(() => {
            if (window.checkAndMigrateLocalStorage) {
                window.checkAndMigrateLocalStorage();
            }
        }, 1000);
    } else {
        showAuthMessage(result.error, true);
    }
}

/**
 * Handle sign in form submission
 */
export async function handleSignIn() {
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

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
            if (window.renderSettingsModal) {
                setTimeout(() => {
                    window.renderSettingsModal();
                }, 100);
            }
        }, 1000);
    } else {
        showAuthMessage(result.error, true);
    }
}

/**
 * Handle magic link form submission
 */
export async function handleMagicLink() {
    const email = document.getElementById('magic-email').value.trim();

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
}

/**
 * Handle password reset form submission
 */
export async function handlePasswordReset() {
    const email = document.getElementById('reset-email').value.trim();

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
}

/**
 * Attach event listeners to auth forms
 */
export function attachAuthListeners() {
    // Sign Up Form
    document.getElementById('signup-submit')?.addEventListener('click', handleSignUp);
    document.getElementById('signup-to-signin')?.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthForm('signin');
    });

    // Sign In Form
    document.getElementById('signin-submit')?.addEventListener('click', handleSignIn);
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

