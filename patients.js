const Patients = {
  socket: null,
  init: async () => {
    document.getElementById('patientForm').addEventListener('submit', Patients.handleCreate);
    document.getElementById('searchPatient').addEventListener('input', Patients.renderList);
    await Patients.loadAll();
    Patients.initSocket();
  },
  loadAll: async () => {
    try {
      Patients.list = await Api.get('/api/patients');
      Patients.renderList();
      const selectPaciente = document.getElementById('selectPaciente');
      if (selectPaciente) {
        selectPaciente.innerHTML = '<option value="">-- Seleccione --</option>' + Patients.list.map(p => `<option value="${p.IdPaciente}">${p.NombreCompleto} (${p.DPI||'sin DPI'})</option>`).join('');
      }
    } catch (e) {
      console.error(e);
    }
  },
  renderList: () => {
    const q = document.getElementById('searchPatient').value.toLowerCase();
    const tbody = document.querySelector('#patientsTable tbody');
    const rows = (Patients.list || []).filter(p => (p.NombreCompleto||'').toLowerCase().includes(q) || (p.DPI||'').includes(q));
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td>${p.IdPaciente}</td>
        <td>${p.DPI || ''}</td>
        <td>${p.NombreCompleto}</td>
        <td>${p.Telefono || ''}</td>
        <td>${p.Correo || ''}</td>
        <td>
          <button class="action-btn action-primary small" onclick="Patients.fillEdit(${p.IdPaciente})">Editar</button>
          <button class="action-btn action-danger small" onclick="Patients.remove(${p.IdPaciente})">Borrar</button>
        </td>
      </tr>
    `).join('');
  },
  handleCreate: async (e) => {
    e.preventDefault();
    const payload = {
      DPI: document.getElementById('dpi').value || null,
      NombreCompleto: document.getElementById('nombreCompleto').value,
      FechaNacimiento: document.getElementById('fechaNacimiento').value || null,
      Telefono: document.getElementById('telefono').value || null,
      Correo: document.getElementById('correo').value || null,
      Direccion: document.getElementById('direccion').value || null
    };
    try {
      await Api.post('/api/patients', payload);
      Utils.showMsg('patientMsg','Paciente guardado');
      await Patients.loadAll();
      document.getElementById('patientForm').reset();
      Patients.socket && Patients.socket.emit('paciente:creado');
    } catch (err) {
      Utils.showMsg('patientMsg', err.message, false);
    }
  },
  fillEdit: (id) => {
    const p = Patients.list.find(x=>x.IdPaciente===id);
    if (!p) return;
    document.getElementById('dpi').value = p.DPI || '';
    document.getElementById('nombreCompleto').value = p.NombreCompleto;
    document.getElementById('fechaNacimiento').value = p.FechaNacimiento ? p.FechaNacimiento.split('T')[0] : '';
    document.getElementById('telefono').value = p.Telefono || '';
    document.getElementById('correo').value = p.Correo || '';
    document.getElementById('direccion').value = p.Direccion || '';
  },
  remove: async (id) => {
    if (!confirm('¿Eliminar paciente?')) return;
    try {
      await Api.del(`/api/patients/${id}`);
      await Patients.loadAll();
      Utils.showMsg('patientMsg','Paciente eliminado');
    } catch (e) { Utils.showMsg('patientMsg', e.message, false); }
  },
  initSocket: () => {
    try {
      Patients.socket = io();
    } catch(e){ console.warn('socket failed',e); }
  }
};
