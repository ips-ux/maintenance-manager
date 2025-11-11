import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import SeedDatabase from './pages/SeedDatabase';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/seed-database" element={<SeedDatabase />} />
                <Route path="/units" element={<div className="p-6">Units Page - Coming Soon</div>} />
                <Route path="/turns" element={<div className="p-6">Turns Page - Coming Soon</div>} />
                <Route path="/calendar" element={<div className="p-6">Calendar - Coming Soon</div>} />
                <Route path="/orders" element={<div className="p-6">Orders - Coming Soon</div>} />
                <Route path="/vendors" element={<div className="p-6">Vendors - Coming Soon</div>} />
              </Routes>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
