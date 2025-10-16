// Welcome Swiper Slider Configuration
const slides = [
    {
        bg: 'img/welcome.jpg',
        title: 'Jade Rabbit <br>Lantern Gift Set',
        subtitle: 'Sold out online-available exclusively for walk-ir purchase at Lady M Boutiques.',
        btn: 'Find a Boutique'
    },
    {
        bg: 'img/welcome2.webp',
        title: 'Pink Pearl<br>Mille Crêpes',
        subtitle: 'In support of breast cancer research, 5% of<br>October proceeds from the Pink Pearl Mille Crêpes<br>will be donated to Memorial Sloan Kettering<br>Cancer Center.',
        btn: 'Order Now'
    },
    {
        bg: 'img/welcome3.webp',
        title: 'Taro Mochi Cream Cake',
        subtitle: 'Taro-infused cream layered between airy sponge<br>cake and silky vanilla mochi, topped with lilac<br>whipped cream and blue cornflower petals.',
        btn: 'Explore Cakes'
    },
    {
        bg: 'img/welcome4.webp',
        title: 'Gluten-Free Mille Crêpes',
        subtitle: 'Same quality taste, minus the gluten.<br>Available in both Signature and Green Tea.',
        btn: 'Shop Now'
    },
];

// Initialize Welcome Swiper
document.addEventListener('DOMContentLoaded', function() {
    
    // Hamburger Menu Functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const headerMenu = document.getElementById('headerMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const menuLinks = document.querySelectorAll('.header__menu-link');

    function toggleMenu() {
        const isActive = headerMenu.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        hamburgerBtn.classList.add('active');
        headerMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        mobileOverlay.style.display = 'block';
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburgerBtn.classList.remove('active');
        headerMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (!mobileOverlay.classList.contains('active')) {
                mobileOverlay.style.display = 'none';
            }
        }, 300);
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking on menu links
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                closeMenu();
            }
        });
    });

    // Close menu on window resize if desktop size
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 1024 && headerMenu.classList.contains('active')) {
                closeMenu();
            }
        }, 250);
    });

    const welcomeSwiperWrapper = document.querySelector('.welcomeSwiper .swiper-wrapper');
    
    // Create slides dynamically
    slides.forEach((slide, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'swiper-slide';
        slideDiv.setAttribute('data-slide', index);
        slideDiv.style.backgroundImage = `url(${slide.bg})`;
        
        slideDiv.innerHTML = `
            <div class="welcome__content">
                <h1 class="welcome__title">${slide.title}</h1>
                <p class="welcome__subtitle">${slide.subtitle}</p>
                <button type="button" class="welcome__btn btn">${slide.btn}</button>
            </div>
        `;
        
        welcomeSwiperWrapper.appendChild(slideDiv);
    });
    
    // Initialize Swiper
    const welcomeSwiper = new Swiper('.welcomeSwiper', {
        effect: 'slide',
        speed: 800,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 6000, // Change this value (in milliseconds): 5000 = 5 seconds, 3000 = 3 seconds, 10000 = 10 seconds
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            init: function() {
                // Add animation class to first slide
                const firstSlide = this.slides[this.activeIndex];
                if (firstSlide) {
                    firstSlide.classList.add('swiper-slide-active');
                }
            },
            slideChangeTransitionStart: function() {
                // Remove animation from all slides
                this.slides.forEach(slide => {
                    const content = slide.querySelector('.welcome__content');
                    if (content) {
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(30px)';
                    }
                });
            },
            slideChangeTransitionEnd: function() {
                // Add animation to active slide
                const activeSlide = this.slides[this.activeIndex];
                if (activeSlide) {
                    const content = activeSlide.querySelector('.welcome__content');
                    if (content) {
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }
                }
            }
        }
    });
});

const cart = [];
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartCount = document.getElementById('cartCount');
const cartModalCount = document.getElementById('cartModalCount');
const cartItemsDiv = document.getElementById('cartItems');
const cartEmptyMessage = document.getElementById('cartEmptyMessage');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const watchCakesBtn = document.getElementById('watchCakesBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const deleteConfirmation = document.getElementById('deleteConfirmation');
const deleteCloseBtn = document.getElementById('deleteCloseBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

// Initialize cart in hover mode on page load and set initial state
if (cartModal) {
    cartModal.classList.add('hover-mode');
    cartModal.classList.remove('click-mode', 'active');
}

// Initialize cart display state on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial cart state based on cart contents
    if (cart.length === 0) {
        if (cartItemsDiv) {
            cartItemsDiv.classList.remove('show');
        }
        if (cartEmptyMessage) {
            cartEmptyMessage.classList.add('show');
        }
        if (watchCakesBtn) {
            watchCakesBtn.classList.add('show');
        }
        if (checkoutBtn) {
            checkoutBtn.classList.remove('show');
        }
        if (deleteAllBtn) {
            deleteAllBtn.style.display = 'none';
        }
    }
});

// Utility: Get short name/desc from card
function getCakeInfo(card) {
    const imgDiv = card.querySelector('.cakes__img');
    const imgUrl = imgDiv.style.backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
    
    // Use data-cake-name to avoid translation issues
    let name = card.getAttribute('data-cake-name');
    if (!name) {
        const nameEl = card.querySelector('.cakes__name');
        name = nameEl ? nameEl.textContent.trim() : '';
        if (name) {
            card.setAttribute('data-cake-name', name);
        }
    }
    
    // Get the first overlay image from cakesData
    const cakeData = getCakeData(name);
    const firstOverlayImage = cakeData && cakeData.images && cakeData.images.length > 0 
        ? cakeData.images[0] 
        : imgUrl;
    
    // Get price from the price button
    const priceBtn = card.querySelector('.cakes__btn--price');
    let price = 150;
    if (priceBtn) {
        const priceText = priceBtn.textContent.replace('$', '').trim();
        price = parseFloat(priceText) || 150;
    }
    
    // Get the default size label from cakesData if available
    let sizeLabel = '';
    if (cakeData && cakeData.sizes && cakeData.sizes.length > 0) {
        // Find the size that matches the current cake name or use the first size
        const matchingSize = cakeData.sizes.find(size => size.linkedCake === name);
        sizeLabel = matchingSize ? matchingSize.label : cakeData.sizes[0].label;
    }
    
    // Get the cake's short description for cart display
    const cakeDesc = cakeData && cakeData.shortDesc ? cakeData.shortDesc : 'Delicious layered crepe cake.';
    
    return {
        id: name + sizeLabel,
        img: firstOverlayImage,
        name: name,
        desc: cakeDesc,
        price: price
    };
}

document.querySelectorAll('.cakes__btn--order').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        const card = btn.closest('.cakes__card');
        const info = getCakeInfo(card);
        const existing = cart.find(item => item.id === info.id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.unshift({ ...info, qty: 1 }); // Add to beginning of array
        }
        updateCartCount();
        renderCartItems();
        showCartHover(); // Show in hover mode when adding from card
    });
});

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
    if (cartModalCount) {
        cartModalCount.textContent = totalItems;
    }
    // Update mobile cart count in menu
    const mobileCartCount = document.getElementById('mobileCartCount');
    if (mobileCartCount) {
        mobileCartCount.textContent = totalItems;
    }
}

// Show cart modal in hover mode (appears under icon)
function showCartHover() {
    cartModal.classList.add('hover-mode', 'active');
    renderCartItems();
}

