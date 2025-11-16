const Display = {
  socket: null,
  areaId: null,

  init: async () => {
    // Detectar área por URL
    const params = new URLSearchParams(window.location.search);
    Display.areaId = params.get('areaId') ? Number(params.get('areaId')) : null;

    Display.initClock();
    Display.initSocket();
    await Display.loadInitial();
  },

  // Reloj permanente
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

  // Socket para actualizar display
  initSocket: () => {
    try {
      Display.socket = io();

      // Cualquier cambio en turnos refresca pantalla
      Display.socket.on("turno:update", () => Display.loadInitial());
      Display.socket.on("turno:llamado", () => Display.loadInitial());
    } catch (e) {
      console.warn("Socket error", e);
    }
  },

  // Carga inicial desde backend
  loadInitial: async () => {
    try {
      const url = Display.areaId
        ? `/api/display/${Display.areaId}`
        : `/api/display`;

      const data = await Api.get(url);
      Display.render(data);
    } catch (e) {
      console.error("Display load error", e);
    }
  },

  // Renderizar en HTML
  render: (data) => {
    // Nombre del área
    const areaName =
      data?.area?.NombreArea ??
      (data?.IdArea ? `Área ${data.IdArea}` : "Área");

    document.getElementById("areaName").textContent = areaName;

    // Turno actual
    document.getElementById("currentTurn").textContent =
      data?.TurnoActual || "—";

    // Próximos turnos
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


