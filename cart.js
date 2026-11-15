  /* =========================================
   VIP-TRADERS - SHOPPING CART
   Per-item color / picture selection
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const CART_KEY = "vip_traders_cart";

    const cartContainer = document.querySelector("#cartItems");
    const subtotalElement = document.querySelector("#cartSubtotal");
    const totalElement = document.querySelector("#cartTotal");
    const itemCountElement = document.querySelector("#cartItemCount");
    const clearButton = document.querySelector("#clearCart");

    if (!cartContainer) return;

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c]);
    }

    function money(value) {
        return "Rs. " + Number(value || 0).toLocaleString("en-PK");
    }

    function readCart() {
        try {
            const v = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            return Array.isArray(v) ? v : [];
        } catch (e) {
            return [];
        }
    }

    function writeCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getOptions(product) {
        return typeof getVIPProductVariants === "function"
            ? getVIPProductVariants(product)
            : [{
                id: "standard",
                name: "Standard",
                price: Number(product.price || 0),
                image: product.images?.[0] || "",
                images: product.images || []
            }];
    }

    function normalizeCart() {
        const raw = readCart();
        const clean = [];

        raw.forEach(function (item) {
            const product =
                typeof getProductById === "function"
                    ? getProductById(item.id)
                    : null;

            if (!product || product.inStock === false) return;

            const options = getOptions(product);

            const option =
                options.find(v => String(v.id) === String(item.variantId)) ||
                options.find(v => String(v.name) === String(item.variantName)) ||
                options[0];

            if (!option) return;

            const optionImages =
                option.images?.length
                    ? option.images
                    : (product.images || []);

            const requestedImage =
                typeof vipNormalizeImagePath === "function"
                    ? vipNormalizeImagePath(item.selectedImage)
                    : String(item.selectedImage || "");

            const selectedImage =
                optionImages.includes(requestedImage)
                    ? requestedImage
                    : (option.image || optionImages[0] || product.images?.[0] || "");

            clean.push({
                id: product.id,
                quantity: Math.max(1, Number(item.quantity) || 1),
                variantId: option.id,
                variantName: option.name,
                selectedImage: selectedImage,
                unitPrice: Number(option.price || product.price || 0)
            });
        });

        writeCart(clean);

        return clean;
    }

    function updateHeaderCount(cart) {
        const count = document.querySelector("#cartCount");

        if (count) {
            count.textContent = cart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
        }
    }

    function renderCart() {
        const cart = normalizeCart();

        updateHeaderCount(cart);

        if (!cart.length) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>Your Cart Is Empty</h2>
                    <p>Add products to your cart to continue shopping.</p>
                    <a href="shop.html" class="btn btn-primary">
                        Explore Products
                    </a>
                </div>
            `;

            if (subtotalElement) subtotalElement.textContent = money(0);
            if (totalElement) totalElement.textContent = money(0);
            if (itemCountElement) itemCountElement.textContent = "0";

            return;
        }

        let subtotal = 0;
        let totalQty = 0;

        cartContainer.innerHTML = cart.map(function (item, index) {
            const product = getProductById(item.id);

            const options = getOptions(product);

            const option =
                options.find(v => String(v.id) === String(item.variantId)) ||
                options[0];

            const price = Number(option.price || product.price || 0);
            const lineTotal = price * item.quantity;

            subtotal += lineTotal;
            totalQty += item.quantity;

            const images =
                option.images?.length
                    ? option.images
                    : (product.images || []);

            return `
                <article class="cart-item" data-cart-index="${index}">

                    <div class="cart-item-image">
                        <img
                            src="${escapeHTML(item.selectedImage || images[0] || "")}"
                            alt="${escapeHTML(product.name)}"
                            onerror="this.style.opacity='0.25'"
                        >
                    </div>

                    <div class="cart-item-details">

                        <span class="product-category">
                            ${escapeHTML(product.category || "")}
                        </span>

                        <h3>${escapeHTML(product.name)}</h3>

                        <p class="cart-item-price">
                            ${money(price)} each
                        </p>

                        <label class="cart-choice-label">
                            Color / Choice

                            <select
                                class="cart-variant-select"
                                data-action="variant"
                                data-index="${index}"
                            >
                                ${options.map(v => `
                                    <option
                                        value="${escapeHTML(v.id)}"
                                        ${v.id === option.id ? "selected" : ""}
                                    >
                                        ${escapeHTML(v.name)} — ${money(v.price)}
                                    </option>
                                `).join("")}
                            </select>
                        </label>

                        ${
                            images.length > 1
                                ? `
                                    <div class="cart-image-choices">
                                        ${images.map(img => `
                                            <button
                                                type="button"
                                                class="cart-image-choice ${img === item.selectedImage ? "active" : ""}"
                                                data-action="image"
                                                data-index="${index}"
                                                data-image="${escapeHTML(img)}"
                                                title="Choose this picture"
                                            >
                                                <img src="${escapeHTML(img)}" alt="Product option">
                                            </button>
                                        `).join("")}
                                    </div>
                                `
                                : ""
                        }

                        <div class="cart-quantity">

                            <button
                                type="button"
                                data-action="minus"
                                data-index="${index}"
                                aria-label="Decrease quantity"
                            >−</button>

                            <strong>${item.quantity}</strong>

                            <button
                                type="button"
                                data-action="plus"
                                data-index="${index}"
                                aria-label="Increase quantity"
                            >+</button>

                        </div>

                    </div>

                    <div class="cart-item-actions">
                        <strong>${money(lineTotal)}</strong>

                        <button
                            type="button"
                            class="remove-cart-item"
                            data-action="remove"
                            data-index="${index}"
                        >
                            Remove
                        </button>
                    </div>

                </article>
            `;
        }).join("");

        if (subtotalElement) subtotalElement.textContent = money(subtotal);
        if (totalElement) totalElement.textContent = money(subtotal);

        if (itemCountElement) {
            itemCountElement.textContent = String(totalQty);
        }
    }

    cartContainer.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;
        const index = Number(button.dataset.index);

        const cart = readCart();

        if (!cart[index]) return;

        if (action === "plus") {
            cart[index].quantity =
                Math.max(1, Number(cart[index].quantity) || 1) + 1;
        }

        if (action === "minus") {
            cart[index].quantity =
                Math.max(1, Number(cart[index].quantity) || 1) - 1;
        }

        if (action === "remove") {
            cart.splice(index, 1);
        }

        if (action === "image") {
            cart[index].selectedImage = button.dataset.image;
        }

        writeCart(cart);
        renderCart();
    });

    cartContainer.addEventListener("change", function (event) {
        const select = event.target.closest('[data-action="variant"]');

        if (!select) return;

        const index = Number(select.dataset.index);
        const cart = readCart();

        const product = getProductById(cart[index]?.id);

        if (!product) return;

        const option = getOptions(product).find(
            v => String(v.id) === select.value
        );

        if (!option) return;

        cart[index].variantId = option.id;
        cart[index].variantName = option.name;

        cart[index].unitPrice = Number(
            option.price || product.price || 0
        );

        cart[index].selectedImage =
            option.image ||
            option.images?.[0] ||
            product.images?.[0] ||
            "";

        writeCart(cart);
        renderCart();
    });

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            if (!confirm("Are you sure you want to clear your cart?")) {
                return;
            }

            writeCart([]);
            renderCart();
        });
    }

    renderCart();
});