// Hide cart modal
function hideCart() {
    cartModal.classList.remove('active');
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        // Hide cart items immediately
        if (cartItemsDiv) {
            cartItemsDiv.classList.remove('show');
            cartItemsDiv.innerHTML = '';
        }
        // Show empty message
        if (cartEmptyMessage) {
            cartEmptyMessage.classList.add('show');
        }
        // Show Watch Cakes button
        if (watchCakesBtn) {
            watchCakesBtn.classList.add('show');
        }
        // Hide checkout button
        if (checkoutBtn) {
            checkoutBtn.classList.remove('show');
        }
        // Hide delete all button
        if (deleteAllBtn) {
            deleteAllBtn.style.display = 'none';
        }
        return;
    }
    
    // Clear and show cart items container
    cartItemsDiv.innerHTML = '';
    if (cartItemsDiv) {
        cartItemsDiv.classList.add('show');
    }
    // Hide empty message
    if (cartEmptyMessage) {
        cartEmptyMessage.classList.remove('show');
        cartEmptyMessage.style.display = 'none';
    }
    // Hide Watch Cakes button
    if (watchCakesBtn) {
        watchCakesBtn.classList.remove('show');
    }
    // Show checkout button
    if (checkoutBtn) {
        checkoutBtn.classList.add('show');
    }
    // Show delete all button
    if (deleteAllBtn) {
        deleteAllBtn.style.display = 'flex';
    }
    
    // Render items in order (newest first since we use unshift)
    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'cart-modal__item';
        div.innerHTML = `
            <img src="${item.img}" class="cart-modal__item-img" alt="${item.name}">
            <div class="cart-modal__item-info">
                <div class="cart-modal__item-details">
                    <h3 class="cart-modal__item-title">${item.name}</h3>
                    <p class="cart-modal__item-desc">${item.desc}</p>
                </div>
                <div class="cart-modal__item-controls">
                    <div class="cart-modal__item-quantity">
                        <button class="cart-modal__qty-btn minus" data-idx="${idx}" data-action="minus"></button>
                        <span class="cart-modal__qty-value">${item.qty}</span>
                        <button class="cart-modal__qty-btn plus" data-idx="${idx}" data-action="plus">
                            <img src="img/icons/PlusIcon.svg" alt="Increase quantity" />
                        </button>
                    </div>
                    <span class="cart-modal__item-price">${(item.qty * item.price).toFixed(0)}$</span>
                </div>
            </div>
        `;
        cartItemsDiv.appendChild(div);
    });

    // Quantity buttons
    cartItemsDiv.querySelectorAll('.cart-modal__qty-btn').forEach(btn => {
        btn.onclick = function() {
            const idx = parseInt(btn.dataset.idx);
            if (btn.dataset.action === 'plus') {
                cart[idx].qty += 1;
            } else if (btn.dataset.action === 'minus') {
                if (cart[idx].qty > 1) {
                    cart[idx].qty -= 1;
                } else {
                    // Remove item if quantity becomes 0
                    cart.splice(idx, 1);
                }
            }
            updateCartCount();
            renderCartItems();
        };
    });

    // Calculate total amount
    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    // Update checkout button text
    if (checkoutBtn) {
        checkoutBtn.textContent = `Proceeding to checkout (${total.toFixed(0)}$)`;
    }
}

// Cart hover functionality - opens on hover and stays open
let cartHoverTimeout;
cartBtn.addEventListener('mouseenter', function() {
    clearTimeout(cartHoverTimeout);
    showCartHover();
});

// Keep cart open when hovering over the cart modal itself
cartModal.addEventListener('mouseenter', function() {
    if (cartModal.classList.contains('hover-mode')) {
        clearTimeout(cartHoverTimeout);
    }
});

// Cart stays open after hover - no auto-close on mouseleave
// User must click close button or click outside (in click mode) to close

// Cart icon click opens cart in hover mode
cartBtn.onclick = function(e) {
    e.stopPropagation();
    clearTimeout(cartHoverTimeout);
    showCartHover();
};

// Close button click
if (cartCloseBtn) {
    cartCloseBtn.onclick = function(e) {
        e.stopPropagation();
        hideCart();
    };
}

// Cart no longer uses click mode overlay, so no need for overlay click handler

// Delete all button click
if (deleteAllBtn) {
    deleteAllBtn.onclick = function() {
        if (cart.length > 0) {
            showDeleteConfirmation();
        }
    };
}

// Show delete confirmation (inside cart)
function showDeleteConfirmation() {
    if (deleteConfirmation) {
        deleteConfirmation.classList.add('active');
        // Hide cart items and all buttons while showing confirmation
        if (cartItemsDiv) cartItemsDiv.classList.remove('show');
        if (checkoutBtn) {
            checkoutBtn.classList.remove('show');
            checkoutBtn.style.display = 'none';
        }
        if (watchCakesBtn) {
            watchCakesBtn.classList.remove('show');
            watchCakesBtn.style.display = 'none';
        }
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
    }
}

// Hide delete confirmation
function hideDeleteConfirmation() {
    if (deleteConfirmation) {
        deleteConfirmation.classList.remove('active');
        // Show cart items and buttons again based on cart state
        if (cart.length > 0) {
            if (cartItemsDiv) cartItemsDiv.classList.add('show');
            if (checkoutBtn) {
                checkoutBtn.classList.add('show');
                checkoutBtn.style.display = '';
            }
        } else {
            if (cartEmptyMessage) {
                cartEmptyMessage.classList.add('show');
                cartEmptyMessage.style.display = 'block';
            }
            if (watchCakesBtn) {
                watchCakesBtn.classList.add('show');
                watchCakesBtn.style.display = 'block';
            }
        }
    }
}

// Close delete confirmation with X button
if (deleteCloseBtn) {
    deleteCloseBtn.onclick = hideDeleteConfirmation;
}

// Confirm delete all
if (deleteConfirmBtn) {
    deleteConfirmBtn.onclick = function() {
        // Clear cart
        cart.length = 0;
        updateCartCount();
        renderCartItems();
        hideDeleteConfirmation();
    };
}

