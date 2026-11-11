import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('blog_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('blog_token')) {
      localStorage.removeItem('blog_token');
      localStorage.removeItem('blog_user');
      if (location.pathname.startsWith('/admin')) location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

