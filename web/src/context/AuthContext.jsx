import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user dari server setiap kali app dimuat — data tersimpan di DB jadi tidak hilang
  useEffect(() => {
    authService.me()
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // setUser juga update data dari server agar foto & nama selalu sinkron
  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      setUser(res.data.data);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // tetap logout meski request gagal
    } finally {
      setUser(null);
      sessionStorage.removeItem('loginToastShown');
      sessionStorage.removeItem('userLoginToastShown');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}