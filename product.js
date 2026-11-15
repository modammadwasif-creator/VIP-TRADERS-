  /* =========================================
   VIP-TRADERS - PRODUCT DETAILS
   Variant / image choice -> Cart
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const CART_KEY = "vip_traders_cart";
    const productId = new URLSearchParams(window.location.search).get("id");
    const product = typeof getProductById === "function" ? getProductById(productId) : null;
    const details = document.querySelector("#productDetails");

    const el = {
        category: document.querySelector("#productCategory"),
        name: document.querySelector("#productName"),
        price: document.querySelector("#productPrice"),
        oldPrice: document.querySelector("#productOldPrice"),
        description: document.querySelector("#productDescription"),
        mainImage: document.querySelector("#mainProductImage"),
        thumbnails: document.querySelector("#productThumbnails"),
        previous: document.querySelector("#previousImage"),
        next: document.querySelector("#nextImage"),
        quantity: document.querySelector("#productQuantity"),
        minus: document.querySelector("#quantityMinus"),
        plus: document.querySelector("#quantityPlus"),
        add: document.querySelector("#addToCart")
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[char];
        });
    }

    function formatPrice(value) {
        const amount = Number(value || 0);
        return amount > 0
            ? "Rs. " + amount.toLocaleString("en-PK")
            : "Price coming soon";
    }

    function readCart() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function updateCartCount() {
        const count = document.querySelector("#cartCount");
        if (!count) return;

        const total = readCart().reduce(function (sum, item) {
            return sum + Math.max(1, Number(item.quantity) || 1);
        }, 0);

        count.textContent = total;
    }

    if (!product) {
        if (details) {
            details.innerHTML = `
                <div class="shop-empty">
                    <h3>Product not found</h3>
                    <p>This product may have been removed.</p>
                    <a href="shop.html">Back to Shop</a>
                </div>
            `;
        }
        return;
    }

    const variants = typeof getVIPProductVariants === "function"
        ? getVIPProductVariants(product)
        : [{
            id: "standard",
            name: "Standard",
            price: Number(product.price || 0),
            image: (product.images || [])[0] || "",
            images: product.images || []
        }];

    let selectedVariant = variants[0];
    let galleryImages = [...(selectedVariant.images || [])];

    if (!galleryImages.length) {
        galleryImages = [...(product.images || [])];
    }

    let currentImageIndex = 0;

    if (el.category) el.category.textContent = product.category || "";
    if (el.name) el.name.textContent = product.name || "Product";
    if (el.description) el.description.textContent = product.description || "";

    if (el.oldPrice) {
        el.oldPrice.textContent =
            Number(product.oldPrice) > Number(product.price)
                ? formatPrice(product.oldPrice)
                : "";
    }

    let variantControl = document.querySelector("#productVariantControl");

    if (!variantControl && el.price && el.price.parentElement) {
        variantControl = document.createElement("div");
        variantControl.id = "productVariantControl";
        variantControl.className = "product-variant-control";

        el.price.parentElement.insertAdjacentElement(
            "beforebegin",
            variantControl
        );
    }

    function renderVariantSelector() {
        if (!variantControl) return;

        if (variants.length <= 1) {
            variantControl.innerHTML =
                '<span class="variant-current">Choice: ' +
                escapeHTML(selectedVariant.name) +
                '</span>';
            return;
        }

        variantControl.innerHTML = `
            <label for="productVariantSelect">
                Select Color / Choice
            </label>

            <select id="productVariantSelect" class="variant-select">
                ${variants.map(function (variant) {
                    return `
                        <option
                            value="${escapeHTML(variant.id)}"
                            ${variant.id === selectedVariant.id ? "selected" : ""}
                        >
                            ${escapeHTML(variant.name)}
                            - ${escapeHTML(formatPrice(variant.price))}
                        </option>
                    `;
                }).join("")}
            </select>
        `;

        const select = variantControl.querySelector("#productVariantSelect");

        select.addEventListener("change", function () {
            selectedVariant =
                variants.find(v => String(v.id) === this.value) ||
                variants[0];

            galleryImages = [...(selectedVariant.images || [])];

            if (!galleryImages.length) {
                galleryImages = [...(product.images || [])];
            }

            currentImageIndex = 0;
            updateVariantDisplay();
        });
    }

    function showImage(index) {
        if (!galleryImages.length || !el.mainImage) {
            if (el.mainImage) {
                el.mainImage.removeAttribute("src");
            }

            if (el.thumbnails) {
                el.thumbnails.innerHTML = "";
            }

            return;
        }

        currentImageIndex =
            (index + galleryImages.length) % galleryImages.length;

        const image = galleryImages[currentImageIndex];

        el.mainImage.style.display = "block";
        el.mainImage.alt =
            (product.name || "Product") + " - " + selectedVariant.name;

        el.mainImage.onerror = function () {
            this.style.display = "none";
            this.alt = "Product image could not be loaded: " + image;
        };

        el.mainImage.src = image;

        if (el.thumbnails) {
            el.thumbnails.innerHTML = galleryImages.map(function (src, index) {
                return `
                    <button
                        type="button"
                        class="product-thumbnail ${index === currentImageIndex ? "active" : ""}"
                        data-image-index="${index}"
                        aria-label="Show product picture ${index + 1}"
                    >
                        <img
                            src="${escapeHTML(src)}"
                            alt="${escapeHTML(product.name)} picture ${index + 1}"
                            loading="lazy"
                        >
                    </button>
                `;
            }).join("");
        }
    }

    function updateVariantDisplay() {
        if (el.price) {
            el.price.textContent = formatPrice(selectedVariant.price);
        }

        if (el.oldPrice) {
            const oldPrice = Number(product.oldPrice || 0);

            el.oldPrice.textContent =
                oldPrice > Number(selectedVariant.price || 0)
                    ? formatPrice(oldPrice)
                    : "";
        }

        showImage(0);
        renderVariantSelector();
    }

    if (el.thumbnails) {
        el.thumbnails.addEventListener("click", function (event) {
            const button = event.target.closest("[data-image-index]");

            if (!button) return;

            showImage(Number(button.dataset.imageIndex));
        });
    }

    if (el.previous) {
        el.previous.addEventListener("click", function () {
            showImage(currentImageIndex - 1);
        });
    }

    if (el.next) {
        el.next.addEventListener("click", function () {
            showImage(currentImageIndex + 1);
        });
    }

    if (el.minus) {
        el.minus.addEventListener("click", function () {
            if (el.quantity) {
                el.quantity.value = Math.max(
                    1,
                    Number(el.quantity.value || 1) - 1
                );
            }
        });
    }

    if (el.plus) {
        el.plus.addEventListener("click", function () {
            if (el.quantity) {
                el.quantity.value = Math.max(
                    1,
                    Number(el.quantity.value || 1) + 1
                );
            }
        });
    }

    if (el.add) {
        el.add.addEventListener("click", function () {
            const quantity = Math.max(
                1,
                Number(el.quantity?.value || 1)
            );

            const selectedImage =
                galleryImages[currentImageIndex] ||
                selectedVariant.image ||
                product.images?.[0] ||
                "";

            const cart = readCart();

            const existing = cart.find(item =>
                String(item.id) === String(product.id) &&
                String(item.variantId || "standard") ===
                String(selectedVariant.id)
            );

            if (existing) {
                existing.quantity =
                    Math.max(1, Number(existing.quantity) || 1) + quantity;

                existing.selectedImage = selectedImage;
                existing.variantName = selectedVariant.name;

                existing.unitPrice = Number(
                    selectedVariant.price || product.price || 0
                );

            } else {
                cart.push({
                    id: product.id,
                    quantity: quantity,
                    variantId: selectedVariant.id,
                    variantName: selectedVariant.name,
                    selectedImage: selectedImage,
                    unitPrice: Number(
                        selectedVariant.price || product.price || 0
                    )
                });
            }

            localStorage.setItem(CART_KEY, JSON.stringify(cart));

            updateCartCount();

            alert(
                product.name +
                " (" + selectedVariant.name + ") added to cart."
            );
        });
    }

    renderVariantSelector();
    updateVariantDisplay();
    updateCartCount();
});
