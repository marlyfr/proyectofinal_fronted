const API_BASE = "https://proyectofinal-1-81b6.onrender.com";

window.Api = {
  get: async (url) => {
    const token = localStorage.getItem("token");
    const res = await fetch(API_BASE + url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? "Bearer " + token : ""
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en GET");
    return data;
  },

  post: async (url, body) => {
    const token = localStorage.getItem("token");

    const res = await fetch(API_BASE + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? "Bearer " + token : ""
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error en POST");
    return data;
  }
};


