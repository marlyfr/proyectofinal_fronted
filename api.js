const API_BASE = "https://proyectofinal-1-81b6.onrender.com";

export const Api = {
  get: async (url) => {
    const res = await fetch(API_BASE + url);
    if (!res.ok) throw new Error("Error en GET");
    return res.json();
  },

  post: async (url, body) => {
    const res = await fetch(API_BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Error en POST");
    return res.json();
  },
};


