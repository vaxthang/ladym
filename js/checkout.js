// Checkout Page JavaScript

// Get cart data from localStorage
let cartData = [];
const TAX_RATE = 0.08;
const DELIVERY_FEE = 10.00;

// Load cart data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartData();
    renderOrderSummary();
    updateCartCount();
    setupFormValidation();
    setupEventListeners();
});

// Load cart data from localStorage
function loadCartData() {
    const storedCart = localStorage.getItem('ladym_cart');
    if (storedCart) {
        try {
            cartData = JSON.parse(storedCart);
        } catch (e) {
            console.error('Error parsing cart data:', e);
            cartData = [];
        }
    }

    // If cart is empty, show empty state
    if (cartData.length === 0) {
        showEmptyCartState();
    }
}

// Show empty cart state
function showEmptyCartState() {
    const checkoutSection = document.querySelector('.checkout');
    checkoutSection.innerHTML = `
        <div class="empty-cart">
            <div class="empty-cart__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6"/>
                </svg>
            </div>
            <h2 class="empty-cart__title">Your cart is empty</h2>
            <p class="empty-cart__message">Add some delicious cakes to your cart before checking out.</p>
            <a href="index.html" class="empty-cart__btn btn">Browse Cakes</a>
        </div>
    `;
}

// Render order summary
function renderOrderSummary() {
    const summaryItemsContainer = document.getElementById('orderSummaryItems');
    if (!summaryItemsContainer) return;

    summaryItemsContainer.innerHTML = '';

    if (cartData.length === 0) {
        return;
    }

    cartData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="summary-item__image">
            <div class="summary-item__details">
                <div class="summary-item__name">${item.name}</div>
                <div class="summary-item__desc">${item.desc}</div>
                <div class="summary-item__quantity">Quantity: ${item.qty}</div>
            </div>
            <div class="summary-item__price">$${(item.price * item.qty).toFixed(2)}</div>
        `;
        summaryItemsContainer.appendChild(itemDiv);
    });

    updateTotals();
}

// Update totals
function updateTotals() {
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + DELIVERY_FEE;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('delivery').textContent = `$${DELIVERY_FEE.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cartData.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalItems;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Back to cart button
    const backToCartBtn = document.getElementById('backToCartBtn');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmit);
    }

    // Back to home button in success modal
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Expiry date formatting
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', formatExpiryDate);
    }

    // CVV input restriction
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

// Format card number with spaces
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

// Format expiry date as MM/YY
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
}

// Format phone number
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `+1 (${value}`;
        } else if (value.length <= 6) {
            value = `+1 (${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `+1 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    e.target.value = value;
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /\+1 \(\d{3}\) \d{3}-\d{4}/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }

    // Card number validation
    if (fieldName === 'cardNumber' && value) {
        const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
        if (!cardRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid card number';
        }
    }

    // Expiry date validation
    if (fieldName === 'expiryDate' && value) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid expiry date (MM/YY)';
        } else {
            // Check if date is in the future
            const [month, year] = value.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const now = new Date();
            if (expiry < now) {
                isValid = false;
                errorMessage = 'Card has expired';
            }
        }
    }

    // CVV validation
    if (fieldName === 'cvv' && value) {
        if (value.length < 3 || value.length > 4) {
            isValid = false;
            errorMessage = 'Please enter a valid CVV';
        }
    }

    // ZIP code validation
    if (fieldName === 'zipCode' && value) {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid ZIP code';
        }
    }

    // Update UI
    if (isValid) {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }

    return isValid;
}

// Validate entire form
function validateForm() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('.form-input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        // Scroll to first error
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Processing...';

    // Simulate API call
    setTimeout(() => {
        // Generate order number
        const orderNumber = '#' + Math.floor(10000 + Math.random() * 90000);
        document.getElementById('orderNumber').textContent = orderNumber;

        // Clear cart
        localStorage.removeItem('ladym_cart');
        cartData = [];

        // Show success modal
        const successModal = document.getElementById('successModal');
        successModal.classList.add('active');

        // Reset form
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Complete Order
        `;
    }, 2000);
}

// Cart button functionality (redirect to home with cart open)
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', function() {
        window.location.href = 'index.html#cart';
    });
}