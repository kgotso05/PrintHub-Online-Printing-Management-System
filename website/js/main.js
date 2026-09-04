document.addEventListener("DOMContentLoaded", () => {

    console.log("PrintHub website loaded successfully.");

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const password =
                document.getElementById("registerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;

            const message =
                document.getElementById("registerMessage");

            if (password.length < 6) {

                message.className =
                    "form-message error-message";

                message.textContent =
                    "Password must contain at least 6 characters.";

                return;
            }

            if (password !== confirmPassword) {

                message.className =
                    "form-message error-message";

                message.textContent =
                    "Passwords do not match.";

                return;
            }

            message.className =
                "form-message success-message";

            message.textContent =
                "Registration details are valid. Backend registration will be connected during implementation.";

        });
    }

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            alert(
                "Login prototype successful. Authentication will be connected to the backend during implementation."
            );

        });
    }
    // Service search and filtering

const serviceSearch =
    document.getElementById("serviceSearch");

const serviceItems =
    document.querySelectorAll(".service-item");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const noServicesMessage =
    document.getElementById("noServicesMessage");

let activeCategory = "all";

function filterServices() {

    if (!serviceSearch || serviceItems.length === 0) {
        return;
    }

    const searchValue =
        serviceSearch.value.toLowerCase().trim();

    let visibleCount = 0;

    serviceItems.forEach((service) => {

        const name =
            service.dataset.name.toLowerCase();

        const category =
            service.dataset.category;

        const matchesSearch =
            name.includes(searchValue);

        const matchesCategory =
            activeCategory === "all" ||
            category === activeCategory;

        if (matchesSearch && matchesCategory) {

            service.style.display = "block";
            visibleCount++;

        } else {

            service.style.display = "none";
        }
    });

    if (noServicesMessage) {

        noServicesMessage.style.display =
            visibleCount === 0 ? "block" : "none";
    }
}

if (serviceSearch) {
    serviceSearch.addEventListener(
        "input",
        filterServices
    );
}

categoryButtons.forEach((button) => {

    button.addEventListener("click", () => {

        categoryButtons.forEach((btn) =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        activeCategory =
            button.dataset.category;

        filterServices();
    });
});


// Quotation prototype

const quotationForm =
    document.getElementById("quotationForm");

const designFile =
    document.getElementById("designFile");

if (designFile) {

    designFile.addEventListener("change", () => {

        const fileInfo =
            document.getElementById("fileInfo");

        if (designFile.files.length > 0) {

            const file =
                designFile.files[0];

            fileInfo.textContent =
                `Selected file: ${file.name}`;

        } else {

            fileInfo.textContent = "";
        }
    });
}

if (quotationForm) {

    quotationForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const service =
                document.getElementById("quoteService");

            const quantity =
                Number(
                    document.getElementById(
                        "quoteQuantity"
                    ).value
                );

            const paperSize =
                document.getElementById("paperSize");

            const paperType =
                document.getElementById("paperType");

            const finishing =
                document.getElementById(
                    "finishingOption"
                );

            const basePrice =
                Number(service.value);

            const sizePrice =
                Number(paperSize.value);

            const paperPrice =
                Number(paperType.value);

            const finishingPrice =
                Number(finishing.value);

            const estimatedTotal =
                (basePrice + sizePrice + paperPrice)
                * quantity
                + finishingPrice;

            document.getElementById(
                "summaryService"
            ).textContent =
                service.options[
                    service.selectedIndex
                ].text;

            document.getElementById(
                "summaryQuantity"
            ).textContent =
                quantity;

            document.getElementById(
                "summaryPaperSize"
            ).textContent =
                paperSize.options[
                    paperSize.selectedIndex
                ].text;

            document.getElementById(
                "summaryPaperType"
            ).textContent =
                paperType.options[
                    paperType.selectedIndex
                ].text;

            document.getElementById(
                "summaryFinishing"
            ).textContent =
                finishing.options[
                    finishing.selectedIndex
                ].text;

            document.getElementById(
                "quoteTotal"
            ).textContent =
                `R${estimatedTotal.toFixed(2)}`;

            const continueButton =
                document.getElementById(
                    "continueOrderButton"
                );

            continueButton.classList.remove(
                "disabled-link"
            );
        }
    );
}
// Order filtering

const orderTabs =
    document.querySelectorAll(".order-tab");

