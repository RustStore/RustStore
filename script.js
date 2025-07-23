// API Configuration
const API_BASE = 'http://localhost:3000/api/v1';

// Debug: Test if JavaScript is loading
console.log('=== JAVASCRIPT IS LOADING ===');

// State management
let currentUser = null;
let storeItems = [];
let cartItems = [];
let isLoginMode = true;
let termsAccepted = localStorage.getItem('termsAccepted') === 'true';

// DOM Elements
const elements = {
    storeItems: document.getElementById('storeItems'),
    loading: document.getElementById('loading'),
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    cartModal: document.getElementById('cartModal'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    closeCart: document.getElementById('closeCart'),
    clearCart: document.getElementById('clearCart'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    authModal: document.getElementById('authModal'),
    authTitle: document.getElementById('authTitle'),
    authForm: document.getElementById('authForm'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    authUsername: document.getElementById('authUsername'),
    authPsnId: document.getElementById('authPsnId'),
    authSubmit: document.getElementById('authSubmit'),
    closeAuth: document.getElementById('closeAuth'),
    toggleAuth: document.getElementById('toggleAuth'),
    registerFields: document.getElementById('registerFields'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userSection: document.getElementById('userSection'),
    authSection: document.getElementById('authSection'),
    username: document.getElementById('username'),
    userInfoBtn: document.getElementById('userInfoBtn'),
    termsBtn: document.getElementById('termsBtn'),
    termsModal: document.getElementById('termsModal'),
    termsContent: document.getElementById('termsContent'),
    privacyModal: document.getElementById('privacyModal'),
    privacyContent: document.getElementById('privacyContent'),
    closeTerms: document.getElementById('closeTerms'),
    acceptTerms: document.getElementById('acceptTerms'),
    declineTerms: document.getElementById('declineTerms'),
    closePrivacy: document.getElementById('closePrivacy'),
    closePrivacyBtn: document.getElementById('closePrivacyBtn'),
    userInfoModal: document.getElementById('userInfoModal'),
    userInfoForm: document.getElementById('userInfoForm'),
    userEmail: document.getElementById('userEmail'),
    userDiscord: document.getElementById('userDiscord'),
    userGameName: document.getElementById('userGameName'),
    saveUserInfo: document.getElementById('saveUserInfo'),
    deleteUserInfo: document.getElementById('deleteUserInfo'),
    closeUserInfo: document.getElementById('closeUserInfo'),
    messageContainer: document.getElementById('messageContainer')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM LOADED, INITIALIZING APP ===');
    initializeApp();
    setupEventListeners();
    setupNavigation();
    loadTermsContent();
    loadPrivacyContent();
});

function initializeApp() {
    console.log('=== INITIALIZING APP ===');
    // Check for stored token
    const token = localStorage.getItem('authToken');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUIForLoggedInUser();
    }
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Check if terms need to be accepted
    if (!termsAccepted) {
        disableUserInteractions();
        showTermsModal();
    } else {
        enableUserInteractions();
    }
    
    console.log('=== APP READY - WAITING FOR USER INTERACTION ===');
}

function disableUserInteractions() {
    // Disable navigation buttons except Terms
    const navButtons = document.querySelectorAll('.bottom-bar .store-section');
    navButtons.forEach(button => {
        if (!button.onclick || !button.onclick.toString().includes('showTermsModal')) {
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        }
    });
    
    // Disable other interactive elements but keep Terms buttons accessible
    const interactiveElements = document.querySelectorAll('button:not([onclick*="showTermsModal"]), input, select, textarea');
    interactiveElements.forEach(element => {
        if (!element.closest('.modal') && !element.id?.includes('terms')) { // Don't disable modal elements or terms buttons
            element.style.pointerEvents = 'none';
            element.style.cursor = 'not-allowed';
        }
    });
    
    console.log('User interactions disabled');
}

function loadTermsContent() {
    const termsText = `
        <h3 style="color: #ffd700; margin-bottom: 1rem;">Terms and Conditions</h3>
        <p>By using this Rust gaming store, you agree to the following terms:</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">1. Service Description</h4>
        <p>This Service provides digital in-game items, resources, and VIP packages for the Rust video game. All purchases are for digital content only.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">2. Eligibility</h4>
        <p>You must be at least 13 years old to use this Service. If you are under 18, you must have parental or guardian consent.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">3. Payment Terms</h4>
        <p>All prices are in USD. Payment is required at the time of purchase. We accept PayPal and Stripe payments. All sales are final unless required by law.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">4. Digital Content Delivery</h4>
        <p>Digital items are delivered in-game via server commands. Delivery may take up to 10 minutes after payment confirmation. We are not responsible for server issues or game updates.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">5. Prohibited Activities</h4>
        <p>You agree NOT to use the Service for any illegal purpose, attempt to hack or cheat, share account credentials, or violate Rust's Terms of Service.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">6. Disclaimers</h4>
        <p>The Service is provided "as is" without warranties. We are not responsible for game server issues, game updates, or items lost due to game mechanics or server wipes.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">7. Limitation of Liability</h4>
        <p>Our total liability shall not exceed the amount paid for the specific item. We are not liable for indirect, incidental, or consequential damages.</p>
        
        <p style="margin-top: 2rem; padding: 1rem; background: rgba(255, 215, 0, 0.1); border-radius: 10px; border-left: 4px solid #ffd700;">
            <strong>By clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong>
        </p>
    `;
    
    if (elements.termsContent) {
        elements.termsContent.innerHTML = termsText;
    }
}

function loadPrivacyContent() {
    const privacyText = `
        <h3 style="color: #ffd700; margin-bottom: 1rem;">Privacy Policy</h3>
        <p>This Privacy Policy explains how we collect, use, and protect your information.</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">1. Information We Collect</h4>
        <p><strong>Personal Information:</strong> Email address, Discord username, in-game username</p>
        <p><strong>Payment Information:</strong> Processed securely by PayPal and Stripe (we don't store card details)</p>
        <p><strong>Technical Information:</strong> IP address, browser type, device information</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">2. How We Use Your Information</h4>
        <p>• Process your purchases and payments</p>
        <p>• Deliver digital items to your in-game account</p>
        <p>• Send order confirmation emails</p>
        <p>• Provide customer support</p>
        <p>• Prevent fraud and ensure security</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">3. Information Sharing</h4>
        <p>We do NOT sell or share your personal information with third parties except:</p>
        <p>• Payment processors (PayPal, Stripe) for payment processing</p>
        <p>• Game server administrators for item delivery</p>
        <p>• Law enforcement if required by law</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">4. Data Security</h4>
        <p>• SSL encryption for all data transmission</p>
        <p>• Secure payment processing</p>
        <p>• Regular security audits</p>
        <p>• Access controls and authentication</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">5. Your Rights</h4>
        <p>• Request a copy of your data</p>
        <p>• Update or correct your information</p>
        <p>• Delete your account</p>
        <p>• Opt out of communications</p>
        
        <h4 style="color: #ffd700; margin: 1rem 0 0.5rem 0;">6. Data Retention</h4>
        <p>• Order information: 7 years (for tax purposes)</p>
        <p>• Account information: Until account deletion</p>
        <p>• Payment data: Not stored by us</p>
        
        <p style="margin-top: 2rem; padding: 1rem; background: rgba(0, 255, 0, 0.1); border-radius: 10px; border-left: 4px solid #00ff00;">
            <strong>We are committed to protecting your privacy and ensuring your data is secure.</strong>
        </p>
    `;
    
    if (elements.privacyContent) {
        elements.privacyContent.innerHTML = privacyText;
    }
}

function showTermsModal() {
    if (elements.termsModal) {
        elements.termsModal.style.display = 'block';
        elements.termsModal.style.zIndex = '3000'; // Ensure it's on top
    }
}

function showPrivacyModal() {
    if (elements.privacyModal) {
        elements.privacyModal.style.display = 'block';
    }
}

function hidePrivacyModal() {
    if (elements.privacyModal) {
        elements.privacyModal.style.display = 'none';
    }
}

function hideTermsModal() {
    if (elements.termsModal) {
        elements.termsModal.style.display = 'none';
    }
}

function acceptTerms() {
    termsAccepted = true;
    localStorage.setItem('termsAccepted', 'true');
    hideTermsModal();
    showSuccess('Terms and conditions accepted!');
    
    // Enable all interactions after accepting terms
    enableUserInteractions();
}

function enableUserInteractions() {
    // Enable navigation buttons
    const navButtons = document.querySelectorAll('.bottom-bar .store-section');
    navButtons.forEach(button => {
        button.style.pointerEvents = 'auto';
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    });
    
    // Enable other interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    interactiveElements.forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'auto';
    });
    
    console.log('User interactions enabled');
}

