
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const serviceSelect = document.getElementById("service");
    const quantityInput = document.getElementById("quantity");
    const unitPrice = document.getElementById("unitPrice");
    const orderTotal = document.getElementById("orderTotal");
    const description = document.getElementById("serviceDescription");
    const message = document.getElementById("orderMessage");
    const form = document.getElementById("placeOrderForm");

    let services = [];

    const money = amount => `R${Number(amount).toFixed(2)}`;

    function updatePrice() {
        const selected = services.find(
            service => String(service.service_id) === serviceSelect.value
        );

        const quantity = Number(quantityInput.value);

        if (!selected || !Number.isInteger(quantity) || quantity < 1) {
            unitPrice.textContent = "R0.00";
            orderTotal.textContent = "R0.00";
            return;
        }

        const price = Number(selected.base_price);

        unitPrice.textContent = money(price);
        orderTotal.textContent = money(price * quantity);
        description.textContent = selected.description || "";
    }

    try {
        const data = await apiRequest("/services");

        services = (data.services || []).filter(
            service => Number(service.is_available) === 1
        );

        serviceSelect.replaceChildren();

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select a printing service";
        serviceSelect.appendChild(placeholder);

        services.forEach(service => {
            const option = document.createElement("option");
            option.value = service.service_id;
            option.textContent =
                `${service.service_name} - ${money(service.base_price)}`;
            serviceSelect.appendChild(option);
        });

    } catch (error) {
        message.textContent = `Unable to load services: ${error.message}`;
    }

    serviceSelect.addEventListener("change", updatePrice);
    quantityInput.addEventListener("input", updatePrice);

    
/* SUBMIT PRINTING ORDER TO MYSQL */

form.addEventListener("submit", async event => {
    event.preventDefault();

    const serviceId = Number(serviceSelect.value);
    const quantity = Number(quantityInput.value);
    const instructions = document
        .getElementById("instructions").value.trim();
    
    if (instructions.length > 2000) {
    message.style.color = "#b42318";
    message.textContent =
        "Special instructions cannot exceed 2000 characters.";
    return;
    }

    if (!Number.isSafeInteger(serviceId) || serviceId <= 0) {
        message.style.color = "#b42318";
        message.textContent = "Please select a printing service.";
        return;
    }

    if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 10000
    ) {
        message.style.color = "#b42318";
        message.textContent = "Enter a valid quantity between 1 and 10000.";
        return;
    }

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
submitButton.textContent = "Processing Order...";

message.style.color = "#64748b";
message.textContent = "Submitting your order...";

    try {
        const data = await apiRequest("/orders", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                items: [
                    {
                        service_id: serviceId,
                        quantity: quantity
                    }
                ],
                special_instructions: instructions
            })
        });

        const orderId = data.order?.order_id;

        message.style.color = "#17643a";
        message.textContent = orderId
            ? `Order #${orderId} placed successfully!`
            : "Your printing order was placed successfully!";

        form.reset();
        unitPrice.textContent = "R0.00";
        orderTotal.textContent = "R0.00";
        description.textContent = "";

        // Redirect to My Orders after success
        setTimeout(() => {
            window.location.href = "my-orders.html";
        }, 1500);

    } catch (error) {
        console.error("Order submission failed:", error);

        message.style.color = "#b42318";
        message.textContent = error.message;

    } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Place Order";
    }
});

});
