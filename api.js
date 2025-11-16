// API wrapper - URL del backend
const BASE_URL = 'https://proyectofinal-1-81b6.onrender.com';

const Api = {
  _url: (path) => BASE_URL + path,

  get: async (path) => {
    const res = await fetch(Api._url(path), Api._opts('GET'));
    return Api._handle(res);
  },

  post: async (path, body) => {
    const res = await fetch(Api._url(path), Api._opts('POST', body));
    return Api._handle(res);
  },

  put: async (path, body) => {
    const res = await fetch(Api._url(path), Api._opts('PUT', body));
    return Api._handle(res);
  },

  del: async (path) => {
    const res = await fetch(Api._url(path), Api._opts('DELETE'));
    return Api._handle(res);
  },

  _opts: (method = 'GET', body = null) => {
    const headers = { 'Accept': 'application/json' };
    
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;

    if (body) headers['Content-Type'] = 'application/json';

    return body
      ? { method, headers, body: JSON.stringify(body) }
      : { method, headers };
  },

  _handle: async (res) => {
    const txt = await res.text();
    let data;

    try {
      data = txt ? JSON.parse(txt) : null;
    } catch {
      data = txt;
    }

    if (!res.ok) {
      const msg = data?.message || data || 'Error en la petición';
      throw new Error(msg);
    }

    return data;
  }
};