const orderCards =
    document.querySelectorAll(".order-card");

const orderSearch =
    document.getElementById("orderSearch");

const noOrdersMessage =
    document.getElementById("noOrdersMessage");

let currentOrderFilter = "all";

function filterOrders() {

    if (orderCards.length === 0) {
        return;
    }

    const searchValue =
        orderSearch
            ? orderSearch.value.toLowerCase().trim()
            : "";

    let visibleCount = 0;

    orderCards.forEach((card) => {

        const status =
            card.dataset.orderStatus;

        const orderId =
            card.dataset.orderId.toLowerCase();

        const matchesStatus =
            currentOrderFilter === "all" ||
            status === currentOrderFilter;

        const matchesSearch =
            orderId.includes(searchValue);

        if (matchesStatus && matchesSearch) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (noOrdersMessage) {
        noOrdersMessage.style.display =
            visibleCount === 0 ? "block" : "none";
    }
}

orderTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        orderTabs.forEach((item) =>
            item.classList.remove("active")
        );

        tab.classList.add("active");

        currentOrderFilter =
            tab.dataset.orderFilter;

        filterOrders();
    });
});

if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        filterOrders
    );
}


// Prototype order details

const prototypeOrders = {

    PH001: {
        service: "A4 Colour Printing",
        quantity: 50,
        date: "04 Sep 2026",
        total: "R250.00",
        status: "Processing"
    },

    PH002: {
        service: "Spiral Binding",
        quantity: 3,
        date: "02 Sep 2026",
        total: "R180.00",
        status: "Ready"
    },

    PH003: {
        service: "Business Cards",
        quantity: 100,
        date: "27 Aug 2026",
        total: "R450.00",
        status: "Completed"
    },
    PH004: {
    service: "A4 Colour Printing",
    quantity: 50,
    date: "04 Sep 2026",
    total: "R250.00",
    status: "Processing"
}
};

const orderModal =
    document.getElementById("orderModal");

const modalOrderContent =
    document.getElementById("modalOrderContent");

document.querySelectorAll(
    ".details-button"
).forEach((button) => {

    button.addEventListener("click", () => {

        const id =
            button.dataset.order;

        const order =
            prototypeOrders[id];

        if (!order || !orderModal) {
            return;
        }

        modalOrderContent.innerHTML = `
            <p><strong>Order:</strong> #${id}</p>
            <p><strong>Service:</strong> ${order.service}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Total:</strong> ${order.total}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        `;

        orderModal.classList.add("active");
    });
});

const closeOrderModal =
    document.getElementById("closeOrderModal");

if (closeOrderModal && orderModal) {

    closeOrderModal.addEventListener(
        "click",
        () => {
            orderModal.classList.remove("active");
        }
    );
}


// Tracking prototype

const trackingForm =
    document.getElementById("trackingForm");

if (trackingForm) {

    trackingForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const id =
                document
                    .getElementById("trackingId")
                    .value
                    .trim()
                    .toUpperCase()
                    .replace("#", "");

            showTrackingResult(id);
        }
    );

    const urlParams =
        new URLSearchParams(window.location.search);

    const urlOrderId =
        urlParams.get("id");

    if (urlOrderId) {

        document.getElementById(
            "trackingId"
        ).value = urlOrderId;

        showTrackingResult(
            urlOrderId.toUpperCase()
        );
    }
}

function showTrackingResult(id) {

    const order =
        prototypeOrders[id];

    const result =
        document.getElementById(
            "trackingResult"
        );

    const error =
        document.getElementById(
            "trackingError"
        );

    if (!order) {

        result.classList.add("hidden");
        error.classList.remove("hidden");

        return;
    }

    error.classList.add("hidden");
    result.classList.remove("hidden");

    document.getElementById(
        "trackingOrderNumber"
    ).textContent = `#${id}`;

    document.getElementById(
        "trackingService"
    ).textContent = order.service;

    document.getElementById(
        "trackingDate"
    ).textContent = order.date;

    document.getElementById(
        "trackingTotal"
    ).textContent = order.total;

    const status =
        document.getElementById(
            "trackingStatus"
        );

    status.textContent =
        order.status;

    status.className = "status";

    if (order.status === "Processing") {
        status.classList.add(
            "status-processing"
        );
    }

    if (order.status === "Ready") {
        status.classList.add(
            "status-ready"
        );
    }

    if (order.status === "Completed") {
        status.classList.add(
            "status-completed"
        );
    }

    updateTrackingProgress(
        order.status
    );
}

