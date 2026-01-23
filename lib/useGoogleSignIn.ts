/**
 * Google Sign-In Hook
 * Provides Google OAuth integration using Google Identity Services
 */

import { useEffect, useRef, useCallback } from 'react';

// Extend Window interface to include Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: GoogleInitConfig) => void;
                    prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
                    renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
                    disableAutoSelect: () => void;
                    cancel: () => void;
                };
            };
        };
    }
}

interface GoogleInitConfig {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    ux_mode?: 'popup' | 'redirect';
    login_uri?: string;
}

interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
    clientId?: string;
}

interface GoogleButtonConfig {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: number;
    locale?: string;
}

interface PromptMomentNotification {
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
    getMomentType: () => string;
}

interface UseGoogleSignInOptions {
    clientId: string;
    onSuccess: (credentialResponse: GoogleCredentialResponse) => void;
    onError?: () => void;
    autoSelect?: boolean;
    context?: 'signin' | 'signup' | 'use';
    uxMode?: 'popup' | 'redirect';
}

/**
 * Hook to integrate Google Sign-In
 */
export const useGoogleSignIn = ({
    clientId,
    onSuccess,
    onError,
    autoSelect = false,
    context = 'signin',
    uxMode = 'popup',
}: UseGoogleSignInOptions) => {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Load Google Identity Services script
        if (!scriptLoaded.current) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                scriptLoaded.current = true;
                initializeGoogleSignIn();
            };
            document.body.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }

        return () => {
            // Cleanup: disable auto-select when component unmounts
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [clientId]);

    const initializeGoogleSignIn = useCallback(() => {
        if (!window.google?.accounts?.id) {
            console.error('Google Identity Services not loaded');
            return;
        }

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
                try {
                    onSuccess(response);
                } catch (error) {
                    console.error('Error in Google Sign-In callback:', error);
                    onError?.();
                }
            },
            auto_select: autoSelect,
            cancel_on_tap_outside: true,
            context,
            ux_mode: uxMode,
        });
    }, [clientId, onSuccess, onError, autoSelect, context, uxMode]);

    /**
     * Render Google Sign-In button
     */
    const renderButton = useCallback(
        (element: HTMLElement | null, options?: GoogleButtonConfig) => {
            if (!element || !window.google?.accounts?.id) {
                return;
            }

            const defaultOptions: GoogleButtonConfig = {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: context === 'signup' ? 'signup_with' : 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: element.offsetWidth || 300,
            };

            window.google.accounts.id.renderButton(element, {
                ...defaultOptions,
                ...options,
            });
        },
        [context]
    );

    /**
     * Show One Tap prompt
     */
    const showOneTap = useCallback(() => {
        if (!window.google?.accounts?.id) {
            console.error('Google Identity Services not loaded');
            return;
        }

        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('One Tap not displayed:', notification.getNotDisplayedReason?.() || notification.getSkippedReason?.());
            }
        });
    }, []);

    return {
        renderButton,
        showOneTap,
    };
};