// Checkout button
if (checkoutBtn) {
    checkoutBtn.onclick = function() {
        // Save cart to localStorage
        localStorage.setItem('ladym_cart', JSON.stringify(cart));
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
}

// Watch Cakes button
if (watchCakesBtn) {
    watchCakesBtn.onclick = function() {
        // Close cart
        hideCart();
        // Scroll to cakes section with offset to show title
        const cakesSection = document.querySelector('.cakes');
        if (cakesSection) {
            const yOffset = -120; // Offset to show title (accounts for fixed header)
            const y = cakesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };
}

// Global search functions accessible from anywhere
function performSearchWithoutScroll(query) {
    const cardsContainer = document.querySelector('.cakes__cards');
    // Get current cards dynamically instead of using cached NodeList
    const cakeCards = document.querySelectorAll('.cakes__card');
    const cardsArray = Array.from(cakeCards);

    // Separate matched and unmatched cards
    const matched = [];
    const unmatched = [];

    cardsArray.forEach(card => {
        // Use data-cake-name to avoid translation issues
        const cakeName = card.getAttribute('data-cake-name');
        if (!cakeName) {
            const nameEl = card.querySelector('.cakes__name');
            if (nameEl) {
                card.setAttribute('data-cake-name', nameEl.textContent.trim());
            }
        }
        
        const searchName = (card.getAttribute('data-cake-name') || '').toLowerCase();
        const words = searchName.split(/\s+/);
        
        if (query && words.some(word => word.startsWith(query))) {
            card.classList.add('highlight-cake');
            matched.push(card);
        } else {
            card.classList.remove('highlight-cake');
            unmatched.push(card);
        }
    });

    // Reorder cards: matched first, then unmatched
    const newOrder = [...matched, ...unmatched];
    newOrder.forEach(card => cardsContainer.appendChild(card));
    
    return { matched: matched.length, unmatched: unmatched.length };
}

function scrollToCakesSection() {
    const cakesSection = document.querySelector('.cakes');
    if (cakesSection) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 100;
        const extraSpace = 20; // Small space above the section
        
        const sectionRect = cakesSection.getBoundingClientRect();
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const sectionAbsoluteTop = sectionRect.top + currentScroll;
        const targetPosition = sectionAbsoluteTop - headerHeight - extraSpace;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('searchBtn');
    const searchWrapper = document.getElementById('searchWrapper');
    const searchContainer = searchBtn.closest('.header__search-container');
    const searchInput = document.getElementById('cakeSearch');
    const searchCloseBtn = document.getElementById('searchCloseBtn');

    // Check if we're on a small device
    function isSmallDevice() {
        return window.innerWidth <= 814;
    }

    // Track previous device state
    let wasSmallDevice = isSmallDevice();

    // Initialize search state based on device size
    function initializeSearchState(skipAnimation = false) {
        const isSmall = isSmallDevice();
        
        // Always disable transitions on small devices
        if (isSmall) {
            searchWrapper.style.transition = 'none';
            searchContainer.style.transition = 'none';
            searchBtn.style.transition = 'none';
            
            searchWrapper.classList.add('active');
            searchContainer.classList.add('expanded');
            searchBtn.classList.add('hidden');
            
            // Keep transitions disabled on mobile
            void searchWrapper.offsetWidth;
        } else {
            // On larger devices
            if (skipAnimation) {
                searchWrapper.style.transition = 'none';
                searchContainer.style.transition = 'none';
                searchBtn.style.transition = 'none';
            }
            
            searchWrapper.classList.remove('active');
            searchContainer.classList.remove('expanded');
            searchBtn.classList.remove('hidden');
            
            if (skipAnimation) {
                void searchWrapper.offsetWidth;
            }
            
            // Re-enable transitions for desktop
            requestAnimationFrame(() => {
                searchWrapper.style.transition = '';
                searchContainer.style.transition = '';
                searchBtn.style.transition = '';
            });
        }
        
        wasSmallDevice = isSmall;
    }

    // Toggle search input with smooth expanding animation
    function toggleSearch() {
        // Don't toggle on devices 814px and below - search is always open
        if (isSmallDevice()) {
            // Just clear the search on close button click
            searchInput.value = '';
            cakeCards.forEach(card => card.classList.remove('highlight-cake'));
            // Re-render all cakes in original order
            const cardsContainer = document.querySelector('.cakes__cards');
            const cardsArray = Array.from(cakeCards);
            cardsArray.forEach(card => cardsContainer.appendChild(card));
            return;
        }

        if (searchWrapper.classList.contains('active')) {
            // Close search
            searchWrapper.classList.remove('active');
            searchContainer.classList.remove('expanded');
            searchBtn.classList.remove('hidden');
            
            setTimeout(() => {
                searchInput.value = '';
                const cakeCards = document.querySelectorAll('.cakes__card');
                cakeCards.forEach(card => card.classList.remove('highlight-cake'));
            }, 400); // Match transition duration
        } else {
            // Open search
            searchWrapper.classList.add('active');
            searchContainer.classList.add('expanded');
            searchBtn.classList.add('hidden');
            
            // Focus input after animation completes
            setTimeout(() => {
                searchInput.focus();
            }, 400);
        }
    }

    // Initialize on page load - skip animation
    initializeSearchState(true);

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const isSmall = isSmallDevice();
            // Only reinitialize if device size category changed
            if (isSmall !== wasSmallDevice) {
                initializeSearchState(true);
            }
        }, 100);
    });

    // Only add click listeners on devices above 814px
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            if (!isSmallDevice()) {
                toggleSearch();
            }
        });
    }
    
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', function(e) {
            if (isSmallDevice()) {
                // On devices 814px and below, just clear the search
                searchInput.value = '';
                cakeCards.forEach(card => card.classList.remove('highlight-cake'));
                const cardsContainer = document.querySelector('.cakes__cards');
                const cardsArray = Array.from(cakeCards);
                cardsArray.forEach(card => cardsContainer.appendChild(card));
            } else {
                toggleSearch();
            }
        });
    }

    // Search functionality (shared function) - with scroll
    function performSearch(query) {
        const result = performSearchWithoutScroll(query);
        
        // If there are matches, scroll to cakes section
        if (result.matched > 0) {
            scrollToCakesSection();
        }
    }
    
    // Helper function to scroll to a specific cake card
    function scrollToCake(cakeCard, callback) {
        if (!cakeCard) {
            // No cake card found - silently skip
            return;
        }
        
        // Get header height dynamically
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 100;
        const extraSpace = 80; // Extra space for better visibility
        
        // Get card position relative to viewport
        const cardRect = cakeCard.getBoundingClientRect();
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate absolute position of the card
        const cardAbsoluteTop = cardRect.top + currentScroll;
        
        // Calculate where we want to scroll to
        const targetPosition = cardAbsoluteTop - headerHeight - extraSpace;
        
        // Perform the scroll
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Execute callback after scroll completes
        if (callback) {
            setTimeout(callback, 700);
        }
    }

    // Header search input
    searchInput.addEventListener('input', function () {
        const query = searchInput.value.trim().toLowerCase();
        performSearch(query);
        
        // Sync with mobile menu search
        const mobileMenuSearch = document.getElementById('mobileMenuSearch');
        if (mobileMenuSearch) {
            mobileMenuSearch.value = searchInput.value;
        }
    });
    
    // Header search - press Enter to scroll to cakes section
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                // Scroll to cakes section
                const cakesSection = document.querySelector('.cakes');
                if (cakesSection) {
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 100;
                    const extraSpace = 20; // Small space above the section
                    
                    const sectionRect = cakesSection.getBoundingClientRect();
                    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                    const sectionAbsoluteTop = sectionRect.top + currentScroll;
                    const targetPosition = sectionAbsoluteTop - headerHeight - extraSpace;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });
    
    // Mobile menu search input
    const mobileMenuSearch = document.getElementById('mobileMenuSearch');
    if (mobileMenuSearch) {
        mobileMenuSearch.addEventListener('input', function () {
            const query = mobileMenuSearch.value.trim().toLowerCase();
            const result = performSearchWithoutScroll(query);
            
            // Sync with header search
            if (searchInput) {
                searchInput.value = mobileMenuSearch.value;
            }
            
            // Auto-close menu on devices 319px or below when cakes are found
            if (window.innerWidth <= 319 && query && result.matched > 0) {
                const hamburgerBtn = document.getElementById('hamburgerBtn');
                const headerMenu = document.getElementById('headerMenu');
                const mobileOverlay = document.getElementById('mobileOverlay');
                
                if (hamburgerBtn && headerMenu && mobileOverlay) {
                    hamburgerBtn.classList.remove('active');
                    headerMenu.classList.remove('active');
                    mobileOverlay.classList.remove('active');
                    hamburgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                    
                    setTimeout(() => {
                        if (!mobileOverlay.classList.contains('active')) {
                            mobileOverlay.style.display = 'none';
                        }
                    }, 300);
                    
                    // Scroll to cakes section after menu closes
                    setTimeout(() => {
                        scrollToCakesSection();
                    }, 400);
                }
            } else if (result.matched > 0) {
                // For devices above 319px, just scroll to cakes section
                scrollToCakesSection();
            }
        });
        
        // Mobile menu search - press Enter to scroll to cakes section and close menu
        mobileMenuSearch.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = mobileMenuSearch.value.trim().toLowerCase();
                if (query) {
                    // Close mobile menu first
                    const hamburgerBtn = document.getElementById('hamburgerBtn');
                    const headerMenu = document.getElementById('headerMenu');
                    const mobileOverlay = document.getElementById('mobileOverlay');
                    
                    if (hamburgerBtn && headerMenu && mobileOverlay) {
                        hamburgerBtn.classList.remove('active');
                        headerMenu.classList.remove('active');
                        mobileOverlay.classList.remove('active');
                        hamburgerBtn.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                        
                        setTimeout(() => {
                            if (!mobileOverlay.classList.contains('active')) {
                                mobileOverlay.style.display = 'none';
                            }
                        }, 300);
                    }
                    
                    // Scroll to cakes section after menu closes
                    setTimeout(() => {
                        const cakesSection = document.querySelector('.cakes');
                        if (cakesSection) {
                            const header = document.querySelector('.header');
                            const headerHeight = header ? header.offsetHeight : 100;
                            const extraSpace = 20; // Small space above the section
                            
                            const sectionRect = cakesSection.getBoundingClientRect();
                            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                            const sectionAbsoluteTop = sectionRect.top + currentScroll;
                            const targetPosition = sectionAbsoluteTop - headerHeight - extraSpace;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }, 400);
                }
            }
        });
    }
});

document.querySelectorAll('.cakes__img').forEach(img => {
    const hoverImg = img.getAttribute('data-hover');
    if (hoverImg) {
        img.addEventListener('mouseenter', () => {
            img.classList.add('hovered');
            img.style.setProperty('--hover-img', `url(../img/${hoverImg})`);
        });
        img.addEventListener('mouseleave', () => {
            img.classList.remove('hovered');
            // Wait for the CSS transition to finish before removing the image
            setTimeout(() => {
                if (!img.classList.contains('hovered')) {
                    img.style.setProperty('--hover-img', '');
                }
            }, 600); // Match your CSS transition duration (0.6s)
        });
    }
});

