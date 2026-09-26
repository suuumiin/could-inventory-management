// ============================================================
// Cloud Inventory Management System
// Frontend JavaScript
// ============================================================


// ------------------------------------------------------------
// API CONFIGURATION
// ------------------------------------------------------------

// IMPORTANT:
// Replace the URL below with YOUR API Gateway Invoke URL.
//
// Example:
// https://abc123xyz.execute-api.ap-south-1.amazonaws.com

const API_BASE_URL =
    "https://aq0s1aifta.execute-api.ap-south-1.amazonaws.com";


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const productForm =
    document.getElementById("productForm");

const editProductForm =
    document.getElementById("editProductForm");

const inventoryTableBody =
    document.getElementById("inventoryTableBody");

const searchInput =
    document.getElementById("searchInput");

const totalProductsElement =
    document.getElementById("totalProducts");

const totalItemsElement =
    document.getElementById("totalItems");

const lowStockElement =
    document.getElementById("lowStock");

const editModal =
    document.getElementById("editModal");

const closeEditModal =
    document.getElementById("closeEditModal");

const cancelEdit =
    document.getElementById("cancelEdit");


// ------------------------------------------------------------
// GLOBAL PRODUCT LIST
// ------------------------------------------------------------

let products = [];


// ------------------------------------------------------------
// LOAD PRODUCTS
// ------------------------------------------------------------

async function loadProducts() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/products`
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load products. Status: ${response.status}`
            );

        }


        products = await response.json();


        updateDashboard();

        displayProducts(products);


    } catch (error) {

        console.error(error);

        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    Unable to load products.
                    <br>
                    Please check the API connection.
                </td>
            </tr>
        `;

    }

}


// ------------------------------------------------------------
// UPDATE DASHBOARD
// ------------------------------------------------------------

function updateDashboard() {

    const totalProducts =
        products.length;


    const totalItems =
        products.reduce(
            (total, product) =>
                total + Number(product.quantity || 0),
            0
        );


    const lowStockProducts =
        products.filter(
            product =>
                Number(product.quantity) <=
                Number(product.minimumStock)
        );


    totalProductsElement.textContent =
        totalProducts;


    totalItemsElement.textContent =
        totalItems;


    lowStockElement.textContent =
        lowStockProducts.length;

}


// ------------------------------------------------------------
// GET STOCK STATUS
// ------------------------------------------------------------

function getStockStatus(product) {

    const quantity =
        Number(product.quantity);

    const minimumStock =
        Number(product.minimumStock);


    if (quantity === 0) {

        return {
            text: "Out of Stock",
            className: "status-out"
        };

    }


    if (quantity <= minimumStock) {

        return {
            text: "Low Stock",
            className: "status-low"
        };

    }


    return {
        text: "In Stock",
        className: "status-good"
    };

}


// ------------------------------------------------------------
// DISPLAY PRODUCTS
// ------------------------------------------------------------

function displayProducts(productList) {

    inventoryTableBody.innerHTML = "";


    if (productList.length === 0) {

        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    No products available.
                    <br>
                    Add a product using the form above.
                </td>
            </tr>
        `;

        return;

    }


    productList.forEach(product => {

        const status =
            getStockStatus(product);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${escapeHtml(product.productId)}
            </td>

            <td>
                ${escapeHtml(product.productName)}
            </td>

            <td>
                ${escapeHtml(product.category)}
            </td>

            <td>
                ₹${Number(product.price).toFixed(2)}
            </td>

            <td>
                ${Number(product.quantity)}
            </td>

            <td>
                ${Number(product.minimumStock)}
            </td>

            <td>
                <span class="status ${status.className}">
                    ${status.text}
                </span>
            </td>

            <td>

                <button
                    class="btn btn-edit"
                    onclick="openEditModal('${encodeURIComponent(product.productId)}')"
                >
                    Edit
                </button>

                <button
                    class="btn btn-delete"
                    onclick="deleteProduct('${encodeURIComponent(product.productId)}')"
                >
                    Delete
                </button>

            </td>
        `;


        inventoryTableBody.appendChild(row);

    });

}


// ------------------------------------------------------------
// ESCAPE HTML
// ------------------------------------------------------------

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ------------------------------------------------------------
// ADD PRODUCT
// ------------------------------------------------------------

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const product = {

            productId:
                document.getElementById(
                    "productId"
                ).value.trim(),

            productName:
                document.getElementById(
                    "productName"
                ).value.trim(),

            category:
                document.getElementById(
                    "category"
                ).value.trim(),

            price:
                Number(
                    document.getElementById(
                        "price"
                    ).value
                ),

            quantity:
                Number(
                    document.getElementById(
                        "quantity"
                    ).value
                ),

            minimumStock:
                Number(
                    document.getElementById(
                        "minimumStock"
                    ).value
                )
        };


        if (!product.productId) {

            alert("Product ID is required.");

            return;

        }


        if (!product.productName) {

            alert("Product name is required.");

            return;

        }


        if (!product.category) {

            alert("Category is required.");

            return;

        }


        if (product.price < 0) {

            alert("Price cannot be negative.");

            return;

        }


        if (product.quantity < 0) {

            alert("Quantity cannot be negative.");

            return;

        }


        if (product.minimumStock < 0) {

            alert("Minimum stock cannot be negative.");

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/products`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to add product."
                );

            }


            alert(
                "Product added successfully!"
            );


            productForm.reset();


            await loadProducts();


        } catch (error) {

            console.error(error);

            alert(
                `Error: ${error.message}`
            );

        }

    }
);


