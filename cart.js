/* =========================================
   VIP-TRADERS - CART JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const cartContainer = document.querySelector("#cartItems");
    const subtotalElement = document.querySelector("#cartSubtotal");
    const totalElement = document.querySelector("#cartTotal");
    const itemCountElement = document.querySelector("#cartItemCount");
    const clearCartButton = document.querySelector("#clearCart");

    const CART_KEY = "vip_traders_cart";

    // =====================================
    // 1. GET CART DATA
    // =====================================

    function getCart() {
        try {
            const cart = JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

            return Array.isArray(cart) ? cart : [];

        } catch (error) {
            return [];
        }
    }

    // =====================================
    // 2. SAVE CART DATA
    // =====================================

    function saveCart(cart) {
        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

        updateCartCount();
    }

    // =====================================
    // 3. PRICE FORMAT
    // =====================================

    function formatPrice(price) {
        return "Rs. " + Number(price).toLocaleString("en-PK");
    }

    // =====================================
    // 4. UPDATE HEADER CART COUNT
    // =====================================

    function updateCartCount() {

        const cartCount = document.querySelector("#cartCount");
        if (!cartCount) return;

        const cart = getCart();

        const count = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        cartCount.textContent = count;
    }

    // =====================================
    // 5. DISPLAY CART
    // =====================================

    function renderCart() {

        if (!cartContainer) return;

        const cart = getCart();

        let subtotal = 0;
        let totalItems = 0;

        if (cart.length === 0) {

            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>Your Cart is Empty</h2>
                    <p>You haven't added any products yet.</p>

                    <a href="shop.html" class="btn btn-primary">
                        Continue Shopping
                    </a>
                </div>
            `;

            updateSummary(0, 0);
            return;
        }

        const validItems = cart.map(item => {

            const product = getProductById(item.id);

            if (!product || !product.inStock) {
                return null;
            }

            return {
                ...item,
                product: product
            };

        }).filter(Boolean);

        if (validItems.length !== cart.length) {
            saveCart(validItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            })));
        }

        cartContainer.innerHTML = validItems.map(item => {

            const product = item.product;
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const image = product.images?.[0] || "";

            const itemTotal = product.price * quantity;

            subtotal += itemTotal;
            totalItems += quantity;

            return `
                <article class="cart-item" data-id="${product.id}">

                    <div class="cart-item-image">
                        <img
                            src="${image}"
                            alt="${product.name}"
                            onerror="this.style.display='none';"
                        >
                    </div>

                    <div class="cart-item-details">

                        <span class="product-category">
                            ${product.category}
                        </span>

                        <h3>${product.name}</h3>

                        <p class="cart-item-price">
                            ${formatPrice(product.price)}
                        </p>

                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="quantity-decrease"
                                data-id="${product.id}"
                                aria-label="Decrease quantity"
                            >−</button>

                            <span>${quantity}</span>

                            <button
                                type="button"
                                class="quantity-increase"
                                data-id="${product.id}"
                                aria-label="Increase quantity"
                            >+</button>

                        </div>

                    </div>

                    <div class="cart-item-actions">

                        <strong>${formatPrice(itemTotal)}</strong>

                        <button
                            type="button"
                            class="remove-cart-item"
                            data-id="${product.id}"
                        >
                            Remove
                        </button>

                    </div>

                </article>
            `;

        }).join("");

        updateSummary(subtotal, totalItems);
    }

    // =====================================
    // 6. UPDATE SUMMARY
    // =====================================

    function updateSummary(subtotal, totalItems) {

        if (subtotalElement) {
            subtotalElement.textContent = formatPrice(subtotal);
        }

        if (totalElement) {
            totalElement.textContent = formatPrice(subtotal);
        }

        if (itemCountElement) {
            itemCountElement.textContent = totalItems;
        }
    }

    // =====================================
    // 7. CART BUTTON ACTIONS
    // =====================================

    if (cartContainer) {

        cartContainer.addEventListener("click", function (event) {

            const increaseButton = event.target.closest(".quantity-increase");
            const decreaseButton = event.target.closest(".quantity-decrease");
            const removeButton = event.target.closest(".remove-cart-item");

            let cart = getCart();

            // INCREASE QUANTITY

            if (increaseButton) {

                const id = increaseButton.dataset.id;

                const item = cart.find(product => product.id === id);

                if (item) {
                    item.quantity++;
                }

                saveCart(cart);
                renderCart();
            }

            // DECREASE QUANTITY

            if (decreaseButton) {

                const id = decreaseButton.dataset.id;

                const item = cart.find(product => product.id === id);

                if (item) {

                    item.quantity--;

                    if (item.quantity <= 0) {
                        cart = cart.filter(product => product.id !== id);
                    }

                }

                saveCart(cart);
                renderCart();
            }

            // REMOVE PRODUCT

            if (removeButton) {

                const id = removeButton.dataset.id;

                cart = cart.filter(product => product.id !== id);

                saveCart(cart);
                renderCart();
            }

        });
    }

    // =====================================
    // 8. CLEAR ENTIRE CART
    // =====================================

    if (clearCartButton) {

        clearCartButton.addEventListener("click", function () {

            const confirmed = confirm(
                "Are you sure you want to clear your cart?"
            );

            if (!confirmed) return;

            saveCart([]);
            renderCart();

        });
    }

    // =====================================
    // 9. INITIAL LOAD
    // =====================================

    updateCartCount();
    renderCart();

});