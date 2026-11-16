
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_admin_token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const tableBody = document.getElementById("adminOrdersTable");
    const count = document.getElementById("adminOrderCount");
    const message = document.getElementById("adminOrdersMessage");
    const logout = document.getElementById("adminLogout");

    logout.addEventListener("click", () => {
        sessionStorage.removeItem("printhub_admin_token");
        window.location.replace("login.html");
    });

    const transitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Processing", "Cancelled"],
        Processing: ["Ready", "Cancelled"],
        Ready: ["Completed", "Cancelled"],
        Completed: [],
        Cancelled: []
    };

    const money = value => `R${Number(value || 0).toFixed(2)}`;

    function showRow(text) {
        tableBody.replaceChildren();
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = text;
        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    async function loadOrders() {
        message.textContent = "";
        showRow("Loading orders...");

        try {
            await apiRequest("/admin/test", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await apiRequest("/admin/orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const orders = Array.isArray(data.orders)
                ? data.orders
                : [];

            count.textContent = `${orders.length} orders`;
            tableBody.replaceChildren();

            if (!orders.length) {
                showRow("No customer orders found.");
                return;
            }

            orders.forEach(order => {
                const row = document.createElement("tr");

                const values = [
                    `#${order.order_id}`,
                    order.customer_name || "—",
                    order.order_date
                        ? new Date(order.order_date)
                            .toLocaleDateString("en-ZA")
                        : "—",
                    order.order_status,
                    money(order.total_amount)
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                const actionCell = document.createElement("td");
                const allowed = transitions[order.order_status] || [];

                if (allowed.length === 0) {
                    actionCell.textContent = "No further changes";
                } else {
                    const select = document.createElement("select");
                    const placeholder = document.createElement("option");
                    placeholder.value = "";
                    placeholder.textContent = "Select status";
                    select.appendChild(placeholder);

                    allowed.forEach(status => {
                        const option = document.createElement("option");
                        option.value = status;
                        option.textContent = status;
                        select.appendChild(option);
                    });

                    const button = document.createElement("button");
                    button.className = "btn btn-small";
                    button.textContent = "Update";
                    button.type = "button";

                    button.addEventListener("click", async () => {
                        if (!select.value) {
                            message.textContent =
                                "Please select a new order status.";
                            return;
                        }

                        const newStatus = select.value;

                        if (!window.confirm(
                            `Change order #${order.order_id} to ${newStatus}?`
                        )) return;

                        button.disabled = true;
                        select.disabled = true;
                        message.textContent = "Updating order...";

                        try {
                            await apiRequest(
                                `/admin/orders/${order.order_id}/status`,
                                {
                                    method: "PATCH",
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        order_status: newStatus
                                    })
                                }
                            );

                            await loadOrders();
                            message.style.color = "#17643a";
                            message.textContent =
                                `Order #${order.order_id} updated to ${newStatus}.`;

                        } catch (error) {
                            message.style.color = "#b42318";
                            message.textContent = error.message;
                            button.disabled = false;
                            select.disabled = false;
                        }
                    });

                    actionCell.append(select, button);
                }

                row.appendChild(actionCell);
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Admin orders error:", error);
            count.textContent = "Unavailable";
            showRow("Unable to load orders.");
            message.style.color = "#b42318";
            message.textContent = error.message;

            if (error.message.includes("401") ||
                error.message.includes("403")) {
                sessionStorage.removeItem("printhub_admin_token");
                window.location.replace("login.html");
            }
        }
    }

    await loadOrders();
});
