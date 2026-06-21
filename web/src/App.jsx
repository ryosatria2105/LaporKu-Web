import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardAdminPage from './pages/DashboardAdminPage'
import DashboardUserPage from './pages/DashboardUserPage'
import PrivateRoute from './components/PrivateRoute'
import PasswordRecoveryPage from './pages/PasswordRecoveryPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilPage from './pages/ProfilPage'
import KategoriPage from './pages/KategoriPage'

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Loading...</div></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  const SESSION_KEY = 'appSessionStarted'
  const isNewSession = !sessionStorage.getItem(SESSION_KEY)
  sessionStorage.setItem(SESSION_KEY, '1') // set immediately, before any check

  const ALLOW_DIRECT = ['/reset-password', '/forgot-password', '/', '/login', '/register']
  const isAllowed = ALLOW_DIRECT.some(p => location.pathname.startsWith(p))

  // Only block direct access if: fresh session AND not allowed path AND no user logged in
  if (isNewSession && !isAllowed && !user) {
    return <Navigate to="/" replace />
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/dashboard/admin" element={
        <PrivateRoute role="admin"><DashboardAdminPage /></PrivateRoute>
      } />
      <Route path="/profil" element={
        <PrivateRoute><ProfilPage /></PrivateRoute>
      } />
      <Route path="/dashboard/admin/kategori" element={
        <PrivateRoute role="admin"><KategoriPage /></PrivateRoute>
      } />
      <Route path="/dashboard/user" element={
        <PrivateRoute role="masyarakat"><DashboardUserPage/></PrivateRoute>
      } />
      <Route path="/dashboard" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} replace />
          : <Navigate to="/" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}