// Cake data for all cakes (add more descriptions/images as needed)
const cakesData = [
    {
        name: "Dubai Chocolate Mille - 9 inches",
        price: "150$",
        desc: "Inspired by the viral Dubai chocolate bar, our newest cake features handcrafted crêpes layered with chocolate and pistachio pastry creams. Topped with a blend of crispy kataifi, pistachio, and tahini encircled by a piping of chocolate cream, this dessert brings together French patisserie with the beloved flavors of knafeh in one indulgent Mille Crêpes creation.",
        shortDesc: "Chocolate and pistachio crêpes with kataifi",
        categories: ['all', 'new', 'best'],
        mainImage: './img/cake1.jpg',
        hoverImage: 'cake1-hover.webp',
        images: [
            "./img/cake-overlay-images/cake1-overlay-img1.png", 
            "./img/cake-overlay-images/cake1-overlay-img2.png",
            "./img/cake-overlay-images/cake1-overlay-img3.png",
            "./img/cake-overlay-images/cake1-overlay-img4.png",
            "./img/cake-overlay-images/cake1-overlay-img5.png",
            "./img/cake-overlay-images/cake1-overlay-img6.png",
            "./img/cake-overlay-images/cake1-overlay-img7.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "150$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Dubai Chocolate Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Amedei Chocolate Mille Crêpes - 9 inches",
        price: "125$",
        desc: "Savor every bite of our new Amedei Chocolate Mille Crêpes—a true chocolate lover's delight. Handmade cocoa crêpes are layered with pastry cream featuring Amedei's Toscano Black 65% chocolate from Tuscany, Italy. Elegantly finished with delicate chocolate shavings and chocolate ganache, this exclusive creation is the epitome of chocolate indulgence. Perfect for birthdays, dinner parties, and special occasions.",
        shortDesc: "Cocoa crêpes with Amedei chocolate cream",
        categories: ['all', 'birthday', 'best'],
        mainImage: './img/cake2.jpg',
        hoverImage: 'cake2-hover.webp',
        images: [
            "./img/cake-overlay-images/cake2-overlay-img1.png", 
            "./img/cake-overlay-images/cake2-overlay-img2.png",
            "./img/cake-overlay-images/cake2-overlay-img3.png",
            "./img/cake-overlay-images/cake2-overlay-img4.png",
            "./img/cake-overlay-images/cake2-overlay-img5.png",
            "./img/cake-overlay-images/cake2-overlay-img6.png"
        ],
        sizes: [
             { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "125$"},
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Amedei Chocolate Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Signature Mille Crêpes - 9 inches",
        price: "115$",
        desc: "Famous worldwide, Lady M's Signature Mille Crêpes features paper-thin handmade crêpes layered with ethereal light pastry cream. Delicate and irresistible, the top is gently caramelized golden. Layers of crêpe and cream melt in your mouth, leaving a subtle sweet finish. Perfect for birthdays, dinner parties, and special occasions.",
        shortDesc: "Classic crêpes with light pastry cream",
        categories: ['all', 'best', 'birthday', 'anniversary'],
        mainImage: './img/cake3.jpg',
        hoverImage: 'cake3-hover.webp',
        images: [
            "./img/cake-overlay-images/cake3-overlay-img1.png", 
            "./img/cake-overlay-images/cake3-overlay-img2.png",
            "./img/cake-overlay-images/cake3-overlay-img3.png",
            "./img/cake-overlay-images/cake3-overlay-img4.png",
            "./img/cake-overlay-images/cake3-overlay-img5.png",
            "./img/cake-overlay-images/cake3-overlay-img6.png"
        ],
        sizes: [
             { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$", linkedCake: "Signature Mille Crêpes - 9 inches" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Signature Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Signature Mille Crêpes - 6 inches",
        price: "70$",
        desc: "Our signature cake and famous worldwide, the Lady M Signature Mille Crêpes features paper-thin handmade crêpes layered with ethereal light pastry cream. Delicate and irresistible, the top is gently caramelized till golden. Sink right in; alternating crêpe and cream layers literally melt in your mouth, leaving a subtle sweet finish. Note: 6-inch cakes are not eligible for US shipping.",
        shortDesc: "Classic crêpes with light pastry cream",
        categories: ['all', 'birthday', 'anniversary', 'graduation'],
        mainImage: './img/cake4.png',
        hoverImage: 'cake4-hover.png',
        images: [
            "./img/cake-overlay-images/cake4-overlay-img1.png", 
            "./img/cake-overlay-images/cake4-overlay-img2.png",
            "./img/cake-overlay-images/cake4-overlay-img3.png",
            "./img/cake-overlay-images/cake4-overlay-img4.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$", linkedCake: "Signature Mille Crêpes - 9 inches" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Signature Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Checkers - 9 inches",
        price: "115$",
        desc: "Striking black and white in appearance, our popular Checkers cake weaves together a precise and tender checkerboard of classic and chocolate sponge cake. The lightest fresh whipped cream comes tucked between the squares, all outfitted in a silky dark chocolate ganache. Perfect for birthdays, dinner parties, and special occasions.",
        shortDesc: "Checkerboard sponge with chocolate ganache",
        categories: ['all', 'birthday', 'anniversary'],
        mainImage: './img/cake5.jpg',
        hoverImage: 'cake5-hover.png',
        images: [
            "./img/cake-overlay-images/cake5-overlay-img1.png", 
            "./img/cake-overlay-images/cake5-overlay-img2.png",
            "./img/cake-overlay-images/cake5-overlay-img3.png",
            "./img/cake-overlay-images/cake5-overlay-img4.png",
            "./img/cake-overlay-images/cake5-overlay-img5.png",
            "./img/cake-overlay-images/cake5-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Checkers - 6 inches" }
        ]
    },
    {
        name: "Strawberry Shortcake - 9 inches",
        price: "100$",
        desc: "A must for any fan of the classic Strawberry Shortcake. Our version is made with superfine flour from Japan, producing a vanilla sponge cake unlike any other. We couple the cake layers with fresh strawberries and clouds of whipped cream to create this understated and elegant cake. Perfect for birthdays, dinner parties, and special occasions.",
        shortDesc: "Vanilla sponge with fresh strawberries",
        categories: ['all', 'birthday', 'graduation'],
        mainImage: './img/cake6.jpg',
        hoverImage: 'cake6-hover.png',
        images: [
            "./img/cake-overlay-images/cake6-overlay-img1.png", 
            "./img/cake-overlay-images/cake6-overlay-img2.png",
            "./img/cake-overlay-images/cake6-overlay-img3.png",
            "./img/cake-overlay-images/cake6-overlay-img4.png",
            "./img/cake-overlay-images/cake6-overlay-img5.png",
            "./img/cake-overlay-images/cake6-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "100$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "60$", linkedCake: "Strawberry Shortcake - 6 inches" }
        ]
    },
    {
        name: "Purple Yam Mille Crêpes - 9 inches",
        price: "125$",
        desc: "The dream Mille Crêpes cakes for purple yam lovers. Creamy and sweet purple yam is incorporated in every element of this cake from the lacy purple yam crêpes to the layers of whipped purple yam cream and purple yam paste. To finish, purple yam crumbles and snow sugar. Available for a limited time through the end of October.",
        shortDesc: "Purple yam crêpes with whipped cream",
        categories: ['all', 'new'],
        mainImage: './img/cake7.png',
        hoverImage: 'cake7-hover.webp',
        images: [
            "./img/cake-overlay-images/cake7-overlay-img1.png", 
            "./img/cake-overlay-images/cake7-overlay-img2.png",
            "./img/cake-overlay-images/cake7-overlay-img3.png",
            "./img/cake-overlay-images/cake7-overlay-img4.png",
            "./img/cake-overlay-images/cake7-overlay-img5.png",
            "./img/cake-overlay-images/cake7-overlay-img6.png",
            "./img/cake-overlay-images/cake7-overlay-img7.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "125$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "85$", linkedCake: "Purple Yam Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Tiramisu Mille Crêpes - 9 inches",
        price: "115$",
        desc: "Made from lacy crêpes, luxurious crème pâte à bombe, and a center layer of espresso sponge cake, our Tiramisu Mille Crêpes captures the true flavors of a classic tiramisu. Topped with petals of whipped mascarpone and a generous dusting of cocoa powder. Please note that inscriptions will be on a separate chocolate plaque.",
        shortDesc: "Espresso crêpes with mascarpone cream",
        categories: ['all', 'anniversary', 'graduation'],
        mainImage: './img/cake8.jpg',
        hoverImage: 'cake8-hover.png',
        images: [
            "./img/cake-overlay-images/cake8-overlay-img1.png", 
            "./img/cake-overlay-images/cake8-overlay-img2.png",
            "./img/cake-overlay-images/cake8-overlay-img3.png",
            "./img/cake-overlay-images/cake8-overlay-img4.png",
            "./img/cake-overlay-images/cake8-overlay-img5.png",
            "./img/cake-overlay-images/cake8-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Tiramisu Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Coconut Mille Crêpes - 9 inches",
        price: "115$",
        desc: "To create our delicate Coconut Mille Crêpes, we fold coconut flakes into the lightest of pastry cream, accented with a subtle touch of almonds and coconut rum, all tucked between layers of buttery crêpes. Finished with toasted coconut shavings. Available for a limited time through September.",
        shortDesc: "Coconut crêpes with almond pastry cream",
        categories: ['all', 'new'],
        mainImage: './img/cake9.jpg',
        hoverImage: 'cake9-hover.png',
        images: [
            "./img/cake-overlay-images/cake9-overlay-img1.png", 
            "./img/cake-overlay-images/cake9-overlay-img2.png",
            "./img/cake-overlay-images/cake9-overlay-img3.png",
            "./img/cake-overlay-images/cake9-overlay-img4.png",
            "./img/cake-overlay-images/cake9-overlay-img5.png",
            "./img/cake-overlay-images/cake9-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Coconut Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Peach Melba Mille Crêpes - 9 inches",
        price: "125$",
        desc: "A Lady M twist on a French classic, our Peach Melba Mille Crêpes layers delicate, handcrafted crêpes with luscious raspberry cream and vanilla-kissed milk cream studded with tender peaches. Finished with a glossy raspberry glaze and a touch of gold leaf, this show-stopping dessert channels the romance of a Parisian café—an ode to opera diva Nellie Melba in every decadent bite. Available for a limited time through the end of October.",
        shortDesc: "Raspberry and peach crêpes with gold leaf",
        categories: ['all', 'new', 'anniversary'],
        mainImage: './img/cake10.jpg',
        hoverImage: 'cake10-hover.webp',
        images: [
            "./img/cake-overlay-images/cake10-overlay-img1.png", 
            "./img/cake-overlay-images/cake10-overlay-img2.png",
            "./img/cake-overlay-images/cake10-overlay-img3.png",
            "./img/cake-overlay-images/cake10-overlay-img4.png",
            "./img/cake-overlay-images/cake10-overlay-img5.png",
            "./img/cake-overlay-images/cake10-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "125$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "85$", linkedCake: "Peach Melba Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Couronne du Chocolat - 9 inches",
        price: "102$",
        desc: "Literally \"the crown of chocolate,\" our Couronne du Chocolat is crowned with a stunning ring of white chocolate shavings. Alternating layers of moist chocolate sponge cake and heavenly dark chocolate mousse are polished with a delicate coat of ganache and chocolate crumbs.",
        shortDesc: "Chocolate sponge with dark chocolate mousse",
        categories: ['all', 'birthday', 'graduation'],
        mainImage: './img/cake11.jpg',
        hoverImage: 'cake11-hover.png',
        images: [
            "./img/cake-overlay-images/cake11-overlay-img1.png", 
            "./img/cake-overlay-images/cake11-overlay-img2.png",
            "./img/cake-overlay-images/cake11-overlay-img3.png",
            "./img/cake-overlay-images/cake11-overlay-img4.png",
            "./img/cake-overlay-images/cake11-overlay-img5.png",
            "./img/cake-overlay-images/cake11-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "102$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "60$", linkedCake: "Couronne du Chocolat - 6 inches" }
        ]
    },
    {
        name: "Dassai Blue Mille Crêpes - 9 inches",
        price: "135$",
        desc: "The sake cake you've been waiting for—Dassai Blue Mille Crêpes, where French finesse meets Japanese elegance. Layers of delicate crêpes and sake-soaked vanilla sponge cake are paired with a velvety sake kasu pastry cream. Topped with a white chocolate sake kasu glaze, powdered sugar, and shimmering gold leaf, this creation showcases the luxurious essence of Dassai Blue 23 sake. *Must be 21+ years old to order, purchase and participate.",
        shortDesc: "Sake-infused crêpes with gold leaf",
        categories: ['all', 'new', 'best'],
        mainImage: './img/cake12.jpg',
        hoverImage: 'cake12-hover.png',
        images: [
            "./img/cake-overlay-images/cake12-overlay-img1.png", 
            "./img/cake-overlay-images/cake12-overlay-img2.png",
            "./img/cake-overlay-images/cake12-overlay-img3.png",
            "./img/cake-overlay-images/cake12-overlay-img4.png",
            "./img/cake-overlay-images/cake12-overlay-img5.png",
            "./img/cake-overlay-images/cake12-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "135$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "95$", linkedCake: "Dassai Blue Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Slice of the Best: Passion Collection - 9 inches",
        price: "132$",
        desc: "An exclusive 2025 edition of Lady M's popular Mille Crêpe tasting cake. Slice of the Best: Passion Collection features three slices each of: Signature, Green Tea, Chocolate, and Passion Fruit Mille Crêpes. Available for a limited time through the end of October.",
        shortDesc: "Assorted Mille Crêpes tasting collection",
        categories: ['all', 'new', 'best', 'birthday', 'anniversary', 'graduation'],
        mainImage: './img/cake13.png',
        hoverImage: 'cake13-hover.png',
        images: [
            "./img/cake-overlay-images/cake13-overlay-img1.png", 
            "./img/cake-overlay-images/cake13-overlay-img2.png",
            "./img/cake-overlay-images/cake13-overlay-img3.png",
            "./img/cake-overlay-images/cake13-overlay-img4.png",
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "132$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "80$", linkedCake: "Signature Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Pink Pearl Mille Crêpes - 9 inches",
        price: "125$",
        desc: "Layers of delicate pink crêpes are filled with silky cream cheese cream, crowned with buttery strawberry streusel, and finished with glistening strawberry pearls. In support of breast cancer research, 5% of October proceeds from the Pink Pearl Mille Crêpes will be donated to Memorial Sloan Kettering Cancer Center. Available exclusively during the month of October.",
        shortDesc: "Pink crêpes with cream cheese and strawberry",
        categories: ['all', 'new'],
        mainImage: './img/cake14.png',
        hoverImage: 'cake14-hover.png',
        images: [
            "./img/cake-overlay-images/cake14-overlay-img1.png", 
            "./img/cake-overlay-images/cake14-overlay-img2.png",
            "./img/cake-overlay-images/cake14-overlay-img3.png",
            "./img/cake-overlay-images/cake14-overlay-img4.png",
            "./img/cake-overlay-images/cake14-overlay-img5.png",
            "./img/cake-overlay-images/cake14-overlay-img6.png",
            "./img/cake-overlay-images/cake14-overlay-img7.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "125$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "75$", linkedCake: "Pink Pearl Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Taro Mochi Cream Cake - 9 inches",
        price: "115$",
        desc: "Our delicate Taro Mochi Cream Cake is made with premium Taiwanese taro. Fragrant taro-infused cream is nestled between layers of airy taro sponge and soft vanilla mochi. Finished with lilac whipped cream, edible blue cornflower petals, and glistening water-like droplets.",
        shortDesc: "Taro sponge with vanilla mochi cream",
        categories: ['all', 'new', 'birthday', 'graduation', 'anniversary'],
        mainImage: './img/cake15.png',
        hoverImage: 'cake15-hover.png',
        images: [
            "./img/cake-overlay-images/cake15-overlay-img1.png", 
            "./img/cake-overlay-images/cake15-overlay-img2.png",
            "./img/cake-overlay-images/cake15-overlay-img3.png",
            "./img/cake-overlay-images/cake15-overlay-img4.png",
            "./img/cake-overlay-images/cake15-overlay-img5.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "65$", linkedCake: "Taro Mochi Cream Cake - 6 inches" }
        ]
    },
    {
        name: "Green Tea Mille Crêpes - 9 inches",
        price: "115$",
        desc: "Green tea is infused into every element of our classic Green Tea Mille Crêpes. Elegant and eye catching, this cake features paper-thin handmade crêpes layered with green tea pastry cream, finished with Japanese powdered matcha. Perfect for birthdays, dinner parties, and special occasions.",
        shortDesc: "Matcha crêpes with green tea cream",
        categories: ['all', 'best'],
        mainImage: './img/cake16.jpg',
        hoverImage: 'cake16-hover.webp',
        images: [
            "./img/cake-overlay-images/cake16-overlay-img1.png", 
            "./img/cake-overlay-images/cake16-overlay-img2.png",
            "./img/cake-overlay-images/cake16-overlay-img3.png",
            "./img/cake-overlay-images/cake16-overlay-img4.png",
            "./img/cake-overlay-images/cake16-overlay-img5.png",
            "./img/cake-overlay-images/cake16-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$", linkedCake: "Green Tea Mille Crêpes - 9 inches" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Green Tea Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Green Tea Mille Crêpes - 6 inches",
        price: "70$",
        desc: "Green tea is infused into every element of our classic Green Tea Mille Crêpes. Elegant and eye catching, this cake features handmade crêpes layered with green tea pastry cream. Finished with Japanese powdered matcha. Note: 6-inch cakes are not eligible for US shipping.",
        shortDesc: "Matcha crêpes with green tea cream",
        categories: ['all', 'birthday', 'anniversary', 'graduation'],
        mainImage: './img/cake17.png',
        hoverImage: 'cake17-hover.png',
        images: [
            "./img/cake-overlay-images/cake17-overlay-img1.png", 
            "./img/cake-overlay-images/cake17-overlay-img2.png",
            "./img/cake-overlay-images/cake17-overlay-img3.png",
            "./img/cake-overlay-images/cake17-overlay-img4.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$", linkedCake: "Green Tea Mille Crêpes - 9 inches" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Green Tea Mille Crêpes - 6 inches" }
        ]
    },
    {
        name: "Gluten-Free Green Tea Mille Crêpes - 9 inches",
        price: "160$",
        desc: "Green tea is infused into every element of this gluten-free Green Tea Mille Crêpes. Elegant and eye-catching, it features delicate handmade gluten-free crêpes layered with green tea pastry cream, and is finished with a dusting of Japanese matcha.<br><br>Exclusively available for online shipping and in our Bryant Park Boutique. Arriving at additional boutiques soon.",
        disclaimer: "*This product is made with gluten-free ingredients but is manufactured in a facility that also processes wheat.",
        shortDesc: "Gluten-free matcha crêpes with green tea cream",
        categories: ['all', 'new', 'gluten', 'birthday', 'graduation', 'anniversary'],
        mainImage: './img/cake16.jpg',
        hoverImage: 'cake16-hover.webp',
        images: [
            "./img/cake-overlay-images/cake16-overlay-img1.png", 
            "./img/cake-overlay-images/cake16-overlay-img2.png",
            "./img/cake-overlay-images/cake16-overlay-img3.png",
            "./img/cake-overlay-images/cake16-overlay-img4.png",
            "./img/cake-overlay-images/cake16-overlay-img5.png",
            "./img/cake-overlay-images/cake16-overlay-img6.png"
        ],
        sizes: [
            { label: "9 Inch (Serves 10–14)", description: "9 Inch (Serves 10–14)", price: "115$", linkedCake: "Gluten-Free Green Tea Mille Crêpes" },
            { label: "6 Inch (Serves 4–6)", description: "6 Inch (Serves 4–6)", price: "70$", linkedCake: "Gluten-Free Green Tea Mille Crêpes - 6 inches" }
        ]
    },
];

// Helper to get cake info by name
function getCakeData(name) {
    return cakesData.find(cake => cake.name === name);
}

// Swiper instances
let mainSwiper = null;
let thumbSwiper = null;

function openCakeModal(cake) {
    const cakeModal = document.getElementById('cakeModal');
    const cakeModalOverlay = document.getElementById('cakeModalOverlay');

    document.getElementById('cakeModalTitle').textContent = cake.name;
    // Use innerHTML to support HTML tags like <br>
    const descElement = document.getElementById('cakeModalDesc');
    descElement.innerHTML = cake.desc;
    
    // Add or remove disclaimer
    const disclaimerElement = document.getElementById('cakeModalDisclaimer');
    if (disclaimerElement) {
        disclaimerElement.remove();
    }
    
    if (cake.disclaimer) {
        const disclaimer = document.createElement('p');
        disclaimer.id = 'cakeModalDisclaimer';
        disclaimer.className = 'cake-modal__disclaimer';
        disclaimer.textContent = cake.disclaimer;
        descElement.parentNode.appendChild(disclaimer);
    }

    // Update Swiper gallery with cake images
    const mainSwiperWrapper = document.querySelector('.mainSwiper .swiper-wrapper');
    const thumbSwiperWrapper = document.querySelector('.thumbSwiper .swiper-wrapper');
    
    // Clear existing slides
    mainSwiperWrapper.innerHTML = '';
    thumbSwiperWrapper.innerHTML = '';
    
    // Add new slides based on cake images
    cake.images.forEach((imgSrc, index) => {
        // Main swiper slide
        const mainSlide = document.createElement('div');
        mainSlide.className = 'swiper-slide';
        mainSlide.innerHTML = `<img src="${imgSrc}" alt="${cake.name} - Image ${index + 1}" />`;
        mainSwiperWrapper.appendChild(mainSlide);
        
        // Thumbnail swiper slide
        const thumbSlide = document.createElement('div');
        thumbSlide.className = 'swiper-slide';
        thumbSlide.innerHTML = `<img src="${imgSrc}" alt="${cake.name} - Thumbnail ${index + 1}" />`;
        thumbSwiperWrapper.appendChild(thumbSlide);
    });

    // Destroy existing swiper instances if they exist
    if (thumbSwiper) {
        thumbSwiper.destroy(true, true);
        thumbSwiper = null;
    }
    if (mainSwiper) {
        mainSwiper.destroy(true, true);
        mainSwiper = null;
    }

    // Wait a bit for DOM to update, then initialize Swiper
    setTimeout(() => {
        // Initialize thumbnail swiper first
        thumbSwiper = new Swiper(".thumbSwiper", {
            spaceBetween: 10,
            slidesPerView: 'auto',
            freeMode: true,
            watchSlidesProgress: true,
        });

        // Initialize main swiper with thumbnail connection
        mainSwiper = new Swiper(".mainSwiper", {
            spaceBetween: 10,
            thumbs: {
                swiper: thumbSwiper,
            },
            on: {
                slideChange: function() {
                    updateArrowStates(this);
                },
                init: function() {
                    updateArrowStates(this);
                }
            }
        });

        // Custom arrow navigation for main swiper
        const prevBtn = document.getElementById('cakeModalPrev');
        const nextBtn = document.getElementById('cakeModalNext');
        
        // Remove old event listeners by cloning and replacing the buttons
        if (prevBtn) {
            const newPrevBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
            
            newPrevBtn.addEventListener('click', () => {
                if (mainSwiper && !newPrevBtn.classList.contains('disabled')) {
                    mainSwiper.slidePrev();
                }
            });
        }
        
        if (nextBtn) {
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
            
            newNextBtn.addEventListener('click', () => {
                if (mainSwiper && !newNextBtn.classList.contains('disabled')) {
                    mainSwiper.slideNext();
                }
            });
        }

        // Function to update arrow states (use fresh references)
        function updateArrowStates(swiper) {
            const prevBtn = document.getElementById('cakeModalPrev');
            const nextBtn = document.getElementById('cakeModalNext');
            
            if (!prevBtn || !nextBtn) return;
            
            // Disable prev button if at the beginning
            if (swiper.isBeginning) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
            
            // Disable next button if at the end
            if (swiper.isEnd) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
        }
    }, 100);

    // Sizes buttons
    const sizesContainer = document.getElementById('cakeModalSizes');
    sizesContainer.innerHTML = '';
    if (cake.sizes) {
        // Find which size button should be active based on the current cake
        let activeSizeIndex = 0;
        cake.sizes.forEach((size, index) => {
            if (size.linkedCake === cake.name) {
                activeSizeIndex = index;
            }
        });
        
        cake.sizes.forEach((size, index) => {
            const btn = document.createElement('button');
            btn.textContent = size.label;
            if (index === activeSizeIndex) btn.classList.add('active');
            
            // Check if the linked cake exists
            const linkedCakeExists = size.linkedCake ? getCakeData(size.linkedCake) : true;
            
            // Disable button if linked cake doesn't exist
            if (!linkedCakeExists) {
                btn.disabled = true;
                btn.classList.add('disabled');
            } else {
                btn.addEventListener('click', () => {
                    // Check if this size has a linked cake (different product variant)
                    if (size.linkedCake && size.linkedCake !== cake.name) {
                        const linkedCake = getCakeData(size.linkedCake);
                        if (linkedCake) {
                            // Switch to the linked cake variant
                            openCakeModal(linkedCake);
                            return;
                        }
                    }
                    
                    // Normal size selection behavior (no linked cake)
                    document.querySelectorAll('#cakeModalSizes button').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    document.getElementById('cakeModalSize').textContent = size.description;
                    // Update price based on current quantity
                    const basePrice = parseFloat(size.price.replace('$', ''));
                    const totalPrice = (basePrice * qty).toFixed(2);
                    document.getElementById('cakeModalPrice').textContent = `${totalPrice}$`;
                });
            }
            
            sizesContainer.appendChild(btn);
        });
        // Set initial size info and price based on the active size
        document.getElementById('cakeModalSize').textContent = cake.sizes[activeSizeIndex].description;
        const initialPrice = parseFloat(cake.sizes[activeSizeIndex].price.replace('$', ''));
        document.getElementById('cakeModalPrice').textContent = `${initialPrice.toFixed(2)}$`;
    }

    // Quantity controls - Reset to 1 when modal opens
    let qty = 1;
    const qtyValue = document.getElementById('qtyValue');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    
    // Reset quantity display
    qtyValue.textContent = qty;

    // Remove any existing event listeners by cloning and replacing
    const newQtyMinus = qtyMinus.cloneNode(true);
    const newQtyPlus = qtyPlus.cloneNode(true);
    qtyMinus.parentNode.replaceChild(newQtyMinus, qtyMinus);
    qtyPlus.parentNode.replaceChild(newQtyPlus, qtyPlus);

    // Add new event listeners
    newQtyMinus.addEventListener('click', () => {
        if (qty > 1) {
            qty--;
            qtyValue.textContent = qty;
            updateModalPrice();
        }
    });

    newQtyPlus.addEventListener('click', () => {
        qty++;
        qtyValue.textContent = qty;
        updateModalPrice();
    });

    function updateModalPrice() {
        const activeSize = document.querySelector('#cakeModalSizes button.active');
        if (activeSize && cake.sizes) {
            const sizeIndex = Array.from(document.querySelectorAll('#cakeModalSizes button')).indexOf(activeSize);
            const basePrice = parseFloat(cake.sizes[sizeIndex].price.replace('$', ''));
            const totalPrice = (basePrice * qty).toFixed(2);
            document.getElementById('cakeModalPrice').textContent = `${totalPrice}$`;
        }
    }

    // Add to cart button
    const orderBtn = document.getElementById('cakeModalOrder');
    const newOrderBtn = orderBtn.cloneNode(true);
    orderBtn.parentNode.replaceChild(newOrderBtn, orderBtn);

    newOrderBtn.addEventListener('click', () => {
        const activeSize = document.querySelector('#cakeModalSizes button.active');
        let sizeLabel = '';
        let price = parseFloat(cake.price.replace('$', ''));
        
        if (activeSize && cake.sizes) {
            const sizeIndex = Array.from(document.querySelectorAll('#cakeModalSizes button')).indexOf(activeSize);
            sizeLabel = cake.sizes[sizeIndex].label;
            price = parseFloat(cake.sizes[sizeIndex].price.replace('$', ''));
        }

        const cartItem = {
            id: cake.name + sizeLabel,
            img: cake.images[0],
            name: cake.name,
            desc: cake.shortDesc || cake.desc,
            price: price,
            qty: qty
        };

        const existing = cart.find(item => item.id === cartItem.id);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.unshift(cartItem);
        }

        updateCartCount();
        renderCartItems();
        closeCakeModal();
        showCartHover(); // Show in hover mode when adding from modal
    });

    // Show modal with proper sequencing for Chrome
    // First show overlay
    cakeModalOverlay.style.display = 'block';
    cakeModalOverlay.style.opacity = '0';
    
    // Force reflow
    void cakeModalOverlay.offsetHeight;
    
    // Then show modal
    cakeModal.style.display = 'block';
    cakeModal.classList.remove('closing');
    
    // Force another reflow
    void cakeModal.offsetHeight;
    
    // Use requestAnimationFrame to ensure rendering
    requestAnimationFrame(() => {
        cakeModalOverlay.style.opacity = '1';
        cakeModalOverlay.style.transition = 'opacity 0.3s ease';
    });
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeCakeModal() {
    const cakeModal = document.getElementById('cakeModal');
    const cakeModalOverlay = document.getElementById('cakeModalOverlay');

    cakeModal.classList.add('closing'); // Add closing animation class
    cakeModal.addEventListener('animationend', function handler() {
        cakeModal.style.display = 'none';
        cakeModalOverlay.style.display = 'none';
        cakeModal.removeEventListener('animationend', handler);
        
        // Restore body scroll
        document.body.style.overflow = '';
    });
}

// Attach click handlers to all cake cards
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle card click/tap
    function handleCardInteraction(e) {
        // Prevent click on buttons inside card from opening modal
        if (e.target.closest('button')) return;

        const card = e.currentTarget;
        // Use data-cake-name attribute instead of text content to avoid translation issues
        const name = card.getAttribute('data-cake-name') || card.querySelector('.cakes__name').textContent.trim();
        const cake = getCakeData(name);
        if (cake) {
            e.preventDefault();
            e.stopPropagation();
            openCakeModal(cake);
        }
    }

    document.querySelectorAll('.cakes__card').forEach(card => {
        // Add data-cake-name attribute if not present
        if (!card.hasAttribute('data-cake-name')) {
            const name = card.querySelector('.cakes__name');
            if (name) {
                card.setAttribute('data-cake-name', name.textContent.trim());
            }
        }
        
        // Add both click and touchend for better tablet support
        card.addEventListener('click', handleCardInteraction);
        card.addEventListener('touchend', function(e) {
            // Only handle touchend if it's a tap (not a scroll)
            if (e.cancelable) {
                handleCardInteraction(e);
            }
        }, { passive: false });
    });

    // Close modal on overlay or close button
    const overlay = document.getElementById('cakeModalOverlay');
    const closeBtn = document.getElementById('cakeModalClose');
    const closeBtnNew = document.getElementById('cakeModalCloseBtn');
    
    if (overlay) {
        overlay.addEventListener('click', closeCakeModal);
        overlay.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeCakeModal();
        }, { passive: false });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCakeModal);
        closeBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeCakeModal();
        }, { passive: false });
    }
    if (closeBtnNew) {
        closeBtnNew.addEventListener('click', closeCakeModal);
        closeBtnNew.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeCakeModal();
        }, { passive: false });
    }
    
    // Category Navigation Functionality
    initCategoryNavigation();
});

// Category Navigation - Update title and filter cakes based on selected category
function initCategoryNavigation() {
    const categoryButtons = document.querySelectorAll('.cakes__nav-btn');
    const cakesTitle = document.getElementById('cakesTitle');
    
    if (!categoryButtons.length || !cakesTitle) {
        return;
    }
    
    // Category title mapping
    const categoryTitles = {
        'all': 'Cakes',
        'new': 'New & Seasonal',
        'gluten': 'Gluten-Free',
        'best': 'Best Sellers',
        'birthday': 'Birthday',
        'anniversary': 'Anniversary',
        'graduation': 'Graduation'
    };
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('cakes__nav-btn--active'));
            
            // Add active class to clicked button
            this.classList.add('cakes__nav-btn--active');
            
            // Get category from data attribute
            const category = this.getAttribute('data-category');
            
            // Update title with smooth transition
            cakesTitle.style.opacity = '0';
            cakesTitle.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                cakesTitle.textContent = categoryTitles[category] || 'Cakes';
                cakesTitle.style.opacity = '1';
                cakesTitle.style.transform = 'translateY(0)';
            }, 200);
            
            // Filter and display cakes
            filterCakes(category);
        });
    });
}