// ------------------------------------------------------------
// OPEN EDIT MODAL
// ------------------------------------------------------------

function openEditModal(encodedProductId) {

    const productId =
        decodeURIComponent(
            encodedProductId
        );


    const product =
        products.find(
            item =>
                item.productId === productId
        );


    if (!product) {

        alert("Product not found.");

        return;

    }


    document.getElementById(
        "editProductId"
    ).value = product.productId;


    document.getElementById(
        "editProductName"
    ).value = product.productName;


    document.getElementById(
        "editCategory"
    ).value = product.category;


    document.getElementById(
        "editPrice"
    ).value = product.price;


    document.getElementById(
        "editQuantity"
    ).value = product.quantity;


    document.getElementById(
        "editMinimumStock"
    ).value = product.minimumStock;


    editModal.style.display = "flex";

}


// ------------------------------------------------------------
// CLOSE EDIT MODAL
// ------------------------------------------------------------

function closeModal() {

    editModal.style.display = "none";

}


closeEditModal.addEventListener(
    "click",
    closeModal
);


cancelEdit.addEventListener(
    "click",
    closeModal
);


// ------------------------------------------------------------
// UPDATE PRODUCT
// ------------------------------------------------------------

editProductForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const productId =
            document.getElementById(
                "editProductId"
            ).value;


        const updatedProduct = {

            productName:
                document.getElementById(
                    "editProductName"
                ).value.trim(),

            category:
                document.getElementById(
                    "editCategory"
                ).value.trim(),

            price:
                Number(
                    document.getElementById(
                        "editPrice"
                    ).value
                ),

            quantity:
                Number(
                    document.getElementById(
                        "editQuantity"
                    ).value
                ),

            minimumStock:
                Number(
                    document.getElementById(
                        "editMinimumStock"
                    ).value
                )
        };


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/products/${encodeURIComponent(productId)}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                updatedProduct
                            )
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to update product."
                );

            }


            alert(
                "Product updated successfully!"
            );


            closeModal();


            await loadProducts();


        } catch (error) {

            console.error(error);

            alert(
                `Error: ${error.message}`
            );

        }

    }
);


// ------------------------------------------------------------
// DELETE PRODUCT
// ------------------------------------------------------------

async function deleteProduct(
    encodedProductId
) {

    const productId =
        decodeURIComponent(
            encodedProductId
        );


    const confirmed =
        confirm(
            `Are you sure you want to delete ${productId}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products/${encodeURIComponent(productId)}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Failed to delete product."
            );

        }


        alert(
            "Product deleted successfully!"
        );


        await loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            `Error: ${error.message}`
        );

    }

}


// ------------------------------------------------------------
// SEARCH
// ------------------------------------------------------------

searchInput.addEventListener(
    "input",
    function() {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!searchTerm) {

            displayProducts(products);

            return;

        }


        const filteredProducts =
            products.filter(product =>

                String(
                    product.productId
                )
                .toLowerCase()
                .includes(searchTerm)

                ||

                String(
                    product.productName
                )
                .toLowerCase()
                .includes(searchTerm)

                ||

                String(
                    product.category
                )
                .toLowerCase()
                .includes(searchTerm)

            );


        displayProducts(
            filteredProducts
        );

    }
);


// ------------------------------------------------------------
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ------------------------------------------------------------

window.addEventListener(
    "click",
    function(event) {

        if (event.target === editModal) {

            closeModal();

        }

    }
);


// ------------------------------------------------------------
// LOAD PRODUCTS WHEN PAGE OPENS
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

    }
);