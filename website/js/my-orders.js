
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const tableBody = document.getElementById("allOrders");
    const orderCount = document.getElementById("orderCount");
    const message = document.getElementById("ordersMessage");
    
    document.getElementById("closeDetailsBtn")
    .addEventListener("click", () => {
        document.getElementById("orderDetailsPanel").hidden = true;
    });

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("printhub_token");
            window.location.href = "login.html";
        });
    }

    function addMessageRow(text) {
        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.textContent = text;

        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    try {
        const data = await apiRequest("/orders/my", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const orders = Array.isArray(data.orders)
            ? data.orders
            : [];

        orderCount.textContent =
            `${orders.length} order${orders.length === 1 ? "" : "s"}`;

        tableBody.replaceChildren();

        if (orders.length === 0) {
            addMessageRow("You haven't placed any orders yet.");
            return;
        }

        orders.forEach(order => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = `#${order.order_id}`;

            const dateCell = document.createElement("td");
            dateCell.textContent = order.order_date
                ? new Date(order.order_date).toLocaleDateString("en-ZA")
                : "—";

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            const status = order.order_status || "Pending";

            statusBadge.className =
                `order-status ${status.toLowerCase()}`;

            statusBadge.textContent = status;
            statusCell.appendChild(statusBadge);

            const totalCell = document.createElement("td");
            totalCell.textContent =
                `R${Number(order.total_amount || 0).toFixed(2)}`;

            
const actionCell = document.createElement("td");

const viewButton = document.createElement("button");
viewButton.type = "button";
viewButton.className = "btn btn-small";
viewButton.textContent = "View Details";


viewButton.addEventListener("click", async () => {
    const panel = document.getElementById("orderDetailsPanel");
    const itemsBody = document.getElementById("detailItems");

    panel.hidden = false;
    itemsBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 4;
    loadingCell.textContent = "Loading order details...";
    loadingRow.appendChild(loadingCell);
    itemsBody.appendChild(loadingRow);

    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const data = await apiRequest(
            `/orders/${order.order_id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const selectedOrder = data.order;

        document.getElementById("detailId").textContent =
            `#${selectedOrder.order_id}`;

        document.getElementById("detailDate").textContent =
            selectedOrder.order_date
                ? new Date(selectedOrder.order_date)
                    .toLocaleString("en-ZA")
                : "—";

        document.getElementById("detailStatus").textContent =
            selectedOrder.order_status || "Pending";

        document.getElementById("detailTotal").textContent =
            `R${Number(selectedOrder.total_amount).toFixed(2)}`;

        document.getElementById("detailInstructions").textContent =
            selectedOrder.special_instructions ||
            "No special instructions";

        itemsBody.replaceChildren();

        const items = Array.isArray(selectedOrder.items)
            ? selectedOrder.items
            : [];

        if (items.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 4;
            cell.textContent = "No printing services found.";

            row.appendChild(cell);
            itemsBody.appendChild(row);
            return;
        }

        items.forEach(item => {
            const row = document.createElement("tr");

            const values = [
                item.service_name,
                item.quantity,
                `R${Number(item.unit_price).toFixed(2)}`,
                `R${Number(item.subtotal).toFixed(2)}`
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            itemsBody.appendChild(row);
        });

    } catch (error) {
        console.error("Order details error:", error);

        itemsBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent =
            `Unable to load order details: ${error.message}`;

        row.appendChild(cell);
        itemsBody.appendChild(row);
    }
});


actionCell.appendChild(viewButton);

row.append(
    idCell,
    dateCell,
    statusCell,
    totalCell,
    actionCell
);


            tableBody.appendChild(row);
        });

        console.log("My Orders loaded:", orders.length);

    } catch (error) {
        console.error("My Orders error:", error);

        orderCount.textContent = "Unavailable";
        addMessageRow("Unable to load your orders.");

        message.textContent = error.message;

        if (/401|403/.test(error.message)) {
            sessionStorage.removeItem("printhub_token");
            window.location.href = "login.html";
        }
    }
});
