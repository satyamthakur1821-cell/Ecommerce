/* ============================================
   CART PAGE - ES6+ MODERN JAVASCRIPT
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

let cart = [];

// ============================================
// DOM ELEMENTS
// ============================================

const cartItemsContainer = document.getElementById('cart-items');
const emptyCartState = document.getElementById('empty-cart');
const cartContent = document.getElementById('cart-content');
const cartSummary = document.getElementById('cart-summary');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');

// ============================================
// CONSTANTS
// ============================================

const TAX_RATE = 0.10;  // 10% tax

// ============================================
// 1. INITIALIZATION
// ============================================

/**
 * Initializes cart page on load
 * Retrieves cart data and renders it
 */
function initCart() {
    loadCart();
    renderCart();
}

/**
 * Retrieves cart from localStorage
 */
function loadCart() {
    const storedCart = localStorage.getItem('cart');
    cart = storedCart ? JSON.parse(storedCart) : [];
}

/**
 * Saves cart to localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ============================================
// 2. CART RENDERING
// ============================================

/**
 * Main render function - controls entire cart display
 */
function renderCart() {
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        showCartItems();
    }
}

/**
 * Displays empty cart state
 */
function showEmptyCart() {
    emptyCartState.style.display = 'block';
    cartContent.style.display = 'none';
}

/**
 * Displays cart with items
 */
function showCartItems() {
    emptyCartState.style.display = 'none';
    cartContent.style.display = 'flex';

    renderCartItems();
    calculateAndUpdateSummary();
}

/**
 * Renders all cart items to the DOM
 */
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartItemsContainer.appendChild(itemElement);
    });
}

/**
 * Creates a single cart item element with all controls
 * @param {Object} item - Cart item object
 * @param {Number} index - Item index in cart array
 * @returns {HTMLElement} Cart item element
 */
function createCartItemElement(item, index) {
    const subtotal = item.price * item.quantity;

    const itemDiv = document.createElement('article');
    itemDiv.className = 'cart-item';
    itemDiv.setAttribute('data-item-index', index);

    itemDiv.innerHTML = `
        <!-- PRODUCT IMAGE -->
        <img 
            src="${item.image}" 
            alt="${item.title}"
            class="cart-item-image"
        >

        <!-- PRODUCT DETAILS -->
        <div class="cart-item-details">
            <h3>${item.title}</h3>
            <p>Unit Price: <strong>₹${item.price.toFixed(2)}</strong></p>
        </div>

        <!-- UNIT PRICE -->
        <div class="cart-item-price">
            ₹${item.price.toFixed(2)}
        </div>

        <!-- QUANTITY CONTROLS -->
        <div class="quantity-controls">
            <button 
                class="qty-btn"
                onclick="handleQuantityChange(${index}, -1)"
                aria-label="Decrease quantity"
            >
                −
            </button>
            <span class="qty-display">${item.quantity}</span>
            <button 
                class="qty-btn"
                onclick="handleQuantityChange(${index}, 1)"
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>

        <!-- SUBTOTAL -->
        <div style="text-align: right; font-weight: 700; color: #0052FF; min-width: 80px;">
            ₹${subtotal.toFixed(2)}
        </div>

        <!-- REMOVE BUTTON -->
        <button 
            class="remove-btn"
            onclick="handleRemoveItem(${index})"
            aria-label="Remove item from cart"
        >
            REMOVE
        </button>
    `;

    return itemDiv;
}

// ============================================
// 3. QUANTITY & ITEM MANAGEMENT
// ============================================

/**
 * Handles quantity increase/decrease
 * @param {Number} index - Item index in cart
 * @param {Number} change - Change amount (+1 or -1)
 */
function handleQuantityChange(index, change) {
    const item = cart[index];

    if (!item) return;

    const newQuantity = item.quantity + change;

    // Prevent quantity from going below 1 or above 999
    if (newQuantity < 1 || newQuantity > 999) {
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    renderCart();

    // Scroll to item for visual feedback
    setTimeout(() => {
        const itemElement = document.querySelector(`[data-item-index="${index}"]`);
        if (itemElement) {
            itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

/**
 * Handles item removal from cart
 * @param {Number} index - Item index to remove
 */
function handleRemoveItem(index) {
    // Optional: Add confirmation
    if (confirm('Remove this item from your cart?')) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

// ============================================
// 4. CALCULATIONS & SUMMARY
// ============================================

/**
 * Calculates and updates order summary
 */
function calculateAndUpdateSummary() {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    // Update DOM elements
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;

    // Ensure summary is visible
    cartSummary.style.display = 'block';
}

/**
 * Calculates cart subtotal
 * @returns {Number} Subtotal amount
 */
function calculateSubtotal() {
    return cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

/**
 * Calculates tax on subtotal
 * @param {Number} subtotal - Subtotal amount
 * @returns {Number} Tax amount
 */
function calculateTax(subtotal) {
    return subtotal * TAX_RATE;
}

// ============================================
// 5. HELPER FUNCTIONS
// ============================================

/**
 * Gets total number of items in cart (accounting for quantities)
 * @returns {Number} Total item count
 */
function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Checks if cart is empty
 * @returns {Boolean} True if cart is empty
 */
function isCartEmpty() {
    return cart.length === 0;
}

/**
 * Handles checkout (placeholder for future integration)
 */
function handleCheckout() {
    if (isCartEmpty()) {
        alert('Your cart is empty');
        return;
    }

    const total = calculateSubtotal() + calculateTax(calculateSubtotal());
    alert(`Proceeding to checkout with total: ₹${total.toFixed(2)}\n\nThis is a demo. Payment processing not implemented.`);
}

// ============================================
// 6. RESPONSIVE ADJUSTMENTS
// ============================================

/**
 * Handles responsive layout changes for cart
 */
function handleResponsive() {
    const width = window.innerWidth;

    if (width <= 1024) {
        // On tablet/mobile, adjust cart layout
        if (cartContent.style.display !== 'none') {
            // Flexbox direction changes handled by CSS media queries
        }
    }
}

// ============================================
// 7. EVENT LISTENERS & INITIALIZATION
// ============================================

// Setup checkout button
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Initialize cart on page load
    initCart();
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', handleResponsive);

// ============================================
// 8. SESSION STORAGE SYNC
// ============================================

/**
 * Listen for storage changes from other tabs/windows
 * This keeps the cart in sync across browser tabs
 */
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        loadCart();
        renderCart();
    }
});