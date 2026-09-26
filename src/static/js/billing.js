const API_BASE_URL =
    "https://aq0s1aifta.execute-api.ap-south-1.amazonaws.com";


let billItems = [];


// --------------------------------------------------
// GET PRODUCT
// --------------------------------------------------

async function getProduct(productId) {

    const response = await fetch(
        `${API_BASE_URL}/products/${encodeURIComponent(productId)}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error || "Product not found."
        );
    }

    return result;
}


// --------------------------------------------------
// ADD ITEM
// --------------------------------------------------

document
    .getElementById("addItemButton")
    .addEventListener("click", async function () {

        const productId =
            document
                .getElementById("productId")
                .value
                .trim();

        const quantity =
            Number(
                document
                    .getElementById("quantity")
                    .value
            );


        if (!productId) {

            alert("Please enter a Product ID.");

            return;
        }


        if (!quantity || quantity <= 0) {

            alert(
                "Quantity must be greater than 0."
            );

            return;
        }


        try {

            const product =
                await getProduct(productId);


            if (quantity > Number(product.quantity)) {

                alert(
                    `Insufficient stock.\n\n` +
                    `Available quantity: ${product.quantity}\n` +
                    `Requested quantity: ${quantity}`
                );

                return;
            }


            const existingIndex =
                billItems.findIndex(
                    item =>
                        item.productId === productId
                );


            if (existingIndex !== -1) {

                const newQuantity =
                    billItems[existingIndex].quantity
                    + quantity;


                if (
                    newQuantity >
                    Number(product.quantity)
                ) {

                    alert(
                        `Cannot add this quantity.\n\n` +
                        `Available stock: ${product.quantity}`
                    );

                    return;
                }


                billItems[existingIndex].quantity =
                    newQuantity;

            } else {

                billItems.push({

                    productId:
                        product.productId,

                    productName:
                        product.productName,

                    price:
                        Number(product.price),

                    quantity:
                        quantity
                });

            }


            document
                .getElementById("productId")
                .value = "";

            document
                .getElementById("quantity")
                .value = "";


            displayBill();

        } catch (error) {

            console.error(error);

            alert(
                `Error: ${error.message}`
            );
        }

    });


// --------------------------------------------------
// DISPLAY BILL
// --------------------------------------------------

function displayBill() {

    const tbody =
        document.getElementById(
            "billTableBody"
        );


    tbody.innerHTML = "";


    if (billItems.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-message">

                    No products added to the bill.

                </td>

            </tr>

        `;

        updateSummary();

        return;
    }


    billItems.forEach(
        (item, index) => {

            const total =
                item.price *
                item.quantity;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(item.productId)}
                </td>

                <td>
                    ${escapeHtml(item.productName)}
                </td>

                <td>
                    ₹${item.price.toFixed(2)}
                </td>

                <td>
                    ${item.quantity}
                </td>

                <td>
                    ₹${total.toFixed(2)}
                </td>

                <td>

                    <button
                        class="remove-btn"
                        onclick="removeItem(${index})">

                        Remove

                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );


    updateSummary();
}


// --------------------------------------------------
// REMOVE ITEM
// --------------------------------------------------

function removeItem(index) {

    billItems.splice(index, 1);

    displayBill();
}


// --------------------------------------------------
// UPDATE SUMMARY
// --------------------------------------------------

function updateSummary() {

    const totalItems =
        billItems.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const grandTotal =
        billItems.reduce(
            (sum, item) =>
                sum +
                (item.price *
                 item.quantity),
            0
        );


    document
        .getElementById("totalItems")
        .textContent =
        totalItems;


    document
        .getElementById("grandTotal")
        .textContent =
        grandTotal.toFixed(2);
}


// --------------------------------------------------
// CLEAR BILL
// --------------------------------------------------

document
    .getElementById("clearBillButton")
    .addEventListener("click", function () {

        if (billItems.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "Clear all products from this bill?"
            );


        if (!confirmed) {
            return;
        }


        billItems = [];

        displayBill();

    });


// --------------------------------------------------
// GENERATE BILL
// --------------------------------------------------

document
    .getElementById("generateBillButton")
    .addEventListener(
        "click",
        async function () {

            if (billItems.length === 0) {

                alert(
                    "Please add at least one product."
                );

                return;
            }


            const items =
                billItems.map(
                    item => ({

                        productId:
                            item.productId,

                        quantity:
                            item.quantity

                    })
                );


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/billing`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    items: items
                                })
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Failed to generate bill."
                    );

                }


                displayReceipt(result);


                billItems = [];

                displayBill();


                alert(
                    "Bill generated successfully!\n\n" +
                    "Inventory quantities have been updated."
                );


            } catch (error) {

                console.error(error);

                alert(
                    `Error: ${error.message}`
                );

            }

        }
    );


// --------------------------------------------------
// DISPLAY RECEIPT
// --------------------------------------------------

function displayReceipt(result) {

    document
        .getElementById("receiptSection")
        .style.display = "block";


    document
        .getElementById("receiptBillId")
        .textContent =
        result.billId;


    document
        .getElementById("receiptDate")
        .textContent =
        new Date().toLocaleString();


    const tbody =
        document.getElementById(
            "receiptTableBody"
        );


    tbody.innerHTML = "";


    result.items.forEach(
        item => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        item.productName
                    )}
                </td>

                <td>
                    ${item.quantity}
                </td>

                <td>
                    ₹${Number(
                        item.price
                    ).toFixed(2)}
                </td>

                <td>
                    ₹${Number(
                        item.total
                    ).toFixed(2)}
                </td>

            `;


            tbody.appendChild(row);

        }
    );


    document
        .getElementById("receiptTotal")
        .textContent =
        Number(
            result.total
        ).toFixed(2);


    window.scrollTo({
        top: document
            .getElementById(
                "receiptSection"
            )
            .offsetTop,

        behavior: "smooth"
    });
}


// --------------------------------------------------
// HTML ESCAPE
// --------------------------------------------------

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}