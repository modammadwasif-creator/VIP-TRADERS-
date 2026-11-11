/* =========================================
   VIP-TRADERS - PRODUCT DETAILS JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. GET PRODUCT ID FROM URL
    // =====================================

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const product = getProductById(productId);

    const productDetails = document.querySelector("#productDetails");

    if (!product) {

        if (productDetails) {
            productDetails.innerHTML = `
                <div class="no-products">
                    <h2>Product Not Found!</h2>
                    <p>This product is not available.</p>
                    <a href="shop.html" class="btn btn-primary">
                        Back to Shop
                    </a>
                </div>
            `;
        }

        return;
    }


    // =====================================
    // 2. ELEMENTS
    // =====================================

    const mainImage = document.querySelector("#mainProductImage");
    const thumbnailContainer = document.querySelector("#productThumbnails");
    const previousButton = document.querySelector("#previousImage");
    const nextButton = document.querySelector("#nextImage");

    const productName = document.querySelector("#productName");
    const productCategory = document.querySelector("#productCategory");
    const productPrice = document.querySelector("#productPrice");
    const productOldPrice = document.querySelector("#productOldPrice");
    const productDescription = document.querySelector("#productDescription");

    const quantityInput = document.querySelector("#productQuantity");
    const minusButton = document.querySelector("#quantityMinus");
    const plusButton = document.querySelector("#quantityPlus");

    const addToCartButton = document.querySelector("#addToCart");


    // =====================================
    // 3. PRICE FORMAT
    // =====================================

    function formatPrice(price) {

        if (!price || price <= 0) {
            return "Price coming soon";
        }

        return "Rs. " + Number(price).toLocaleString("en-PK");
    }


    // =====================================
    // 4. PRODUCT INFORMATION
    // =====================================

    if (productName) {
        productName.textContent = product.name;
    }

    if (productCategory) {
        productCategory.textContent = product.category;
    }

    if (productPrice) {
        productPrice.textContent = formatPrice(product.price);
    }

    if (productOldPrice) {

        if (product.oldPrice > product.price && product.price > 0) {
            productOldPrice.textContent = formatPrice(product.oldPrice);
        } else {
            productOldPrice.style.display = "none";
        }
    }

    if (productDescription) {
        productDescription.textContent = product.description;
    }


    // =====================================
    // 5. IMAGE GALLERY
    // =====================================

    const images = product.images || [];

    let currentImageIndex = 0;

    function showImage(index) {

        if (!mainImage || images.length === 0) return;

        currentImageIndex =
            (index + images.length) % images.length;

        mainImage.style.opacity = "0";

        setTimeout(function () {

            mainImage.src = images[currentImageIndex];

            mainImage.alt = product.name;

            mainImage.onload = function () {
                mainImage.style.opacity = "1";
            };

            if (mainImage.complete) {
                mainImage.style.opacity = "1";
            }

        }, 150);

        if (thumbnailContainer) {

            thumbnailContainer.querySelectorAll("img").forEach(
                (thumbnail, thumbnailIndex) => {

                    thumbnail.classList.toggle(
                        "active",
                        thumbnailIndex === currentImageIndex
                    );

                }
            );
        }
    }


    // =====================================
    // 6. CREATE THUMBNAILS
    // =====================================

    if (thumbnailContainer) {

        thumbnailContainer.innerHTML = images.map(
            (image, index) => `
                <button
                    type="button"
                    class="product-thumbnail ${index === 0 ? "active" : ""}"
                    data-index="${index}"
                    aria-label="View product image ${index + 1}"
                >
                    <img
                        src="${image}"
                        alt="${product.name} image ${index + 1}"
                    >
                </button>
            `
        ).join("");

        thumbnailContainer.querySelectorAll("button").forEach(
            button => {

                button.addEventListener("click", function () {

                    showImage(Number(this.dataset.index));

                });

            }
        );
    }

    showImage(0);


    // =====================================
    // 7. NEXT / PREVIOUS BUTTONS
    // =====================================

    if (nextButton) {

        nextButton.addEventListener("click", function () {

            showImage(currentImageIndex + 1);

        });
    }

    if (previousButton) {

        previousButton.addEventListener("click", function () {

            showImage(currentImageIndex - 1);

        });
    }


    // =====================================
    // 8. QUANTITY CONTROLS
    // =====================================

    function getQuantity() {

        return Math.max(
            1,
            Number(quantityInput?.value) || 1
        );
    }

    if (minusButton) {

        minusButton.addEventListener("click", function () {

            const quantity = getQuantity();

            if (quantityInput) {
                quantityInput.value = Math.max(1, quantity - 1);
            }

        });
    }

    if (plusButton) {

        plusButton.addEventListener("click", function () {

            const quantity = getQuantity();

            if (quantityInput) {
                quantityInput.value = quantity + 1;
            }

        });
    }

    if (quantityInput) {

        quantityInput.addEventListener("change", function () {

            this.value = getQuantity();

        });
    }


    // =====================================
    // 9. ADD TO CART
    // =====================================

    if (addToCartButton) {

        addToCartButton.addEventListener("click", function () {

            if (!product.inStock || product.price <= 0) {

                alert("This product is currently unavailable.");
                return;

            }

            let cart = [];

            try {

                cart = JSON.parse(
                    localStorage.getItem("vip_traders_cart") || "[]"
                );

                if (!Array.isArray(cart)) {
                    cart = [];
                }

            } catch (error) {

                cart = [];

            }

            const quantity = getQuantity();

            const existingItem = cart.find(
                item => item.id === product.id
            );

            if (existingItem) {

                existingItem.quantity += quantity;

            } else {

                cart.push({
                    id: product.id,
                    quantity: quantity
                });

            }

            localStorage.setItem(
                "vip_traders_cart",
                JSON.stringify(cart)
            );

            alert("Product added to your cart!");

            const cartCount = document.querySelector("#cartCount");

            if (cartCount) {

                const totalItems = cart.reduce(
                    (total, item) => total + item.quantity,
                    0
                );

                cartCount.textContent = totalItems;

            }

        });
    }

});