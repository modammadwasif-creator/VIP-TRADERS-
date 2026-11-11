/* =========================================
   VIP-TRADERS - MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // =====================================
    // 1. MOBILE MENU
    // =====================================

    const menuToggle = document.querySelector("#menuToggle");
    const navMenu = document.querySelector("#navMenu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function () {
            navMenu.classList.toggle("active");

            menuToggle.classList.toggle("active");

            const isOpen = navMenu.classList.contains("active");

            menuToggle.setAttribute("aria-expanded", isOpen);
        });

        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", function () {
                navMenu.classList.remove("active");
                menuToggle.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }


    // =====================================
    // 2. FEATURED PRODUCTS
    // =====================================

    const featuredContainer = document.querySelector("#featuredProducts");

    function formatPrice(price) {
        if (!price || price <= 0) {
            return "Price coming soon";
        }

        return "Rs. " + Number(price).toLocaleString("en-PK");
    }

    function renderFeaturedProducts() {

        if (!featuredContainer) return;

        if (typeof VIP_PRODUCTS === "undefined") {
            featuredContainer.innerHTML =
                "<p>Products could not be loaded.</p>";
            return;
        }

 const products = getFeaturedProducts().slice(0, 4);
        if (products.length === 0) {
            featuredContainer.innerHTML =
                "<p>No featured products available right now.</p>";
            return;
        }

        featuredContainer.innerHTML = products.map(product => {

            const image = product.images && product.images.length
                ? product.images[0]
                : "";

            const oldPrice = product.oldPrice > product.price &&
                product.price > 0
                ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
                : "";

            return `
                <article class="product-card">

                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                        class="product-image-wrap"
                    >

                        ${product.badge
                            ? `<span class="product-badge">${product.badge}</span>`
                            : ""
                        }

                        <img
                            src="${image}"
                            alt="${product.name}"
                            loading="lazy"
                            onerror="this.style.display='none';"
                        >

                    </a>

                    <div class="product-info">

                        <span class="product-category">
                            ${product.category}
                        </span>

                        <h3>
                            <a href="product.html?id=${encodeURIComponent(product.id)}">
                                ${product.name}
                            </a>
                        </h3>

                        <div class="product-price">

                            <span class="current-price">
                                ${formatPrice(product.price)}
                            </span>

                            ${oldPrice}

                        </div>

                        <div class="product-card-actions">

                            <a
                                href="product.html?id=${encodeURIComponent(product.id)}"
                                class="btn btn-primary"
                            >
                                View Product
                            </a>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
    }

    renderFeaturedProducts();


    // =====================================
    // 3. CART COUNT
    // =====================================

    function updateCartCount() {

        const cartCount = document.querySelector("#cartCount");

        if (!cartCount) return;

        try {

            const cart = JSON.parse(
                localStorage.getItem("vip_traders_cart") || "[]"
            );

            const totalItems = cart.reduce((total, item) => {
                return total + Number(item.quantity || 1);
            }, 0);

            cartCount.textContent = totalItems;

        } catch (error) {

            cartCount.textContent = "0";

        }
    }

    updateCartCount();


    // =====================================
    // 4. BACK TO TOP
    // =====================================

    const backToTop = document.querySelector("#backToTop");

    if (backToTop) {

        window.addEventListener("scroll", function () {

            if (window.scrollY > 300) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }

        });

        backToTop.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });
    }


    // =====================================
    // 5. CURRENT YEAR
    // =====================================

    const yearElement = document.querySelector("#currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // =====================================
    // 6. CATEGORY LINKS
    // =====================================

    document.querySelectorAll("[data-category]").forEach(link => {

        link.addEventListener("click", function () {

            const category = this.dataset.category;

            if (category) {
                window.location.href =
                    "shop.html?category=" + encodeURIComponent(category);
            }

        });

    });

});