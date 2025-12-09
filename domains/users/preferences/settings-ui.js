/**
 * Settings modal rendering and logic
 * 
 * @typedef {import('../../../src/types/dom.js').DOMElements} DOMElements
 */

import { getDOMElements } from '../../../src/shared/utils/dom-elements.js';
import { openModal, closeModal } from '../../navigation/modal.js';
import { availableFonts, attachFontDropdown } from './fonts.js';
import { showAuthForm, attachAuthListeners } from '../../auth/auth-ui.js';
import * as supabaseModule from '../../supabase-client.js';
import { waitForTransition } from '../../../src/shared/utils/transitions.js';
import { CSS_CLASSES, TRANSITION_TIMEOUTS } from '../../../src/shared/constants.js';

let dom = null;

/**
 * Initialize settings module
 */
export function initSettings() {
    dom = getDOMElements();
    
    // Set up settings button click handler
    dom.buttons.settings.addEventListener('click', handleSettingsClick);
}

/**
 * Handle settings button click
 */
async function handleSettingsClick() {
    // Fade out menu content
    dom.menuContent.classList.add(CSS_CLASSES.FADE_OUT);

    // Wait for fade-out animation before showing modal
    await waitForTransition(dom.menuContent, 'opacity', TRANSITION_TIMEOUTS.DEFAULT);
    renderSettingsModal();
}

/**
 * Render settings modal based on auth state
 */
export function renderSettingsModal() {
    // Check current auth state directly from the imported module
    const isUserAuthenticated = supabaseModule.currentUser !== null;

    if (isUserAuthenticated) {
        renderAuthenticatedSettings();
    } else {
        renderAnonymousSettings();
    }
}

/**
 * Render settings for anonymous (not logged in) users
 */
function renderAnonymousSettings() {
    // Check current dark mode state from body class
    const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');

    openModal(`
        <h2 class="fade-in-element">Settings</h2>
        
        <div class="auth-section fade-in-element" style="animation-delay: 0.3s">
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

        <hr class="settings-divider fade-in-element" style="animation-delay: 0.4s" />

        <div class="fade-in-element" style="animation-delay: 0.5s">
            <h3>Appearance</h3>
            <div class="dark-mode-toggle">
                <label for="dark-mode-switch">
                    <span>Dark Mode</span>
                    <input type="checkbox" id="dark-mode-switch" ${isCurrentlyDarkMode ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="font-selector">
                <label for="font-select">Font</label>
                <select id="font-select" class="font-select">
                    ${availableFonts.map(font => 
                        `<option value="${font.value}" style="font-family: ${font.value}">${font.name}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <h3 class="fade-in-element" style="animation-delay: 0.7s">Timer</h3>
        <p class="fade-in-element" style="animation-delay: 0.8s">Customize Journal, Timer Style (Coming soon)</p>
    `, true); // Hide close button

    // Attach event listeners after modal is created
    setTimeout(() => {
        attachAnonymousSettingsListeners();
        attachDarkModeToggle();
        attachFontDropdown();

        // Trigger fade-in
        const fadeElements = document.querySelectorAll('.fade-in-element');
        requestAnimationFrame(() => {
            fadeElements.forEach(el => el.classList.add('show'));
        });
    }, 50);
}

/**
 * Render settings for authenticated users
 */
async function renderAuthenticatedSettings() {
    // Check current dark mode state from body class
    const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');

    const profileResult = await supabaseModule.getUserProfile();
    const user = supabaseModule.currentUser;

    const email = user?.email || 'Unknown';
    const timerMins = profileResult.success ? Math.floor(profileResult.data.timer_duration / 60) : 10;

    openModal(`
        <h2 class="fade-in-element">Settings</h2>
        
        <div class="auth-section fade-in-element" style="animation-delay: 0.3s">
            <h3>Account</h3>
            <div class="account-card">
                <div class="account-info">
                    <div class="account-email">${email}</div>
                    <div class="account-meta">Current timer: ${timerMins} minutes</div>
                </div>
                <button id="auth-signout" class="auth-btn secondary">Sign Out</button>
            </div>
        </div>

        <hr class="settings-divider fade-in-element" style="animation-delay: 0.4s" />

        <div class="fade-in-element" style="animation-delay: 0.5s">
            <h3>Appearance</h3>
            <div class="dark-mode-toggle">
                <label for="dark-mode-switch">
                    <span>Dark Mode</span>
                    <input type="checkbox" id="dark-mode-switch" ${isCurrentlyDarkMode ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="font-selector">
                <label for="font-select">Font</label>
                <select id="font-select" class="font-select">
                    ${availableFonts.map(font => 
                        `<option value="${font.value}" style="font-family: ${font.value}">${font.name}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        
        <h3 class="fade-in-element" style="animation-delay: 0.7s">Timer</h3>
        <p class="fade-in-element" style="animation-delay: 0.8s">Customize Journal, Timer Style (Coming soon)</p>
    `, true); // Hide close button

    // Attach event listeners
    setTimeout(() => {
        attachAuthenticatedSettingsListeners();
        attachDarkModeToggle();
        attachFontDropdown();

        // Trigger fade-in
        const fadeElements = document.querySelectorAll('.fade-in-element');
        requestAnimationFrame(() => {
            fadeElements.forEach(el => el.classList.add('show'));
        });
    }, 50);
}

/**
 * Attach event listeners for anonymous settings
 */
function attachAnonymousSettingsListeners() {
    const showSignupBtn = document.getElementById('auth-show-signup');
    const showSigninBtn = document.getElementById('auth-show-signin');

    showSignupBtn?.addEventListener('click', () => showAuthForm('signup'));
    showSigninBtn?.addEventListener('click', () => showAuthForm('signin'));

    // Attach auth form listeners
    attachAuthListeners();
}

/**
 * Attach event listeners for authenticated settings
 */
function attachAuthenticatedSettingsListeners() {
    document.getElementById('auth-signout')?.addEventListener('click', async () => {
        const result = await supabaseModule.signOut();
        if (result.success) {
            closeModal();
            // Reload to reset state
            location.reload();
        }
    });
}

/**
 * Attach dark mode toggle handler
 */
function attachDarkModeToggle() {
    const toggle = document.getElementById('dark-mode-switch');
    toggle?.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;

        // Apply or remove dark mode class
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Save to localStorage
        localStorage.setItem('bl_darkMode', isDarkMode.toString());
    });
}

// Make renderSettingsModal available globally for auth state changes
window.renderSettingsModal = renderSettingsModal;

