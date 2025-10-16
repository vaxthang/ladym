// Backend Status Checker
// This file checks if backend services are available

class BackendStatus {
    constructor() {
        this.status = {
            localStorage: true,
            googleAuth: false,
            emailService: false
        };
        
        this.checkStatus();
    }

    checkStatus() {
        // Check localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.status.localStorage = true;
        } catch (e) {
            this.status.localStorage = false;
            console.error('localStorage not available');
        }

        // Check Google Auth (will be set when loaded)
        setTimeout(() => {
            this.status.googleAuth = typeof google !== 'undefined';
            if (!this.status.googleAuth) {
                console.warn('Google Sign-In not available. Please configure Google OAuth.');
            }
        }, 1000);

        // Check Email Service (will be set when loaded)
        setTimeout(() => {
            this.status.emailService = typeof emailjs !== 'undefined';
            if (!this.status.emailService) {
                console.warn('EmailJS not available. Password reset emails will not be sent.');
            }
        }, 1000);
    }

    getStatus() {
        return this.status;
    }

    isReady() {
        return this.status.localStorage;
    }
}

// Create global instance
window.backendStatus = new BackendStatus();