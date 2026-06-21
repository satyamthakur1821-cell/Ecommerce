/* ============================================
   PRODUCT PAGE - ES6+ MODERN JAVASCRIPT
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

let allProducts = [];              // All products from API
let filteredProducts = [];         // Products after search/filter
let selectedCategory = 'all';      // Current category filter
let currentSort = '';              // Current sort option
let debounceTimer = null;          // Debounce timer for search

// ============================================
// DOM ELEMENTS
// ============================================

const productContainer = document.getElementById('products');
const searchInput = document.getElementById('search');
const sortDropdown = document.getElementById('sort');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadingIndicator = document.getElementById('loading');
const cartBadge = document.getElementById('cart-badge');

// ============================================
// 1. INITIALIZATION & API FETCH
// ============================================

/**
 * Initializes the application
 * Fetches products and sets up event listeners
 */
async function init() {
    try {
        showLoading(true);
        await fetchProducts();
        setupEventListeners();
        updateCartBadge();
        showLoading(false);
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        productContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Failed to load products. Please refresh the page.</p>';
    }
}

/**
 * Fetches all products from FakeStore API asynchronously
 * Stores data in allProducts and initializes filteredProducts
 */
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allProducts = await response.json();
        filteredProducts = [...allProducts];

        // Sort by rating by default (highest first)
        filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));

        renderProducts(filteredProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// ============================================
// 2. RENDERING FUNCTIONS
// ============================================

/**
 * Renders products to the DOM with semantic HTML
 * @param {Array} products - Array of product objects to render
 */
function renderProducts(products) {
    // Clear container
    productContainer.innerHTML = '';

    // Handle empty state
    if (products.length === 0) {
        productContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <h3 style="color: #999; margin-bottom: 1rem;">No products found</h3>
                <p style="color: #ccc;">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    // Render each product card
    products.forEach((product, index) => {
        const card = createProductCard(product, index);
        productContainer.appendChild(card);
    });
}

/**
 * Applies price multiplier for budget segment (3-5k range)
 * @param {Number} price - Original price from API
 * @returns {Number} Adjusted price for 3-5k budget segment
 */
function adjustPriceForBudgetSegment(price) {
    const PRICE_MULTIPLIER = 30; // Multiplier to bring prices into 3-5k range
    return price * PRICE_MULTIPLIER;
}

/**
 * Creates a product card element with all details and interactions
 * @param {Object} product - Product data object
 * @param {Number} index - Product index for asymmetric grid logic
 * @returns {HTMLElement} Complete product card element
 */
function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);

    // Apply price adjustment for 3-5k budget segment
    const adjustedPrice = adjustPriceForBudgetSegment(product.price);

    // Calculate rating stars for display
    const ratingStars = createStarRating(product.rating?.rate || 0);
    const categoryBadge = product.category.charAt(0).toUpperCase() + product.category.slice(1);

    // Build card HTML with semantic structure
    card.innerHTML = `
        <div class="product-image-wrapper">
            <img 
                src="${product.image}" 
                alt="${product.title}"
                loading="lazy"
            >
            <span class="product-category">${categoryBadge}</span>
        </div>

        <div class="product-info">
            <div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    <span>${ratingStars}</span>
                    <span style="margin-left: 0.5rem; color: #999;">(${product.rating?.count || 0} reviews)</span>
                </div>
            </div>

            <div class="product-footer">
                <span class="product-price">₹${adjustedPrice.toFixed(2)}</span>
                <button 
                    class="add-to-cart-btn"
                    data-product-id="${product.id}"
                    onclick="handleAddToCart(event, ${product.id}, '${product.title}', ${adjustedPrice}, '${product.image}')"
                >
                    ADD TO CART
                </button>
            </div>
        </div>
    `;

    return card;
}

/**
 * Creates a star rating display (⭐ format)
 * @param {Number} rating - Rating value (0-5)
 * @returns {String} Star rating HTML/text
 */
function createStarRating(rating) {
    const filledStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(filledStars);
    if (hasHalfStar && filledStars < 5) stars += '◐';
    stars += '☆'.repeat(5 - Math.ceil(rating));
    return `${stars} ${rating.toFixed(1)}`;
}

// ============================================
// 3. SEARCH & FILTER LOGIC
// ============================================

