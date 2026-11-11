/* =========================================
   VIP-TRADERS - SHOP JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const productGrid = document.querySelector("#shopProducts");
    const searchInput = document.querySelector("#shopSearch");
    const categoryFilter = document.querySelector("#categoryFilter");
    const sortFilter = document.querySelector("#sortFilter");
    const resultCount = document.querySelector("#resultCount");

    if (!productGrid) return;

    let filteredProducts = [...VIP_PRODUCTS];

    // =====================================
    // PRICE FORMAT
    // =====================================

    function formatPrice(price) {
        if (!price || price <= 0) {
            return "Price coming soon";
        }

        return "Rs. " + Number(price).toLocaleString("en-PK");
    }

    // =====================================
    // PRODUCT CARD
    // =====================================

    function createProductCard(product) {

        const image = product.images && product.images.length
            ? product.images[0]
            : "";

        const oldPrice =
            product.oldPrice > product.price && product.price > 0
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
    }

    // =====================================
    // DISPLAY PRODUCTS
    // =====================================

    function displayProducts(products) {

        if (products.length === 0) {

            productGrid.innerHTML = `
                <div class="no-products">
                    <h3>No Products Found</h3>
                    <p>Try another search or category.</p>
                </div>
            `;

        } else {

            productGrid.innerHTML = products
                .map(product => createProductCard(product))
                .join("");

        }

        if (resultCount) {
            resultCount.textContent =
                `${products.length} Products Found`;
        }
    }

    // =====================================
    // SEARCH
    // =====================================

    function applyFilters() {

        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        filteredProducts = VIP_PRODUCTS.filter(product => {

            const matchesSearch =
                product.name.toLowerCase().includes(searchText) ||
                product.category.toLowerCase().includes(searchText) ||
                product.description.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                product.category.toLowerCase() ===
                selectedCategory.toLowerCase();

            return product.inStock && matchesSearch && matchesCategory;

        });

        applySorting();
    }

    // =====================================
    // SORTING
    // =====================================

    function applySorting() {

        const sortValue = sortFilter
            ? sortFilter.value
            : "default";

        const sortedProducts = [...filteredProducts];

        if (sortValue === "low-high") {

            sortedProducts.sort(
                (a, b) => a.price - b.price
            );

        } else if (sortValue === "high-low") {

            sortedProducts.sort(
                (a, b) => b.price - a.price
            );

        } else if (sortValue === "name") {

            sortedProducts.sort(
                (a, b) => a.name.localeCompare(b.name)
            );

        }

        displayProducts(sortedProducts);
    }

    // =====================================
    // EVENT LISTENERS
    // =====================================

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener("change", applySorting);
    }

    // =====================================
    // URL CATEGORY
    // =====================================

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromURL = urlParams.get("category");

    if (categoryFromURL && categoryFilter) {

        const matchingOption = Array.from(categoryFilter.options)
            .find(option =>
                option.value.toLowerCase() ===
                categoryFromURL.toLowerCase()
            );

        if (matchingOption) {
            categoryFilter.value = matchingOption.value;
        }
    }

    // =====================================
    // INITIAL LOAD
    // =====================================

    applyFilters();

});