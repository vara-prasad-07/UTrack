import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Get payment data from localStorage
    try {
      const data = localStorage.getItem('paymentData');
      if (data) {
        setPaymentData(JSON.parse(data));
        // Clear the data after retrieving
        localStorage.removeItem('paymentData');
      }
    } catch (error) {
      console.error('Error retrieving payment data:', error);
    }
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '50px auto', 
        padding: '20px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="/vite.svg" 
            alt="UTrack Logo" 
            style={{ maxWidth: '180px', marginBottom: '20px' }}
          />
        </div>
        
        {/* Success Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          {/* Success Icon */}
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            width: '80px',
            height: '80px',
            fontSize: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'scaleIn 0.5s ease-in-out'
          }}>
            ✓
          </div>
          
          <h1 style={{
            fontSize: '24px',
            color: '#28a745',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Payment Successful!
          </h1>
          
          <p style={{ marginBottom: '10px' }}>
            Your transaction has been completed successfully.
          </p>
          <p style={{ marginBottom: '30px' }}>
            Thank you for using UTrack!
          </p>
          
          {/* Payment Details */}
          <div style={{ 
            marginTop: '30px', 
            textAlign: 'left',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Transaction Details</h3>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Transaction ID:</span>
              <span style={{ fontWeight: '500' }}>
                {paymentData?.transactionId || 'Payment Completed'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Amount:</span>
              <span style={{ fontWeight: '500' }}>
                {paymentData?.amount || 'Payment Successful'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Date & Time:</span>
              <span style={{ fontWeight: '500' }}>
                {paymentData?.dateTime || new Date().toLocaleString()}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Payment Method:</span>
              <span style={{ fontWeight: '500' }}>
                {paymentData?.method || 'Online'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0'
            }}>
              <span style={{ fontWeight: '600', color: '#666' }}>Status:</span>
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                {paymentData?.status || 'Completed'}
              </span>
            </div>
          </div>
          
          {/* Buttons */}
          <div style={{ 
            marginTop: '30px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGoHome}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                backgroundColor: '#3399cc',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3399cc'}
            >
              Back to Home
            </button>
            
            <button
              onClick={handlePrintReceipt}
              style={{
                padding: '12px 24px',
                border: '2px solid #3399cc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                backgroundColor: 'transparent',
                color: '#3399cc',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f8ff'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Print Receipt
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          color: '#777', 
          fontSize: '14px' 
        }}>
          <p>&copy; 2025 UTrack. All rights reserved.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
      
      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .buttons {
            flex-direction: column !important;
          }
          
          .buttons button {
            width: 100% !important;
            margin-bottom: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
