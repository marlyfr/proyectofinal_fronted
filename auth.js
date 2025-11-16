// ======================
// LOGIN
// ======================

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const Usuario = document.getElementById("Usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("msg");

    msg.textContent = "";

    try {
        // Petición al backend en Render
        const data = await Api.post("/api/auth/login", { Usuario, password });

        // Guardar token y datos de usuario
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // REDIRECCIÓN A LA SIGUIENTE VENTANA
        window.location.href = "dashboard.html";  // ← CAMBIA ESTO AL HTML QUE TU QUIERAS

    } catch (err) {
        msg.textContent = err.message;
    }
});
