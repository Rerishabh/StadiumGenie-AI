import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Login() {
  const { login, loading } = useContext(AuthContext);
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const result = await login({ email: data.email, password: data.password });
      const user = result?.user;
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            StadiumGenie
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4">Welcome Back</h2>
          <p className="text-sm text-slate-550">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-655 tracking-wide uppercase">Email Address</label>
            <input
              {...registerField('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              placeholder="john@example.com"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-805 text-sm font-semibold transition-all outline-none ${
                errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1 relative">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-655 tracking-wide uppercase">Password</label>
            </div>
            <div className="relative">
              <input
                {...registerField('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-4 pr-10 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-805 text-sm font-semibold transition-all outline-none ${
                  errors.password ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold select-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password.message}</p>}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center text-sm tracking-wide uppercase"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>

        {/* Admin access notice */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            🔐 Admin access? Use your admin credentials above — you'll be redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
