import React, { useState } from 'react';
import '../pages/Alerts.css';

const PaymentDemo = () => {
  const [paymentData, setPaymentData] = useState({
    amount: '100',
    currency: 'INR',
    description: 'Test Payment',
    email: 'user@example.com',
    contact: '+91 9999999999'
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

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

  const simulatePayment = async () => {
    if (!validatePaymentData()) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful payment
    const mockPaymentDetails = {
      id: `pay_${Date.now()}`,
      status: 'captured',
      amount: parseFloat(paymentData.amount),
      currency: paymentData.currency
    };

    setPaymentStatus({
      status: 'success',
      message: 'Payment completed successfully!',
      details: mockPaymentDetails
    });
    
    setLoading(false);
  };

  const resetForm = () => {
    setPaymentData({
      amount: '',
      currency: 'INR',
      description: '',
      email: 'user@example.com',
      contact: ''
    });
    setPaymentStatus(null);
  };

  const selectedCurrency = currencies.find(c => c.code === paymentData.currency);

  return (
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
            onClick={simulatePayment}
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
            <button onClick={() => alert('Navigate to Dashboard')}>
              🏠 Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDemo;