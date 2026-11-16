
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    function showMessage(text, success = false) {
        if (!message) return;
        message.textContent = text;
        message.classList.toggle("success", success);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const button = loginForm.querySelector("button");
            button.disabled = true;
            showMessage("Signing in...");

            try {
                const data = await apiRequest("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("password").value
                    })
                });

                if (!data.token) {
                    throw new Error("No authentication token received.");
                }

                sessionStorage.setItem("printhub_token", data.token);
                window.location.href = "dashboard.html";

            } catch (error) {
                showMessage(error.message);
            } finally {
                button.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const button = registerForm.querySelector("button");
            button.disabled = true;
            showMessage("Creating account...");

            try {
                await apiRequest("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        full_name: document.getElementById("name").value.trim(),
                        email: document.getElementById("email").value.trim(),
                        password: document.getElementById("password").value
                    })
                });

                showMessage("Account created! Redirecting to login...", true);
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);

            } catch (error) {
                showMessage(error.message);
            } finally {
                button.disabled = false;
            }
        });
    }

    

/* PRINTHUB DASHBOARD - REAL MYSQL DATA */

async function loadDashboard() {
    const tableBody = document.getElementById("recentOrders");

    if (!tableBody) return;

    const token = sessionStorage.getItem("printhub_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/orders/my",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("printhub_token");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const orders = Array.isArray(data.orders) ? data.orders : [];

        // Calculate statistics
        const active = orders.filter(order => {
            const status = (order.order_status || "").toLowerCase();
            return status !== "completed" && status !== "cancelled";
        }).length;

        const completed = orders.filter(order =>
            (order.order_status || "").toLowerCase() === "completed"
        ).length;

        document.getElementById("activeOrders").textContent = active;
        document.getElementById("completedOrders").textContent = completed;
        document.getElementById("totalOrders").textContent = orders.length;

        // Display recent orders
        tableBody.replaceChildren();

        if (orders.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 4;
            cell.textContent = "No orders found.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        orders.slice(0, 5).forEach(order => {
            const row = document.createElement("tr");

            const values = [
                `#${order.order_id}`,
                order.order_date
                    ? new Date(order.order_date).toLocaleDateString("en-ZA")
                    : "—",
                order.order_status || "Pending",
                `R${Number(order.total_amount || 0).toFixed(2)}`
            ];

            
values.forEach((value, index) => {
    const cell = document.createElement("td");

    if (index === 2) {
        const badge = document.createElement("span");
        const status = String(value || "Pending");

        badge.className = "order-status";

        const statusClass = status
            .toLowerCase()
            .replace(/\s+/g, "-");

        badge.classList.add(statusClass);
        badge.textContent = status;

        cell.appendChild(badge);
    } else {
        cell.textContent = value;
    }

    row.appendChild(cell);
});


            tableBody.appendChild(row);
        });

        console.log("PrintHub dashboard loaded:", orders.length);

    } catch (error) {
        console.error("Dashboard error:", error);
        document.getElementById("dashboardMessage").textContent =
            `Unable to load orders: ${error.message}`;
    }
}

// Run after the page has loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDashboard);
} else {
    loadDashboard();
}

// Logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("printhub_token");
            window.location.href = "login.html";
        });
    }
});


});
