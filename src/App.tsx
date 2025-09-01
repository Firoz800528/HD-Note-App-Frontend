import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
axios.defaults.withCredentials = true;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Check user session
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          const res = await axios.get('/api/me');
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/app" />
          ) : (
            <SignIn
              onAuth={(u) => {
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
              }}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/app" />
          ) : (
            <SignUp
              onAuth={(u) => {
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
              }}
            />
          )
        }
      />

      <Route
        path="/app"
        element={
          user ? (
            <Dashboard
              user={user}
              onLogout={() => {
                setUser(null);
                localStorage.removeItem('user');
              }}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
