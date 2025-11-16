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
    const tick = () => { if(el) el.textContent = new Date().toLocaleTimeString(); };
    tick(); setInterval(tick, 1000);
  },
  initSocket: () => {
    try {
      Display.socket = io();
      Display.socket.on('turno:llamado', ()=> Display.loadInitial());
      Display.socket.on('turno:update', ()=> Display.loadInitial());
    } catch (e) { console.warn(e); }
  },
  loadInitial: async () => {
    try {
      const url = Display.areaId ? `/api/display/${Display.areaId}` : '/api/display';
      const data = await Api.get(url);
      Display.render(data);
    } catch (e) { console.error(e); }
  },
  render: (data) => {
    const areaName = data && data.area ? data.area.NombreArea : (data && data.IdArea ? `Área ${data.IdArea}` : 'Área');
    document.getElementById('areaName').textContent = areaName;
    document.getElementById('currentTurn').textContent = data && data.TurnoActual ? data.TurnoActual : '—';
    const nextList = document.getElementById('nextList');
    nextList.innerHTML = (data && data.proximos ? data.proximos : []).slice(0,5).map(t => `<li>${t.NumeroTurno} — ${t.PacienteNombre || ''}</li>`).join('');
  }
};

