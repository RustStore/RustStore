// API Configuration
const API_BASE = 'http://localhost:3000/api/v1';

// Debug: Test if JavaScript is loading
console.log('=== JAVASCRIPT IS LOADING ===');

// State management
let currentUser = null;
let storeItems = [];
let cartItems = [];
let isLoginMode = true;

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
    username: document.getElementById('username')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM LOADED, INITIALIZING APP ===');
    initializeApp();
    setupEventListeners();
    setupNavigation();
});

function initializeApp() {
    console.log('=== INITIALIZING APP ===');
    // Check for stored token
    const token = localStorage.getItem('authToken');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUIForLoggedInUser();
    }
    
    // Don't load anything by default - wait for user interaction
    console.log('=== APP READY - WAITING FOR USER INTERACTION ===');
}

function setupNavigation() {
    console.log('=== SETTING UP NAVIGATION ===');
    const storeSection = document.getElementById('storeSection');
    const vipSection = document.getElementById('vipSection');
    const resourceKitsSection = document.getElementById('resourceKitsSection');
    const navButtons = document.querySelectorAll('.bottom-bar .store-section');
    
    // Hide all sections by default - only show video background and navigation
    if (storeSection) {
        storeSection.style.display = 'none';
        storeSection.style.opacity = '0';
        storeSection.style.transform = 'translateY(20px)';
    }
    
    // Hide VIP section by default - show only video background
    if (vipSection) {
        vipSection.style.display = 'none';
        vipSection.style.opacity = '0';
        vipSection.style.transform = 'translateY(20px)';
    }
    
    // Hide Resource Kits section by default
    if (resourceKitsSection) {
        resourceKitsSection.style.display = 'none';
        resourceKitsSection.style.opacity = '0';
        resourceKitsSection.style.transform = 'translateY(20px)';
    }
    
    // Track current section
    let currentSection = null;
    
    // Set up navigation clicks
    navButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const buttonText = button.textContent.trim().toLowerCase();
            console.log('=== NAVIGATION CLICKED:', buttonText, '===');
            console.log('Button text length:', buttonText.length);
            console.log('Button text characters:', Array.from(buttonText).map(c => c.charCodeAt(0)));
            
            if (buttonText === 'vip') {
                // If VIP is already shown, hide it
                if (currentSection === vipSection) {
                    hideSection(vipSection);
                    currentSection = null;
                } else {
                    showSection(vipSection, [storeSection, resourceKitsSection]);
                    currentSection = vipSection;
                }
            } else if (buttonText === 'resource kits' || buttonText === 'resources kits') {
                console.log('=== RESOURCE KITS CLICKED ===');
                console.log('Button text matched:', buttonText);
                // If Resource Kits is already shown, hide it
                if (currentSection === resourceKitsSection) {
                    hideSection(resourceKitsSection);
                    currentSection = null;
                } else {
                    console.log('Showing resourceKitsSection:', resourceKitsSection);
                    showSection(resourceKitsSection, [storeSection, vipSection]);
                    currentSection = resourceKitsSection;
                }
            } else {
                // For all other buttons (Building Kits, War Kits, Vehicle Kits, Gun Kits)
                // Show the store section with items
                if (currentSection === storeSection) {
                    hideAllSections();
                    currentSection = null;
                } else {
                    showSection(storeSection, [vipSection, resourceKitsSection]);
                    currentSection = storeSection;
                    // Load store items when switching to store
                    loadStoreItems();
                }
            }
        });
    });
}

function hideAllSections() {
    console.log('=== HIDING ALL SECTIONS ===');
    const storeSection = document.getElementById('storeSection');
    const vipSection = document.getElementById('vipSection');
    const resourceKitsSection = document.getElementById('resourceKitsSection');
    
    if (storeSection) {
        hideSection(storeSection);
    }
    
    if (vipSection) {
        hideSection(vipSection);
    }
    
    if (resourceKitsSection) {
        hideSection(resourceKitsSection);
    }
}

function hideSection(section) {
    console.log('=== HIDING SECTION ===');
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => {
            section.style.display = 'none';
        }, 500); // Match the transition duration
    }
}

function showSection(showElement, hideElements) {
    console.log('=== SHOWING SECTION ===');
    console.log('Show element:', showElement);
    console.log('Hide elements:', hideElements);
    
    // Hide the other sections
    if (hideElements) {
        if (Array.isArray(hideElements)) {
            hideElements.forEach(element => {
                if (element) hideSection(element);
            });
        } else {
            hideSection(hideElements);
        }
    }
    
    // Show the target section
    if (showElement) {
        console.log('Setting display to block for:', showElement.id || showElement.className);
        showElement.style.display = 'block';
        setTimeout(() => {
            showElement.style.opacity = '1';
            showElement.style.transform = 'translateY(0)';
        }, 10);
    }
}

