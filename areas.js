const Areas = {
  init: async () => {
    document.getElementById('areaForm').addEventListener('submit', Areas.save);
    await Areas.load();
  },
  load: async () => {
    try {
      Areas.list = await Api.get('/api/areas');
      Areas.render();
      ['selectArea','areaFilter'].forEach(id=>{
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = '<option value="">-- Seleccione --</option>' + Areas.list.map(a=>`<option value="${a.IdArea}">${a.NombreArea}</option>`).join('');
      });
    } catch (e) { console.error(e); }
  },
  render: () => {
    const tbody = document.querySelector('#areasTable tbody');
    tbody.innerHTML = (Areas.list || []).map(a=>`
      <tr>
        <td>${a.IdArea}</td>
        <td>${a.NombreArea}</td>
        <td>${a.Descripcion || ''}</td>
        <td>${a.Activo ? 'Sí' : 'No'}</td>
        <td>
          <button class="action-btn action-primary small" onclick="Areas.edit(${a.IdArea})">Editar</button>
          <button class="action-btn action-danger small" onclick="Areas.remove(${a.IdArea})">Borrar</button>
        </td>
      </tr>
    `).join('');
  },
  save: async (e) => {
    e.preventDefault();
    const id = document.getElementById('idArea').value;
    const payload = {
      NombreArea: document.getElementById('nombreArea').value,
      Descripcion: document.getElementById('descripcion').value,
      Activo: document.getElementById('activo').checked
    };
    try {
      if (id) await Api.put(`/api/areas/${id}`, payload);
      else await Api.post('/api/areas', payload);
      Utils.showMsg('areaMsg','Área guardada');
      document.getElementById('areaForm').reset();
      await Areas.load();
    } catch (e) { Utils.showMsg('areaMsg', e.message, false); }
  },
  edit: (id) => {
    const a = Areas.list.find(x=>x.IdArea===id);
    if (!a) return;
    document.getElementById('idArea').value = a.IdArea;
    document.getElementById('nombreArea').value = a.NombreArea;
    document.getElementById('descripcion').value = a.Descripcion || '';
    document.getElementById('activo').checked = a.Activo;
  },
  remove: async (id) => {
    if (!confirm('Eliminar área?')) return;
    try {
      await Api.del(`/api/areas/${id}`);
      await Areas.load();
    } catch (e) { alert('Error: ' + e.message); }
  }
};

