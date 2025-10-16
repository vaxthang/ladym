// Authentication Manager with Full Functionality
// Handles login, registration, Google Sign-In, password reset, and user sessions

// ============= AUTH MANAGER =============
class AuthManager {
    constructor() {
        this.authModal = null;
        this.profileModal = null;
        this.currentMode = 'login';
        this.currentUser = null;
        this.isAuthenticated = false;
        this.birthdayPicker = null;
        
        this.init();
        
        // Make globally accessible
        window.authManager = this;
    }

    init() {
        // Create modals
        this.createAuthModal();
        this.createProfileModal();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Check if user is already logged in
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        if (window.apiClient && window.apiClient.isAuthenticated()) {
            const response = await window.apiClient.getCurrentUser();
            if (response.success) {
                this.setAuthenticatedUser(response.user);
            }
        }
    }

    setAuthenticatedUser(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        this.updateProfileModal(user);
        this.updateHeaderProfileButton(user);
    }

    updateHeaderProfileButton(user) {
        // Update the profile button in header to show user's picture
        const profileBtn = document.querySelector('.header__btn img[alt="Account"]');
        if (profileBtn && user.picture) {
            // Replace the SVG icon with the user's profile picture
            profileBtn.src = user.picture;
            profileBtn.style.width = '100%';
            profileBtn.style.height = '100%';
            profileBtn.style.borderRadius = '50%';
            profileBtn.style.objectFit = 'cover';
        }
    }

    updateProfileModal(user) {
        const nameInput = document.getElementById('profileName');
        const emailValue = document.getElementById('profileEmail');
        const birthdayInput = document.getElementById('profileBirthday');
        const profilePicture = document.getElementById('profilePicturePreview');

        if (nameInput) nameInput.value = user.name || '';
        if (emailValue) emailValue.textContent = user.email || 'user@example.com';
        if (birthdayInput) {
            birthdayInput.value = user.birthday || '';
            // Check age and show warning if needed
            if (user.birthday) {
                this.checkAgeAndShowWarning(user.birthday);
            }
        }

        // Update profile picture
        if (profilePicture) {
            if (user.picture) {
                profilePicture.innerHTML = `<img src="${user.picture}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
            } else {
                // Reset to placeholder if no picture
                profilePicture.innerHTML = `
                    <svg class="profile-picture-upload__placeholder-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                `;
            }
        }
    }

