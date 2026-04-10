import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Key, Lock, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  // OTP Modal States
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('forgot'); // 'forgot' or 'register'
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password (for forgot)
  const [otpStep, setOtpStep] = useState(1); // 1: Sending, 2: Entering OTP
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
        // Registration Flow with OTP
        await api.post(`/auth/registration-otp?email=${trimmedEmail}`);
        setResetEmail(trimmedEmail);
        setModalMode('register');
        setIsOtpModalOpen(true);
        setOtpStep(2); // Go straight to entering OTP
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
        await api.post(`/auth/forgot-password?email=${resetEmail}`);
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
        const res = await api.post(`/auth/verify-otp?email=${resetEmail}&otp=${otp}`);
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
    <div className="flex justify-center items-center h-[85vh] bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2 text-indigo-600 font-black text-4xl">
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-xl shadow-lg shadow-indigo-200">P</span>
                <span className="tracking-tighter">PostApp</span>
            </div>
        </div>
        
        <h2 className="text-2xl font-black mb-2 text-center text-gray-900">
          {isLogin ? 'Welcome back' : 'Get started for free'}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8 font-medium">
            {isLogin ? 'Please enter your details to sign in' : 'Create an account to start networking'}
        </p>

        {error && !isOtpModalOpen && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded-r-lg text-sm font-bold flex items-center gap-2">
                <X size={16} /> {error}
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-medium" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="email@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-medium" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                {isLogin && (
                    <button 
                        type="button"
                        onClick={() => { setModalMode('forgot'); setIsOtpModalOpen(true); setError(''); setResetStep(1); }}
                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                    >
                        Forgot?
                    </button>
                )}
            </div>
            <div className="relative">
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pl-12 text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-medium" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition transform active:scale-95 flex items-center justify-center gap-3"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 font-bold">
            {isLogin ? "Don't have an account?" : 'Already using PostApp?'}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2">
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900">
                        {modalMode === 'register' ? 'Verify Email' : 'Reset Password'}
                    </h2>
                    <button onClick={() => setIsOtpModalOpen(false)} className="p-2 hover:bg-white rounded-full transition shadow-sm"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-6">
                    {/* Error Display in Modal */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                            <X size={14} /> {error}
                        </div>
                    )}

                    {success ? (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {modalMode === 'register' ? 'Verified!' : 'Password Reset!'}
                            </h3>
                            <p className="text-gray-500 font-medium">
                                {modalMode === 'register' ? 'Account successfully created.' : 'You can now login with your new secret.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {(modalMode === 'forgot' && resetStep === 1) && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Mail size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium mt-2">Enter your email and we'll send you an OTP code.</p>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-medium"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSendOtp}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={20} /></>}
                                    </button>
                                </div>
                            )}

                            {/* OTP Entry Step (Reused for both) */}
                            {((modalMode === 'forgot' && resetStep === 2) || (modalMode === 'register')) && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Key size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium mt-2">Check your inbox for a 6-digit code sent to {resetEmail}</p>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">6-Digit OTP</label>
                                        <input 
                                            type="text" 
                                            value={resetOtp}
                                            maxLength={6}
                                            onChange={(e) => setResetOtp(e.target.value)}
                                            placeholder="000000"
                                            className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-black text-center text-3xl tracking-[10px]"
                                        />
                                    </div>
                                    <button 
                                        onClick={modalMode === 'register' ? handleRegisterConfirm : handleVerifyOtp}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : <>Verify Code <ArrowRight size={20} /></>}
                                    </button>
                                    {modalMode === 'forgot' && (
                                        <button onClick={() => setResetStep(1)} className="w-full text-indigo-600 font-bold text-sm hover:underline">Incorrect email? Try again</button>
                                    )}
                                </div>
                            )}

                            {(modalMode === 'forgot' && resetStep === 3) && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Lock size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium mt-2">OTP Verified! Now choose a new strong password.</p>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition font-medium"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleResetPassword}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