// Filter and render cakes based on category
function filterCakes(category) {
    const cakesContainer = document.querySelector('.cakes__cards');
    
    if (!cakesContainer) {
        return;
    }
    
    // Filter cakes based on category
    const filteredCakes = cakesData.filter(cake => cake.categories.includes(category));
    
    // Add fade out animation
    cakesContainer.style.opacity = '0';
    cakesContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Clear existing cakes
        cakesContainer.innerHTML = '';
        
        // Render filtered cakes
        filteredCakes.forEach(cake => {
            const cakeCard = createCakeCard(cake);
            cakesContainer.appendChild(cakeCard);
        });
        
        // Reattach event listeners
        attachCakeCardListeners();
        
        // Fade in animation
        cakesContainer.style.opacity = '1';
        cakesContainer.style.transform = 'translateY(0)';
        
        // Reapply search if there's an active search query
        setTimeout(() => {
            const searchInput = document.getElementById('cakeSearch');
            const mobileMenuSearch = document.getElementById('mobileMenuSearch');
            const query = searchInput ? searchInput.value.trim().toLowerCase() : 
                         (mobileMenuSearch ? mobileMenuSearch.value.trim().toLowerCase() : '');
            
            if (query) {
                performSearchWithoutScroll(query);
            }
        }, 50);
    }, 300);
}

