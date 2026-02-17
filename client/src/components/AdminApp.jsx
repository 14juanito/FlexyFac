import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    setAdmin(null);
  };

  return (
    <AnimatePresence mode="wait">
      {!admin ? (
        <AdminLogin key="admin-login" onLogin={handleLogin} />
      ) : (
        <AdminDashboard key="admin-dashboard" admin={admin} onLogout={handleLogout} />
      )}
    </AnimatePresence>
  );
}