import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Key, Lock, CheckCircle, ArrowRight, User } from 'lucide-react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    const trimmedEmail = formData.email.trim();
    try {
      if (isLogin) {
        await login(trimmedEmail, formData.password.trim());
        navigate('/');
      } else {
        await register(formData.name.trim(), trimmedEmail, formData.password.trim());
        setSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(false);
          setFormData({ name: '', email: '', password: '' });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] animate-fade-in">
      <Card className="w-full max-w-md p-10 animate-slide-up">
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
                <div className="bg-brand-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl shadow-brand-100">P</div>
                <span className="text-surface-900 font-extrabold text-3xl tracking-tighter">PostApp</span>
            </div>
        </div>
        
        <h2 className="text-2xl font-black mb-2 text-center text-surface-900">
          {isLogin ? 'Welcome back' : 'Get started for free'}
        </h2>
        <p className="text-center text-surface-500 text-sm mb-8 font-medium">
            {isLogin ? 'Enter your details to sign in to your professional hub' : 'Create an account to start networking globally'}
        </p>

        {success && (
            <div className="bg-green-50 text-green-600 p-4 mb-6 rounded-xl text-sm font-bold flex items-center gap-3 border border-green-100">
                <CheckCircle size={18} /> Account created! Redirecting to login...
            </div>
        )}

        {error && (
            <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-in shake-1 duration-300">
                <Lock size={18} /> {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <Input 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="John Doe" 
              leftIcon={User} 
            />
          )}
          
          <Input 
            label="Email Address" 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            placeholder="email@example.com" 
            leftIcon={Mail} 
          />
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black text-surface-400 uppercase tracking-widest pl-1">Password</label>
            </div>
            <Input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="••••••••" 
              leftIcon={Lock} 
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-4 text-lg" 
            isLoading={isProcessing}
            rightIcon={!isProcessing ? ArrowRight : null}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-500 font-bold">
            {isLogin ? "New to PostApp?" : 'Already using PostApp?'}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="ml-2 text-brand-600 hover:text-brand-700 underline underline-offset-4 decoration-2 decoration-brand-200 hover:decoration-brand-600 transition-all"
            >
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginSignup;
