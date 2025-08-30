import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import CustomSpinner from '../components/CustomSpinner';
import { Canvas } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Simplified shader background for auth pages
function AuthBackground() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      </div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
    </div>
  );
}

const Login = () => {
  const navigate = useNavigate();  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    if (containerRef.current && cardRef.current) {
      gsap.set(cardRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.95
      });

      gsap.to(cardRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      });
    }
  }, { scope: containerRef });

  const handleLogin = async () => {
    if (email === '' || password === '') {
      alert("Please enter valid login details");
      return;
    }
    try {
      setLoading(true);
      const userDetails = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      const user = userDetails.user;
      console.log("Successful login:", user);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.error(error.message);
      alert("Please enter valid details");
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      <AuthBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back to Home Button */}
          <button
            onClick={handleBackToHome}
            className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Login Card */}
          <div ref={cardRef} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">UTrack</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-white/60">Sign in to your account to continue</p>
            </div>

            {loading && <CustomSpinner />}

            {/* Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Login Button */}
              <button
                type="button"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">Or continue with</span>
                </div>
              </div>

              {/* Google Login Button */}
              <GoogleLoginButton />

              {/* Signup Link */}
              <div className="text-center">
                <span className="text-white/60">
                  Don't have an account?{' '}
                  <button 
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-300"
                    onClick={handleSignup}
                  >
                    Create Account
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;