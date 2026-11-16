
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_admin_token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const tableBody = document.getElementById("customersTable");
    const searchInput = document.getElementById("customerSearch");
    const message = document.getElementById("customersMessage");
    const customerCount = document.getElementById("customerCount");

    const logout = document.getElementById("adminLogout");

    logout.addEventListener("click", () => {
        sessionStorage.removeItem("printhub_admin_token");
        window.location.replace("login.html");
    });

    let customers = [];

    function renderCustomers(searchTerm = "") {
        const term = searchTerm.trim().toLowerCase();

        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(term) ||
            customer.email.toLowerCase().includes(term)
        );

        customerCount.textContent =
            `${filtered.length} customer${filtered.length === 1 ? "" : "s"}`;

        tableBody.replaceChildren();

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.textContent = "No matching customers found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        filtered.forEach(customer => {
            const row = document.createElement("tr");

            const values = [
                `#${customer.id}`,
                customer.name,
                customer.email,
                customer.orders,
                `R${customer.totalValue.toFixed(2)}`
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    }

    try {
        // Verify administrator access.
        await apiRequest("/admin/test", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Retrieve orders containing customer information.
        const data = await apiRequest("/admin/orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const orders = Array.isArray(data.orders)
            ? data.orders
            : [];

        const customerMap = new Map();

        orders.forEach(order => {
            const id = order.customer_id;

            if (!customerMap.has(id)) {
                customerMap.set(id, {
                    id,
                    name: order.customer_name || "Unknown",
                    email: order.customer_email || "",
                    orders: 0,
                    totalValue: 0
                });
            }

            const customer = customerMap.get(id);

            customer.orders += 1;
            customer.totalValue += Number(order.total_amount || 0);
        });

        customers = [...customerMap.values()];

        document.getElementById("totalCustomers").textContent =
            customers.length;

        document.getElementById("customerOrderCount").textContent =
            orders.length;

        renderCustomers();

        searchInput.addEventListener("input", () => {
            renderCustomers(searchInput.value);
        });

    } catch (error) {
        console.error("Customer management error:", error);

        message.textContent = error.message;
        customerCount.textContent = "Unavailable";

        if (/401|403/.test(error.message)) {
            sessionStorage.removeItem("printhub_admin_token");
            window.location.replace("login.html");
        }
    }
});
