import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, addDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import BottomNav from '../components/BottomNav';
import { 
  initiatePayment, 
  createPaymentOrder,
  verifyPayment, 
  loadRazorpayScript, 
  validatePaymentData,
  formatAmount 
} from '../utils/paymentUtils';
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

    // Load Razorpay script
    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        console.error('Failed to load Razorpay script');
      }
    });

    // Set up global payment handlers
    window.onPaymentSuccess = handlePaymentSuccess;
    window.onPaymentError = handlePaymentError;
    window.onPaymentCancel = handlePaymentCancel;

    return () => {
      unsubscribe();
      // Clean up global handlers
      delete window.onPaymentSuccess;
      delete window.onPaymentError;
      delete window.onPaymentCancel;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentForm = () => {
    const { amount, currency, email } = paymentData;
    
    const validation = validatePaymentData(amount, email, currency);
    if (!validation.isValid) {
      alert('Validation failed:\n' + validation.errors.join('\n'));
      return false;
    }

    return true;
  };

  const createRazorpayOrder = async () => {
    if (!validatePaymentForm()) return;
    if (!user) {
      alert('Please log in to make a payment');
      return;
    }

    setLoading(true);
    try {
      // Use the new createPaymentOrder function
      const result = await createPaymentOrder({
        amount: parseFloat(paymentData.amount),
        userId: user.uid,
        description: paymentData.description,
        name: user.displayName || '',
        email: paymentData.email,
        contact: paymentData.contact
      });

      if (!result.success) {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Failed to create payment order: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Global payment success handler
  const handlePaymentSuccess = async (verificationData, paymentResponse) => {
    try {
      setLoading(false);
      
      console.log('Payment verified successfully:', verificationData);
      
      // Store transaction in Firestore
      await storeTransaction({
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        status: 'completed',
        userId: user.uid,
        timestamp: new Date().toISOString(),
        description: paymentData.description,
        verificationData: verificationData
      });

      setPaymentStatus({
        status: 'success',
        message: 'Payment completed successfully!',
        details: {
          id: paymentResponse.razorpay_payment_id,
          status: 'captured',
          amount: parseFloat(paymentData.amount),
          currency: paymentData.currency
        }
      });
    } catch (error) {
      console.error('Error handling successful payment:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Payment was successful but failed to save transaction details.'
      });
    }
  };

  // Global payment error handler
  const handlePaymentError = (errorMessage, errorDetails) => {
    setLoading(false);
    console.error('Payment error:', errorMessage, errorDetails);
    setPaymentStatus({
      status: 'error',
      message: errorMessage
    });
  };

  // Global payment cancel handler
  const handlePaymentCancel = () => {
    setLoading(false);
    setPaymentStatus({
      status: 'cancelled',
      message: 'Payment was cancelled by user'
    });
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
              {loading ? '⏳ Processing...' : `💳 Pay ${formatAmount(paymentData.amount || 0, paymentData.currency)}`}
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
                    <td>{formatAmount(paymentStatus.details.amount, paymentStatus.details.currency)}</td>
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
