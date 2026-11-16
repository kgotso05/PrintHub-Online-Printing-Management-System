
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_admin_token");
    const message = document.getElementById("adminMessage");
    const tableBody = document.getElementById("adminRecentOrders");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const logoutBtn = document.getElementById("adminLogout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("printhub_admin_token");
            window.location.replace("login.html");
        });
    }

    try {
        // Confirm that the logged-in user is an administrator.
        await apiRequest("/admin/test", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Retrieve all customer orders.
        const data = await apiRequest("/admin/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        
// Retrieve printing service statistics
const servicesData = await apiRequest("/admin/services", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

const services = Array.isArray(servicesData.services)
    ? servicesData.services
    : [];

const availableServices = services.filter(
    service => Number(service.is_available) === 1
).length;

const disabledServices = services.length - availableServices;

document.getElementById("dashboardAvailableServices").textContent =
    availableServices;

document.getElementById("dashboardDisabledServices").textContent =
    disabledServices;


        const orders = Array.isArray(data.orders)
            ? data.orders
            : [];

        const pending = orders.filter(order =>
            ["Pending", "Confirmed", "Processing", "Ready"]
                .includes(order.order_status)
        ).length;

        const completed = orders.filter(order =>
            order.order_status === "Completed"
        ).length;

        // Revenue from completed orders only.
        const revenue = orders
            .filter(order => order.order_status === "Completed")
            .reduce(
                (total, order) =>
                    total + Number(order.total_amount || 0),
                0
            );

        document.getElementById("adminTotalOrders").textContent =
            orders.length;

        document.getElementById("adminPendingOrders").textContent =
            pending;

        document.getElementById("adminCompletedOrders").textContent =
            completed;

        document.getElementById("adminRevenue").textContent =
            `R${revenue.toFixed(2)}`;

        tableBody.replaceChildren();

        if (orders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No customer orders found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        orders.slice(0, 5).forEach(order => {
            const row = document.createElement("tr");

            const values = [
                `#${order.order_id}`,
                order.customer_name,
                order.order_date
                    ? new Date(order.order_date)
                        .toLocaleDateString("en-ZA")
                    : "—",
                order.order_status,
                `R${Number(order.total_amount).toFixed(2)}`
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "—";
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        if (/401|403/.test(error.message)) {
            sessionStorage.removeItem("printhub_admin_token");
            window.location.replace("login.html");
            return;
        }

        if (message) {
            message.textContent =
                `Unable to load admin dashboard: ${error.message}`;
        }
    }
});
