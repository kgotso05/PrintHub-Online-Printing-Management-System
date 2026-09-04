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