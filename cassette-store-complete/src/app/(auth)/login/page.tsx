'use client'

import React, { useState } from 'react';
import { Music, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginSubmit = async (): Promise<void> => {
    const newErrors: LoginErrors = {};

    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // 🔥 FETCH ke API LOGIN
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || 'Login failed');
        return;
      }

      // Cookie sudah otomatis di-set dari API (authCookieHeader)
      alert('Login successful!');
      window.location.href = '/'; // redirect ke home/dashboard

    } catch (error) {
      console.log(error);
      alert('Server error. Please try again.');
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleLoginSubmit();
    }
  };

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-700 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
          <Music className="h-24 w-24 text-yellow-600 mb-8" />
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Bebas Neue, cursive' }}>
            HYSTERIA MUSIC
          </h1>
          <p className="text-yellow-600 text-sm tracking-widest mb-8">EST. 1946</p>
          <p className="text-zinc-300 text-lg max-w-md">
            Your ultimate destination for vinyl records, CDs, and cassettes. Discover timeless music in every format.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Music className="h-16 w-16 text-yellow-600 mb-4" />
            <h1 className="text-3xl font-bold text-zinc-900" style={{ fontFamily: 'Bebas Neue, cursive' }}>
              HYSTERIA MUSIC
            </h1>
            <p className="text-yellow-600 text-xs tracking-widest">EST. 1946</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 mb-2" style={{ fontFamily: 'Bebas Neue, cursive' }}>
              WELCOME BACK
            </h2>
            <p className="text-zinc-600">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setLoginData({ ...loginData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-12 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-zinc-300'
                    } bg-white text-zinc-900 focus:border-yellow-600 focus:outline-none transition-colors`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setLoginData({ ...loginData, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-12 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-zinc-300'
                    } bg-white text-zinc-900 focus:border-yellow-600 focus:outline-none transition-colors`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                onClick={() => alert('Forgot password feature coming soon!')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleLoginSubmit}
              className="w-full bg-yellow-600 text-white py-3 font-semibold uppercase tracking-wider hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-zinc-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;