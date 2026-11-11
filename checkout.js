 /* =========================================
   VIP-TRADERS - CHECKOUT JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const CART_KEY = "vip_traders_cart";

    // VIP-TRADERS WhatsApp number
    const STORE_WHATSAPP = "923322100970";

    // Delivery charges
    const DELIVERY_CHARGES = 0;

    const checkoutForm = document.querySelector("#checkoutForm");
    const orderItems = document.querySelector("#checkoutItems");

    const subtotalElement = document.querySelector("#checkoutSubtotal");
    const deliveryElement = document.querySelector("#checkoutDelivery");
    const totalElement = document.querySelector("#checkoutTotal");

    const placeOrderButton = document.querySelector("#placeOrder");

    // =====================================
    // 1. GET CART
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
    // 2. FORMAT PRICE
    // =====================================

    function formatPrice(price) {

        return "Rs. " + Number(price).toLocaleString("en-PK");

    }

    // =====================================
    // 3. GET VALID ORDER ITEMS
    // =====================================

    function getOrderProducts() {

        const cart = getCart();

        return cart.map(item => {

            const product = getProductById(item.id);

            if (!product || !product.inStock || product.price <= 0) {
                return null;
            }

            return {
                ...product,
                quantity: Math.max(1, Number(item.quantity) || 1)
            };

        }).filter(Boolean);
    }

    // =====================================
    // 4. CALCULATE TOTALS
    // =====================================

    function calculateTotals(products) {

        const subtotal = products.reduce(
            (total, product) =>
                total + product.price * product.quantity,
            0
        );

        const total = subtotal + DELIVERY_CHARGES;

        return {
            subtotal,
            delivery: DELIVERY_CHARGES,
            total
        };
    }

    // =====================================
    // 5. DISPLAY ORDER SUMMARY
    // =====================================

    function renderCheckout() {

        if (!orderItems) return;

        const products = getOrderProducts();

        if (products.length === 0) {

            orderItems.innerHTML = `
                <div class="empty-cart">
                    <h3>Your Cart is Empty</h3>

                    <a href="shop.html" class="btn btn-primary">
                        Continue Shopping
                    </a>
                </div>
            `;

            if (placeOrderButton) {
                placeOrderButton.disabled = true;
            }

            updateTotals({
                subtotal: 0,
                delivery: 0,
                total: 0
            });

            return;
        }

        if (placeOrderButton) {
            placeOrderButton.disabled = false;
        }

        orderItems.innerHTML = products.map(product => {

            return `
                <div class="checkout-item">

                    <div>
                        <h4>${product.name}</h4>
                        <p>Quantity: ${product.quantity}</p>
                    </div>

                    <strong>
                        ${formatPrice(product.price * product.quantity)}
                    </strong>

                </div>
            `;

        }).join("");

        updateTotals(calculateTotals(products));

    }

    // =====================================
    // 6. UPDATE TOTALS
    // =====================================

    function updateTotals(totals) {

        if (subtotalElement) {
            subtotalElement.textContent =
                formatPrice(totals.subtotal);
        }

        if (deliveryElement) {
            deliveryElement.textContent =
                totals.delivery === 0
                    ? "To be confirmed"
                    : formatPrice(totals.delivery);
        }

        if (totalElement) {
            totalElement.textContent =
                formatPrice(totals.total);
        }

    }

    // =====================================
    // 7. GET FORM VALUE
    // =====================================

    function getFieldValue(fieldName) {

        const field = checkoutForm.elements[fieldName];

        return field ? field.value.trim() : "";

    }

    // =====================================
    // 8. CLEAR CART AFTER WHATSAPP OPENS
    // =====================================

    function clearCartAfterOrder() {

        // Remove saved cart
        localStorage.removeItem(CART_KEY);

        // Reset header cart count
        const cartCount = document.querySelector("#cartCount");

        if (cartCount) {
            cartCount.textContent = "0";
        }

    }

    // =====================================
    // 9. PLACE ORDER ON WHATSAPP
    // =====================================

    if (checkoutForm) {

        checkoutForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const products = getOrderProducts();

            if (products.length === 0) {

                alert("Your cart is empty or contains unavailable products.");
                return;

            }

            if (!checkoutForm.checkValidity()) {

                checkoutForm.reportValidity();
                return;

            }

            const fullName = getFieldValue("fullName");
            const phone = getFieldValue("phone");
            const whatsapp = getFieldValue("whatsapp");
            const city = getFieldValue("city");
            const address = getFieldValue("address");
            const notes = getFieldValue("notes");

            if (!fullName || !phone || !city || !address) {

                alert("Please complete all required delivery details.");
                return;

            }

            const totals = calculateTotals(products);

            // =================================
            // CREATE WHATSAPP MESSAGE
            // =================================

            let message = `*VIP-TRADERS - NEW ORDER*\n\n`;

            message += `*CUSTOMER DETAILS*\n`;
            message += `Name: ${fullName}\n`;
            message += `Phone: ${phone}\n`;
            message += `WhatsApp: ${whatsapp || "Not provided"}\n`;
            message += `City: ${city}\n`;
            message += `Address: ${address}\n\n`;

            message += `*ORDER ITEMS*\n`;

            products.forEach((product, index) => {

                message += `\n${index + 1}. ${product.name}\n`;
                message += `Quantity: ${product.quantity}\n`;
                message += `Price: ${formatPrice(product.price)}\n`;

                message += `Subtotal: ${formatPrice(
                    product.price * product.quantity
                )}\n`;

            });

            message += `\n*PAYMENT METHOD*\n`;
            message += `Cash on Delivery (COD)\n\n`;

            message += `*ORDER TOTAL*\n`;
            message += `Subtotal: ${formatPrice(totals.subtotal)}\n`;
            message += `Delivery: To be confirmed\n`;
            message += `Total before delivery: ${formatPrice(totals.total)}\n`;

            if (notes) {
                message += `\n*CUSTOMER NOTES*\n${notes}\n`;
            }

            message += `\nPlease confirm this order. Thank you!`;

            // =================================
            // OPEN WHATSAPP
            // =================================

            const whatsappURL =
                `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;

            const whatsappTab = window.open(
                whatsappURL,
                "_blank"
            );

            // =================================
            // AUTOMATICALLY CLEAR CART
            // =================================

            if (whatsappTab) {

                clearCartAfterOrder();

                alert("Your order message is ready on WhatsApp. Your website cart has been cleared!");

                renderCheckout();

                checkoutForm.reset();

            } else {

                alert(
                    "WhatsApp could not open. Please allow pop-ups in your browser. Your cart has been kept safe."
                );

            }

        });

    }

    // =====================================
    // 10. INITIAL LOAD
    // =====================================

    renderCheckout();

});