function setupEventListeners() {
    console.log('=== SETTING UP EVENT LISTENERS ===');
    
    // Cart events
    elements.cartBtn.addEventListener('click', showCart);
    elements.closeCart.addEventListener('click', hideCart);
    elements.checkoutBtn.addEventListener('click', checkout);
    
    // Auth events
    elements.loginBtn.addEventListener('click', () => showAuthModal(true));
    elements.registerBtn.addEventListener('click', () => showAuthModal(false));
    elements.closeAuth.addEventListener('click', hideAuthModal);
    elements.toggleAuth.addEventListener('click', toggleAuthMode);
    elements.authForm.addEventListener('submit', handleAuthSubmit);
    elements.logoutBtn.addEventListener('click', logout);
    
    // Test button event
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', () => {
            console.log('=== TEST BUTTON WORKS! ===');
            alert('Test button works! Event listeners are functioning.');
        });
    }
    
    // VIP Purchase events - Use event delegation for dynamically added elements
    document.addEventListener('click', (e) => {
        console.log('=== CLICK EVENT DETECTED ===');
        console.log('Target:', e.target);
        console.log('Classes:', e.target.classList);
        console.log('Dataset:', e.target.dataset);
        
        if (e.target.classList.contains('vip-purchase-btn')) {
            console.log('=== VIP BUTTON CLICKED ===');
            e.preventDefault();
            e.stopPropagation();
            const tier = e.target.dataset.tier;
            const price = parseInt(e.target.dataset.price);
            console.log('Tier:', tier, 'Price:', price);
            purchaseVIP(tier, price, e.target);
        }
        
        // Also check for clicks on child elements of the button
        const button = e.target.closest('.vip-purchase-btn');
        if (button && !e.target.classList.contains('vip-purchase-btn')) {
            console.log('=== VIP BUTTON CHILD CLICKED ===');
            e.preventDefault();
            e.stopPropagation();
            const tier = button.dataset.tier;
            const price = parseInt(button.dataset.price);
            console.log('Tier:', tier, 'Price:', price);
            purchaseVIP(tier, price, button);
        }
        
        // Modal button events
        if (e.target.classList.contains('modal-confirm-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const tier = e.target.dataset.tier;
            const price = parseInt(e.target.dataset.price);
            console.log('=== CONFIRM PURCHASE CLICKED ===');
            confirmVipPurchase(tier, price, e.target);
        }
        
        if (e.target.classList.contains('modal-cancel-btn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== CANCEL PURCHASE CLICKED ===');
            hideVipPurchaseModal();
        }
    });
    
    // Kit information events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('kit-info-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const kitType = e.target.getAttribute('data-kit');
            showKitInfo(kitType);
        }
    });

    // Close kit info modal
    const closeKitInfo = document.getElementById('closeKitInfo');
    if (closeKitInfo) {
        closeKitInfo.addEventListener('click', hideKitInfo);
    }

    // Close modals when clicking outside
    elements.cartModal.addEventListener('click', (e) => {
        if (e.target === elements.cartModal) hideCart();
    });
    elements.authModal.addEventListener('click', (e) => {
        if (e.target === elements.authModal) hideAuthModal();
    });
    
    const kitInfoModal = document.getElementById('kitInfoModal');
    if (kitInfoModal) {
        kitInfoModal.addEventListener('click', (e) => {
            if (e.target === kitInfoModal) hideKitInfo();
        });
    }
    
    console.log('=== EVENT LISTENERS SETUP COMPLETE ===');
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Store Functions
async function loadStoreItems() {
    try {
        elements.loading.style.display = 'block';
        elements.storeItems.innerHTML = '';
        
        // Use mock data since we don't have a backend API yet
        storeItems = [
            {
                id: 1,
                name: 'Basic Starter Kit',
                description: 'Essential items to get you started in Rust',
                price: 999, // $9.99 in cents
                category: 'Starter',
                rarity: 'Common',
                image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%238B4513"/><circle cx="30" cy="30" r="8" fill="%23A0522D"/><circle cx="70" cy="70" r="12" fill="%23A0522D"/></svg>'
            },
            {
                id: 2,
                name: 'Advanced Kit',
                description: 'Premium items for experienced players',
                price: 1999, // $19.99 in cents
                category: 'Advanced',
                rarity: 'Rare',
                image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FFD700"/><polygon points="20,20 40,10 60,20 60,40 40,50 20,40" fill="%23FFED4E"/></svg>'
            },
            {
                id: 3,
                name: 'Pro Kit',
                description: 'Ultimate kit for serious players',
                price: 2999, // $29.99 in cents
                category: 'Pro',
                rarity: 'Epic',
                image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23C0C0C0"/><polygon points="20,20 40,10 60,20 60,40 40,50 20,40" fill="%23D3D3D3"/></svg>'
            }
        ];
        
        renderStoreItems();
    } catch (error) {
        console.error('Error loading store items:', error);
        showError('Failed to load store items');
    } finally {
        elements.loading.style.display = 'none';
    }
}

