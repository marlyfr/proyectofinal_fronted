const Dashboard = {
  socket: null,

  init: async () => {
    try {
      const [areas, patients, turns] = await Promise.all([
        Api.get('/api/areas'),
        Api.get('/api/patients'),
        Api.get('/api/turns')
      ]);

      Dashboard.renderCards(areas, patients, turns);
      Dashboard.renderLastTurns(turns);
      Dashboard.renderLastPatients(patients);

      Dashboard.initSocket();
    } catch (e) {
      console.error("Error inicializando Dashboard:", e);
    }
  },

  /* --- TARJETAS RESUMEN --- */
  renderCards: (areas = [], patients = [], turns = []) => {
    document.getElementById("countAreas").textContent = areas.length;
    document.getElementById("countPatients").textContent = patients.length;

    const pending = turns.filter(t => t.IdEstado === 1).length;
    const active = turns.filter(t => t.IdEstado === 3).length;

    document.getElementById("countTurnsPending").textContent = pending;
    document.getElementById("countTurnsActive").textContent = active;
  },

  /* --- ÚLTIMOS TURNOS --- */
  renderLastTurns: (turns = []) => {
    const tbody = document.querySelector("#lastTurnsTable tbody");
    tbody.innerHTML = "";

    const last = turns.slice(-10).reverse(); // últimos 10

    last.forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${t.IdTurno}</td>
          <td>${t.CodigoTurno || "-"}</td>
          <td>${t.Area || "-"}</td>
          <td>${t.Paciente || "-"}</td>
          <td>${Dashboard.formatEstado(t.IdEstado)}</td>
        </tr>
      `;
    });
  },

  formatEstado: (estado) => {
    switch (estado) {
      case 1: return "En espera";
      case 2: return "Llamado";
      case 3: return "Atendiendo";
      case 4: return "Finalizado";
      default: return "—";
    }
  },

  /* --- ÚLTIMOS PACIENTES --- */
  renderLastPatients: (patients = []) => {
    const tbody = document.querySelector("#lastPatientsTable tbody");
    tbody.innerHTML = "";

    const last = patients.slice(-10).reverse();

    last.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>${p.IdPaciente}</td>
          <td>${p.NombreCompleto}</td>
          <td>${p.DPI || "-"}</td>
          <td>${p.Telefono || "-"}</td>
        </tr>
      `;
    });
  },

  /* --- SOCKET.IO --- */
  initSocket: () => {
    try {
      Dashboard.socket = io();
      Dashboard.socket.on("turno:update", () => {
        Dashboard.init(); // refrescar dashboard al actualizar turnos
      });
    } catch (e) {
      console.warn("Socket no disponible:", e);
    }
  }
};