function declineTerms() {
    hideTermsModal();
    showError('You must accept the terms and conditions to use this service.');
    // Redirect to a different page or show a message
    setTimeout(() => {
        showTermsModal();
    }, 2000);
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function addToCart(item) {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            ...item,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showSuccess(`${item.name} added to cart!`);
}

function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
    showSuccess('Item removed from cart');
}

function updateCartQuantity(itemId, quantity) {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = quantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function clearCart() {
    cartItems = [];
    saveCartToStorage();
    updateCartUI();
    hideCart();
    showSuccess('Cart cleared');
}

function updateCartUI() {
    if (elements.cartCount) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
    }
    
    if (elements.cartItems) {
        if (cartItems.length === 0) {
            elements.cartItems.innerHTML = '<p style="text-align: center; color: #ccc; padding: 2rem;">Your cart is empty</p>';
        } else {
            elements.cartItems.innerHTML = cartItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                    <div style="flex: 1;">
                        <h4 style="color: #fff; margin: 0 0 0.5rem 0;">${item.name}</h4>
                        <p style="color: #ccc; margin: 0;">$${(item.price / 100).toFixed(2)}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="background: rgba(255, 215, 0, 0.2); border: 1px solid #ffd700; color: #ffd700; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">-</button>
                            <span style="color: #fff; min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="background: rgba(255, 215, 0, 0.2); border: 1px solid #ffd700; color: #ffd700; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">+</button>
                        </div>
                        <button onclick="removeFromCart('${item.id}')" style="background: rgba(255, 0, 0, 0.2); border: 1px solid #ff0000; color: #ff0000; padding: 0.5rem; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    if (elements.cartTotal) {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        elements.cartTotal.textContent = `$${(total / 100).toFixed(2)}`;
    }
}

function showCart() {
    if (elements.cartModal) {
        elements.cartModal.style.display = 'block';
    }
}

function hideCart() {
    if (elements.cartModal) {
        elements.cartModal.style.display = 'none';
    }
}

function showUserInfoModal() {
    if (elements.userInfoModal) {
        // Load saved user info
        const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (elements.userEmail) elements.userEmail.value = savedUserInfo.email || '';
        if (elements.userDiscord) elements.userDiscord.value = savedUserInfo.discord || '';
        if (elements.userGameName) elements.userGameName.value = savedUserInfo.gameName || '';
        
        elements.userInfoModal.style.display = 'block';
    }
}

function hideUserInfoModal() {
    if (elements.userInfoModal) {
        elements.userInfoModal.style.display = 'none';
    }
}

function saveUserInfo() {
    const userInfo = {
        email: elements.userEmail.value,
        discord: elements.userDiscord.value,
        gameName: elements.userGameName.value
    };
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    hideUserInfoModal();
    showSuccess('User information saved!');
}

function deleteUserInfo() {
    localStorage.removeItem('userInfo');
    if (elements.userEmail) elements.userEmail.value = '';
    if (elements.userDiscord) elements.userDiscord.value = '';
    if (elements.userGameName) elements.userGameName.value = '';
    showSuccess('User information deleted!');
}

function buyNow(item) {
    // Check if user info is complete
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.email || !userInfo.discord || !userInfo.gameName) {
        showUserInfoModal();
        showError('Please complete your user information first');
        return;
    }
    
    // Redirect to checkout with single item
    const params = new URLSearchParams({
        item: item.id,
        price: item.price,
        name: item.name,
        quantity: '1'
    });
    window.location.href = `checkout.html?${params.toString()}`;
}

