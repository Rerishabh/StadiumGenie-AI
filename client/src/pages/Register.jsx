import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Register() {
  const { register: registerAction, loading } = useContext(AuthContext);
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    const phoneValue = data.phone && data.phone.trim() !== '' ? data.phone.trim() : null;
    try {
      const res = await registerAction({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: phoneValue
      });
      
      setSuccess(true);
      const token = res?.data?.data?.accessToken || res?.data?.accessToken;
      
      setTimeout(async () => {
        if (token) {
          localStorage.setItem('stadiumGenie_token', token);
          if (res?.data?.data?.user) {
             localStorage.setItem('stadiumGenie_user', JSON.stringify(res.data.data.user));
          }
          window.location.href = '/'; // force reload to hydrate context
        } else {
          navigate('/login');
        }
      }, 2000);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && backendErrors.length > 0) {
        const errorMessages = backendErrors.map(e => e.message).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(err?.response?.data?.message || err.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            StadiumGenie
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4">Create your account</h2>
          <p className="text-sm text-slate-550">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-2xl text-center space-y-3">
            <span className="text-2xl">🎉</span>
            <p className="font-bold text-sm">Account created successfully!</p>
            <p className="text-xs text-green-600">Logging you in and redirecting to the arenas...</p>
            <div className="flex justify-center pt-2">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">Full Name</label>
              <input
                {...registerField('name', { required: 'Name is required' })}
                type="text"
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold transition-all outline-none ${
                  errors.name ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs font-bold mt-1">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">Email Address</label>
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
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold transition-all outline-none ${
                  errors.email ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-650 tracking-wide uppercase">Phone Number <span className="text-[10px] text-slate-400 font-medium">(Optional)</span></label>
              <input
                {...registerField('phone', {
                  validate: (value) => {
                    if (!value || value.trim() === '') return true;
                    return /^[0-9+()-\s]{7,15}$/.test(value.trim()) || 'Invalid phone number';
                  }
                })}
                type="tel"
                placeholder="+1 555-0199"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold transition-all outline-none ${
                  errors.phone ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-655 tracking-wide uppercase">Password</label>
              <div className="relative">
                <input
                  {...registerField('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold transition-all outline-none ${
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

            {/* Confirm Password */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-655 tracking-wide uppercase">Confirm Password</label>
              <div className="relative">
                <input
                  {...registerField('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold transition-all outline-none ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-1 focus:ring-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold select-none"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1">{errors.confirmPassword.message}</p>}
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
              {loading ? <LoadingSpinner size="sm" /> : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}