    attachProfileEventListeners() {
        // Upload picture button
        const uploadBtn = document.getElementById('uploadPictureBtn');
        const fileInput = document.getElementById('profilePictureInput');
        const preview = document.getElementById('profilePicturePreview');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        this.showProfileMessage('Image size must be less than 5MB', 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (event) => {
                        preview.innerHTML = `<img src="${event.target.result}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
                        // Store the image data
                        this.tempProfilePicture = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Birthday picker
        const birthdayInput = document.getElementById('profileBirthday');
        if (birthdayInput) {
            this.profileBirthdayPicker = new BirthdayPicker(birthdayInput);
            
            // Listen for birthday changes
            birthdayInput.addEventListener('change', () => {
                this.checkAgeAndShowWarning(birthdayInput.value);
            });
        }

        // Save profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProfile();
            });
        }
    }

    checkAgeAndShowWarning(birthdayString) {
        const ageWarning = document.getElementById('ageWarning');
        if (!ageWarning || !birthdayString) return;

        const age = this.calculateAge(birthdayString);
        
        if (age < 18) {
            ageWarning.style.display = 'flex';
        } else {
            ageWarning.style.display = 'none';
        }
    }

    calculateAge(birthdayString) {
        const birthday = new Date(birthdayString);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        
        return age;
    }

    async saveProfile() {
        const nameInput = document.getElementById('profileName');
        const birthdayInput = document.getElementById('profileBirthday');
        const saveBtn = document.getElementById('profileSaveBtn');

        const name = nameInput.value.trim();
        const birthday = birthdayInput.value;

        if (!name) {
            this.showProfileMessage('Please enter your name', 'error');
            return;
        }

        // Show loading state
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const updates = {
                name: name,
                birthday: birthday || null
            };

            // Add profile picture if changed
            if (this.tempProfilePicture) {
                updates.picture = this.tempProfilePicture;
            }

            const response = await window.apiClient.updateProfile(updates);

            if (response.success) {
                this.currentUser = response.user;
                this.showProfileMessage('Profile updated successfully!', 'success');
                
                // Update the displayed values
                this.updateProfileModal(response.user);
                
                // Clear temp picture
                this.tempProfilePicture = null;
            } else {
                this.showProfileMessage(response.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showProfileMessage('Failed to update profile. Please try again.', 'error');
        } finally {
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }

    showProfileMessage(message, type) {
        const messageEl = document.getElementById('profileMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `auth-message ${type} active`;
            
            setTimeout(() => {
                messageEl.classList.remove('active');
            }, 3000);
        }
    }

    createAuthModal() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="authModalOverlay"></div>
            <div class="auth-modal" id="authModal">
                <div class="auth-modal__container">
                    <div id="authModalContent"></div>
                </div>
                <button class="auth-modal__close" id="authModalClose">
                    <img src="img/icons/close-x-icon.svg" alt="Close" />
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.authModal = document.getElementById('authModal');
        this.renderAuthForm('login');
    }

    createProfileModal() {
        const modalHTML = `
            <div class="profile-modal" id="profileModal">
                <div class="profile-modal__container">
                    <div class="profile-modal__header">
                        <h2 class="profile-modal__title">My Profile</h2>
                    </div>
                    
                    <div id="profileModalContent">
                        <form id="profileForm">
                            <input type="file" id="profilePictureInput" accept="image/*" style="display: none;" />
                            
                            <div class="profile-picture-upload">
                                <div class="profile-picture-upload__preview" id="profilePicturePreview">
                                    <svg class="profile-picture-upload__placeholder-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <button type="button" class="profile-picture-upload__btn" id="uploadPictureBtn">
                                    Upload Picture
                                </button>
                            </div>
                            
                            <div class="auth-message" id="profileMessage"></div>
                            
                            <div class="profile-info">
                                <div class="profile-info__item profile-info__item--editable">
                                    <div class="profile-info__label">Name</div>
                                    <input 
                                        type="text" 
                                        class="profile-info__input" 
                                        id="profileName" 
                                        placeholder="Your name"
                                        value="User Name"
                                    />
                                </div>
                                
                                <div class="profile-info__item">
                                    <div class="profile-info__label">Email</div>
                                    <div class="profile-info__value" id="profileEmail">user@example.com</div>
                                </div>
                                
                                <div class="profile-info__item profile-info__item--editable">
                                    <div class="profile-info__label">Birthday</div>
                                    <input 
                                        type="text" 
                                        class="profile-info__input" 
                                        id="profileBirthday" 
                                        placeholder="Select birthday"
                                        readonly
                                    />
                                    <div class="birthday-info-message">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                        <span>We require your birthday to verify you're 18 or older to make purchases. If you're under 18, your parent or guardian must log in to complete any purchases on your behalf.</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="ageWarning" class="age-warning" style="display: none;">
                                <div class="age-warning__icon">⚠️</div>
                                <div class="age-warning__content">
                                    <strong>You must be 18 or older to make purchases.</strong>
                                    <p>If you're under 18, please ask your parents or guardians to create an account and make purchases on your behalf.</p>
                                </div>
                            </div>
                            
                            <div class="profile-actions">
                                <button type="submit" class="profile-actions__btn profile-actions__btn--primary" id="profileSaveBtn">
                                    Save Changes
                                </button>
                                <button type="button" class="profile-actions__btn profile-actions__btn--secondary" id="profileLogoutBtn">
                                    Log Out
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <button class="auth-modal__close profile-modal__close" id="profileModalClose">
                    <img src="img/icons/close-x-icon.svg" alt="Close" />
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.profileModal = document.getElementById('profileModal');
        this.attachProfileEventListeners();
    }

    renderAuthForm(mode) {
        this.currentMode = mode;
        const content = document.getElementById('authModalContent');
        
        if (mode === 'register') {
            content.innerHTML = this.getRegisterFormHTML();
            this.attachRegisterFormListeners();
        } else if (mode === 'login') {
            content.innerHTML = this.getLoginFormHTML();
            this.attachLoginFormListeners();
        } else if (mode === 'forgot_password') {
            content.innerHTML = this.getForgotPasswordFormHTML();
            this.attachForgotPasswordListeners();
        }
    }

    getRegisterFormHTML() {
        return `
            <div class="auth-modal__header">
                <h2 class="auth-modal__title">Create an Account</h2>
                <span class="auth-modal__subtitle">Create an Account</span>
            </div>
            
            <div class="auth-message" id="authMessage"></div>
            
            <form class="auth-form" id="registerForm">
                <div class="auth-form__group">
                    <input 
                        type="email" 
                        class="auth-form__input" 
                        id="registerEmail" 
                        placeholder="Email"
                        required
                    />
                    
                    <input 
                        type="password" 
                        class="auth-form__input" 
                        id="registerPassword" 
                        placeholder="Create password"
                        required
                    />
                    
                    <div class="auth-form__password-requirements">
                        Passwords must contain 8–25 characters, at least 1 uppercase, 1 lowercase letter, 1 number and 1 special character.
                    </div>
                    
                    <input 
                        type="text" 
                        class="auth-form__input" 
                        id="birthdayInput" 
                        placeholder="Birthday"
                        readonly
                        required
                    />
                </div>
                
                <button type="submit" class="auth-form__submit">Create</button>
                
                <div class="auth-form__divider">
                    <div class="auth-form__divider-line"></div>
                    <span class="auth-form__divider-text">Or</span>
                    <div class="auth-form__divider-line"></div>
                </div>
                
                <button type="button" class="auth-form__social-btn" id="googleSignIn">
                    <img src="img/icons/google-icon.svg" alt="Google" />
                    Continue with Google account
                </button>
                
                <div class="auth-form__footer">
                    By continuing, you accept Terms & Conditions of Service and confirm that you have read our Privacy Statement.
                </div>
                
                <div class="auth-form__switch">
                    <span class="auth-form__switch-text">Already have an account? </span>
                    <a href="#" class="auth-form__switch-link" id="switchToLogin">Log In</a>
                </div>
            </form>
        `;
    }

    getLoginFormHTML() {
        return `
            <div class="auth-modal__header">
                <h2 class="auth-modal__title">Welcome Back</h2>
                <span class="auth-modal__subtitle">Log In</span>
            </div>
            
            <div class="auth-message" id="authMessage"></div>
            
            <form class="auth-form" id="loginForm">
                <div class="auth-form__group">
                    <input 
                        type="email" 
                        class="auth-form__input" 
                        id="loginEmail" 
                        placeholder="Email"
                        required
                    />
                    
                    <input 
                        type="password" 
                        class="auth-form__input" 
                        id="loginPassword" 
                        placeholder="Password"
                        required
                    />
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="auth-form__checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                class="auth-form__checkbox" 
                                id="rememberMe"
                            />
                            <label for="rememberMe" class="auth-form__checkbox-label">Remember me</label>
                        </div>
                        <a href="#" class="auth-form__link" id="forgotPasswordLink">Forgot Password?</a>
                    </div>
                </div>
                
                <button type="submit" class="auth-form__submit">Log In</button>
                
                <div class="auth-form__divider">
                    <div class="auth-form__divider-line"></div>
                    <span class="auth-form__divider-text">Or</span>
                    <div class="auth-form__divider-line"></div>
                </div>
                
                <button type="button" class="auth-form__social-btn" id="googleSignIn">
                    <img src="img/icons/google-icon.svg" alt="Google" />
                    Continue with Google account
                </button>
                
                <div class="auth-form__switch">
                    <span class="auth-form__switch-text">Don't have an account? </span>
                    <a href="#" class="auth-form__switch-link" id="switchToRegister">Create Account</a>
                </div>
            </form>
        `;
    }

    getForgotPasswordFormHTML() {
        return `
            <div class="auth-modal__header">
                <h2 class="auth-modal__title">Reset Password</h2>
                <span class="auth-modal__subtitle">Forgot Password</span>
            </div>
            
            <div class="auth-message" id="authMessage"></div>
            
            <form class="auth-form" id="forgotPasswordForm">
                <div class="auth-form__group">
                    <p style="font-size: 16px; color: #7A7A7A; margin-bottom: 20px;">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <input 
                        type="email" 
                        class="auth-form__input" 
                        id="resetEmail" 
                        placeholder="Email"
                        required
                    />
                </div>
                
                <button type="submit" class="auth-form__submit">Send Reset Link</button>
                
                <div class="auth-form__switch">
                    <a href="#" class="auth-form__switch-link" id="backToLogin">Back to Login</a>
                </div>
            </form>
        `;
    }

    attachRegisterFormListeners() {
        const form = document.getElementById('registerForm');
        const googleBtn = document.getElementById('googleSignIn');
        const switchBtn = document.getElementById('switchToLogin');
        const birthdayInput = document.getElementById('birthdayInput');

        // Initialize birthday picker
        if (birthdayInput) {
            this.birthdayPicker = new BirthdayPicker(birthdayInput);
            
            // Add age warning container after birthday input
            const ageWarningHTML = `
                <div id="registerAgeWarning" class="age-warning" style="display: none; margin-top: 15px;">
                    <div class="age-warning__icon">⚠️</div>
                    <div class="age-warning__content">
                        <strong>You must be 18 or older to create an account.</strong>
                        <p>If you're under 18, please ask your parents or guardians to create an account and make purchases on your behalf.</p>
                    </div>
                </div>
            `;
            birthdayInput.parentElement.insertAdjacentHTML('afterend', ageWarningHTML);
            
            // Listen for birthday changes
            birthdayInput.addEventListener('change', () => {
                const age = this.calculateAge(birthdayInput.value);
                const warning = document.getElementById('registerAgeWarning');
                if (warning) {
                    warning.style.display = age < 18 ? 'flex' : 'none';
                }
            });
        }

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const birthday = birthdayInput.value || null;

            // Validate inputs
            if (!email || !password) {
                this.showMessage('Please fill in all required fields', 'error');
                return;
            }

            // Validate age if birthday is provided
            if (birthday) {
                const age = this.calculateAge(birthday);
                if (age < 18) {
                    this.showMessage('You must be 18 or older to create an account', 'error');
                    return;
                }
            }

            // Show loading state
            const submitBtn = form.querySelector('.auth-form__submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating account...';
            submitBtn.disabled = true;

            try {
                const response = await window.apiClient.register(email, password, birthday);
                
                if (response.success) {
                    this.setAuthenticatedUser(response.user);
                    this.showMessage('Account created successfully!', 'success');
                    
                    setTimeout(() => {
                        this.closeAuthModal();
                        window.location.reload();
                    }, 1500);
                } else {
                    this.showMessage(response.error || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.showMessage('Registration failed. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Google sign in
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.googleAuth) {
                window.googleAuth.signIn();
            } else {
                this.showMessage('Google Sign-In is not available', 'error');
            }
        });

        // Switch to login
        switchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthForm('login');
        });
    }

    attachLoginFormListeners() {
        const form = document.getElementById('loginForm');
        const googleBtn = document.getElementById('googleSignIn');
        const switchBtn = document.getElementById('switchToRegister');
        const forgotBtn = document.getElementById('forgotPasswordLink');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = rememberMeCheckbox.checked;

            // Validate inputs
            if (!email || !password) {
                this.showMessage('Please fill in all fields', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('.auth-form__submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            try {
                const response = await window.apiClient.login(email, password, rememberMe);
                
                if (response.success) {
                    this.setAuthenticatedUser(response.user);
                    this.showMessage('Login successful!', 'success');
                    
                    setTimeout(() => {
                        this.closeAuthModal();
                        window.location.reload();
                    }, 1500);
                } else {
                    this.showMessage(response.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                this.showMessage('Login failed. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Google sign in
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.googleAuth) {
                window.googleAuth.signIn();
            } else {
                this.showMessage('Google Sign-In is not available', 'error');
            }
        });

        // Switch to register
        switchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthForm('register');
        });

        // Forgot password
        forgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthForm('forgot_password');
        });
    }

    attachForgotPasswordListeners() {
        const form = document.getElementById('forgotPasswordForm');
        const backBtn = document.getElementById('backToLogin');

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value.trim();

            if (!email) {
                this.showMessage('Please enter your email address', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('.auth-form__submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await window.apiClient.requestPasswordReset(email);
                
                if (response.success) {
                    this.showMessage(response.message, 'success');
                    
                    // For development: show reset code
                    if (response.resetCode) {
                        // Reset code sent successfully
                        this.showMessage(`Reset code: ${response.resetCode} (check console)`, 'success');
                    }
                    
                    setTimeout(() => {
                        this.renderAuthForm('login');
                    }, 3000);
                } else {
                    this.showMessage(response.error || 'Failed to send reset email', 'error');
                }
            } catch (error) {
                console.error('Password reset error:', error);
                this.showMessage('Failed to send reset email. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Back to login
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthForm('login');
        });
    }

    attachEventListeners() {
        // Close buttons
        document.getElementById('authModalClose')?.addEventListener('click', () => {
            this.closeAuthModal();
        });

        document.getElementById('authModalOverlay')?.addEventListener('click', () => {
            this.closeAuthModal();
        });

        document.getElementById('profileModalClose')?.addEventListener('click', () => {
            this.closeProfileModal();
        });

        // Profile logout button
        document.getElementById('profileLogoutBtn')?.addEventListener('click', () => {
            if (window.apiClient) {
                window.apiClient.logout();
            }
            this.currentUser = null;
            this.isAuthenticated = false;
            this.resetHeaderProfileButton();
            this.closeProfileModal();
            this.showMessage('Logged out successfully', 'success');
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }

    resetHeaderProfileButton() {
        // Reset the profile button in header back to default icon
        const profileBtn = document.querySelector('.header__btn img[alt="Account"]');
        if (profileBtn) {
            profileBtn.src = 'img/icons/profile.svg';
            profileBtn.style.width = '20px';
            profileBtn.style.height = '20px';
            profileBtn.style.borderRadius = '';
            profileBtn.style.objectFit = '';
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `auth-message ${type} active`;
            
            setTimeout(() => {
                messageEl.classList.remove('active');
            }, 3000);
        }
    }

    openAuthModal(mode = 'login') {
        this.renderAuthForm(mode);
        document.getElementById('authModalOverlay').classList.add('active');
        document.getElementById('authModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAuthModal() {
        document.getElementById('authModalOverlay').classList.remove('active');
        document.getElementById('authModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    openProfileModal() {
        document.getElementById('authModalOverlay').classList.add('active');
        document.getElementById('profileModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeProfileModal() {
        document.getElementById('authModalOverlay').classList.remove('active');
        document.getElementById('profileModal').classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});