// Payment utility functions for UTrack
// This file contains reusable payment functions for Razorpay integration

// Initialize Razorpay payment
function initializePayment(orderData, userInfo = {}) {
  // Make sure we have the minimum required data
  if (!orderData || !orderData.order || !orderData.order.id) {
    console.error('Missing required order data for payment');
    alert('Unable to initialize payment: Invalid order data');
    return;
  }

  try {
    // Configure Razorpay with only essential options
    const options = {
      key: orderData.key_id || 'rzp_test_zAzYoKHbMhK7mn', // Use provided key or fallback to test key
      amount: orderData.order.amount || 0,
      currency: orderData.order.currency || 'INR',
      name: 'UTrack',
      description: 'Payment for services',
      order_id: orderData.order.id,
      handler: function(response) {
        console.log('Payment successful', response);
        verifyPayment(response, userInfo.userId || 'anonymous');
      },
      modal: {
        ondismiss: function() {
          console.log('Checkout closed without payment');
        }
      }
    };

    // Add optional fields only if they exist
    if (userInfo.name || userInfo.email || userInfo.contact) {
      options.prefill = {};
      
      if (userInfo.name) options.prefill.name = userInfo.name;
      if (userInfo.email) options.prefill.email = userInfo.email;
      if (userInfo.contact) options.prefill.contact = userInfo.contact;
    }

    if (userInfo.userId) {
      options.notes = { userId: userInfo.userId };
    }

    // Initialize and open Razorpay
    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function(failedResponse) {
      console.error('Payment failed', failedResponse.error);
      alert('Payment failed: ' + (failedResponse.error.description || 'Unknown error'));
    });
    
    rzp.open();
  } catch (error) {
    console.error('Error initializing payment', error);
    alert('Unable to initialize payment: ' + (error.message || 'Unknown error'));
  }
}

// Function to create a payment order and then initialize checkout
export async function createPaymentOrder(paymentDetails) {
  try {
    const response = await fetch('http://127.0.0.1:5001/utrack-d3efb/us-central1/createPaymentOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentDetails.amount,
        currency: 'INR',
        description: paymentDetails.description || '',
        userId: paymentDetails.userId,
        name: paymentDetails.name || '',
        email: paymentDetails.email || '',
        contact: paymentDetails.contact || ''
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create order');
    }
    
    console.log('Order created:', data);
    
    // Initialize payment with the order data
    initializePayment(data, {
      userId: paymentDetails.userId,
      name: paymentDetails.name,
      email: paymentDetails.email,
      contact: paymentDetails.contact
    });
    
    return { success: true, order: data.order };
    
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Error: ' + error.message);
    return { success: false, error: error.message };
  }
}

// Legacy function for backward compatibility
export async function initiatePayment(amount, userId, description = '', userDetails = {}) {
  return await createPaymentOrder({
    amount: amount,
    userId: userId,
    description: description,
    name: userDetails.name || '',
    email: userDetails.email || '',
    contact: userDetails.contact || ''
  });
}

// Minimal and robust verification function
export async function verifyPayment(response, userId = 'anonymous') {
  console.log('Verifying payment...', response);
  
  // Ensure we have the minimum required data from Razorpay response
  if (!response || !response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
    console.error('Missing required payment data from Razorpay');
    alert('Payment verification failed: Missing payment data');
    return;
  }
  
  try {
    // Prepare verification data - only the essential fields
    const verificationData = {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      userId: userId || 'anonymous' // Fall back to anonymous if userId not provided
    };
    
    console.log('Sending verification request:', verificationData);
    
    // Call the verification endpoint
    const verifyResponse = await fetch('http://127.0.0.1:5001/utrack-d3efb/us-central1/verifyPayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationData)
    });
    
    // Parse response
    const result = await verifyResponse.json();
    
    if (result.success) {
      console.log('Payment verification successful:', result);
      
      // Store minimal payment data
      const paymentData = {
        transactionId: response.razorpay_payment_id,
        amount: result.payment?.amount ? `₹${result.payment.amount}` : 'Paid',
        method: result.payment?.method || 'Online',
        dateTime: new Date().toLocaleString()
      };
      
      // Store for success page
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      
      // Alert user
      alert('Payment successful! Redirecting to confirmation page...');
      
      // Redirect to success page (React route)
      setTimeout(() => {
        window.location.href = '/payment-success';
      }, 1000);
    } else {
      console.error('Payment verification failed:', result.error);
      alert('Payment verification failed: ' + (result.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    
    // Still try to redirect to success page if we have the payment ID
    // since the payment might have succeeded despite verification errors
    if (response && response.razorpay_payment_id) {
      alert('Payment may have succeeded, but verification encountered an error. You will be redirected to the confirmation page.');
      
      const paymentData = {
        transactionId: response.razorpay_payment_id,
        amount: 'Verification pending',
        method: 'Online',
        dateTime: new Date().toLocaleString(),
        status: 'Verification pending'
      };
      
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      
      setTimeout(() => {
        window.location.href = '/payment-success';
      }, 1000);
    } else {
      alert('Payment verification failed. Please contact support with your payment ID if payment was deducted.');
    }
  }
}

// Helper function to load Razorpay script if not already loaded
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.getElementById('razorpay-script');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
}

// Helper function to validate payment data
export function validatePaymentData(amount, email, currency = 'INR') {
  const errors = [];
  
  // Validate amount
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push('Please enter a valid amount greater than 0');
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Validate currency
  const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD'];
  if (!supportedCurrencies.includes(currency)) {
    errors.push('Unsupported currency selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to format amount for display
export function formatAmount(amount, currency = 'INR') {
  const currencySymbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SGD': 'S$'
  };
  
  const symbol = currencySymbols[currency] || currency;
  const formattedAmount = parseFloat(amount).toFixed(2);
  
  return `${symbol}${formattedAmount}`;
}

// Example usage function
export function createPaymentButton(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }
  
  const {
    amount,
    userId,
    description = 'UTrack Payment',
    userDetails = {},
    buttonText = 'Pay Now',
    buttonClass = 'pay-button'
  } = config;
  
  // Validate required parameters
  if (!amount || !userId) {
    console.error('Amount and userId are required for payment button');
    return;
  }
  
  // Create button element
  const button = document.createElement('button');
  button.className = buttonClass;
  button.textContent = `${buttonText} ${formatAmount(amount)}`;
  button.onclick = async () => {
    // Load Razorpay script first
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load payment system. Please try again.');
      return;
    }
    
    // Validate payment data
    const validation = validatePaymentData(amount, userDetails.email);
    if (!validation.isValid) {
      alert('Payment validation failed:\n' + validation.errors.join('\n'));
      return;
    }
    
    // Initiate payment
    await initiatePayment(amount, userId, description, userDetails);
  };
  
  // Clear container and add button
  container.innerHTML = '';
  container.appendChild(button);
  
  return button;
}

// Export functions to window for standalone usage
window.verifyPayment = verifyPayment;
window.initializePayment = initializePayment;
window.createPaymentOrder = createPaymentOrder;
