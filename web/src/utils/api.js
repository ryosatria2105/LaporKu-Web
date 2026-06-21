import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';
    const currentPath = window.location.pathname;

    // Silent 401 di /auth/me — normal saat belum login di landing page
    if (status === 401 && url.includes('/auth/me')) {
      return Promise.reject(error);
    }

    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.some(p => currentPath.startsWith(p));

    if (status === 401 && !isAuthPage) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (!error.response) {
      error.message = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    }

    return Promise.reject(error);
  }
);

export default api;