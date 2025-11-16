const Turns = {
  socket: null,
  init: async () => {
    document.getElementById('turnForm').addEventListener('submit', Turns.create);
    document.getElementById('areaFilter').addEventListener('change', Turns.renderQueue);
    await Promise.all([Turns.loadAreas(), Turns.loadPacientes()]);
    await Turns.loadQueue();
    Turns.initSocket();
  },
  loadAreas: async () => {
    Turns.areas = await Api.get('/api/areas');
    const sel = document.getElementById('selectArea');
    const filter = document.getElementById('areaFilter');
    const opts = '<option value="">-- Seleccione --</option>' + (Turns.areas||[]).map(a=>`<option value="${a.IdArea}">${a.NombreArea}</option>`).join('');
    if (sel) sel.innerHTML = opts;
    if (filter) filter.innerHTML = opts;
  },
  loadPacientes: async () => {
    try {
      Turns.pacientes = await Api.get('/api/patients');
      const sel = document.getElementById('selectPaciente');
      if (sel) sel.innerHTML = '<option value="">-- Seleccione --</option>' + (Turns.pacientes||[]).map(p=>`<option value="${p.IdPaciente}">${p.NombreCompleto}</option>`).join('');
    } catch (e) { console.error(e); }
  },
  create: async (e) => {
    e.preventDefault();
    const payload = {
      IdPaciente: Number(document.getElementById('selectPaciente').value),
      IdArea: Number(document.getElementById('selectArea').value),
      Priorizacion: document.getElementById('priorizacion').value
    };
    try {
      await Api.post('/api/turns', payload);
      Utils.showMsg('turnMsg', 'Turno generado');
      await Turns.loadQueue();
    } catch (err) { Utils.showMsg('turnMsg', err.message, false); }
  },
  loadQueue: async () => {
    try {
      Turns.queue = await Api.get('/api/turns');
      Turns.renderQueue();
    } catch (e) { console.error(e); }
  },
  renderQueue: () => {
    const areaId = Number(document.getElementById('areaFilter').value || 0);
    const rows = (Turns.queue || []).filter(t=> !areaId || t.IdArea === areaId).sort((a,b)=> (a.Priorizacion==='Alta'? -1:1) - (b.Priorizacion==='Alta'? -1:1) || a.NumeroTurno - b.NumeroTurno);
    const tbody = document.querySelector('#queueTable tbody');
    tbody.innerHTML = rows.map(t => `
      <tr>
        <td>${t.IdTurno}</td>
        <td>${t.NumeroTurno}</td>
        <td>${t.PacienteNombre || t.IdPaciente}</td>
        <td>${t.Priorizacion}</td>
        <td>${t.IdEstado === 1 ? 'Espera' : t.IdEstado === 2 ? 'Llamando' : t.IdEstado === 3 ? 'Atendiendo' : t.IdEstado === 4 ? 'Finalizado' : 'Ausente'}</td>
        <td>
          <button class="action-btn action-primary small" onclick="Turns.call(${t.IdTurno})">Llamar</button>
          <button class="action-btn action-primary small" onclick="Turns.start(${t.IdTurno})">Atender</button>
          <button class="action-btn action-danger small" onclick="Turns.finish(${t.IdTurno})">Finalizar</button>
          <button class="action-btn small" onclick="Turns.markAbsent(${t.IdTurno})">Ausente</button>
        </td>
      </tr>
    `).join('');
  },
  call: async (id) => {
    try {
      await Api.put(`/api/turns/${id}/llamar`);
      await Turns.loadQueue();
    } catch (e) { alert(e.message); }
  },
  start: async (id) => {
    try {
      await Api.put(`/api/turns/${id}/atender`);
      await Turns.loadQueue();
    } catch (e) { alert(e.message); }
  },
  finish: async (id) => {
    try {
      await Api.put(`/api/turns/${id}/finalizar`);
      await Turns.loadQueue();
    } catch (e) { alert(e.message); }
  },
  markAbsent: async (id) => {
    try {
      await Api.put(`/api/turns/${id}/ausente`);
      await Turns.loadQueue();
    } catch (e) { alert(e.message); }
  },
  initSocket: () => {
    try {
      Turns.socket = io();
      Turns.socket.on('turno:update', ()=> Turns.loadQueue());
    } catch(e){ console.warn('socket error',e); }
  }
};
