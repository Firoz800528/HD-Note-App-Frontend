import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import { useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5174';
axios.defaults.withCredentials = true;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    axios
      .get('')
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center">Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/app" /> : <SignIn onAuth={(u) => setUser(u)} />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/app" /> : <SignUp onAuth={(u) => setUser(u)} />}
      />
      <Route
        path="/app"
        element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/" />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
