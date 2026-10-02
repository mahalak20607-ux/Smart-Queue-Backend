const API_URL = "http://localhost:5000";


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message = document.getElementById("loginMessage");
        const button = document.getElementById("loginButton");

        message.textContent = "";
        message.className = "form-message";

        button.disabled = true;
        button.textContent = "Signing in...";


        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message || "Login failed"
                );
            }


            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            message.textContent = "Login successful!";
            message.className =
                "form-message success";


            setTimeout(() => {

                if (data.user.role === "admin") {

                    window.location.href =
                        "admin-dashboard.html";

                } else {

                    window.location.href =
                        "user-dashboard.html";
                }

            }, 700);


        } catch (error) {

            message.textContent =
                error.message;

            message.className =
                "form-message error";

            button.disabled = false;
            button.textContent = "Sign In";
        }

    });
}