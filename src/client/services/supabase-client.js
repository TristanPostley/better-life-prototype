/**
 * Supabase Client and API Service
 * 
 * This module initializes the Supabase client and provides the complete API interface
 * for authentication, user profiles, sessions, responses, and feedback.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Project Settings > API
 * 3. Copy your project URL and anon/public key
 * 4. Replace the placeholder values below
 * 
 * @typedef {import('../../shared/types/api.js').APIResponse} APIResponse
 * @typedef {import('../../shared/types/api.js').SuccessResponse} SuccessResponse
 * @typedef {import('../../shared/types/api.js').ErrorResponse} ErrorResponse
 * @typedef {import('../../shared/domains/auth/types.js').AuthStateChangedEventDetail} AuthStateChangedEventDetail
 * @typedef {import('../../shared/domains/auth/types.js').AuthResult} AuthResult
 * @typedef {import('../../shared/domains/users/types.js').Profile} Profile
 * @typedef {import('../../shared/domains/users/types.js').ProfileUpdate} ProfileUpdate
 * @typedef {import('../../shared/domains/sessions/types.js').Session} Session
 * @typedef {import('../../shared/domains/sessions/types.js').SessionCreate} SessionCreate
 * @typedef {import('../../shared/domains/reflection/types.js').QuestionType} QuestionType
 * @typedef {import('../../shared/domains/reflection/types.js').Response} Response
 * @typedef {import('../../shared/domains/feedback/types.js').Feedback} Feedback
 */

import { handleError, ERROR_SEVERITY } from '../../shared/utils/error-handler.js';

// TODO: Replace these with your actual Supabase credentials
// Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const SUPABASE_URL = 'https://ftuodzyaxdshogamezvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dW9kenlheGRzaG9nYW1lenZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjkyNTUsImV4cCI6MjA4MDIwNTI1NX0.K8AvAvlzQhOZubO-HpSOquDidpZHaKHHOUIBBnvNch4';

// Initialize Supabase client with error handling
// Use a placeholder that will be initialized asynchronously
let supabase = null;
let supabaseInitialized = false;

// Create a minimal mock to prevent errors until Supabase loads
const createMockSupabase = () => ({
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } }),
        signUp: async () => ({ data: null, error: { message: 'Supabase not initialized' } }),
        signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not initialized' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not initialized' } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not initialized' } }),
        signOut: async () => ({ error: { message: 'Supabase not initialized' } }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Supabase not initialized' } })
    },
    from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not initialized' } }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not initialized' } }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not initialized' } }) }) }) })
    })
});

// Initialize with mock first
supabase = createMockSupabase();

// Don't try to load Supabase during module evaluation
// Only load it when initAuth is called (lazy loading)
async function loadSupabaseClient() {
    if (supabaseInitialized) return; // Already loaded or attempted
    
    // Mark as attempted immediately to prevent multiple attempts
    supabaseInitialized = true;
    
    // Validate credentials before attempting to load
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        handleError('Supabase credentials are missing', {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'loadSupabaseClient' }
        });
        return;
    }
    
    try {
        // Try multiple CDN sources for better reliability
        let supabaseModule;
        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm',
            'https://unpkg.com/@supabase/supabase-js@2/dist/esm/index.js',
            'https://esm.sh/@supabase/supabase-js@2'
        ];
        
        let lastError = null;
        for (const url of cdnUrls) {
            try {
                supabaseModule = await import(url);
                if (supabaseModule && supabaseModule.createClient) {
                    break; // Success, exit loop
                }
            } catch (importError) {
                lastError = importError;
                continue; // Try next URL
            }
        }
        
        // Check if the module was loaded successfully
        if (!supabaseModule || typeof supabaseModule !== 'object') {
            throw new Error(`Failed to import Supabase module from any CDN. Last error: ${lastError?.message || 'Unknown error'}`);
        }
        
        // Check if createClient exists and is a function
        if (!supabaseModule.createClient || typeof supabaseModule.createClient !== 'function') {
            throw new Error('Supabase module loaded but createClient is not available');
        }
        
        const { createClient } = supabaseModule;
        
        // Create the client
        let client;
        try {
            client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (clientError) {
            throw new Error(`Failed to create Supabase client: ${clientError.message}`);
        }
        
        // Verify the client was created successfully
        if (!client || typeof client !== 'object') {
            throw new Error('Supabase client creation returned invalid result');
        }
        
        if (!client.auth || typeof client.auth !== 'object') {
            throw new Error('Supabase client created but auth property is invalid');
        }
        
        // Success! Use the real client
        supabase = client;
        console.log('Supabase client initialized successfully');
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'loadSupabaseClient' }
        });
        // Keep using the mock (already set at module initialization)
    }
}

