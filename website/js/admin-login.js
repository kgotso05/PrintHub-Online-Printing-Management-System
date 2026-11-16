
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("adminLoginForm");
    const message = document.getElementById("adminLoginMessage");
    const button = document.getElementById("adminLoginButton");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const email = document
            .getElementById("adminEmail").value.trim();

        const password = document
            .getElementById("adminPassword").value;

        button.disabled = true;
        button.textContent = "Verifying Administrator...";
        message.textContent = "";

        // Clear any previous admin session.
        sessionStorage.removeItem("printhub_admin_token");

        try {
            // Step 1: Authenticate credentials.
            const loginData = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!loginData.token) {
                throw new Error("No authentication token received.");
            }

            // Step 2: Verify administrator permissions.
            await apiRequest("/admin/test", {
                headers: {
                    Authorization: `Bearer ${loginData.token}`
                }
            });

            // Step 3: Save token only after admin verification.
            sessionStorage.setItem(
                "printhub_admin_token",
                loginData.token
            );

            message.style.color = "#17643a";
            message.textContent = "Administrator verified.";

            window.location.replace("dashboard.html");

        } catch (error) {
            console.error("Admin login failed:", error);

            message.style.color = "#b42318";

            message.textContent =
                error.message.includes("403")
                    ? "Access denied. Administrator account required."
                    : error.message;

        } finally {
            button.disabled = false;
            button.textContent = "Sign In as Administrator";
        }
    });
});
