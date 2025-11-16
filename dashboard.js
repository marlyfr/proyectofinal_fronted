const Dashboard = {
  socket: null,
  init: async () => {
    try {
      const [areas, turnos] = await Promise.all([
        Api.get('/api/areas'),
        Api.get('/api/turns') // backend route: GET /api/turns
      ]);
      Dashboard.renderCards(areas, turnos);
      Dashboard.initSocket();
      Dashboard.showWelcome();
    } catch (e) {
      console.error('Dashboard init', e);
    }
  },
  showWelcome: () => {
    const user = Auth.getUser();
    const name = user ? (user.NombreCompleto || user.nombre || user.Usuario) : 'Usuario';
    document.getElementById('welcomeTitle').textContent = `Bienvenido, ${name}`;
  },
  renderCards: (areas=[], turnos=[]) => {
    const container = document.getElementById('cardsGrid');
    container.innerHTML = '';
    const totalTurnos = (turnos && turnos.length) || 0;
    const cards = [
      { title: 'Turnos totales', value: totalTurnos },
      { title: 'Áreas', value: (areas && areas.length) || 0 },
      { title: 'En espera', value: (turnos ? turnos.filter(t=>t.IdEstado===1).length : 0) },
      { title: 'Atendiendo', value: (turnos ? turnos.filter(t=>t.IdEstado===3).length : 0) }
    ];
    container.innerHTML = cards.map(c=>`
      <div class="card-mini">
        <div class="small">${c.title}</div>
        <div class="card-stat">${c.value}</div>
      </div>`).join('');
  },
  initSocket: () => {
    try {
      Dashboard.socket = io(); // if different origin use io(BASE_URL)
      Dashboard.socket.on('turno:update', ()=> Dashboard.init());
    } catch(e){ console.warn('Socket failed', e); }
  }
};

