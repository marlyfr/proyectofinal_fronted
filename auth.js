document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value; 
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Usuario: usuario, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error en login");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", data.user.usuario);

        alert("✔ Login correcto");
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error(err);
        alert("Error conectando con el servidor");
    }
});

