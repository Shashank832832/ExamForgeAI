import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';
import { registerUser } from '../services/authService';
import { AlertCircle, Lock, Mail, User, Loader2 } from 'lucide-react';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'student'  // default role selection
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await registerUser(data);
      dispatch(setCredentials(response));
      if (response.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registrations failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Candidate Account</h2>
        <p className="text-slate-400 text-sm mt-2">Fill in your information to join mock examinations</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3 mb-6 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="name">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              placeholder="Aryan Sharma"
              {...register('name', { required: 'Full name is required' })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

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
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters long' }
              })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Account Role Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="role">Candidate Role</label>
          <select
            id="role"
            {...register('role')}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          >
            <option value="student">Student (Attempt Mock Exams)</option>
            <option value="admin">Administrator (Upload & Extract Exams)</option>
          </select>
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
              Registering Account...
            </>
          ) : (
            'Create Portal Profile'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
