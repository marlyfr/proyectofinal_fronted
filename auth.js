document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const Usuario = document.getElementById("Usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    msg.textContent = "";

    try {
        // RUTA CORRECTA
        const data = await Api.post("/api/auth/login", { Usuario, password });

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "dashboard.html";

    } catch (err) {
        msg.textContent = err.message;
    }
});
