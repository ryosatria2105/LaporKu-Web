import React from 'react'
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

function MobileGuard({ children }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const [bypass, setBypass] = React.useState(false);
  if (isMobile && !bypass) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'#F8FAFC', textAlign:'center' }}>
      <svg width="52" height="52" fill="none" viewBox="0 0 24 24" stroke="#3B82F6" strokeWidth={1.5} style={{ marginBottom:'20px' }}>
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
      <h2 style={{ fontSize:'20px', fontWeight:700, color:'#0F172A', margin:'0 0 10px' }}>Tampilan Tidak Optimal</h2>
      <p style={{ fontSize:'14px', color:'#64748B', margin:'0 0 8px', lineHeight:1.6, maxWidth:'300px' }}>Dashboard LaporKu dirancang untuk layar laptop atau PC (min. 1024px).</p>
      <p style={{ fontSize:'14px', color:'#64748B', margin:'0 0 24px', lineHeight:1.6, maxWidth:'300px' }}>Silakan buka di perangkat yang lebih besar untuk pengalaman terbaik.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%', maxWidth:'280px' }}>
        <button onClick={() => window.location.href = '/login'} style={{ background:'#3B82F6', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 28px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>Kembali ke Login</button>
        <button onClick={() => setBypass(true)} style={{ background:'none', color:'#64748B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 28px', fontSize:'13px', cursor:'pointer' }}>Lanjutkan di perangkat ini</button>
      </div>
    </div>
  );
  return children;
}

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
        <PrivateRoute role="admin"><MobileGuard><DashboardAdminPage /></MobileGuard></PrivateRoute>
      } />
      <Route path="/profil" element={
        <PrivateRoute><ProfilPage /></PrivateRoute>
      } />
      <Route path="/dashboard/admin/kategori" element={
        <PrivateRoute role="admin"><KategoriPage /></PrivateRoute>
      } />
      <Route path="/dashboard/user" element={
        <PrivateRoute role="masyarakat"><MobileGuard><DashboardUserPage/></MobileGuard></PrivateRoute>
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