// Create a cake card element
function createCakeCard(cake) {
    const card = document.createElement('div');
    card.className = 'cakes__card';
    card.setAttribute('data-cake-name', cake.name);
    
    const priceValue = parseFloat(cake.price.replace('$', ''));
    
    // Generate badges HTML based on cake categories
    let badgesHTML = '';
    let badgeCount = 0;
    
    // Priority order: New, Gluten-Free, Best Seller
    if (cake.categories.includes('new')) {
        const positionClass = badgeCount > 0 ? (badgeCount === 1 ? 'cakes__badge--secondary' : 'cakes__badge--tertiary') : '';
        badgesHTML += `
            <div class="cakes__badge cakes__badge--new ${positionClass}">
                <svg class="cakes__badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="cakes__badge-text">New</span>
            </div>
        `;
        badgeCount++;
    }
    
    if (cake.categories.includes('gluten')) {
        const positionClass = badgeCount > 0 ? (badgeCount === 1 ? 'cakes__badge--secondary' : 'cakes__badge--tertiary') : '';
        badgesHTML += `
            <div class="cakes__badge cakes__badge--gluten-free ${positionClass}">
                <svg class="cakes__badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="cakes__badge-text">Gluten Free</span>
            </div>
        `;
        badgeCount++;
    }
    
    if (cake.categories.includes('best')) {
        const positionClass = badgeCount > 0 ? (badgeCount === 1 ? 'cakes__badge--secondary' : 'cakes__badge--tertiary') : '';
        badgesHTML += `
            <div class="cakes__badge cakes__badge--best-seller ${positionClass}">
                <svg class="cakes__badge-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="cakes__badge-text">Best Seller</span>
            </div>
        `;
        badgeCount++;
    }
    
    card.innerHTML = `
        <div class="cakes__img" style="background-image: url(${cake.mainImage});" data-hover="${cake.hoverImage}">
            ${badgesHTML}
        </div>
        <div class="cakes__info">
            <h3 class="cakes__name">${cake.name}</h3>
            <div class="cakes__btn">
                <button type="button" class="cakes__btn--price btn">${priceValue}$</button>
                <button type="button" class="cakes__btn--order btn">Add to cart</button>
            </div>
        </div>
    `;
    
    return card;
}

