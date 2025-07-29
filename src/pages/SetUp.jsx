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
    const user_settings={ "usersettings":  {"currency":selectedCurrency,"montly_budget":budget},"user_bills":[], "user_chats":[]}
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

    <div className="min-vh-100 bg-black text-white">
        {loading && <CustomSpinner />}
      <div className="container py-5">
        <div className="text-center mb-5">
          <div className="mb-4">
           
            <h2 className="text-white fw-bold">UTrack</h2>
          </div>
          
          {/* Progress Steps */}
          <div className="d-flex align-items-center justify-content-center mb-5">
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-primary' : 'bg-secondary'}`} 
                 style={{ width: '40px', height: '40px' }}>
              <span className="text-white fw-bold">1</span>
            </div>
            <div className={`mx-3 ${currentStep >= 2 ? 'bg-primary' : 'bg-secondary'}`} 
                 style={{ height: '4px', width: '100px' }}></div>
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-primary' : 'bg-secondary'}`} 
                 style={{ width: '40px', height: '40px' }}>
              <span className="text-white fw-bold">2</span>
            </div>
          </div>
          
          <p className="text-primary mb-0">Step {currentStep}</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            {currentStep === 1 && (
              <div className="text-center">
                <h3 className="text-white fw-bold mb-4">Choose Currency</h3>
                
                <div className="mb-4">
                  <select 
                    className="form-select form-select-lg bg-secondary text-white border-0"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    style={{ backgroundColor: '#343a40 !important' }}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code} className="bg-secondary">
                        {currency.code} - {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={handleStep1Next}
                >
                  Next →
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center">
                <h3 className="text-white fw-bold mb-4">Set Your Monthly Budget</h3>
                
                <div className="mb-3">
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-secondary text-white border-0">
                      {currencies.find(c => c.code === selectedCurrency)?.symbol}
                    </span>
                    <input
                      type="number"
                      className="form-control bg-secondary text-white border-0"
                      placeholder="Enter value"
                      value={monthlyBudget}
                      onChange={handleBudgetChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {budgetError && (
                    <div className="alert alert-danger mt-2 mb-0">
                      <small>{budgetError}</small>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← Back
                  </button>
                  <button 
                    className="btn btn-primary btn-lg px-4"
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
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
    </div>
  );
};

export default SetupGuide;