export { supabase };

// Global auth state
export let currentUser = null;
export let isAuthenticated = false;

/**
 * Initialize authentication state and set up listeners
 * @returns {Promise<APIResponse<{user: Object|null, authenticated: boolean}>>}
 */
export async function initAuth() {
    // Try to load Supabase client if not already loaded
    await loadSupabaseClient();
    
    // Safety check: ensure supabase and auth are available
    if (!supabase || !supabase.auth) {
        handleError('Supabase client not available (using mock)', {
            severity: ERROR_SEVERITY.WARNING,
            context: { module: 'supabase-client.js', function: 'initAuth' },
            silent: false
        });
        return { success: false, error: 'Supabase client not available', data: { user: null, authenticated: false } };
    }
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        currentUser = session.user;
        isAuthenticated = true;
    } else {
        currentUser = null;
        isAuthenticated = false;
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {

        if (session) {
            currentUser = session.user;
            isAuthenticated = true;

            // Trigger custom event for app to respond to
            /** @type {AuthStateChangedEventDetail} */
            const detail = { event, user: currentUser, authenticated: true };
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail }));
        } else {
            currentUser = null;
            isAuthenticated = false;

            /** @type {AuthStateChangedEventDetail} */
            const detail = { event, user: null, authenticated: false };
            window.dispatchEvent(new CustomEvent('auth-state-changed', { detail }));
        }
    });

    return { success: true, data: { user: currentUser, authenticated: isAuthenticated } };
}

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<APIResponse<Object>>}
 */
export async function signUpWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, data: data.user, message: 'Account created! Check your email to verify.' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signUpWithEmail' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<APIResponse<Object>>}
 */
export async function signInWithEmail(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, data: data.user, message: 'Signed in successfully!' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signInWithEmail' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Sign in with OAuth provider (Google or GitHub)
 * @param {'google' | 'github'} provider
 * @returns {Promise<APIResponse<null>>}
 */
export async function signInWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider, // 'google' or 'github'
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, data: null, message: `Redirecting to ${provider}...` };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signInWithOAuth', data: { provider } }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Send magic link for passwordless authentication
 * @param {string} email
 * @returns {Promise<APIResponse<null>>}
 */
export async function signInWithMagicLink(email) {
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, data: null, message: 'Check your email for the magic link!' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signInWithMagicLink' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Sign out current user
 * @returns {Promise<APIResponse<null>>}
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return { success: true, data: null, message: 'Signed out successfully' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'signOut' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<APIResponse<null>>}
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        if (error) throw error;

        return { success: true, data: null, message: 'Password reset email sent!' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'resetPassword' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Get current user's profile data
 * @returns {Promise<APIResponse<Profile>>}
 */
export async function getUserProfile() {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'getUserProfile' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Update user's profile data
 * @param {ProfileUpdate} updates
 * @returns {Promise<APIResponse<Profile>>}
 */
export async function updateUserProfile(updates) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'updateUserProfile' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Save a completed session
 * @param {number} durationSeconds
 * @param {string|null} [journalEntry]
 * @returns {Promise<APIResponse<Session>>}
 */
export async function saveSession(durationSeconds, journalEntry = null) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                user_id: currentUser.id,
                duration_seconds: durationSeconds,
                journal_entry: journalEntry
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'saveSession' }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Save a question response
 * @param {QuestionType} questionType
 * @param {string} responseText
 * @returns {Promise<APIResponse<Response>>}
 */
export async function saveResponse(questionType, responseText) {
    if (!isAuthenticated) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('responses')
            .insert({
                user_id: currentUser.id,
                question_type: questionType,
                response_text: responseText
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'saveResponse', data: { questionType } }
        });
        return { success: false, error: error.message };
    }
}

/**
 * Submit feedback
 * @param {string} message
 * @returns {Promise<APIResponse<null>>}
 */
export async function submitFeedback(message) {
    try {
        const feedbackData = {
            message,
            user_id: isAuthenticated ? currentUser.id : null
        };

        const { error } = await supabase
            .from('feedback')
            .insert(feedbackData);

        if (error) throw error;

        return { success: true, data: null, message: 'Feedback sent! Thank you.' };
    } catch (error) {
        handleError(error, {
            severity: ERROR_SEVERITY.ERROR,
            context: { module: 'supabase-client.js', function: 'submitFeedback' }
        });
        return { success: false, error: error.message };
    }
}