function renderStoreItems() {
    elements.storeItems.innerHTML = storeItems.map(item => `
        <div class="item-card bg-gray-800 rounded-lg border-2 rarity-${item.rarity.toLowerCase()} p-6">
            <div class="text-center mb-4">
                <div class="w-24 h-24 bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <i class="fas fa-box text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-bold mb-2">${item.name}</h3>
                <p class="text-sm text-gray-300 mb-3">${item.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-700">${item.category}</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-700">${item.rarity}</span>
                </div>
                <div class="text-2xl font-bold text-orange-500 mb-4">$${(item.price / 100).toFixed(2)}</div>
                <button onclick="addToCart('${item.id}')" class="w-full bg-orange-600 hover:bg-orange-700 py-2 rounded-lg font-bold">
                    <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Cart Functions
async function loadCart() {
    if (!currentUser) return;
    
    try {
        const cart = await apiRequest('/store/cart');
        cartItems = cart.items;
        updateCartUI();
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

async function addToCart(itemId) {
    if (!currentUser) {
        showAuthModal(true);
        return;
    }
    
    try {
        await apiRequest('/store/cart', {
            method: 'POST',
            body: JSON.stringify({ item_id: itemId, quantity: 1 })
        });
        
        await loadCart();
        showSuccess('Item added to cart!');
    } catch (error) {
        showError('Failed to add item to cart');
    }
}

function updateCartUI() {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    elements.cartCount.textContent = itemCount;
    elements.cartTotal.textContent = `$${(total / 100).toFixed(2)}`;
    
    elements.cartItems.innerHTML = cartItems.map(item => `
        <div class="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
            <div>
                <h4 class="font-bold">${item.item.name}</h4>
                <p class="text-sm text-gray-300">$${(item.item.price / 100).toFixed(2)} each</p>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-sm">Qty: ${item.quantity}</span>
                <button onclick="removeFromCart('${item.item.id}')" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function removeFromCart(itemId) {
    try {
        await apiRequest(`/store/cart/${itemId}`, { method: 'DELETE' });
        await loadCart();
    } catch (error) {
        showError('Failed to remove item from cart');
    }
}

function showCart() {
    elements.cartModal.style.display = 'block';
}

function hideCart() {
    elements.cartModal.style.display = 'none';
}

async function checkout() {
    if (!currentUser) {
        showAuthModal(true);
        return;
    }
    
    if (cartItems.length === 0) {
        showError('Cart is empty');
        return;
    }
    
    // In a real implementation, you would integrate with a payment processor
    // For now, we'll simulate a successful payment
    try {
        const response = await apiRequest('/store/checkout', {
            method: 'POST',
            body: JSON.stringify({
                payment_method: 'creditcard',
                payment_token: 'simulated_payment_token'
            })
        });
        
        showSuccess('Purchase successful! Items have been added to your inventory.');
        hideCart();
        await loadCart();
    } catch (error) {
        showError('Checkout failed');
    }
}

// Auth Functions
function showAuthModal(isLogin) {
    isLoginMode = isLogin;
    elements.authTitle.textContent = isLogin ? 'Login' : 'Register';
    elements.authSubmit.textContent = isLogin ? 'Login' : 'Register';
    elements.toggleAuth.textContent = isLogin ? 
        "Don't have an account? Register" : 
        "Already have an account? Login";
    elements.registerFields.classList.toggle('hidden', isLogin);
    elements.authModal.style.display = 'block';
}

function hideAuthModal() {
    elements.authModal.style.display = 'none';
    elements.authForm.reset();
}

function toggleAuthMode() {
    showAuthModal(!isLoginMode);
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const formData = {
        email: elements.authEmail.value,
        password: elements.authPassword.value
    };
    
    if (!isLoginMode) {
        formData.username = elements.authUsername.value;
        formData.psn_id = elements.authPsnId.value;
    }
    
    try {
        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const response = await apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Store auth data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        currentUser = response.user;
        
        updateUIForLoggedInUser();
        hideAuthModal();
        await loadCart();
        showSuccess(isLoginMode ? 'Login successful!' : 'Registration successful!');
    } catch (error) {
        showError(isLoginMode ? 'Login failed' : 'Registration failed');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
    cartItems = [];
    updateUIForLoggedOutUser();
    updateCartUI();
    showSuccess('Logged out successfully');
}

function updateUIForLoggedInUser() {
    elements.userSection.style.display = 'block';
    elements.authSection.style.display = 'none';
    elements.username.textContent = currentUser.username;
}

function updateUIForLoggedOutUser() {
    elements.userSection.style.display = 'none';
    elements.authSection.style.display = 'block';
    elements.username.textContent = '';
}

// Utility Functions
function showSuccess(message) {
    // Simple success notification
    alert(message); // Replace with a proper notification system
}

function showError(message) {
    // Simple error notification
    alert('Error: ' + message); // Replace with a proper notification system
}

// Global functions for onclick handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;

// VIP Purchase Functions - No animations
async function purchaseVIP(tier, price, button) {
    console.log('=== VIP PURCHASE FUNCTION CALLED ===');
    console.log('Tier:', tier);
    console.log('Price:', price);
    
    // Show VIP purchase modal with unique animation (regardless of login status)
    showVipPurchaseModal(tier, price, button);
}

function showVipPurchaseModal(tier, price, button) {
    const modal = document.getElementById('vipPurchaseModal');
    const modalContent = document.getElementById('vipModalContent');
    const closeBtn = document.getElementById('closeVipModal');
    
    // Get the original card element
    const originalCard = button.closest('.vip-card');
    
    // Create modal content based on tier
    const modalHTML = createVipModalContent(tier, price);
    modalContent.innerHTML = modalHTML;
    
    // Set tier-specific styles
    setTierSpecificStyles(tier, modalContent);
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'translate(-50%, -50%) scale(1)';
        closeBtn.style.opacity = '1';
    }, 10);
    
    // Add tier-specific entrance animation
    addTierEntranceAnimation(tier, modalContent);
    
    // Setup close functionality
    closeBtn.onclick = () => hideVipPurchaseModal();
    modal.onclick = (e) => {
        if (e.target === modal) hideVipPurchaseModal();
    };
}

function createVipModalContent(tier, price) {
    const tierConfig = {
        vip: {
            name: 'VIP',
            color: '#00ff88',
            icon: 'fas fa-medal',
            gradient: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            features: [
                'Priority Queue Access',
                '2x Resource Gathering',
                'VIP Chat Channel',
                'Monthly Starter Kit',
                'Discord Role'
            ]
        },
        vip_plus: {
            name: 'VIP+',
            color: '#ff6b35',
            icon: 'fas fa-star',
            gradient: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            features: [
                'Priority Queue Access',
                '3x Resource Gathering',
                'VIP Chat Channel',
                'Weekly Premium Kit',
                'Custom Discord Role',
                'Reserved Slot'
            ]
        },
        vip_plus_plus: {
            name: 'VIP++',
            color: '#ffd700',
            icon: 'fas fa-crown',
            gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            features: [
                'Priority Queue Access',
                '5x Resource Gathering',
                'VIP Chat Channel',
                '24/7 Priority Support',
                'Daily Premium Kit',
                'Custom Discord Role + Color',
                'Exclusive Events Access'
            ]
        }
    };
    
    const config = tierConfig[tier];
    const priceFormatted = (price / 100).toFixed(2);
    
    return `
        <div class="vip-modal-card" style="background: rgba(0, 0, 0, 0.95); border: 3px solid ${config.color}; border-radius: 20px; padding: 0; text-align: center; backdrop-filter: blur(20px); box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 50px ${config.color}40; overflow: hidden; max-width: 500px; width: 100%;">
            <!-- Modal Package Image -->
            <div class="modal-package-image" style="height: 180px; background: ${config.gradient}; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('${config.image}') center/cover; opacity: 0.8;"></div>
                <div style="position: relative; z-index: 2; text-align: center;">
                    <div class="modal-vip-icon" style="font-size: 3.5rem; color: #fff; margin-bottom: 0.8rem; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);">
                        <i class="${config.icon}"></i>
                    </div>
                    <h3 class="modal-vip-name" style="font-size: 2.2rem; color: #fff; margin: 0; font-weight: 700; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);">${config.name}</h3>
                </div>
            </div>
            
            <!-- Modal Package Content -->
            <div style="padding: 1.8rem;">
                <div class="modal-vip-price" style="font-size: 2.8rem; color: ${config.color}; margin-bottom: 1.2rem; font-weight: 700; text-shadow: 0 0 15px ${config.color}80;">
                    $${priceFormatted}
                    <span style="font-size: 1.1rem; color: #ccc;">/month</span>
                </div>
                
                <div class="modal-package-contents" style="background: ${config.color}15; border-radius: 15px; padding: 1.2rem; margin-bottom: 1.8rem; border: 2px solid ${config.color}40;">
                    <h4 style="color: ${config.color}; font-size: 1.3rem; margin-bottom: 0.8rem; font-weight: 600;">
                        <i class="${config.icon}" style="margin-right: 0.5rem;"></i>VIP Benefits:
                    </h4>
                    <ul class="modal-vip-features" style="list-style: none; padding: 0; margin: 0; text-align: left;">
                        ${config.features.map(feature => `
                            <li style="padding: 0.5rem 0; color: #fff; border-bottom: 1px solid ${config.color}30; font-size: 0.9rem;">
                                <i class="fas fa-check" style="color: ${config.color}; margin-right: 0.6rem; font-size: 0.9rem;"></i>${feature}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; gap: 0.8rem;">
                    <button class="modal-vip-button modal-confirm-btn" style="flex: 1; background: ${config.gradient}; border: none; color: ${tier === 'vip' ? '#000' : '#fff'}; padding: 1rem 1.2rem; border-radius: 20px; font-size: 1rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;" data-tier="${tier}" data-price="${price}">
                        <i class="fas fa-credit-card" style="margin-right: 0.5rem;"></i>Confirm
                    </button>
                    <button class="modal-vip-button modal-cancel-btn" style="flex: 1; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.3); color: #fff; padding: 1rem 1.2rem; border-radius: 20px; font-size: 1rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setTierSpecificStyles(tier, modalContent) {
    const tierStyles = {
        vip: {
            borderColor: '#00ff88',
            glowColor: 'rgba(0, 255, 136, 0.4)',
            animation: 'vipEntrance'
        },
        vip_plus: {
            borderColor: '#ff6b35',
            glowColor: 'rgba(255, 107, 53, 0.4)',
            animation: 'vipPlusEntrance'
        },
        vip_plus_plus: {
            borderColor: '#ffd700',
            glowColor: 'rgba(255, 215, 0, 0.4)',
            animation: 'vipPlusPlusEntrance'
        }
    };
    
    const style = tierStyles[tier];
    modalContent.style.borderColor = style.borderColor;
    modalContent.style.boxShadow = `0 25px 80px rgba(0, 0, 0, 0.6), 0 0 50px ${style.glowColor}`;
}

function addTierEntranceAnimation(tier, modalContent) {
    const animations = {
        vip: () => {
            // VIP: Unfolds from middle
            modalContent.style.animation = 'vipEntrance 2s ease-out';
        },
        vip_plus: () => {
            // VIP+: Drops dramatically from top
            modalContent.style.animation = 'vipPlusEntrance 2.5s ease-out';
        },
        vip_plus_plus: () => {
            // VIP++: Slot machine effect - content spins inside
            modalContent.style.animation = 'vipPlusPlusEntrance 0.5s ease-out';
            modalContent.style.perspective = '1000px';
            
            // Add slot machine effect to the features list (text content)
            const featuresList = modalContent.querySelector('.modal-vip-features');
            if (featuresList) {
                featuresList.style.overflow = 'hidden';
                featuresList.style.transformStyle = 'preserve-3d';
                
                // Animate each feature item individually with staggered timing
                const featureItems = featuresList.querySelectorAll('li');
                featureItems.forEach((item, index) => {
                    item.style.animation = `slotMachineReel 2s ease-out ${index * 0.3}s`;
                    item.style.transformStyle = 'preserve-3d';
                });
            }
            
            // Animate title and price with different timing
            const title = modalContent.querySelector('.modal-vip-title');
            const price = modalContent.querySelector('.modal-vip-price');
            if (title) {
                title.style.animation = 'textSlotMachine 1.5s ease-out 0.2s';
                title.style.transformStyle = 'preserve-3d';
            }
            if (price) {
                price.style.animation = 'textSlotMachine 1.5s ease-out 0.4s';
                price.style.transformStyle = 'preserve-3d';
            }
        }
    };
    
    if (animations[tier]) {
        animations[tier]();
    }
}

function hideVipPurchaseModal() {
    const modal = document.getElementById('vipPurchaseModal');
    const modalContent = document.getElementById('vipModalContent');
    const closeBtn = document.getElementById('closeVipModal');
    
    modal.style.opacity = '0';
    modalContent.style.transform = 'translate(-50%, -50%) scale(0.5)';
    closeBtn.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

// Add CSS animations for tier-specific entrances
const style = document.createElement('style');
style.textContent = `
    @keyframes vipEntrance {
        0% {
            transform: translate(-50%, -50%) scale(0.01);
            opacity: 0;
            clip-path: polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%);
        }
        20% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 0.2;
            clip-path: polygon(45% 0%, 55% 0%, 55% 100%, 45% 100%);
        }
        40% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0.4;
            clip-path: polygon(35% 0%, 65% 0%, 65% 100%, 35% 100%);
        }
        60% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.6;
            clip-path: polygon(20% 0%, 80% 0%, 80% 100%, 20% 100%);
        }
        80% {
            transform: translate(-50%, -50%) scale(0.85);
            opacity: 0.8;
            clip-path: polygon(8% 0%, 92% 0%, 92% 100%, 8% 100%);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
    }
    
    @keyframes vipPlusEntrance {
        0% {
            transform: translate(-50%, -150vh) scale(0.5);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -120vh) scale(0.6);
            opacity: 0.3;
        }
        40% {
            transform: translate(-50%, -90vh) scale(0.7);
            opacity: 0.5;
        }
        60% {
            transform: translate(-50%, -60vh) scale(0.8);
            opacity: 0.7;
        }
        80% {
            transform: translate(-50%, -30vh) scale(0.9);
            opacity: 0.9;
        }
        90% {
            transform: translate(-50%, -10vh) scale(0.95);
            opacity: 0.95;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes vipPlusPlusEntrance {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes slotMachineSpin {
        0% {
            transform: translateY(-1000px);
            opacity: 0;
        }
        10% {
            transform: translateY(-900px);
            opacity: 0.1;
        }
        20% {
            transform: translateY(-800px);
            opacity: 0.2;
        }
        30% {
            transform: translateY(-700px);
            opacity: 0.3;
        }
        40% {
            transform: translateY(-600px);
            opacity: 0.4;
        }
        50% {
            transform: translateY(-500px);
            opacity: 0.5;
        }
        60% {
            transform: translateY(-400px);
            opacity: 0.6;
        }
        70% {
            transform: translateY(-300px);
            opacity: 0.7;
        }
        80% {
            transform: translateY(-200px);
            opacity: 0.8;
        }
        90% {
            transform: translateY(-100px);
            opacity: 0.9;
        }
        95% {
            transform: translateY(-20px);
            opacity: 0.95;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes textSlotMachine {
        0% {
            transform: translateY(-2000px);
            opacity: 0;
        }
        20% {
            transform: translateY(-1800px);
            opacity: 0.1;
        }
        40% {
            transform: translateY(-1600px);
            opacity: 0.2;
        }
        60% {
            transform: translateY(-1400px);
            opacity: 0.3;
        }
        80% {
            transform: translateY(-1200px);
            opacity: 0.4;
        }
        90% {
            transform: translateY(-1000px);
            opacity: 0.5;
        }
        95% {
            transform: translateY(-500px);
            opacity: 0.7;
        }
        98% {
            transform: translateY(-100px);
            opacity: 0.9;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slotMachineReel {
        0% {
            transform: translateY(-3000px);
            opacity: 0;
        }
        10% {
            transform: translateY(-2700px);
            opacity: 0.1;
        }
        20% {
            transform: translateY(-2400px);
            opacity: 0.2;
        }
        30% {
            transform: translateY(-2100px);
            opacity: 0.3;
        }
        40% {
            transform: translateY(-1800px);
            opacity: 0.4;
        }
        50% {
            transform: translateY(-1500px);
            opacity: 0.5;
        }
        60% {
            transform: translateY(-1200px);
            opacity: 0.6;
        }
        70% {
            transform: translateY(-900px);
            opacity: 0.7;
        }
        80% {
            transform: translateY(-600px);
            opacity: 0.8;
        }
        90% {
            transform: translateY(-300px);
            opacity: 0.9;
        }
        95% {
            transform: translateY(-100px);
            opacity: 0.95;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .modal-vip-button:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
    }
    
    .modal-vip-icon {
        animation: modalIconPulse 2s ease-in-out infinite;
    }
    
    @keyframes modalIconPulse {
        0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }
        50% { 
            transform: scale(1.2) rotate(5deg); 
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
        }
    }
    
    /* Particle effects for VIP++ */
    .vip-modal-card::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
        pointer-events: none;
        animation: particleFloat 4s ease-in-out infinite;
    }
    
    @keyframes particleFloat {
        0%, 100% { opacity: 0.3; transform: translateY(0px); }
        50% { opacity: 0.7; transform: translateY(-10px); }
    }
    
    /* Shimmer effect for all cards */
    .vip-modal-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
        );
        transform: rotate(45deg) translateX(-100%);
        animation: shimmer 3s ease-in-out infinite;
        z-index: 1;
        pointer-events: none;
    }
    
    @keyframes shimmer {
        0% { transform: rotate(45deg) translateX(-100%); }
        50% { transform: rotate(45deg) translateX(100%); }
        100% { transform: rotate(45deg) translateX(100%); }
    }
    
    /* Feature list animations */
    .modal-vip-features li {
        transition: all 0.3s ease;
        transform: translateX(0);
    }
    
    .vip-modal-card:hover .modal-vip-features li {
        transform: translateX(3px);
    }
    
    .vip-modal-card:hover .modal-vip-features li:nth-child(odd) {
        transform: translateX(-3px);
    }
    
    /* Price glow animation */
    .modal-vip-price {
        animation: priceGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes priceGlow {
        0% { text-shadow: 0 0 15px currentColor; }
        100% { text-shadow: 0 0 25px currentColor, 0 0 35px currentColor; }
    }
`;
document.head.appendChild(style);

// Confirm VIP Purchase Function
async function confirmVipPurchase(tier, price, button) {
    console.log('=== CONFIRMING VIP PURCHASE ===');
    console.log('Tier:', tier, 'Price:', price);
    
    // Check if user is logged in
    if (!currentUser) {
        console.log('=== USER NOT LOGGED IN, SHOWING LOGIN MODAL ===');
        hideVipPurchaseModal();
        showAuthModal(true);
        return;
    }
    
    // Add loading state to button
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    button.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        showSuccess(`${tier.toUpperCase()} package purchased successfully!`);
        
        // Hide modal
        hideVipPurchaseModal();
        
    } catch (error) {
        console.error('Purchase failed:', error);
        showError('Purchase failed. Please try again.');
    } finally {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Kit Information Functions
function showKitInfo(kitType) {
    console.log('=== SHOWING KIT INFO ===');
    console.log('Kit type:', kitType);
    
    const modal = document.getElementById('kitInfoModal');
    const title = document.getElementById('kitInfoTitle');
    const content = document.getElementById('kitInfoContent');
    
    if (!modal || !title || !content) {
        console.error('Kit info modal elements not found');
        return;
    }
    
    const kitData = getKitData(kitType);
    if (!kitData) {
        console.error('Kit data not found for:', kitType);
        return;
    }
    
    title.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>${kitData.title}`;
    content.innerHTML = kitData.content;
    
    modal.style.display = 'block';
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function hideKitInfo() {
    console.log('=== HIDING KIT INFO ===');
    
    const modal = document.getElementById('kitInfoModal');
    if (!modal) return;
    
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function getKitData(kitType) {
    const kitData = {
        'vip-monthly': {
            title: 'VIP Monthly Building Kit',
            content: `
                <div style="background: rgba(0, 255, 136, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(0, 255, 136, 0.3);">
                    <h4 style="color: #00ff88; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-hammer" style="margin-right: 0.5rem;"></i>Building Materials
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-tree" style="color: #00ff88; margin-right: 0.8rem;"></i>6,000 Wood
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-mountain" style="color: #00ff88; margin-right: 0.8rem;"></i>10,000 Stone
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-cog" style="color: #00ff88; margin-right: 0.8rem;"></i>3,000 Metal
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-door-open" style="color: #00ff88; margin-right: 0.8rem;"></i>2 Single Metal Doors
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-home" style="color: #00ff88; margin-right: 0.8rem;"></i>Tool Cover (TC)
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-tshirt" style="color: #00ff88; margin-right: 0.8rem;"></i>1,000 Cloth
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-fire" style="color: #00ff88; margin-right: 0.8rem;"></i>200 Low Grade Fuel
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-tools" style="color: #00ff88; margin-right: 0.8rem;"></i>Work Bench Tier 1
                        </li>
                    </ul>
                </div>
            `
        },
        'vip-starter': {
            title: 'VIP Starter Kit',
            content: `
                <div style="background: rgba(0, 255, 136, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(0, 255, 136, 0.3);">
                    <h4 style="color: #00ff88; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-gun" style="margin-right: 0.5rem;"></i>Combat & Survival
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-gun" style="color: #00ff88; margin-right: 0.8rem;"></i>Thompson
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-bullseye" style="color: #00ff88; margin-right: 0.8rem;"></i>120 Bullets
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-user-shield" style="color: #00ff88; margin-right: 0.8rem;"></i>Hazmat Suit
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-heartbeat" style="color: #00ff88; margin-right: 0.8rem;"></i>6 Stims
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 255, 136, 0.2);">
                            <i class="fas fa-coins" style="color: #00ff88; margin-right: 0.8rem;"></i>300 Scrap
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-carrot" style="color: #00ff88; margin-right: 0.8rem;"></i>5 Pumpkin
                        </li>
                    </ul>
                </div>
            `
        },
        'vip-plus-monthly': {
            title: 'VIP+ Monthly Building Kit',
            content: `
                <div style="background: rgba(255, 107, 53, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(255, 107, 53, 0.3);">
                    <h4 style="color: #ff6b35; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-hammer" style="margin-right: 0.5rem;"></i>Building Materials
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-tree" style="color: #ff6b35; margin-right: 0.8rem;"></i>10,000 Wood
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-mountain" style="color: #ff6b35; margin-right: 0.8rem;"></i>15,000 Stone
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-cog" style="color: #ff6b35; margin-right: 0.8rem;"></i>5,000 Metal
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-door-open" style="color: #ff6b35; margin-right: 0.8rem;"></i>2 Single Metal Doors
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-warehouse" style="color: #ff6b35; margin-right: 0.8rem;"></i>3 Garage Doors
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-home" style="color: #ff6b35; margin-right: 0.8rem;"></i>Tool Cover (TC)
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-tshirt" style="color: #ff6b35; margin-right: 0.8rem;"></i>1,500 Cloth
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-fire" style="color: #ff6b35; margin-right: 0.8rem;"></i>500 Low Grade Fuel
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-tools" style="color: #ff6b35; margin-right: 0.8rem;"></i>Work Bench Tier 2
                        </li>
                    </ul>
                </div>
            `
        },
        'vip-plus-starter': {
            title: 'VIP+ Starter Kit',
            content: `
                <div style="background: rgba(255, 107, 53, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(255, 107, 53, 0.3);">
                    <h4 style="color: #ff6b35; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-gun" style="margin-right: 0.5rem;"></i>Combat & Survival
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-gun" style="color: #ff6b35; margin-right: 0.8rem;"></i>MP5 + Holo Sight
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-bullseye" style="color: #ff6b35; margin-right: 0.8rem;"></i>200 Bullets
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-shield-alt" style="color: #ff6b35; margin-right: 0.8rem;"></i>Road Sign Kit
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-heartbeat" style="color: #ff6b35; margin-right: 0.8rem;"></i>12 Stims
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 107, 53, 0.2);">
                            <i class="fas fa-coins" style="color: #ff6b35; margin-right: 0.8rem;"></i>750 Scrap
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-carrot" style="color: #ff6b35; margin-right: 0.8rem;"></i>10 Pumpkin
                        </li>
                    </ul>
                </div>
            `
        },
        'vip-plus-plus-monthly': {
            title: 'VIP++ Monthly Building Kit',
            content: `
                <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(255, 215, 0, 0.3);">
                    <h4 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-hammer" style="margin-right: 0.5rem;"></i>Building Materials
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-tree" style="color: #ffd700; margin-right: 0.8rem;"></i>15,000 Wood
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-mountain" style="color: #ffd700; margin-right: 0.8rem;"></i>20,000 Stone
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-cog" style="color: #ffd700; margin-right: 0.8rem;"></i>8,000 Metal
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-door-open" style="color: #ffd700; margin-right: 0.8rem;"></i>2 Armored Doors
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-warehouse" style="color: #ffd700; margin-right: 0.8rem;"></i>5 Garage Doors
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-home" style="color: #ffd700; margin-right: 0.8rem;"></i>Tool Cover (TC)
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-tshirt" style="color: #ffd700; margin-right: 0.8rem;"></i>2,000 Cloth
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-fire" style="color: #ffd700; margin-right: 0.8rem;"></i>1,000 Low Grade Fuel
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-tools" style="color: #ffd700; margin-right: 0.8rem;"></i>Work Bench Tier 3
                        </li>
                    </ul>
                </div>
            `
        },
        'vip-plus-plus-starter': {
            title: 'VIP++ Starter Kit',
            content: `
                <div style="background: rgba(255, 215, 0, 0.1); border-radius: 10px; padding: 1.5rem; border: 1px solid rgba(255, 215, 0, 0.3);">
                    <h4 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fas fa-gun" style="margin-right: 0.5rem;"></i>Combat & Survival
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; color: #fff;">
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-gun" style="color: #ffd700; margin-right: 0.8rem;"></i>AK + Full Attachments
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-bullseye" style="color: #ffd700; margin-right: 0.8rem;"></i>350 Bullets
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-shield-alt" style="color: #ffd700; margin-right: 0.8rem;"></i>HQM Kit
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-heartbeat" style="color: #ffd700; margin-right: 0.8rem;"></i>18 Stims
                        </li>
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-coins" style="color: #ffd700; margin-right: 0.8rem;"></i>1,250 Scrap
                        </li>
                        <li style="padding: 0.5rem 0;">
                            <i class="fas fa-carrot" style="color: #ffd700; margin-right: 0.8rem;"></i>30 Pumpkin
                        </li>
                    </ul>
                </div>
            `
        }
    };
    
    return kitData[kitType] || null;
}

// Resource Kits Section Functions
function createResourceKitsSection() {
    const resourceKitsSection = document.createElement('div');
    resourceKitsSection.className = 'resource-kits-section';
    resourceKitsSection.id = 'resourceKitsSection';
    resourceKitsSection.style.cssText = `
        position: relative; 
        z-index: 10; 
        padding: 120px 20px 120px 20px; 
        min-height: calc(100vh - 240px); 
        background: rgba(0, 0, 0, 0.3); 
        backdrop-filter: blur(5px); 
        display: none; 
        opacity: 0; 
        transform: translateY(20px); 
        transition: all 0.5s ease-out;
    `;

    const resources = [
        {
            name: 'WOOD BUNDLE',
            icon: 'fas fa-tree',
            color: '#8B4513',
            secondaryColor: '#A0522D',
            price: '$3.99',
            priceValue: 399,
            resource: 'wood',
            amount: '20,000 Wood',
            image: './images/wood.jpg' // Replace with your actual wood image path
        },
        {
            name: 'STONE PACK',
            icon: 'fas fa-mountain',
            color: '#696969',
            secondaryColor: '#808080',
            price: '$7.99',
            priceValue: 799,
            resource: 'stone',
            amount: '30,000 Stone',
            image: './images/stone.jpg' // Replace with your actual stone image path
        },
        {
            name: 'METAL FRAGMENTS',
            icon: 'fas fa-cog',
            color: '#C0C0C0',
            secondaryColor: '#D3D3D3',
            price: '$7.99',
            priceValue: 799,
            resource: 'metal',
            amount: '10,000 Metal Fragments',
            image: './images/metal_fragments.jpg' // Replace with your actual metal fragments image path
        },
        {
            name: 'HIGH QUALITY METAL',
            icon: 'fas fa-gem',
            color: '#FFD700',
            secondaryColor: '#FFED4E',
            price: '$8.99',
            priceValue: 899,
            resource: 'hqm',
            amount: '400 High Quality Metal',
            image: './images/hqm.jpg' // Replace with your actual HQM image path
        },
        {
            name: 'CLOTH BUNDLE',
            icon: 'fas fa-tshirt',
            color: '#F5DEB3',
            secondaryColor: '#DEB887',
            price: '$4.99',
            priceValue: 499,
            resource: 'cloth',
            amount: '2,500 Cloth',
            image: './images/cloth.jpg' // Replace with your actual cloth image path
        },
        {
            name: 'LOW GRADE FUEL',
            icon: 'fas fa-fire',
            color: '#FFA500',
            secondaryColor: '#FF8C00',
            price: '$5.99',
            priceValue: 599,
            resource: 'fuel',
            amount: '2,500 Low Grade Fuel',
            image: './images/low_grade_fuel.jpg' // Replace with your actual fuel image path
        },
        {
            name: 'SCRAP METAL',
            icon: 'fas fa-recycle',
            color: '#CD853F',
            secondaryColor: '#D2691E',
            price: '$8.99',
            priceValue: 899,
            resource: 'scrap',
            amount: '3,000 Scrap',
            image: './images/scrap.jpg' // Replace with your actual scrap image path
        }
    ];

    const container = document.createElement('div');
    container.className = 'resource-kits-container';
    container.style.cssText = 'max-width: 1200px; margin: 0 auto;';

    // Header
    const header = document.createElement('div');
    header.className = 'resource-kits-header';
    header.style.cssText = 'text-align: center; margin-bottom: 3rem;';

    const title = document.createElement('h2');
    title.className = 'resource-kits-title';
    title.style.cssText = 'font-size: 3rem; font-weight: 700; color: #ffd700; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);';
    title.innerHTML = '<i class="fas fa-boxes" style="margin-right: 1rem;"></i>RESOURCE KITS';

    const subtitle = document.createElement('p');
    subtitle.className = 'resource-kits-subtitle';
    subtitle.style.cssText = 'font-size: 1.2rem; color: #fff; max-width: 600px; margin: 0 auto; text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);';
    subtitle.textContent = 'Essential materials and resources to fuel your Rust adventure';

    header.appendChild(title);
    header.appendChild(subtitle);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'resource-kits-grid';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;';

    resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.style.cssText = `
            background: rgba(0, 0, 0, 0.9); 
            border: 2px solid ${resource.color}; 
            border-radius: 20px; 
            padding: 0; 
            text-align: center; 
            backdrop-filter: blur(15px); 
            box-shadow: 0 15px 40px ${resource.color}40; 
            overflow: hidden; 
            transition: all 0.3s ease;
        `;

        // Resource Image
        const imageDiv = document.createElement('div');
        imageDiv.className = 'resource-image';
        imageDiv.style.cssText = `
            height: 200px; 
            background: linear-gradient(135deg, ${resource.color}, ${resource.secondaryColor}); 
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden;
        `;

        const imageBg = document.createElement('div');
        imageBg.style.cssText = `
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0; 
            background: url('${resource.image}') center/cover; 
            opacity: 0.9;
        `;

        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'position: relative; z-index: 2; text-align: center;';

        const icon = document.createElement('div');
        icon.className = 'resource-icon';
        icon.style.cssText = 'font-size: 3rem; color: #fff; margin-bottom: 1rem; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);';
        icon.innerHTML = `<i class="${resource.icon}"></i>`;

        const name = document.createElement('h3');
        name.className = 'resource-name';
        name.style.cssText = 'font-size: 2rem; color: #fff; margin: 0; font-weight: 700; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);';
        name.textContent = resource.name;

        contentDiv.appendChild(icon);
        contentDiv.appendChild(name);
        imageDiv.appendChild(imageBg);
        imageDiv.appendChild(contentDiv);

        // Resource Content
        const contentSection = document.createElement('div');
        contentSection.style.cssText = 'padding: 2rem;';

        const price = document.createElement('div');
        price.className = 'resource-price';
        price.style.cssText = `font-size: 2.5rem; color: ${resource.color}; margin-bottom: 1.5rem; font-weight: 700;`;
        price.textContent = resource.price;

        const details = document.createElement('div');
        details.className = 'resource-details';
        details.style.cssText = `
            background: ${resource.color}1A; 
            border-radius: 15px; 
            padding: 1.5rem; 
            margin-bottom: 2rem; 
            border: 1px solid ${resource.color}4D;
        `;

        const detailsTitle = document.createElement('h4');
        detailsTitle.style.cssText = `color: ${resource.color}; font-size: 1.3rem; margin-bottom: 1rem; font-weight: 600;`;
        detailsTitle.innerHTML = `<i class="${resource.icon}" style="margin-right: 0.5rem;"></i>Bundle Contents:`;

        const list = document.createElement('ul');
        list.style.cssText = 'list-style: none; padding: 0; margin: 0; color: #fff;';

        const listItem = document.createElement('li');
        listItem.style.cssText = `padding: 0.8rem 0; color: #fff; border-bottom: 1px solid ${resource.color}33;`;
        listItem.innerHTML = `<i class="fas fa-check" style="color: ${resource.color}; margin-right: 0.8rem;"></i>${resource.amount}`;

        list.appendChild(listItem);
        details.appendChild(detailsTitle);
        details.appendChild(list);

        const button = document.createElement('button');
        button.className = 'resource-button';
        button.style.cssText = `
            background: linear-gradient(45deg, ${resource.color}, ${resource.secondaryColor}); 
            border: none; 
            color: ${resource.color === '#C0C0C0' || resource.color === '#FFD700' || resource.color === '#F5DEB3' ? '#000' : '#fff'}; 
            padding: 1.2rem 2rem; 
            border-radius: 30px; 
            font-size: 1.2rem; 
            font-weight: 700; 
            cursor: pointer; 
            width: 100%; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            transition: all 0.3s ease;
        `;
        button.setAttribute('data-resource', resource.resource);
        button.setAttribute('data-price', resource.priceValue);
        button.innerHTML = `<i class="fas fa-shopping-cart" style="margin-right: 0.8rem;"></i>Purchase ${resource.name.split(' ')[0]} Bundle`;

        // Add click event for resource purchase
        button.addEventListener('click', function() {
            const resourceType = this.getAttribute('data-resource');
            const price = this.getAttribute('data-price');
            purchaseResource(resourceType, price, this);
        });

        contentSection.appendChild(price);
        contentSection.appendChild(details);
        contentSection.appendChild(button);

        card.appendChild(imageDiv);
        card.appendChild(contentSection);
        grid.appendChild(card);
    });

    container.appendChild(header);
    container.appendChild(grid);
    resourceKitsSection.appendChild(container);

    // Insert before the bottom bar
    const bottomBar = document.querySelector('.bottom-bar');
    bottomBar.parentNode.insertBefore(resourceKitsSection, bottomBar);

    return resourceKitsSection;
}

// Resource purchase function
async function purchaseResource(resourceType, price, button) {
    console.log('=== PURCHASING RESOURCE ===');
    console.log('Resource:', resourceType);
    console.log('Price:', price);
    
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.8rem;"></i>Processing...';
    button.disabled = true;

    try {
        const response = await apiRequest('/api/purchase-resource', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resourceType: resourceType,
                price: parseInt(price)
            })
        });

        if (response.success) {
            showSuccess(`Successfully purchased ${resourceType} bundle!`);
            // Update cart if needed
            await loadCart();
        } else {
            showError(response.message || 'Failed to purchase resource bundle');
        }
    } catch (error) {
        console.error('Error purchasing resource:', error);
        showError('Failed to purchase resource bundle. Please try again.');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Initialize Resource Kits section
console.log('=== CREATING RESOURCE KITS SECTION ===');
const resourceKitsSection = createResourceKitsSection();
console.log('Resource Kits section created:', resourceKitsSection);