// ======================
// LOGIN
// ======================

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Tomar los valores del formulario (tienen EXACTAMENTE los mismos nombres que usa tu backend)
    const Usuario = document.getElementById("Usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    const msg = document.getElementById("msg");
    msg.textContent = ""; // limpiar mensajes

    try {
        // Llamada al backend en Render
        const data = await Api.post("/api/auth/login", { Usuario, password });

        // Guardar token para el resto del sistema
        localStorage.setItem("token", data.token);

        // (Opcional) guardar datos del usuario
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirigir al dashboard o tu página principal
        window.location.href = "dashboard.html";

    } catch (err) {
        msg.textContent = err.message;  // Mostrar error en pantalla
    }
});