// Attach event listeners to cake cards
function attachCakeCardListeners() {
    // Hover effect for images
    document.querySelectorAll('.cakes__img').forEach(img => {
        const hoverImg = img.getAttribute('data-hover');
        if (hoverImg) {
            img.addEventListener('mouseenter', () => {
                img.classList.add('hovered');
                img.style.setProperty('--hover-img', `url(../img/${hoverImg})`);
            });
            img.addEventListener('mouseleave', () => {
                img.classList.remove('hovered');
                setTimeout(() => {
                    if (!img.classList.contains('hovered')) {
                        img.style.setProperty('--hover-img', '');
                    }
                }, 600);
            });
        }
    });
    
    // Add to cart buttons
    document.querySelectorAll('.cakes__btn--order').forEach((btn) => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.cakes__card');
            const info = getCakeInfo(card);
            const existing = cart.find(item => item.id === info.id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.unshift({ ...info, qty: 1 });
            }
            updateCartCount();
            renderCartItems();
            showCartHover();
        });
    });
    
    // Click to open modal
    document.querySelectorAll('.cakes__card').forEach(card => {
        // Add data-cake-name attribute if not present
        if (!card.hasAttribute('data-cake-name')) {
            const nameEl = card.querySelector('.cakes__name');
            if (nameEl) {
                card.setAttribute('data-cake-name', nameEl.textContent.trim());
            }
        }
        
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return;
            const name = card.getAttribute('data-cake-name') || card.querySelector('.cakes__name').textContent.trim();
            const cake = getCakeData(name);
            if (cake) openCakeModal(cake);
        });
    });
};

