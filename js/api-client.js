// API Client for Authentication
// This handles all authentication operations with localStorage as backend

class APIClient {
    constructor() {
        this.storageKeys = {
            users: 'ladym_users_db',
            currentUser: 'ladym_user',
            authToken: 'ladym_auth_token',
            authProvider: 'ladym_auth_provider',
            rememberMe: 'ladym_remember_me',
            resetCodes: 'ladym_reset_codes'
        };
        
        this.initializeStorage();
    }

    // Initialize storage with default data
    initializeStorage() {
        if (!localStorage.getItem(this.storageKeys.users)) {
            localStorage.setItem(this.storageKeys.users, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeys.resetCodes)) {
            localStorage.setItem(this.storageKeys.resetCodes, JSON.stringify({}));
        }
    }

    // Get all users
    getUsers() {
        return JSON.parse(localStorage.getItem(this.storageKeys.users) || '[]');
    }

    // Save users
    saveUsers(users) {
        localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
    }

    // Register new user
    async register(email, password, birthday = null) {
        try {
            const users = this.getUsers();
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                return {
                    success: false,
                    error: 'An account with this email already exists'
                };
            }

            // Validate password
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.valid) {
                return {
                    success: false,
                    error: passwordValidation.error
                };
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: this.hashPassword(password),
                name: email.split('@')[0],
                birthday: birthday,
                picture: null,
                provider: 'email',
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            this.saveUsers(users);

            // Auto login after registration
            const { password: _, ...userWithoutPassword } = newUser;
            this.setCurrentUser(userWithoutPassword, true);

            return {
                success: true,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Registration failed. Please try again.'
            };
        }
    }

    // Login user
    async login(email, password, rememberMe = false) {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            // Check password
            if (user.password !== this.hashPassword(password)) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            // Set current user
            const { password: _, ...userWithoutPassword } = user;
            this.setCurrentUser(userWithoutPassword, rememberMe);

            return {
                success: true,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Login failed. Please try again.'
            };
        }
    }

    // Set current user
    setCurrentUser(user, rememberMe = false) {
        localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(user));
        localStorage.setItem(this.storageKeys.authToken, user.id);
        localStorage.setItem(this.storageKeys.authProvider, user.provider || 'email');
        
        if (rememberMe) {
            localStorage.setItem(this.storageKeys.rememberMe, 'true');
        } else {
            localStorage.removeItem(this.storageKeys.rememberMe);
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.storageKeys.currentUser);
            if (!userStr) {
                return { success: false, error: 'Not authenticated' };
            }

            const user = JSON.parse(userStr);
            return {
                success: true,
                user: user
            };
        } catch (error) {
            return { success: false, error: 'Failed to get user' };
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem(this.storageKeys.authToken);
    }

    // Logout user
    logout() {
        const rememberMe = localStorage.getItem(this.storageKeys.rememberMe) === 'true';
        
        localStorage.removeItem(this.storageKeys.currentUser);
        localStorage.removeItem(this.storageKeys.authToken);
        localStorage.removeItem(this.storageKeys.authProvider);
        
        if (!rememberMe) {
            localStorage.removeItem(this.storageKeys.rememberMe);
        }
    }

    // Request password reset
    async requestPasswordReset(email) {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.email === email);

            if (!user) {
                // Don't reveal if email exists for security
                return {
                    success: true,
                    message: 'If an account exists with this email, a reset code will be sent.'
                };
            }

            // Generate reset code
            const resetCode = window.emailService?.generateCode() || Math.floor(100000 + Math.random() * 900000).toString();
            
            // Store reset code with expiration (10 minutes)
            const resetCodes = JSON.parse(localStorage.getItem(this.storageKeys.resetCodes) || '{}');
            resetCodes[email] = {
                code: resetCode,
                expires: Date.now() + 10 * 60 * 1000 // 10 minutes
            };
            localStorage.setItem(this.storageKeys.resetCodes, JSON.stringify(resetCodes));

            // Try to send email (will fail if EmailJS not configured)
            try {
                if (window.emailService) {
                    await window.emailService.sendPasswordReset(email, resetCode);
                }
            } catch (emailError) {
                console.warn('Email sending failed, but reset code is stored:', resetCode);
                // For development: show reset code in console
                // Reset code generated for development/testing
            }

            return {
                success: true,
                message: 'If an account exists with this email, a reset code will be sent.',
                resetCode: resetCode // For development only
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: 'Failed to process password reset request'
            };
        }
    }

    // Reset password with code
    async resetPassword(email, code, newPassword) {
        try {
            const resetCodes = JSON.parse(localStorage.getItem(this.storageKeys.resetCodes) || '{}');
            const resetData = resetCodes[email];

            if (!resetData) {
                return {
                    success: false,
                    error: 'Invalid or expired reset code'
                };
            }

            if (resetData.expires < Date.now()) {
                delete resetCodes[email];
                localStorage.setItem(this.storageKeys.resetCodes, JSON.stringify(resetCodes));
                return {
                    success: false,
                    error: 'Reset code has expired'
                };
            }

            if (resetData.code !== code) {
                return {
                    success: false,
                    error: 'Invalid reset code'
                };
            }

            // Validate new password
            const passwordValidation = this.validatePassword(newPassword);
            if (!passwordValidation.valid) {
                return {
                    success: false,
                    error: passwordValidation.error
                };
            }

            // Update password
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex === -1) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            users[userIndex].password = this.hashPassword(newPassword);
            this.saveUsers(users);

            // Clear reset code
            delete resetCodes[email];
            localStorage.setItem(this.storageKeys.resetCodes, JSON.stringify(resetCodes));

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: 'Failed to reset password'
            };
        }
    }

    // Update user profile
    async updateProfile(updates) {
        try {
            const currentUserStr = localStorage.getItem(this.storageKeys.currentUser);
            if (!currentUserStr) {
                return { success: false, error: 'Not authenticated' };
            }

            const currentUser = JSON.parse(currentUserStr);
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);

            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }

            // Update user
            users[userIndex] = { ...users[userIndex], ...updates };
            this.saveUsers(users);

            // Update current user
            const { password: _, ...userWithoutPassword } = users[userIndex];
            localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(userWithoutPassword));

            return {
                success: true,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: 'Failed to update profile'
            };
        }
    }

    // Validate password
    validatePassword(password) {
        if (password.length < 8 || password.length > 25) {
            return {
                valid: false,
                error: 'Password must be between 8 and 25 characters'
            };
        }

        if (!/[A-Z]/.test(password)) {
            return {
                valid: false,
                error: 'Password must contain at least one uppercase letter'
            };
        }

        if (!/[a-z]/.test(password)) {
            return {
                valid: false,
                error: 'Password must contain at least one lowercase letter'
            };
        }

        if (!/[0-9]/.test(password)) {
            return {
                valid: false,
                error: 'Password must contain at least one number'
            };
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            return {
                valid: false,
                error: 'Password must contain at least one special character'
            };
        }

        return { valid: true };
    }

    // Simple password hashing (for demo purposes - use proper hashing in production)
    hashPassword(password) {
        // This is a simple hash for demo purposes
        // In production, use proper server-side hashing with bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
}

// Create global instance
window.apiClient = new APIClient();