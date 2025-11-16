const Display = {
  socket: null,
  areaId: null,

  init: async () => {
    const params = new URLSearchParams(window.location.search);
    Display.areaId = params.get('areaId') ? Number(params.get('areaId')) : null;

    Display.initClock();
    Display.initSocket();
    await Display.loadInitial();
  },

  initClock: () => {
    const el = document.getElementById('timeClock');
    const tick = () => {
      if (el) {
        el.textContent = new Date().toLocaleTimeString("es-GT", { hour12: false });
      }
    };
    tick();
    setInterval(tick, 1000);
  },

  initSocket: () => {
    try {
      Display.socket = io();
      Display.socket.on("turno:update", () => Display.loadInitial());
      Display.socket.on("turno:llamado", () => Display.loadInitial());
    } catch (e) {
      console.warn("Socket error", e);
    }
  },

  loadInitial: async () => {
    try {
      const url = Display.areaId
        ? `/display/${Display.areaId}`
        : `/display`;

      const data = await Api.get(url);
      Display.render(data);
    } catch (e) {
      console.error("Display load error", e);
    }
  },

  render: (data) => {
    const areaName =
      data?.area?.NombreArea ??
      (data?.IdArea ? `Área ${data.IdArea}` : "Área");

    document.getElementById("areaName").textContent = areaName;

    document.getElementById("currentTurn").textContent =
      data?.TurnoActual || "—";

    const nextList = document.getElementById("nextList");
    const proximos = data?.proximos ?? [];

    nextList.innerHTML = proximos
      .slice(0, 5)
      .map(
        (t) =>
          `<li><strong>${t.NumeroTurno}</strong> — ${t.PacienteNombre || ""}</li>`
      )
      .join("");
  },
};

