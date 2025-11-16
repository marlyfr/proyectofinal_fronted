const Utils = {
  fmtDate: (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  },
  showMsg: (elId, msg, ok=true) => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = msg;
    el.className = ok ? 'text-success' : 'text-error';
    setTimeout(()=> el.textContent = '', 5000);
  }
};
