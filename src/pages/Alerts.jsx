import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, addDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';
import './Alerts.css';

const Alerts = () => {
  const [user, setUser] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'INR',
    description: '',
    email: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setPaymentData(prev => ({
          ...prev,
          email: currentUser.email,
          contact: currentUser.phoneNumber || ''
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentData = () => {
    const { amount, currency, email } = paymentData;
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    
    if (!currency) {
      alert('Please select a currency');
      return false;
    }
    
    if (!email) {
      alert('Email is required');
      return false;
    }

    return true;
  };

  const createRazorpayOrder = async () => {
    if (!validatePaymentData()) return;

    setLoading(true);
    try {
      // For demo purposes, create a local order object
      // In production, replace this with actual API call to your Firebase Function
      const order = {
        id: `order_${Date.now()}`,
        amount: parseFloat(paymentData.amount) * 100, // Convert to paise/cents
        currency: paymentData.currency,
        receipt: `receipt_${Date.now()}`,
        status: 'created'
      };

      // TODO: Replace with actual API call when backend is deployed
      // const response = await fetch('https://your-region-your-project-id.cloudfunctions.net/createPaymentOrder', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount: parseFloat(paymentData.amount) * 100,
      //     currency: paymentData.currency,
      //     receipt: `receipt_${Date.now()}`,
      //     description: paymentData.description,
      //     userId: user.uid
      //   })
      // });
      // const orderData = await response.json();
      // if (orderData.success) {
      //   initiateRazorpayPayment(orderData.order);
      // }

      initiateRazorpayPayment(order);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create payment order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'UTrack Payment',
      description: paymentData.description || 'Payment via UTrack',
      order_id: order.id,
      handler: async (response) => {
        await handlePaymentSuccess(response, order);
      },
      prefill: {
        name: user.displayName || '',
        email: paymentData.email,
        contact: paymentData.contact
      },
      theme: {
        color: '#007bff'
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setPaymentStatus({
            status: 'cancelled',
            message: 'Payment was cancelled'
          });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = async (paymentResponse, order) => {
    try {
      setLoading(true);
      
      // For demo purposes, simulate successful verification
      // In production, replace this with actual API call to verify payment
      console.log('Payment Response:', paymentResponse);
      console.log('Order:', order);

      // TODO: Replace with actual API call when backend is deployed
      // const verificationResponse = await fetch('https://your-region-your-project-id.cloudfunctions.net/verifyPayment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     razorpay_order_id: paymentResponse.razorpay_order_id,
      //     razorpay_payment_id: paymentResponse.razorpay_payment_id,
      //     razorpay_signature: paymentResponse.razorpay_signature,
      //     userId: user.uid
      //   })
      // });
      // const verificationData = await verificationResponse.json();

      // Simulate verification success for demo
      const mockPaymentDetails = {
        id: paymentResponse.razorpay_payment_id,
        status: 'captured',
        amount: order.amount,
        currency: order.currency
      };

      // Store transaction in Firestore
      await storeTransaction({
        ...paymentResponse,
        order_id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: 'completed',
        userId: user.uid,
        timestamp: new Date().toISOString(),
        description: paymentData.description
      });

      setPaymentStatus({
        status: 'success',
        message: 'Payment completed successfully!',
        details: mockPaymentDetails
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Payment verification failed. Please contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const storeTransaction = async (transactionData) => {
    try {
      // Add to transactions collection
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: new Date()
      });

      // Update user's transaction history
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          [`transactions.${transactionRef.id}`]: transactionData,
          lastTransactionAt: new Date().toISOString()
        });
      }

      console.log('Transaction stored successfully:', transactionRef.id);
    } catch (error) {
      console.error('Error storing transaction:', error);
    }
  };

  const resetForm = () => {
    setPaymentData({
      amount: '',
      currency: 'INR',
      description: '',
      email: user?.email || '',
      contact: user?.phoneNumber || ''
    });
    setPaymentStatus(null);
  };

  const selectedCurrency = currencies.find(c => c.code === paymentData.currency);

  return (
    <div className="page alerts-page">
      <div className="payment-container">
        <h2 className="payment-heading">💳 UTrack Payment Gateway</h2>
        
        {!paymentStatus ? (
          <div className="payment-form">
            <div className="form-group">
              <label>Amount</label>
              <div className="amount-input-group">
                <span className="currency-symbol">
                  {selectedCurrency?.symbol}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select
                name="currency"
                value={paymentData.currency}
                onChange={handleInputChange}
                className="currency-select"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={paymentData.description}
                onChange={handleInputChange}
                placeholder="Payment description"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={paymentData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Number (Optional)</label>
              <input
                type="tel"
                name="contact"
                value={paymentData.contact}
                onChange={handleInputChange}
                placeholder="+91 9999999999"
              />
            </div>

            <button
              className="pay-button"
              onClick={createRazorpayOrder}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : `💳 Pay ${selectedCurrency?.symbol}${paymentData.amount || '0'}`}
            </button>
          </div>
        ) : (
          <div className="payment-result-container">
            <div className={`payment-status-header ${paymentStatus.status}`}>
              <h4>
                {paymentStatus.status === 'success' ? '✅ Payment Successful!' : 
                 paymentStatus.status === 'error' ? '❌ Payment Failed' : 
                 '⏸️ Payment Cancelled'}
              </h4>
            </div>
            
            <p>{paymentStatus.message}</p>
            
            {paymentStatus.details && (
              <table className="payment-details-table">
                <tbody>
                  <tr>
                    <td>Payment ID:</td>
                    <td>{paymentStatus.details.id}</td>
                  </tr>
                  <tr>
                    <td>Amount:</td>
                    <td>{selectedCurrency?.symbol}{paymentData.amount}</td>
                  </tr>
                  <tr>
                    <td>Currency:</td>
                    <td>{paymentData.currency}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>{paymentStatus.details.status}</td>
                  </tr>
                </tbody>
              </table>
            )}
            
            <div className="button-group">
              <button onClick={resetForm}>
                🔄 Make Another Payment
              </button>
              <button onClick={() => window.location.href = '/'}>
                🏠 Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Alerts;
