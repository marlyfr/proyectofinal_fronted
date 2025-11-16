const Patients = {
  socket: null,
  editingId: null,

  init: async () => {
    document.getElementById('patientForm').addEventListener('submit', Patients.handleSubmit);
    document.getElementById('searchPatient').addEventListener('input', Patients.renderList);
    await Patients.loadAll();
    Patients.initSocket();
  },

  loadAll: async () => {
    try {
      Patients.list = await Api.get('/api/patients');
      Patients.renderList();

      // Para turns.html
      const selectPaciente = document.getElementById('selectPaciente');
      if (selectPaciente) {
        selectPaciente.innerHTML =
          '<option value="">-- Seleccione --</option>' +
          Patients.list
            .map(
              p =>
                `<option value="${p.IdPaciente}">${p.NombreCompleto} (${p.DPI || 'sin DPI'})</option>`
            )
            .join('');
      }
    } catch (e) {
      console.error(e);
    }
  },

  renderList: () => {
    const q = document.getElementById('searchPatient').value.toLowerCase();
    const tbody = document.querySelector('#patientsTable tbody');

    const rows = (Patients.list || []).filter(
      p =>
        (p.NombreCompleto || '').toLowerCase().includes(q) ||
        (p.DPI || '').toLowerCase().includes(q)
    );

    tbody.innerHTML = rows
      .map(
        p => `
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
    `
      )
      .join('');
  },

  handleSubmit: async e => {
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
      if (Patients.editingId) {
        // MODO EDITAR
        await Api.put(`/api/patients/${Patients.editingId}`, payload);
        Utils.showMsg('patientMsg', 'Paciente actualizado');
        Patients.editingId = null;
      } else {
        // MODO CREAR
        await Api.post('/api/patients', payload);
        Utils.showMsg('patientMsg', 'Paciente guardado');
        Patients.socket && Patients.socket.emit('paciente:creado');
      }

      await Patients.loadAll();
      document.getElementById('patientForm').reset();

    } catch (err) {
      Utils.showMsg(


