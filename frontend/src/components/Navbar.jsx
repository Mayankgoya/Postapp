import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-2xl">
            <span className="bg-indigo-600 text-white px-2 py-1 rounded-lg">P</span>
            <span>PostApp</span>
          </div>
          
          <div className="flex space-x-8">
            <Link to="/" className="flex flex-col items-center text-gray-500 hover:text-linkedin-dark">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/connections" className="flex flex-col items-center text-gray-500 hover:text-linkedin-dark">
              <Users size={24} />
              <span className="text-xs mt-1">Network</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-linkedin-dark">
              <UserCircle size={24} />
              <span className="text-xs mt-1">Me</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-col items-center text-gray-500 hover:text-red-600 focus:outline-none">
              <LogOut size={24} />
              <span className="text-xs mt-1">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
