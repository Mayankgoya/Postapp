import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/connections', label: 'Network', icon: Users },
    { path: '/profile', label: 'Me', icon: UserCircle },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-surface-200 fixed w-full top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <div className="bg-brand-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-100 group-hover:bg-brand-700 transition-colors">
              P
            </div>
            <span className="text-surface-900 font-black text-2xl tracking-tighter hidden sm:block">PostApp</span>
          </Link>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/profile' && location.pathname.startsWith('/profile'));
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`
                    flex flex-col items-center px-4 py-1 rounded-xl transition-all relative group
                    ${isActive ? 'text-brand-600' : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'}
                  `}
                >
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-active:scale-95" />
                  <span className={`text-[10px] sm:text-xs mt-0.5 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-8 h-1 bg-brand-600 rounded-full animate-in fade-in zoom-in duration-300" />
                  )}
                </Link>
              );
            })}
            
            <div className="h-8 w-[1px] bg-surface-200 mx-2 hidden sm:block" />
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="px-2 sm:px-4 text-red-500 hover:bg-red-50 hover:text-red-600"
              leftIcon={LogOut}
            >
              <span className="hidden sm:inline italic">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