function updateTrackingProgress(status) {

    const processingStep =
        document.getElementById(
            "processingStep"
        );

    const readyStep =
        document.getElementById(
            "readyStep"
        );

    const completeStep =
        document.getElementById(
            "completeStep"
        );

    const readyLine =
        document.getElementById(
            "readyLine"
        );

    const completeLine =
        document.getElementById(
            "completeLine"
        );

    [
        processingStep,
        readyStep,
        completeStep
    ].forEach((element) => {

        element.classList.remove(
            "completed-step",
            "current-step"
        );
    });

    readyLine.classList.remove(
        "active-line"
    );

    completeLine.classList.remove(
        "active-line"
    );

    if (status === "Processing") {

        processingStep.classList.add(
            "current-step"
        );
    }

    if (status === "Ready") {

        processingStep.classList.add(
            "completed-step"
        );

        readyLine.classList.add(
            "active-line"
        );

        readyStep.classList.add(
            "current-step"
        );
    }

    if (status === "Completed") {

        processingStep.classList.add(
            "completed-step"
        );

        readyLine.classList.add(
            "active-line"
        );

        readyStep.classList.add(
            "completed-step"
        );

        completeLine.classList.add(
            "active-line"
        );

        completeStep.classList.add(
            "completed-step"
        );
    }
}
// Checkout prototype

const deliveryMethods =
    document.querySelectorAll(
        'input[name="deliveryMethod"]'
    );

const deliveryAddressSection =
    document.getElementById(
        "deliveryAddressSection"
    );

const deliveryPrice =
    document.getElementById(
        "deliveryPrice"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );

deliveryMethods.forEach((method) => {

    method.addEventListener("change", () => {

        if (method.checked) {

            if (method.value === "delivery") {

                deliveryAddressSection.classList.remove(
                    "hidden"
                );

                deliveryPrice.textContent =
                    "R80.00";

                checkoutTotal.textContent =
                    "R330.00";

            } else {

                deliveryAddressSection.classList.add(
                    "hidden"
                );

                deliveryPrice.textContent =
                    "R0.00";

                checkoutTotal.textContent =
                    "R250.00";
            }
        }
    });
});


const paymentMethods =
    document.querySelectorAll(
        'input[name="paymentMethod"]'
    );

const cardPaymentFields =
    document.getElementById(
        "cardPaymentFields"
    );

const eftFields =
    document.getElementById(
        "eftFields"
    );

paymentMethods.forEach((method) => {

    method.addEventListener("change", () => {

        document
            .querySelectorAll(".payment-method")
            .forEach((option) =>
                option.classList.remove(
                    "active-payment"
                )
            );

        method
            .closest(".payment-method")
            .classList.add(
                "active-payment"
            );

        if (method.value === "eft") {

            cardPaymentFields.classList.add(
                "hidden"
            );

            eftFields.classList.remove(
                "hidden"
            );

        } else {

            cardPaymentFields.classList.remove(
                "hidden"
            );

            eftFields.classList.add(
                "hidden"
            );
        }
    });
});


const cardNumber =
    document.getElementById(
        "cardNumber"
    );

if (cardNumber) {

    cardNumber.addEventListener(
        "input",
        (event) => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 16);

            value =
                value.replace(
                    /(\d{4})(?=\d)/g,
                    "$1 "
                );

            event.target.value =
                value;
        }
    );
}


const expiryDate =
    document.getElementById(
        "expiryDate"
    );

if (expiryDate) {

    expiryDate.addEventListener(
        "input",
        (event) => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .substring(0, 4);

            if (value.length > 2) {

                value =
                    value.substring(0, 2) +
                    "/" +
                    value.substring(2);
            }

            event.target.value =
                value;
        }
    );
}


const placeOrderButton =
    document.getElementById(
        "placeOrderButton"
    );

const orderSuccessModal =
    document.getElementById(
        "orderSuccessModal"
    );