// Custom caret removed - using default browser cursor

// ============= AUTHENTICATION INTEGRATION =============

// Profile button click handler function
async function handleProfileClick(e) {
    e.preventDefault();
    
    // Check if user is authenticated via API client
    if (window.apiClient && window.apiClient.isAuthenticated()) {
        try {
            const response = await window.apiClient.getCurrentUser();
            if (response.success && window.authManager) {
                window.authManager.setAuthenticatedUser(response.user);
                window.authManager.openProfileModal();
            } else {
                if (window.authManager) {
                    window.authManager.openAuthModal('login');
                }
            }
        } catch (error) {
            // Failed to fetch user - show login
            if (window.authManager) {
                window.authManager.openAuthModal('login');
            }
        }
    } else if (window.authManager && window.authManager.isAuthenticated) {
        // Fallback to local auth manager
        window.authManager.openProfileModal();
    } else {
        // Not authenticated - show login
        if (window.authManager) {
            window.authManager.openAuthModal('login');
        }
    }
}

// Make authManager globally accessible (initialized in auth.js)
window.addEventListener('DOMContentLoaded', () => {
    // Desktop profile button handler
    const profileBtn = document.querySelector('.header__profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', handleProfileClick);
    }
    
    // Mobile profile button handler (in menu)
    const mobileProfileBtn = document.getElementById('mobileProfileBtn');
    if (mobileProfileBtn) {
        mobileProfileBtn.addEventListener('click', async (e) => {
            // Close mobile menu first
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            const headerMenu = document.getElementById('headerMenu');
            const mobileOverlay = document.getElementById('mobileOverlay');
            
            if (hamburgerBtn && headerMenu && mobileOverlay) {
                hamburgerBtn.classList.remove('active');
                headerMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (!mobileOverlay.classList.contains('active')) {
                        mobileOverlay.style.display = 'none';
                    }
                }, 300);
            }
            
            // Then handle profile click
            await handleProfileClick(e);
        });
    }
    
    // Mobile cart button handler (in menu)
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close mobile menu first
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            const headerMenu = document.getElementById('headerMenu');
            const mobileOverlay = document.getElementById('mobileOverlay');
            
            if (hamburgerBtn && headerMenu && mobileOverlay) {
                hamburgerBtn.classList.remove('active');
                headerMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    if (!mobileOverlay.classList.contains('active')) {
                        mobileOverlay.style.display = 'none';
                    }
                }, 300);
            }
            
            // Then show cart
            showCartHover();
        });
    }
    
    // Check authentication on page load
    if (window.apiClient && window.apiClient.isAuthenticated()) {
        window.apiClient.getCurrentUser()
            .then(response => {
                if (response.success && window.authManager) {
                    window.authManager.setAuthenticatedUser(response.user);
                }
            })
            .catch(error => {
                // User not authenticated - silent fail
            });
    }
});