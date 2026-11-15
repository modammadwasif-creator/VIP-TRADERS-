  /* =========================================
   VIP-TRADERS - CHECKOUT
   Variant + selected picture + Picture ID
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const CART_KEY = "vip_traders_cart";
    const STORE_WHATSAPP = "923322100970";
    const DELIVERY_CHARGES = 0;

    const form = document.querySelector("#checkoutForm");
    const itemsContainer = document.querySelector("#checkoutItems");
    const subtotalElement = document.querySelector("#checkoutSubtotal");
    const deliveryElement = document.querySelector("#checkoutDelivery");
    const totalElement = document.querySelector("#checkoutTotal");
    const placeOrderButton = document.querySelector("#placeOrder");

    if (!form || !itemsContainer) return;

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
            const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            return Array.isArray(value) ? value : [];
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

            const images =
                option.images?.length
                    ? option.images
                    : (product.images || []);

            const requested =
                typeof vipNormalizeImagePath === "function"
                    ? vipNormalizeImagePath(item.selectedImage)
                    : String(item.selectedImage || "");

            const selectedImage =
                images.includes(requested)
                    ? requested
                    : (option.image || images[0] || product.images?.[0] || "");

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

    function getOrderProducts() {
        const cart = normalizeCart();

        return cart.map(function (item, cartIndex) {
            const product = getProductById(item.id);

            const options = getOptions(product);

            const option =
                options.find(v => String(v.id) === String(item.variantId)) ||
                options[0];

            const images =
                option.images?.length
                    ? option.images
                    : (product.images || []);

            return {
                ...product,
                cartIndex,
                quantity: item.quantity,
                variant: option,
                images,
                selectedImage: item.selectedImage,
                unitPrice: Number(option.price || product.price || 0)
            };
        });
    }

    function renderCheckout() {
        const products = getOrderProducts();

        const cartCount = document.querySelector("#cartCount");

        if (cartCount) {
            cartCount.textContent = products.reduce(
                (sum, product) => sum + product.quantity,
                0
            );
        }

        if (!products.length) {
            itemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add products before checkout.</p>
                    <a href="shop.html">Continue Shopping</a>
                </div>
            `;

            if (subtotalElement) subtotalElement.textContent = money(0);
            if (deliveryElement) deliveryElement.textContent = money(0);
            if (totalElement) totalElement.textContent = money(0);

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
            }

            return {
                products: [],
                subtotal: 0,
                total: 0
            };
        }

        let subtotal = 0;

        itemsContainer.innerHTML = products.map(function (product) {
            const lineTotal = product.unitPrice * product.quantity;

            subtotal += lineTotal;

            return `
                <article class="checkout-item" data-cart-index="${product.cartIndex}">

                    <div class="checkout-item-top">

                        <img
                            class="checkout-item-image"
                            src="${escapeHTML(product.selectedImage)}"
                            alt="${escapeHTML(product.name)}"
                            onerror="this.style.opacity='0.25'"
                        >

                        <div class="checkout-item-info">

                            <h4>${escapeHTML(product.name)}</h4>

                            <p>
                                ${money(product.unitPrice)} × ${product.quantity}
                            </p>

                            <strong>${money(lineTotal)}</strong>

                        </div>

                    </div>

                    <label class="checkout-choice-label">
                        Color / Choice

                        <select
                            class="checkout-variant-select"
                            data-cart-index="${product.cartIndex}"
                        >
                            ${getOptions(product).map(option => `
                                <option
                                    value="${escapeHTML(option.id)}"
                                    ${option.id === product.variant.id ? "selected" : ""}
                                >
                                    ${escapeHTML(option.name)} — ${money(option.price)}
                                </option>
                            `).join("")}
                        </select>
                    </label>

                    ${
                        product.images.length > 1
                            ? `
                                <div class="checkout-image-choices" aria-label="Choose product picture">
                                    ${product.images.map(image => `
                                        <button
                                            type="button"
                                            class="checkout-image-choice ${image === product.selectedImage ? "active" : ""}"
                                            data-cart-index="${product.cartIndex}"
                                            data-image="${escapeHTML(image)}"
                                            title="Select this picture"
                                        >
                                            <img src="${escapeHTML(image)}" alt="Product option">
                                        </button>
                                    `).join("")}
                                </div>
                            `
                            : ""
                    }

                    <p class="checkout-selected-choice">
                        Selected: ${escapeHTML(product.variant.name)}
                    </p>

                </article>
            `;
        }).join("");

        const total = subtotal + DELIVERY_CHARGES;

        if (subtotalElement) {
            subtotalElement.textContent = money(subtotal);
        }

        if (deliveryElement) {
            deliveryElement.textContent =
                DELIVERY_CHARGES > 0
                    ? money(DELIVERY_CHARGES)
                    : "Free";
        }

        if (totalElement) {
            totalElement.textContent = money(total);
        }

        if (placeOrderButton) {
            placeOrderButton.disabled = false;
        }

        return {
            products,
            subtotal,
            total
        };
    }

    itemsContainer.addEventListener("change", function (event) {
        const select = event.target.closest(".checkout-variant-select");

        if (!select) return;

        const index = Number(select.dataset.cartIndex);
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
        renderCheckout();
    });

    itemsContainer.addEventListener("click", function (event) {
        const button = event.target.closest(".checkout-image-choice");

        if (!button) return;

        const index = Number(button.dataset.cartIndex);
        const cart = readCart();

        if (!cart[index]) return;

        cart[index].selectedImage = button.dataset.image;

        writeCart(cart);
        renderCheckout();
    });

    function buildWhatsAppMessage(customer, order) {
        const lines = [
            "*VIP-TRADERS - NEW ORDER*",
            "",
            "*CUSTOMER DETAILS*",
            "Name: " + customer.name,
            "Mobile: " + customer.phone,
            "WhatsApp: " + (customer.whatsapp || "Not provided"),
            "City: " + customer.city,
            "Address: " + customer.address,
            "Notes: " + (customer.notes || "None"),
            "",
            "*ORDER ITEMS*"
        ];

        order.products.forEach(function (product, index) {
            const pictureId =
                typeof getPictureIdForImage === "function"
                    ? getPictureIdForImage(product.id, product.selectedImage)
                    : null;

            lines.push(
                (index + 1) + ". " + product.name,
                "   Choice / Color: " + product.variant.name,
                "   Quantity: " + product.quantity,
                "   Unit Price: " + money(product.unitPrice),
                "   Selected Picture ID: " + (pictureId || "Not assigned"),
                "   Image File: " + (product.selectedImage || "Not selected"),
                "   Line Total: " + money(product.unitPrice * product.quantity)
            );
        });

        lines.push(
            "",
            "Subtotal: " + money(order.subtotal),
            "Delivery: " + (DELIVERY_CHARGES ? money(DELIVERY_CHARGES) : "Free"),
            "*GRAND TOTAL: " + money(order.total) + "*",
            "",
            "Please confirm availability and delivery details."
        );

        return lines.join("\n");
    }

    let confirmationBox =
        document.querySelector("#whatsappSentConfirmation");

    if (!confirmationBox) {
        confirmationBox = document.createElement("div");

        confirmationBox.id = "whatsappSentConfirmation";
        confirmationBox.className = "whatsapp-sent-confirmation";
        confirmationBox.hidden = true;

        confirmationBox.innerHTML = `
            <p>
                WhatsApp opened. Send your order message there,
                then return here.
            </p>

            <button
                type="button"
                id="confirmWhatsAppSent"
                class="btn btn-primary"
            >
                I Have Sent My Order
            </button>
        `;

        form.appendChild(confirmationBox);
    }
// =====================================
// CLEAR CART AFTER WHATSAPP CONFIRMATION
// =====================================

confirmationBox.addEventListener("click", function (event) {

    const confirmButton = event.target.closest("#confirmWhatsAppSent");

    if (!confirmButton) return;

    if (!confirm(
        "Have you sent your order successfully on WhatsApp?"
    )) {
        return;
    }

    // CLEAR CART
    localStorage.setItem(CART_KEY, JSON.stringify([]));

    // RESET CUSTOMER FORM
    form.reset();

    // HIDE CONFIRMATION
    confirmationBox.hidden = true;

    // REFRESH CHECKOUT
    renderCheckout();

    // UPDATE CART COUNT
    const cartCount = document.querySelector("#cartCount");

    if (cartCount) {
        cartCount.textContent = "0";
    }

    alert(
        "Your order is confirmed! Your cart has been cleared successfully."
    );

});
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const order = renderCheckout();

        if (!order.products.length) {
            alert("Your cart is empty.");
            return;
        }

        if (!form.reportValidity()) return;

        const customer = {
            name: document.querySelector("#fullName")?.value.trim() || "",
            phone: document.querySelector("#phone")?.value.trim() || "",
            whatsapp: document.querySelector("#whatsapp")?.value.trim() || "",
            city: document.querySelector("#city")?.value.trim() || "",
            address: document.querySelector("#address")?.value.trim() || "",
            notes: document.querySelector("#notes")?.value.trim() || ""
        };

        const message = buildWhatsAppMessage(customer, order);

        const whatsappURL =
            "https://wa.me/" +
            STORE_WHATSAPP +
            "?text=" +
            encodeURIComponent(message);

        const whatsappWindow = window.open(whatsappURL, "_blank");

        if (!whatsappWindow) {
            alert(
                "Your browser blocked the WhatsApp window. Please allow pop-ups and press Place Order again."
            );
            return;
        }

        confirmationBox.hidden = false;

        confirmationBox.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    });

    renderCheckout();
});
