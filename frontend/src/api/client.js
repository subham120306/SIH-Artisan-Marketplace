import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  return 'https://SubhamPattnaik.pythonanywhere.com/api';
};

const BASE_URL = getBaseURL();
const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh');
        const { data } = await axios.post(`${BASE_URL}/auth/login/refresh/`, { refresh });
        localStorage.setItem('access', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;