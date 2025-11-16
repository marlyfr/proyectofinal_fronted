const Turns = {
  socket: null,

  init: async () => {
    document.getElementById('turnForm').addEventListener('submit', Turns.create);
    document.getElementById('areaFilter').addEventListener('change', Turns.renderQueue);

    await Promise.all([Turns.loadAreas(), Turns.loadPacientes()]);
    await Turns.loadQueue();
    Turns.initSocket();
  },

  // ------------------------
  // CARGA ÁREAS
  // ------------------------
  loadAreas: async () => {
    Turns.areas = await Api.get('/api/areas');

    const select = document.getElementById('selectArea');
    const filter = document.getElementById('areaFilter');

    const opts = `
      <option value="">-- Seleccione --</option>
      ${Turns.areas.map(a => `<option value="${a.IdArea}">${a.NombreArea}</option>`).join('')}
    `;

    if (select) select.innerHTML = opts;
    if (filter) filter.innerHTML = opts;
  },

  // ------------------------
  // CARGA PACIENTES
  // ------------------------
  loadPacientes: async () => {
    try {
      Turns.pacientes = await Api.get('/api/patients');
      const sel = document.getElementById('selectPaciente');

      sel.innerHTML = `
        <option value="">-- Seleccione --</option>
        ${Turns.pacientes.map(p => `<option value="${p.IdPaciente}">${p.NombreCompleto}</option>`).join('')}
      `;
    } catch (e) {
      console.error(e);
    }
  },

  // ------------------------
  // CREAR TURNO
  // ------------------------
  create: async (e) => {
    e.preventDefault();

    const idPaciente = Number(document.getElementById('selectPaciente').value);
    const idArea = Number(document.getElementById('selectArea').value);

    if (!idPaciente || !idArea) {
      Utils.showMsg('turnMsg', 'Debe seleccionar paciente y área', false);
      return;
    }

    const payload = {
      IdPaciente: idPaciente,
      IdArea: idArea,
      Priorizacion: document.getElementById('priorizacion').value
    };

    try {
      await Api.post('/api/turns', payload);
      Utils.showMsg('turnMsg', 'Turno generado');
      await Turns.loadQueue();
    } catch (err) {
      Utils.showMsg('turnMsg', err.message, false);
    }
  },

  // ------------------------
  // CARGAR COLA COMPLETA
  // ------------------------
  loadQueue: async () => {
    try {
      Turns.queue = await Api.get('/api/turns');
      Turns.renderQueue();
    } catch (e) {
      console.error(e);
    }
  },

  // ------------------------
  // RENDERIZAR TABLA
  // ------------------------
  renderQueue: () => {
    const areaId = Number(document.getElementById('areaFilter').value || 0);

    // ORDEN CORRECTO: Prioridad Alta primero → luego número de turno
    const rows = (Turns.queue || [])
      .filter(t => !areaId || t.IdArea === areaId)
      .sort((a, b) => {
        if (a.Priorizacion === 'Alta' && b.Priorizacion !== 'Alta') return -1;
        if (b.Priorizacion === 'Alta' && a.Priorizacion !== 'Alta') return 1;
        return a.NumeroTurno - b.NumeroTurno;
      });

    const tbody = document.querySelector('#queueTable tbody');

    tbody.innerHTML = rows.map(t => `
      <tr>
        <td>${t.IdTurno}</td>
        <td>${t.NumeroTurno}</td>
        <td>${t.PacienteNombre || t.IdPaciente}</td>
        <td>${t.Priorizacion}</td>
        <td>${
          t.IdEstado === 1 ? 'Espera' :
          t.IdEstado === 2 ? 'Llamando' :
          t.IdEstado === 3 ? 'Atendiendo' :
          t.IdEstado === 4 ? 'Finalizado' : 'Ausente'
        }</td>
        <td>
          <button class="action-btn action-primary small" onclick="Turns.call(${t.IdTurno})">Llamar</button>
          <button class="action-btn action-primary small" onclick="Turns.start(${t.IdTurno})">Atender</button>
          <button class="action-btn action-danger small" onclick="Turns.finish(${t.IdTurno})">Finalizar</button>
          <button class="action-btn small" onclick="Turns.markAbsent(${t.IdTurno})">Ausente</button>
        </td>
      </tr>
    `).join('');
  },

  // ------------------------
  // CAMBIOS DE ESTADO
  // ------------------------
  call: async (id) => {
    try { await Api.put(`/api/turns/${id}/llamar`); await Turns.loadQueue(); }
    catch (e) { alert(e.message); }
  },

  start: async (id) => {
    try { await Api.put(`/api/turns/${id}/atender`); await Turns.loadQueue(); }
    catch (e) { alert(e.message); }
  },

  finish: async (id) => {
    try { await Api.put(`/api/turns/${id}/finalizar`); await Turns.loadQueue(); }
    catch (e) { alert(e.message); }
  },

  markAbsent: async (id) => {
    try { await Api.put(`/api/turns/${id}/ausente`); await Turns.loadQueue(); }
    catch (e) { alert(e.message); }
  },

  // ------------------------
  // SOCKETS
  // ------------------------
  initSocket: () => {
    try {
      Turns.socket = io();
      Turns.socket.on('turno:update', () => Turns.loadQueue());
    } catch (e) {
      console.warn('Socket error', e);
    }
  }
};