function createBuyButtons(item) {
    return `
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                    style="flex: 1; background: rgba(255, 215, 0, 0.2); border: 1px solid #ffd700; color: #ffd700; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                <i class="fas fa-cart-plus" style="margin-right: 0.5rem;"></i>Add to Cart
            </button>
            <button onclick="buyNow(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                    style="flex: 1; background: linear-gradient(45deg, #ffd700, #ffed4e); border: none; color: #000; padding: 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.3s ease;">
                <i class="fas fa-bolt" style="margin-right: 0.5rem;"></i>Buy Now
            </button>
        </div>
    `;
}

function setupEventListeners() {
    console.log('=== SETTING UP EVENT LISTENERS ===');
    
    // Cart functionality
    if (elements.cartBtn) {
        elements.cartBtn.addEventListener('click', showCart);
    }
    if (elements.closeCart) {
        elements.closeCart.addEventListener('click', hideCart);
    }
    if (elements.clearCart) {
        elements.clearCart.addEventListener('click', clearCart);
    }
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', checkout);
    }
    
    // Auth functionality
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', () => showAuthModal(true));
    }
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', () => showAuthModal(false));
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }
    if (elements.userInfoBtn) {
        elements.userInfoBtn.addEventListener('click', showUserInfoModal);
    }
    if (elements.termsBtn) {
        elements.termsBtn.addEventListener('click', showTermsModal);
    }
    if (elements.closeAuth) {
        elements.closeAuth.addEventListener('click', hideAuthModal);
    }
    if (elements.toggleAuth) {
        elements.toggleAuth.addEventListener('click', toggleAuthMode);
    }
    if (elements.authForm) {
        elements.authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    // Terms functionality
    if (elements.closeTerms) {
        elements.closeTerms.addEventListener('click', hideTermsModal);
    }
    if (elements.acceptTerms) {
        elements.acceptTerms.addEventListener('click', acceptTerms);
    }
    if (elements.declineTerms) {
        elements.declineTerms.addEventListener('click', declineTerms);
    }
    if (elements.closePrivacy) {
        elements.closePrivacy.addEventListener('click', hidePrivacyModal);
    }
    if (elements.closePrivacyBtn) {
        elements.closePrivacyBtn.addEventListener('click', hidePrivacyModal);
    }
    
    // User info functionality
    if (elements.saveUserInfo) {
        elements.saveUserInfo.addEventListener('click', saveUserInfo);
    }
    if (elements.deleteUserInfo) {
        elements.deleteUserInfo.addEventListener('click', deleteUserInfo);
    }
    if (elements.closeUserInfo) {
        elements.closeUserInfo.addEventListener('click', hideUserInfoModal);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function setupNavigation() {
    console.log('=== SETTING UP NAVIGATION ===');
    const storeSection = document.getElementById('storeSection');
    const vipSection = document.getElementById('vipSection');
    const resourceKitsSection = document.getElementById('resourceKitsSection');
    const raidingKitsSection = document.getElementById('raidingKitsSection');
    const navButtons = document.querySelectorAll('[data-section]');
    
    // Check if sections exist
    if (!storeSection) {
        console.warn('Store section not found');
    }
    if (!vipSection) {
        console.warn('VIP section not found');
    }
    if (!resourceKitsSection) {
        console.warn('Resource Kits section not found');
    }
    if (!raidingKitsSection) {
        console.warn('Raiding Kits section not found');
    }
    
    // Hide all sections by default
    const sections = [storeSection, vipSection, resourceKitsSection, raidingKitsSection];
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        }
    });
    
    // Add click listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = button.getAttribute('data-section');
            console.log('Navigating to section:', targetSection);
            showSection(targetSection);
        });
    });
}

