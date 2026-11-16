
document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("printhub_admin_token");

    if (!token) {
        window.location.replace("login.html");
        return;
    }

    const table = document.getElementById("servicesTable");
    const search = document.getElementById("serviceSearch");
    const message = document.getElementById("servicesMessage");
    const panel = document.getElementById("editServicePanel");
    const form = document.getElementById("editServiceForm");
    const saveButton = document.getElementById("saveServiceBtn");

    let services = [];

    document.getElementById("adminLogout").addEventListener("click", () => {
        sessionStorage.removeItem("printhub_admin_token");
        window.location.replace("login.html");
    });

    function cell(row, value) {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
        return td;
    }

    function renderServices() {
        const term = search.value.trim().toLowerCase();

        const filtered = services.filter(service =>
            service.service_name.toLowerCase().includes(term) ||
            service.category_name.toLowerCase().includes(term)
        );

        table.replaceChildren();

        if (!filtered.length) {
            const row = document.createElement("tr");
            const td = cell(row, "No matching services found.");
            td.colSpan = 6;
            table.appendChild(row);
            return;
        }

        filtered.forEach(service => {
            const row = document.createElement("tr");

            cell(row, `#${service.service_id}`);
            cell(row, service.service_name);
            cell(row, service.category_name);
            cell(row, `R${Number(service.base_price).toFixed(2)}`);

            const available = Boolean(Number(service.is_available));
            cell(row, available ? "Available" : "Disabled");

            const action = document.createElement("td");
            const button = document.createElement("button");

            button.type = "button";
            button.className = "btn";
            button.textContent = "Edit";

            button.addEventListener("click", () => {
                document.getElementById("editServiceId").value =
                    service.service_id;

                document.getElementById("editServiceName").value =
                    service.service_name;

                document.getElementById("editServiceDescription").value =
                    service.description || "";

                document.getElementById("editServicePrice").value =
                    service.base_price;

                document.getElementById("editServiceAvailable").value =
                    available ? "1" : "0";

                panel.hidden = false;
                panel.scrollIntoView({ behavior: "smooth" });
            });

            action.appendChild(button);
            row.appendChild(action);
            table.appendChild(row);
        });
    }

    async function loadServices() {
        const data = await apiRequest("/admin/services", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        services = Array.isArray(data.services) ? data.services : [];

        const available = services.filter(
            s => Number(s.is_available) === 1
        ).length;

        document.getElementById("totalServices").textContent =
            services.length;

        document.getElementById("availableServices").textContent =
            available;

        document.getElementById("disabledServices").textContent =
            services.length - available;

        renderServices();
    }

    search.addEventListener("input", renderServices);

    document.getElementById("cancelServiceEdit")
        .addEventListener("click", () => {
            panel.hidden = true;
            form.reset();
        });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const serviceId = document.getElementById("editServiceId").value;

        const changes = {
            service_name:
                document.getElementById("editServiceName").value.trim(),

            description:
                document.getElementById("editServiceDescription").value,

            base_price:
                Number(document.getElementById("editServicePrice").value),

            is_available:
                document.getElementById("editServiceAvailable").value === "1"
        };

        saveButton.disabled = true;
        message.textContent = "Saving changes...";

        try {
            await apiRequest(`/admin/services/${serviceId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(changes)
            });

            await loadServices();

            panel.hidden = true;
            message.style.color = "#17643a";
            message.textContent = "Service updated successfully.";

        } catch (error) {
            message.style.color = "#b42318";
            message.textContent = error.message;
        } finally {
            saveButton.disabled = false;
        }
    });

    
// CREATE NEW PRINTING SERVICE

const createForm = document.getElementById("createServiceForm");
const createButton = document.getElementById("createServiceBtn");
const createMessage = document.getElementById("createServiceMessage");
const categorySelect = document.getElementById("newServiceCategory");

async function loadCategories() {
    const data = await apiRequest("/admin/categories", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    categorySelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a category";
    categorySelect.appendChild(placeholder);

    (data.categories || []).forEach(category => {
        const option = document.createElement("option");

        option.value = category.category_id;
        option.textContent = category.category_name;

        categorySelect.appendChild(option);
    });
}

createForm.addEventListener("submit", async event => {
    event.preventDefault();

    const newService = {
        service_name:
            document.getElementById("newServiceName").value.trim(),

        description:
            document.getElementById("newServiceDescription").value,

        category_id:
            Number(categorySelect.value),

        base_price:
            Number(document.getElementById("newServicePrice").value)
    };

    createButton.disabled = true;
    createMessage.textContent = "Creating service...";

    try {
        const result = await apiRequest("/admin/services", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(newService)
        });

        createForm.reset();
        await loadServices();

        createMessage.style.color = "#17643a";
        createMessage.textContent =
            `${result.message} (ID: ${result.service_id})`;

    } catch (error) {
        createMessage.style.color = "#b42318";
        createMessage.textContent = error.message;
    } finally {
        createButton.disabled = false;
    }
});


    try {
        await apiRequest("/admin/test", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        await Promise.all([
        loadServices(),
        loadCategories()
        ]);
        
    } catch (error) {
        console.error("Services error:", error);
        message.style.color = "#b42318";
        message.textContent = `Unable to load services: ${error.message}`;
    }
});
