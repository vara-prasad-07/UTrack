import React, { useState,useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomSpinner from '../components/CustomSpinner'
import {auth,db} from '../firebase'
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
const SetupGuide = () => {
  const navigate=useNavigate();  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState(null);

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
  ];

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUid(user.uid);
    } else {
      console.log("No user logged in");
    }
  });

  return () => unsubscribe();
}, []); // ✅ Runs once when component mounts

// 🧠 Optional: do something when uid is ready
useEffect(() => {
  if (uid) {
    console.log("UID available:", uid);
    // fetch data, navigate, etc.
  }
}, [uid]); // ✅ runs when uid changes


  const handleStep2Next = async() => {
    const budget = parseFloat(monthlyBudget);
    if (!monthlyBudget || budget <= 0) {
      setBudgetError('Please enter a valid amount greater than 0');
      return;
    }
    setBudgetError('');
    setLoading(true)
    const user_settings={ "usersettings":  {"currency":selectedCurrency,"montly_budget":budget},"user_bills":[], "user_chats":[],userspendings:{}}
    await updateDoc(doc(db, "users", uid), user_settings);
    setLoading(false)
    navigate('/dashboard');
  };

  const handleBudgetChange = (e) => {
    setMonthlyBudget(e.target.value);
    if (budgetError) {
      setBudgetError('');
    }
  };

 

  return (

    <div className="min-h-screen bg-black text-white">
        {loading && <CustomSpinner />}
      <div className="container mx-auto px-4 py-5">
        <div className="text-center mb-5">
          <div className="mb-4">
           
            <h2 className="text-white fw-bold">UTrack</h2>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-5">
            <div className={`${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-600'} rounded-full flex items-center justify-center w-10 h-10`}>
              <span className="text-white font-bold">1</span>
            </div>
            <div className={`mx-3 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`} style={{ height: '4px', width: '100px' }}></div>
            <div className={`${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'} rounded-full flex items-center justify-center w-10 h-10`}>
              <span className="text-white font-bold">2</span>
            </div>
          </div>
          
          <p className="text-blue-500 mb-0">Step {currentStep}</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            {currentStep === 1 && (
              <div className="text-center">
                <h3 className="text-white font-bold mb-4">Choose Currency</h3>
                
                <div className="mb-4">
                  <select 
                    className="w-full text-white bg-gray-700 border-0 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code} className="bg-gray-700">
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-3"
                  onClick={handleStep1Next}
                >
                  Next →
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <h3 className="text-white font-bold mb-4">Set Your Monthly Budget</h3>
                
                <div className="mb-3">
                  <div className="flex items-stretch text-white">
                    <span className="inline-flex items-center px-4 rounded-l-lg bg-gray-700 border border-r-0 border-gray-600">
                      {currencies.find(c => c.code === selectedCurrency)?.symbol}
                    </span>
                    <input
                      type="number"
                      className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-r-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter value"
                      value={monthlyBudget}
                      onChange={handleBudgetChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {budgetError && (
                    <div className="mt-2 mb-0 text-red-500 text-sm">
                      <small>{budgetError}</small>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-content-center">
                  <button 
                    className="border border-gray-500 text-white rounded-lg px-4 py-2"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← Back
                  </button>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"
                    onClick={handleStep2Next}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;