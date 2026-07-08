import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { loginUser } from '../services/authService';
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await loginUser(data);
      dispatch(setCredentials(response));
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill credentials helper for ease of demo evaluation
  const handleAutofill = (role) => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    if (role === 'admin') {
      if (emailInput) emailInput.value = 'admin@examforge.com';
      if (passwordInput) passwordInput.value = 'admin123';
    } else {
      if (emailInput) emailInput.value = 'student@examforge.com';
      if (passwordInput) passwordInput.value = 'student123';
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Access CBT Platform</h2>
        <p className="text-slate-400 text-sm mt-2">Enter credentials below or select quick login flags</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Address Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="candidate@email.com"
              {...register('email', { 
                required: 'Email address is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="password">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating Candidate...
            </>
          ) : (
            'Verify & Sign In'
          )}
        </button>
      </form>

      {/* Demo helper shortcuts */}
      <div className="mt-6 border-t border-slate-800 pt-6">
        <span className="text-xs text-slate-500">Quick Sandbox Logins:</span>
        <div className="flex gap-2.5 mt-2">
          <button
            onClick={() => handleAutofill('student')}
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] py-1.5 px-2 text-slate-300 rounded font-semibold transition-colors"
          >
            Load Student Form
          </button>
          <button
            onClick={() => handleAutofill('admin')}
            className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] py-1.5 px-2 text-slate-300 rounded font-semibold transition-colors"
          >
            Load Admin Form
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-slate-400">
          New candidate registration?{' '}
          <Link to="/register" className="text-primary-400 hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
