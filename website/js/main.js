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