/**
 * Handles real-time product search with debouncing
 * Searches by title and category
 * @param {String} searchTerm - Search query from input
 */
function handleSearch(searchTerm) {
    // Clear existing debounce timer
    clearTimeout(debounceTimer);

    // Set new debounce timer (300ms delay for performance)
    debounceTimer = setTimeout(() => {
        const term = searchTerm.toLowerCase().trim();

        if (term === '') {
            // If search is empty, apply current category filter
            applyFilters();
            return;
        }

        // Filter by search term across title and category
        filteredProducts = allProducts.filter(product => {
            const titleMatch = product.title.toLowerCase().includes(term);
            const categoryMatch = product.category.toLowerCase().includes(term);
            const categoryFilter = selectedCategory === 'all' || 
                                  product.category.toLowerCase() === selectedCategory.toLowerCase();

            return (titleMatch || categoryMatch) && categoryFilter;
        });

        // Re-apply sort if active
        applySorting();
        renderProducts(filteredProducts);
    }, 300);
}

/**
 * Handles category filtering
 * @param {String} category - Category name to filter by
 */
function handleCategoryFilter(category) {
    selectedCategory = category;

    // Filter products by category
    if (category === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Re-apply search if active
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        handleSearch(searchTerm);
        return;
    }

    // Re-apply sort if active
    applySorting();
    renderProducts(filteredProducts);
}

/**
 * Applies current filters without re-rendering
 * Helper function for search
 */
function applyFilters() {
    if (selectedCategory === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product =>
            product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
    }
    applySorting();
    renderProducts(filteredProducts);
}

// ============================================
// 4. SORTING LOGIC
// ============================================

/**
 * Handles product sorting
 * @param {String} sortType - Type of sort: 'lowToHigh', 'highToLow', 'rating'
 */
function handleSort(sortType) {
    currentSort = sortType;
    applySorting();
    renderProducts(filteredProducts);
}

/**
 * Applies current sort to filtered products
 */
function applySorting() {
    if (currentSort === 'lowToHigh') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'highToLow') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
        filteredProducts.sort((a, b) => 
            (b.rating?.rate || 0) - (a.rating?.rate || 0)
        );
    }
}

// ============================================
// 5. SHOPPING CART MANAGEMENT
// ============================================

/**
 * Retrieves cart from localStorage
 * @returns {Array} Cart items array
 */
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Saves cart to localStorage
 * @param {Array} cart - Cart items array to save
 */
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

/**
 * Handles adding product to cart with visual feedback
 * @param {Event} event - Click event from button
 * @param {Number} productId - ID of product to add
 * @param {String} title - Product title
 * @param {Number} price - Product price
 * @param {String} image - Product image URL
 */
function handleAddToCart(event, productId, title, price, image) {
    event.preventDefault();
    
    const button = event.target;
    const cart = getCart();

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // Increase quantity
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // Add new item
        cart.push({
            id: productId,
            title,
            price,
            image,
            quantity: 1
        });
    }

    // Save cart
    saveCart(cart);

    // Visual feedback: button animation
    button.classList.add('added');
    button.textContent = '✓ ADDED';

    // Reset button after delay
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'ADD TO CART';
    }, 1500);

    // Show subtle notification (optional)
    showNotification(`${title} added to cart!`);
}

/**
 * Updates the cart badge count in header
 */
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.classList.add('active');
    } else {
        cartBadge.classList.remove('active');
    }
}

// ============================================
// 6. UI HELPERS
// ============================================

/**
 * Shows/hides loading indicator
 * @param {Boolean} show - Whether to show loading state
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'block' : 'none';
}

/**
 * Shows brief notification to user
 * @param {String} message - Message to display
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: #0052FF;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Remove after 2 seconds
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// ============================================
// 7. EVENT LISTENERS
// ============================================

/**
 * Sets up all event listeners for the page
 */
function setupEventListeners() {
    // Search input with debounce
    searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Sort dropdown
    sortDropdown.addEventListener('change', (e) => {
        handleSort(e.target.value);
    });

    // Category filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filter
            const category = e.target.dataset.category;
            handleCategoryFilter(category);
        });
    });
}

// ============================================
// 8. APPLICATION STARTUP
// ============================================

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}