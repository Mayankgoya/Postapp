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
  
  // OTP Modal States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('forgot'); // 'forgot' or 'register'
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
        await api.post(`/auth/registration-otp?email=${encodeURIComponent(trimmedEmail)}`);
        setResetEmail(trimmedEmail);
        setModalMode('register');
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterConfirm = async () => {
    setIsProcessing(true);
    setError('');
    const otp = resetOtp.trim();
    try {
        await register(formData.name.trim(), formData.email.trim(), formData.password.trim(), otp);
        setSuccess(true);
        setTimeout(() => {
            setIsOtpModalOpen(false);
            setIsLogin(true);
            setSuccess(false);
            setResetOtp('');
        }, 2000);
    } catch (err) {
        setError(err.response?.data?.message || "Registration failed. Check your OTP.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSendOtp = async () => {
    if (!resetEmail) return;
    setIsProcessing(true);
    setError('');
    try {
        await api.post(`/auth/forgot-password?email=${encodeURIComponent(resetEmail)}`);
        setModalMode('forgot');
        setResetStep(2);
    } catch (err) {
        setError(err.response?.data?.message || "Failed to send OTP. Check your email.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = resetOtp.trim();
    if (!otp) return;
    setIsProcessing(true);
    setError('');
    try {
        const res = await api.post(`/auth/verify-otp?email=${encodeURIComponent(resetEmail)}&otp=${encodeURIComponent(otp)}`);
        if (res.data === true) {
            if (modalMode === 'register') {
                handleRegisterConfirm();
            } else {
                setResetStep(3);
            }
        } else {
            setError("Invalid OTP code.");
        }
    } catch (err) {
        setError("Invalid or expired OTP.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    setIsProcessing(true);
    setError('');
    try {
        await api.post('/auth/reset-password', {
            email: resetEmail,
            otp: resetOtp,
            newPassword: newPassword
        });
        setSuccess(true);
        setTimeout(() => {
            setIsOtpModalOpen(false);
            setResetStep(1);
            setSuccess(false);
            setResetOtp('');
            setNewPassword('');
        }, 2000);
    } catch (err) {
        setError("Failed to reset password.");
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

        {error && !isOtpModalOpen && (
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
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => { setModalMode('forgot'); setIsOtpModalOpen(true); setError(''); setResetStep(1); }}
                  className="text-[11px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest transition-colors"
                >
                  Forgot?
                </button>
              )}
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

      {/* OTP & Password Reset Modal */}
      <Modal 
        isOpen={isOtpModalOpen} 
        onClose={() => setIsOtpModalOpen(false)}
        title={modalMode === 'register' ? 'Verify Your Email' : 'Reset Password'}
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              {error}
            </div>
          )}

          {success ? (
            <div className="py-8 text-center animate-scale-in">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-surface-900 mb-2">
                {modalMode === 'register' ? 'Verified!' : 'Reset Successful!'}
              </h3>
              <p className="text-surface-500 font-medium">
                {modalMode === 'register' ? 'Your account has been created.' : 'Your password has been updated.'}
              </p>
            </div>
          ) : (
            <>
              {(modalMode === 'forgot' && resetStep === 1) && (
                <div className="space-y-4">
                  <p className="text-surface-500 text-center font-medium">Enter your email and we'll send you an OTP code.</p>
                  <Input 
                    label="Email Address" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    placeholder="your@email.com" 
                    leftIcon={Mail}
                  />
                  <Button onClick={handleSendOtp} className="w-full py-4" isLoading={isProcessing}>
                    Send OTP
                  </Button>
                </div>
              )}

              {((modalMode === 'forgot' && resetStep === 2) || (modalMode === 'register')) && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-surface-500 font-medium mb-1">Check your inbox for a 6-digit code</p>
                    <p className="text-brand-600 font-black text-sm">{resetEmail}</p>
                  </div>
                  <Input 
                    label="6-Digit OTP" 
                    maxLength={6} 
                    value={resetOtp} 
                    onChange={(e) => setResetOtp(e.target.value)} 
                    placeholder="000000" 
                    className="text-center text-3xl font-black tracking-[12px] placeholder:tracking-normal"
                  />
                  <Button 
                    onClick={modalMode === 'register' ? handleRegisterConfirm : handleVerifyOtp} 
                    className="w-full py-4" 
                    isLoading={isProcessing}
                  >
                    Verify & Continue
                  </Button>
                  {modalMode === 'forgot' && (
                    <button onClick={() => setResetStep(1)} className="w-full text-brand-600 font-bold text-sm hover:underline">
                      Incorrect email? Try again
                    </button>
                  )}
                </div>
              )}

              {(modalMode === 'forgot' && resetStep === 3) && (
                <div className="space-y-4">
                  <p className="text-surface-500 font-medium text-center">OTP Verified! Create your new password.</p>
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••" 
                    leftIcon={Lock}
                  />
                  <Button onClick={handleResetPassword} className="w-full py-4" isLoading={isProcessing}>
                    Update Password
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoginSignup;
