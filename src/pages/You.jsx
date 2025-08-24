import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import BottomNav from '../components/BottomNav'; 
import SkeletonLayout from "../components/SkeletonLayout"
import { useNavigate } from 'react-router-dom';

const You = () => {
  const [userData, setUserData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editMode, setEditMode] = useState({ currency: false, budget: false });
  const [newCurrency, setNewCurrency] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();
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
    <div className={`min-h-screen bg-black ${isDesktop ? 'pb-0' : 'pb-20'}`}>
      <div className={`${isDesktop ? 'max-w-4xl mx-auto' : ''}`}>
        {/* Profile Header */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-gray-600">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg">
              {userData.userdetails?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-lg">
                {userData.userdetails?.name || 'User'}
              </div>
              <div className="text-gray-300 text-sm">
                {userData.userdetails?.email || 'user@example.com'}
              </div>
              <div className="text-blue-400 text-xs mt-1">
                Member since {new Date().getFullYear()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-sm font-semibold">Active</div>
              <div className="w-3 h-3 bg-green-400 rounded-full mt-1"></div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl text-center border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats.totalReceipts}</div>
              <div className="text-gray-400 text-xs">Receipts</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl text-center border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{currencycheck[userData.usersettings?.currency] || '₹'}{stats.totalSpent.toFixed(0)}</div>
              <div className="text-gray-400 text-xs">Total Spent</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl text-center border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{currencycheck[userData.usersettings?.currency] || '₹'}{stats.avgSpending.toFixed(0)}</div>
              <div className="text-gray-400 text-xs">Avg/Receipt</div>
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="px-4 mb-6">
          <h3 className="text-white font-semibold mb-3 text-lg">Budget Overview</h3>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300">Monthly Budget</span>
              <span className="text-white font-semibold">{userData.usersettings?.currency || '₹'}{userData.usersettings?.montly_budget || 0}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((stats.totalSpent / (userData.usersettings?.montly_budget || 1)) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {stats.totalSpent.toFixed(0)} of {userData.usersettings?.montly_budget || 0} spent
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mb-6">
          <div className="space-y-3">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl text-left transition-all duration-200 flex items-center gap-3 shadow-lg"
            >
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                ⚙️
              </div>
              <div>
                <div className="font-semibold">Settings</div>
                <div className="text-xs text-gray-400">Manage your preferences</div>
              </div>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl text-left transition-all duration-200 flex items-center gap-3 shadow-lg"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                🚪
              </div>
              <div>
                <div className="font-semibold">Logout</div>
                <div className="text-xs opacity-80">Sign out of your account</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className={`bg-gray-800 text-white rounded-2xl p-6 ${isDesktop ? 'w-full max-w-md' : 'w-full max-w-sm'} relative border border-gray-600`}>
            <button
              className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowSettings(false)}
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-6 text-center text-white">Edit Settings</h2>

            {/* Currency */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-300">Currency</label>
              {editMode.currency ? (
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter currency symbol"
                />
              ) : (
                <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <span className="text-white">{newCurrency}</span>
                  <button 
                    onClick={() => setEditMode({ ...editMode, currency: true })}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="mb-8">
              <label className="block text-sm mb-2 text-gray-300">Monthly Budget</label>
              {editMode.budget ? (
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter monthly budget"
                />
              ) : (
                <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <span className="text-white">{newBudget}</span>
                  <button 
                    onClick={() => setEditMode({ ...editMode, budget: true })}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUpdate}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation - only show on mobile */}
      {!isDesktop && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default You;