if (
    placeOrderButton &&
    orderSuccessModal
) {

    placeOrderButton.addEventListener(
        "click",
        () => {

            const firstName =
                document
                    .getElementById(
                        "checkoutFirstName"
                    )
                    .value
                    .trim();

            const lastName =
                document
                    .getElementById(
                        "checkoutLastName"
                    )
                    .value
                    .trim();

            const email =
                document
                    .getElementById(
                        "checkoutEmail"
                    )
                    .value
                    .trim();

            if (
                !firstName ||
                !lastName ||
                !email
            ) {

                alert(
                    "Please complete your customer details before placing the order."
                );

                return;
            }

            orderSuccessModal.classList.add(
                "active"
            );
        }
    );
}
// Admin order status prototype

document.querySelectorAll(
    ".order-status-select"
).forEach((select) => {

    select.addEventListener("change", () => {

        const row =
            select.closest(
                ".admin-order-row"
            );

        const statusCell =
            row.querySelector(
                ".status"
            );

        const value =
            select.value;

        statusCell.textContent =
            value;

        statusCell.className =
            "status";

        if (value === "Processing") {

            statusCell.classList.add(
                "status-processing"
            );

            row.dataset.adminStatus =
                "processing";
        }

        if (value === "Ready") {

            statusCell.classList.add(
                "status-ready"
            );

            row.dataset.adminStatus =
                "ready";
        }

        if (value === "Completed") {

            statusCell.classList.add(
                "status-completed"
            );

            row.dataset.adminStatus =
                "completed";
        }

        if (value === "Pending") {

            statusCell.classList.add(
                "status-processing"
            );

            row.dataset.adminStatus =
                "pending";
        }
    });
});


// Admin order filter

const adminOrderSearch =
    document.getElementById(
        "adminOrderSearch"
    );

const adminStatusFilter =
    document.getElementById(
        "adminStatusFilter"
    );

const adminOrderRows =
    document.querySelectorAll(
        ".admin-order-row"
    );

function filterAdminOrders() {

    if (adminOrderRows.length === 0) {
        return;
    }

    const searchValue =
        adminOrderSearch
            ? adminOrderSearch.value
                .toLowerCase()
                .trim()
            : "";

    const statusValue =
        adminStatusFilter
            ? adminStatusFilter.value
            : "all";

    adminOrderRows.forEach((row) => {

        const text =
            row.textContent.toLowerCase();

        const status =
            row.dataset.adminStatus;

        const searchMatch =
            text.includes(searchValue);

        const statusMatch =
            statusValue === "all" ||
            status === statusValue;

        row.style.display =
            searchMatch && statusMatch
                ? ""
                : "none";
    });
}

if (adminOrderSearch) {

    adminOrderSearch.addEventListener(
        "input",
        filterAdminOrders
    );
}

if (adminStatusFilter) {

    adminStatusFilter.addEventListener(
        "change",
        filterAdminOrders
    );
}


// Add service prototype

const addServiceButton =
    document.getElementById(
        "addServiceButton"
    );

const serviceModal =
    document.getElementById(
        "serviceModal"
    );

const closeServiceModal =
    document.getElementById(
        "closeServiceModal"
    );

if (
    addServiceButton &&
    serviceModal
) {

    addServiceButton.addEventListener(
        "click",
        () => {

            serviceModal.classList.add(
                "active"
            );
        }
    );
}

if (
    closeServiceModal &&
    serviceModal
) {

    closeServiceModal.addEventListener(
        "click",
        () => {

            serviceModal.classList.remove(
                "active"
            );
        }
    );
}


const serviceForm =
    document.getElementById(
        "serviceForm"
    );

if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "newServiceName"
                ).value;

            const category =
                document.getElementById(
                    "newServiceCategory"
                ).value;

            const price =
                Number(
                    document.getElementById(
                        "newServicePrice"
                    ).value
                );

            const table =
                document.getElementById(
                    "adminServicesTable"
                );

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
                <td>${name}</td>
                <td>${category}</td>
                <td>R${price.toFixed(2)}</td>
                <td>
                    <span class="status status-completed">
                        Active
                    </span>
                </td>
                <td>
                    <button class="admin-action-button">
                        Edit
                    </button>

                    <button class="admin-action-button delete-action">
                        Delete
                    </button>
                </td>
            `;

            table.appendChild(row);

            serviceForm.reset();

            serviceModal.classList.remove(
                "active"
            );
        }
    );
}

});


function togglePassword(inputId) {

    const input =
        document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }

}