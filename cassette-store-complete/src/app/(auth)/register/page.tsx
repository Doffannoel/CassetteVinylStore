'use client'

import React, { useState } from 'react';
import { Music, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegisterSubmit = async (): Promise<void> => {
    const newErrors: RegisterErrors = {};

    // Validasi seperti biasa
    if (!registerData.name) newErrors.name = 'Name is required';
    if (!registerData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(registerData.email)) newErrors.email = 'Invalid email format';

    if (!registerData.password) newErrors.password = 'Password is required';
    else if (registerData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!registerData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (registerData.password !== registerData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // 🔥 Kirim ke API REGISTER
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || 'Registration failed');
        return;
      }

      alert('Registration successful!');
      window.location.href = '/'; // redirect ke home / login?

    } catch (error) {
      alert('Server error. Please try again.');
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleRegisterSubmit();
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
            Join our community of music lovers and start your vinyl, CD, and cassette collection today.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
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
              CREATE ACCOUNT
            </h2>
            <p className="text-zinc-600">Join the music revolution</p>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setRegisterData({ ...registerData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3 border ${errors.name ? 'border-red-500' : 'border-zinc-300'
                    } bg-white text-zinc-900 focus:border-yellow-600 focus:outline-none transition-colors`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setRegisterData({ ...registerData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
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
                  value={registerData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-12 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-zinc-300'
                    } bg-white text-zinc-900 focus:border-yellow-600 focus:outline-none transition-colors`}
                  placeholder="Minimum 6 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setRegisterData({ ...registerData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-12 pr-12 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-zinc-300'
                    } bg-white text-zinc-900 focus:border-yellow-600 focus:outline-none transition-colors`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRegisterSubmit}
              className="w-full bg-yellow-600 text-white py-3 font-semibold uppercase tracking-wider hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105"
            >
              Create Account
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-zinc-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;