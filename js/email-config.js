// EmailJS Configuration for Password Reset
// Sign up at https://www.emailjs.com/ and get your credentials

const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

// Initialize EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.warn('EmailJS library not loaded');
    }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetCode) {
    if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS not initialized');
    }

    const templateParams = {
        to_email: email,
        reset_code: resetCode,
        to_name: email.split('@')[0],
        reply_to: 'noreply@ladym.com'
    };

    try {
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

// Generate random reset code
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailJS);
} else {
    initEmailJS();
}

// Export for use in other files
window.emailService = {
    init: initEmailJS,
    sendPasswordReset: sendPasswordResetEmail,
    generateCode: generateResetCode
};