import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import BottomNav from '../components/BottomNav'; 
import SkeletonLayout from "../components/SkeletonLayout"
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Receipt, 
  Target,
  Crown,
  Edit3,
  Check,
  X,
  Wallet,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';

// Modern Profile Background
function ProfileBackground() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
      </div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
    </div>
  );
}

// Circular Progress Component
const CircularProgress = ({ percentage, color, size = 48 }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        viewBox="0 0 40 40"
        style={{ width: size, height: size }}
      >
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-white/10"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
};

const You = () => {
  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState({ currency: false, budget: false });
  const [newCurrency, setNewCurrency] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // GSAP Animations
  useGSAP(() => {
    if (userData) {
      const tl = gsap.timeline();
      
      tl.fromTo('.profile-header', 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo('.stats-card', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 
        '-=0.4'
      )
      .fromTo('.profile-section', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 
        '-=0.3'
      );
    }
  }, { scope: containerRef, dependencies: [userData] });

  const currencycheck={
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    SGD: "S$"
  }

  // Check if screen is desktop size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setNewCurrency(data.usersettings?.currency || '₹');
          setNewBudget(data.usersettings?.montly_budget || 0);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocRef = doc(db, 'users', uid);

    await updateDoc(userDocRef, {
      usersettings: {
        currency: newCurrency,
        montly_budget: Number(newBudget),
      },
    });

    setEditMode({ currency: false, budget: false });
    setShowSettings(false);
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/')
  };

  // Calculate user stats
  const calculateStats = () => {
    if (!userData) return { totalReceipts: 0, totalSpent: 0, avgSpending: 0 };
    
    const receipts = userData.user_bills || [];
    const totalReceipts = receipts.length;
    const totalSpent = receipts.reduce((sum, receipt) => {
      const amount = receipt.json?.total_amount;
      if (typeof amount === 'string') {
        const digits = amount.match(/\d+(\.\d+)?/);
        return sum + (digits ? parseFloat(digits[0]) : 0);
      } else if (typeof amount === 'number') {
        return sum + amount;
      }
      return sum;
    }, 0);
    
    return {
      totalReceipts,
      totalSpent,
      avgSpending: totalReceipts > 0 ? totalSpent / totalReceipts : 0
    };
  };

  const stats = calculateStats();

  if (!userData) return <SkeletonLayout/>

  return (
    <div ref={containerRef}>
      <ProfileBackground />
      <div className="min-h-screen relative z-10 text-white">
        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-md sm:max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="profile-header mb-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg">
                    {userData.userdetails?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-black"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-white font-bold text-xl">
                      {userData.userdetails?.name || 'User'}
                    </h1>
                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Active
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Mail className="w-4 h-4" />
                    {userData.userdetails?.email || 'user@example.com'}
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date().getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-1">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Your Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="stats-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center shadow-lg hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalReceipts}</div>
                <div className="text-white/60 text-xs">Total Receipts</div>
              </div>
              
              <div className="stats-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center shadow-lg hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{currencycheck[userData.usersettings?.currency] || '₹'}{stats.totalSpent.toFixed(0)}</div>
                <div className="text-white/60 text-xs">Total Spent</div>
              </div>
              
              <div className="stats-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center shadow-lg hover:bg-white/10 transition-all duration-300 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{currencycheck[userData.usersettings?.currency] || '₹'}{stats.avgSpending.toFixed(0)}</div>
                <div className="text-white/60 text-xs">Average per Receipt</div>
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div className="profile-section mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-1">
              <Target className="w-6 h-6 text-green-400" />
              Budget Overview
            </h2>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="text-white/70 text-sm mb-1">Monthly Budget</div>
                  <div className="text-white font-bold text-2xl">
                    {currencycheck[userData.usersettings?.currency] || '₹'}{userData.usersettings?.montly_budget || 0}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <CircularProgress 
                    percentage={Math.min((stats.totalSpent / (userData.usersettings?.montly_budget || 1)) * 100, 100)} 
                    color="#10b981" 
                    size={60}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Spent this month</span>
                  <span className="text-white font-semibold">{currencycheck[userData.usersettings?.currency] || '₹'}{stats.totalSpent.toFixed(0)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.totalSpent / (userData.usersettings?.montly_budget || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>₹0</span>
                  <span>₹{userData.usersettings?.montly_budget || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-section mb-20 space-y-4">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition-all duration-300 flex items-center gap-4 shadow-lg group"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-lg">Settings</div>
                <div className="text-white/60 text-sm">Manage your preferences</div>
              </div>
              <div className="text-white/40 group-hover:text-white/60 transition-colors">
                <Edit3 className="w-5 h-5" />
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 text-left hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 flex items-center gap-4 shadow-lg group"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white text-lg">Logout</div>
                <div className="text-white/60 text-sm">Sign out of your account</div>
              </div>
              <div className="text-red-400/60 group-hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-400" />
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Currency Setting */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Currency</label>
                    <div className="text-xs text-white/60">Set your preferred currency symbol</div>
                  </div>
                </div>
                
                {editMode.currency ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="flex-1 p-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none transition-colors placeholder-white/40"
                      placeholder="Enter currency symbol"
                    />
                    <button 
                      onClick={() => setEditMode({ ...editMode, currency: false })}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg border border-white/20">
                    <span className="text-white font-medium">{newCurrency}</span>
                    <button 
                      onClick={() => setEditMode({ ...editMode, currency: true })}
                      className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Budget Setting */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Monthly Budget</label>
                    <div className="text-xs text-white/60">Set your monthly spending limit</div>
                  </div>
                </div>
                
                {editMode.budget ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="flex-1 p-3 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none transition-colors placeholder-white/40"
                      placeholder="Enter monthly budget"
                    />
                    <button 
                      onClick={() => setEditMode({ ...editMode, budget: false })}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg transition-all duration-300 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg border border-white/20">
                    <span className="text-white font-medium">{currencycheck[userData.usersettings?.currency] || '₹'}{newBudget}</span>
                    <button 
                      onClick={() => setEditMode({ ...editMode, budget: true })}
                      className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/20 hover:bg-blue-500/30 p-2 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpdate}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default You;
