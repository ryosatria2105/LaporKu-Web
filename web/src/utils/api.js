import axios from 'axios';

// Development (lokal): VITE_API_URL belum di-set → baseURL = '/api/v1'
//   SAMA PERSIS seperti sekarang, proxy Vite tetap menangani.
// Production (Vercel): VITE_API_URL = "https://xxx.up.railway.app" →
//   baseURL = "https://xxx.up.railway.app/api/v1"
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    // Perbaikan: authPages tidak include '/' agar landing page tetap bisa diakses
    // Redirect 401 selalu ke /login
const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];    const isAuthPage = authPages.some(p => currentPath.startsWith(p));

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