function hideAllSections() {
    const sections = ['store', 'vip', 'resourceKits', 'raidingKits'];
    sections.forEach(sectionName => {
        const section = document.getElementById(sectionName + 'Section');
        if (section) {
            hideSection(section);
        }
    });
}

function hideSection(section) {
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => {
            section.style.display = 'none';
        }, 200);
    }
}

function showSection(sectionName) {
    const targetSection = document.getElementById(sectionName + 'Section');
    if (!targetSection) {
        console.warn('Section not found:', sectionName + 'Section');
        return;
    }
    
    hideAllSections();
    
    setTimeout(() => {
        targetSection.style.display = 'block';
        setTimeout(() => {
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function loadStoreItems() {
    try {
        elements.loading.style.display = 'block';
        elements.storeItems.style.display = 'none';
        
        // Simulate API call - replace with actual API
        const items = [
            {
                id: 'wood-kit',
                name: 'Wood Bundle',
                description: 'Essential resources for your base',
                price: 399,
                image: 'photos resource kits/Wood.png',
                category: 'resources'
            },
            {
                id: 'stone-kit',
                name: 'Stone Bundle',
                description: 'Build strong foundations',
                price: 599,
                image: 'photos resource kits/Stone.png',
                category: 'resources'
            },
            {
                id: 'metal-kit',
                name: 'Metal Fragments',
                description: 'Advanced building materials',
                price: 799,
                image: 'photos resource kits/Metal Fragments.png',
                category: 'resources'
            }
        ];
        
        storeItems = items;
        renderStoreItems();
        
    } catch (error) {
        console.error('Failed to load store items:', error);
        showError('Failed to load store items');
    } finally {
        elements.loading.style.display = 'none';
        elements.storeItems.style.display = 'grid';
    }
}

function renderStoreItems() {
    if (!elements.storeItems) return;
    
    elements.storeItems.innerHTML = storeItems.map(item => `
        <div class="store-item" style="background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 15px; padding: 1.5rem; text-align: center; transition: all 0.3s ease;">
            <div style="width: 100px; height: 100px; margin: 0 auto 1rem; background: linear-gradient(45deg, #ffd700, #ffed4e); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain;">
            </div>
            <h3 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 0.5rem;">${item.name}</h3>
            <p style="color: #ccc; margin-bottom: 1rem;">${item.description}</p>
            <div style="font-size: 1.5rem; color: #ffd700; font-weight: bold; margin-bottom: 1rem;">$${(item.price / 100).toFixed(2)}</div>
            ${createBuyButtons(item)}
        </div>
    `).join('');
}

async function checkout() {
    if (cartItems.length === 0) {
        showError('Your cart is empty');
        return;
    }
    
    // Check if user info is complete
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.email || !userInfo.discord || !userInfo.gameName) {
        showUserInfoModal();
        showError('Please complete your user information first');
        return;
    }
    
    // Redirect to checkout with cart items
    const params = new URLSearchParams({
        cart: JSON.stringify(cartItems)
    });
    window.location.href = `checkout.html?${params.toString()}`;
}

function showAuthModal(isLogin) {
    isLoginMode = isLogin;
    if (elements.authTitle) {
        elements.authTitle.innerHTML = `<i class="fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}" style="margin-right: 0.5rem;"></i>${isLogin ? 'Login' : 'Register'}`;
    }
    if (elements.authSubmit) {
        elements.authSubmit.innerHTML = `<i class="fas fa-${isLogin ? 'sign-in-alt' : 'user-plus'}" style="margin-right: 0.5rem;"></i>${isLogin ? 'Login' : 'Register'}`;
    }
    if (elements.toggleAuth) {
        elements.toggleAuth.innerHTML = `<i class="fas fa-${isLogin ? 'user-plus' : 'sign-in-alt'}" style="margin-right: 0.5rem;"></i>${isLogin ? 'Create Account' : 'Login'}`;
    }
    if (elements.registerFields) {
        elements.registerFields.style.display = isLogin ? 'none' : 'block';
    }
    if (elements.authModal) {
        elements.authModal.style.display = 'block';
    }
}

function hideAuthModal() {
    if (elements.authModal) {
        elements.authModal.style.display = 'none';
    }
}

function toggleAuthMode() {
    showAuthModal(!isLoginMode);
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    const username = elements.authUsername?.value || '';
    const discord = elements.authPsnId?.value || '';
    
    try {
        if (isLoginMode) {
            // Simulate login - replace with actual API
            currentUser = { email, username: email.split('@')[0] };
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('authToken', 'fake-token');
            updateUIForLoggedInUser();
            hideAuthModal();
            showSuccess('Login successful!');
        } else {
            // Simulate registration - replace with actual API
            currentUser = { email, username, discord };
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('authToken', 'fake-token');
            updateUIForLoggedInUser();
            hideAuthModal();
            showSuccess('Registration successful!');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showError('Authentication failed');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    updateUIForLoggedOutUser();
    showSuccess('Logged out successfully');
}

function updateUIForLoggedInUser() {
    if (elements.authSection) elements.authSection.style.display = 'none';
    if (elements.userSection) elements.userSection.style.display = 'block';
    if (elements.username && currentUser) {
        elements.username.textContent = currentUser.username || currentUser.email;
    }
}

function updateUIForLoggedOutUser() {
    if (elements.authSection) elements.authSection.style.display = 'block';
    if (elements.userSection) elements.userSection.style.display = 'none';
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'};
        border: 1px solid ${type === 'success' ? '#00ff00' : '#ff0000'};
        color: ${type === 'success' ? '#00ff00' : '#ff0000'};
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    messageDiv.textContent = message;
    
    if (elements.messageContainer) {
        elements.messageContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}