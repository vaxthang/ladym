// Google OAuth Configuration
// Replace with your actual Google Client ID from Google Cloud Console
// Get your Client ID from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Check if Client ID is configured
const isGoogleConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Initialize Google Sign-In
function initGoogleSignIn() {
    if (typeof google === 'undefined') {
        console.warn('Google Sign-In library not loaded');
        return;
    }

    // Only initialize if Client ID is configured
    if (isGoogleConfigured) {
        try {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true,
                ux_mode: 'popup'
            });
        } catch (error) {
            // Failed to initialize Google Sign-In - silent fail
        }
    }
}

// Handle Google Sign-In response
async function handleGoogleSignIn(response) {
    try {
        // Decode JWT token to get user info
        const userInfo = parseJwt(response.credential);
        
        if (!userInfo) {
            throw new Error('Failed to parse user information from Google');
        }

        const userData = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            provider: 'google',
            googleId: userInfo.sub,
            birthday: null,
            createdAt: new Date().toISOString()
        };

        // Check if user exists in database and create/update
        if (window.apiClient) {
            const users = window.apiClient.getUsers();
            let existingUser = users.find(u => u.email === userData.email);
            
            if (!existingUser) {
                // Create new user
                existingUser = {
                    ...userData,
                    password: null // Google users don't have password
                };
                users.push(existingUser);
                window.apiClient.saveUsers(users);
            } else {
                // Update existing user with Google info
                existingUser.picture = userData.picture;
                existingUser.name = userData.name;
                existingUser.provider = 'google';
                existingUser.googleId = userData.googleId;
                window.apiClient.saveUsers(users);
            }

            // Set as current user with remember me enabled
            window.apiClient.setCurrentUser(existingUser, true);
        } else {
            // Fallback: Store user data directly
            localStorage.setItem('ladym_user', JSON.stringify(userData));
            localStorage.setItem('ladym_auth_token', userData.id);
            localStorage.setItem('ladym_auth_provider', 'google');
            localStorage.setItem('ladym_remember_me', 'true');
        }

        // Update auth manager
        if (window.authManager) {
            window.authManager.setAuthenticatedUser(userData);
            window.authManager.closeAuthModal();
            window.authManager.showMessage('Successfully signed in with Google!', 'success');
        }

        // Reload to update UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);

    } catch (error) {
        if (window.authManager) {
            window.authManager.showMessage('Failed to sign in with Google. Please try again.', 'error');
        }
    }
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

// Trigger Google Sign-In
function triggerGoogleSignIn() {
    if (typeof google === 'undefined') {
        if (window.authManager) {
            showGoogleSetupModal();
        }
        return;
    }

    // Check if Client ID is configured
    if (!isGoogleConfigured) {
        if (window.authManager) {
            showGoogleSetupModal();
        }
        return;
    }

    try {
        // Create a temporary container for the button
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        document.body.appendChild(tempContainer);

        // Render the Google Sign-In button
        google.accounts.id.renderButton(tempContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            width: 250
        });

        // Trigger click on the rendered button
        setTimeout(() => {
            const googleButton = tempContainer.querySelector('div[role="button"]');
            if (googleButton) {
                googleButton.click();
            } else {
                // Fallback: use prompt
                google.accounts.id.prompt();
            }
            
            // Clean up after a delay
            setTimeout(() => {
                if (tempContainer.parentNode) {
                    document.body.removeChild(tempContainer);
                }
            }, 1000);
        }, 100);
        } catch (error) {
        if (window.authManager) {
            window.authManager.showMessage('Failed to open Google Sign-In. Please try again.', 'error');
        }
    }
}

// Show setup modal instead of error
function showGoogleSetupModal() {
    const modalHTML = `
        <div class="google-setup-modal-overlay" id="googleSetupOverlay"></div>
        <div class="google-setup-modal" id="googleSetupModal">
            <div class="google-setup-modal__content">
                <button class="google-setup-modal__close" id="googleSetupClose">×</button>
                <div class="google-setup-modal__icon">🔑</div>
                <h2 class="google-setup-modal__title">Google Sign-In Setup</h2>
                <p class="google-setup-modal__text">
                    Google Sign-In requires a Client ID from Google Cloud Console.
                    This takes about 5 minutes to set up.
                </p>
                <div class="google-setup-modal__options">
                    <a href="setup-google-signin.html" target="_blank" class="google-setup-modal__btn google-setup-modal__btn--primary">
                        📖 Setup Guide (5 min)
                    </a>
                    <button class="google-setup-modal__btn google-setup-modal__btn--secondary" id="googleSetupSkip">
                        Use Email/Password Instead
                    </button>
                </div>
                <p class="google-setup-modal__note">
                    💡 <strong>Note:</strong> Email/password login works perfectly without Google Sign-In.
                    You can set this up later if you prefer.
                </p>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existing = document.getElementById('googleSetupModal');
    if (existing) {
        existing.remove();
        document.getElementById('googleSetupOverlay')?.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles if not already added
    if (!document.getElementById('googleSetupStyles')) {
        const styles = document.createElement('style');
        styles.id = 'googleSetupStyles';
        styles.textContent = `
            .google-setup-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                animation: fadeIn 0.3s;
            }
            .google-setup-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                z-index: 10001;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s;
            }
            .google-setup-modal__close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 32px;
                color: #999;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 32px;
                height: 32px;
            }
            .google-setup-modal__close:hover {
                color: #333;
            }
            .google-setup-modal__icon {
                font-size: 64px;
                text-align: center;
                margin-bottom: 20px;
            }
            .google-setup-modal__title {
                font-size: 28px;
                color: #333;
                text-align: center;
                margin-bottom: 15px;
            }
            .google-setup-modal__text {
                font-size: 16px;
                color: #666;
                text-align: center;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .google-setup-modal__options {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }
            .google-setup-modal__btn {
                padding: 15px 25px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                text-align: center;
                text-decoration: none;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
            }
            .google-setup-modal__btn--primary {
                background: #667eea;
                color: white;
            }
            .google-setup-modal__btn--primary:hover {
                background: #5568d3;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .google-setup-modal__btn--secondary {
                background: #f8f9fa;
                color: #333;
                border: 2px solid #e0e0e0;
            }
            .google-setup-modal__btn--secondary:hover {
                background: #e9ecef;
            }
            .google-setup-modal__note {
                font-size: 14px;
                color: #666;
                text-align: center;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                line-height: 1.5;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translate(-50%, -40%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Show modal
    setTimeout(() => {
        document.getElementById('googleSetupOverlay').style.display = 'block';
        document.getElementById('googleSetupModal').style.display = 'block';
    }, 10);
    
    // Close handlers
    const closeModal = () => {
        const modal = document.getElementById('googleSetupModal');
        const overlay = document.getElementById('googleSetupOverlay');
        if (modal) modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    };
    
    document.getElementById('googleSetupClose')?.addEventListener('click', closeModal);
    document.getElementById('googleSetupOverlay')?.addEventListener('click', closeModal);
    document.getElementById('googleSetupSkip')?.addEventListener('click', () => {
        closeModal();
        // Keep the auth modal open so user can use email/password
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleSignIn);
} else {
    initGoogleSignIn();
}

// Export for use in other files
window.googleAuth = {
    init: initGoogleSignIn,
    signIn: triggerGoogleSignIn,
    parseJwt: parseJwt,
    isConfigured: isGoogleConfigured,
    showSetup: showGoogleSetupModal
};