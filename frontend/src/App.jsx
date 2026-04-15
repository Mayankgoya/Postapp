import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginSignup from './pages/LoginSignup';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import Connections from './pages/Connections';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <main className="max-w-6xl mx-auto pt-20 px-4">
          <Routes>
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/" element={<ProtectedRoute><HomeFeed /></ProtectedRoute>} />
            <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
