const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Firestore
const db = admin.firestore();

// Initialize Razorpay instance - moved to function scope to avoid initialization errors
let razorpay;

// Helper function to validate Razorpay configuration
const validateRazorpayConfig = () => {
  const keyId = functions.config().razorpay?.key_id || process.env.RAZORPAY_KEY_ID;
  const keySecret = functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
  }
  
  return { keyId, keySecret };
};

// Helper function to get or initialize Razorpay
const getRazorpayInstance = () => {
  if (!razorpay) {
    const { keyId, keySecret } = validateRazorpayConfig();
    
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpay;
};

// Create Payment Order
exports.createPaymentOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Validate request method
      if (req.method !== 'POST') {
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
      }

      // Validate Razorpay configuration
      let razorpayConfig;
      try {
        razorpayConfig = validateRazorpayConfig();
      } catch (configError) {
        console.error('Razorpay configuration error:', configError);
        return res.status(500).json({
          success: false,
          error: 'Payment service is not configured properly'
        });
      }

      // Extract request data
      const {
        amount,
        currency = 'INR',
        receipt,
        description,
        userId,
        notes = {},
        name = '',
        email = '',
        contact = ''
      } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Create order options - ENSURE AMOUNT IS IN PAISE (smallest currency unit)
      // This is critical for Razorpay - convert rupees to paise
      const amountInPaise = Math.round(parseFloat(amount) * 100);

      const orderOptions = {
        amount: amountInPaise, 
        currency: currency.toUpperCase(),
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          description: description || '',
          userId: userId,
          created_via: 'UTrack Payment Gateway'
        }
      };

      console.log('Creating order with options:', orderOptions);

      // Create order in Razorpay
      const razorpayInstance = getRazorpayInstance();
      const order = await razorpayInstance.orders.create(orderOptions);

      console.log('Razorpay order created:', order);

      // Store order in Firestore
      const orderData = {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        userId: userId,
        description: description || '',
        receipt: order.receipt,
        notes: order.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        razorpayResponse: order,
        customerInfo: {
          name: name || '',
          email: email || '',
          contact: contact || ''
        }
      };

      await db.collection('payment_orders').doc(order.id).set(orderData);

      // Log the order creation
      console.log('Payment order created and stored in Firestore:', order.id);

      // Return success response WITH KEY ID for frontend initialization
      return res.status(200).json({
        success: true,
        order: {
          id: order.id,
          amount: order.amount, // Amount in paise
          currency: order.currency,
          receipt: order.receipt,
          status: order.status
        },
        key_id: razorpayConfig.keyId // Include key_id for client-side
      });

    } catch (error) {
      console.error('Error creating payment order:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment order'
      });
    }
  });
});

// Verify Payment
// More robust payment verification function
exports.verifyPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log("Verification request received:", req.body);
      
      // Extract payment details with fallbacks for everything
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId = 'anonymous' // Default to 'anonymous' if userId is not provided
      } = req.body;

      // Basic validation - we only need these three from Razorpay for verification
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        console.error('Missing required Razorpay verification parameters');
        return res.status(400).json({
          success: false,
          error: 'Missing payment verification details'
        });
      }

      // Load Razorpay configuration - with error handling
      let razorpayConfig;
      try {
        const keyId = functions.config().razorpay?.key_id || process.env.RAZORPAY_KEY_ID;
        const keySecret = functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET;
        
        if (!keyId || !keySecret) {
          throw new Error('Razorpay credentials not configured');
        }
        
        razorpayConfig = { keyId, keySecret };
      } catch (configError) {
        console.error('Razorpay configuration error:', configError);
        return res.status(500).json({
          success: false,
          error: 'Payment service is not properly configured'
        });
      }

      // Verify signature - this is the critical verification step
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.error('Invalid payment signature');
        return res.status(400).json({
          success: false,
          error: 'Invalid payment signature'
        });
      }

      // Initialize Razorpay if needed
      let payment;
      try {
        const instance = new Razorpay({
          key_id: razorpayConfig.keyId,
          key_secret: razorpayConfig.keySecret
        });
        
        // Fetch payment details from Razorpay
        payment = await instance.payments.fetch(razorpay_payment_id);
      } catch (razorpayError) {
        console.error('Error fetching payment details from Razorpay:', razorpayError);
        // If we can't fetch details, we can still proceed with basic information
        // since we've already verified the signature
        payment = {
          id: razorpay_payment_id,
          order_id: razorpay_order_id,
          status: 'verified', // We know the signature is valid
          amount: 0, // We don't know the amount
          currency: 'INR', // Default
          method: 'unknown'
        };
      }

      try {
        // Store minimal transaction data - no FieldValue operations
        const transactionData = {
          transactionId: razorpay_payment_id,
          orderId: razorpay_order_id,
          userId: userId,
          amount: payment.amount ? payment.amount / 100 : 0, // Convert from paise if available
          currency: payment.currency || 'INR',
          status: payment.status || 'verified',
          method: payment.method || 'unknown',
          verified: true,
          createdAt: new Date().toISOString(),
          signature: razorpay_signature.substring(0, 10) + '...' // Store partial signature for reference
        };

        // Store transaction without using batch operations
        await db.collection('transactions').doc(razorpay_payment_id).set(transactionData);

        // Update order status if possible
        try {
          await db.collection('payment_orders').doc(razorpay_order_id).update({
            status: 'completed',
            paymentId: razorpay_payment_id,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } catch (orderError) {
          // Non-critical: If order update fails, just log it
          console.warn('Could not update order status:', orderError.message);
        }

        // Only update user document if userId is provided and not anonymous
        if (userId && userId !== 'anonymous') {
          try {
            // Check if user exists
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
              // Get current values to calculate new ones
              const userData = userDoc.data() || {};
              const currentTotal = userData.totalPayments || 0;
              const currentAmount = userData.totalAmountPaid || 0;
              
              // Update user without FieldValue operations
              await userRef.update({
                [`paymentHistory.${razorpay_payment_id}`]: {
                  transactionId: razorpay_payment_id,
                  orderId: razorpay_order_id,
                  amount: payment.amount ? payment.amount / 100 : 0,
                  currency: payment.currency || 'INR',
                  status: payment.status || 'verified',
                  timestamp: new Date().toISOString()
                },
                lastPaymentAt: new Date().toISOString(),
                totalPayments: currentTotal + 1,
                totalAmountPaid: currentAmount + (payment.amount ? payment.amount / 100 : 0)
              });
            } else {
              // Create new user document
              await userRef.set({
                userId: userId,
                paymentHistory: {
                  [razorpay_payment_id]: {
                    transactionId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    amount: payment.amount ? payment.amount / 100 : 0,
                    currency: payment.currency || 'INR',
                    status: payment.status || 'verified',
                    timestamp: new Date().toISOString()
                  }
                },
                lastPaymentAt: new Date().toISOString(),
                totalPayments: 1,
                totalAmountPaid: payment.amount ? payment.amount / 100 : 0,
                createdAt: new Date().toISOString()
              });
            }
          } catch (userError) {
            // Non-critical: If user update fails, just log it
            console.warn('Could not update user payment history:', userError.message);
          }
        }

        console.log('Payment verified successfully:', razorpay_payment_id);

        // Return success response
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          payment: {
            id: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: payment.amount ? payment.amount / 100 : 0,
            currency: payment.currency || 'INR',
            status: payment.status || 'verified',
            method: payment.method || 'unknown'
          }
        });
      } catch (dbError) {
        // If database operations fail, we can still return success
        // since the payment verification succeeded
        console.error('Database operation failed, but payment was verified:', dbError);
        
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully, but some records could not be updated',
          payment: {
            id: razorpay_payment_id,
            orderId: razorpay_order_id,
            status: 'verified'
          },
          warning: 'Database update incomplete'
        });
      }
    } catch (error) {
      console.error('Error in payment verification:', error);
      return res.status(500).json({
        success: false,
        error: 'Payment verification failed: ' + (error.message || 'Unknown error')
      });
    }
  });
});
// Webhook for Razorpay events
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Validate webhook signature
    const webhookSecret = functions.config().razorpay?.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({
          success: false,
          error: 'Invalid webhook signature'
        });
      }
    }

    // Parse webhook event
    const { event, payload } = req.body;
    
    console.log('Webhook event received:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process webhook'
    });
  }
});

// Helper function to handle payment captured event
async function handlePaymentCaptured(payment) {
  try {
    const batch = db.batch();

    // Update transaction status
    const transactionRef = db.collection('transactions').doc(payment.id);
    batch.update(transactionRef, {
      status: 'captured',
      capturedAt: new Date(payment.captured_at * 1000),
      updatedAt: new Date()
    });

    // Update order status
    if (payment.order_id) {
      const orderRef = db.collection('payment_orders').doc(payment.order_id);
      batch.update(orderRef, {
        status: 'paid',
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log('Payment captured webhook processed:', payment.id);
  } catch (error) {
    console.error('Error processing payment captured:', error);
  }
}

// Helper function to handle payment failed event
async function handlePaymentFailed(payment) {
  try {
    const batch = db.batch();

    // Update transaction status
    const transactionRef = db.collection('transactions').doc(payment.id);
    batch.update(transactionRef, {
      status: 'failed',
      failureReason: payment.error_description || 'Unknown error',
      updatedAt: new Date()
    });

    // Update order status
    if (payment.order_id) {
      const orderRef = db.collection('payment_orders').doc(payment.order_id);
      batch.update(orderRef, {
        status: 'failed',
        updatedAt: new Date()
      });
    }

    await batch.commit();
    console.log('Payment failed webhook processed:', payment.id);
  } catch (error) {
    console.error('Error processing payment failed:', error);
  }
}

// Helper function to handle order paid event
async function handleOrderPaid(order) {
  try {
    const orderRef = db.collection('payment_orders').doc(order.id);
    await orderRef.update({
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Order paid webhook processed:', order.id);
  } catch (error) {
    console.error('Error processing order paid:', error);
  }
}

// Get user payment history
exports.getUserPaymentHistory = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to view payment history'
      );
    }

    const userId = context.auth.uid;
    const { limit = 10, startAfter = null } = data;

    // Build query
    let query = db.collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfter) {
      const startAfterDoc = await db.collection('transactions').doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }

    // Execute query
    const snapshot = await query.get();
    
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null
      });
    });

    return {
      success: true,
      transactions: transactions,
      hasMore: transactions.length === limit
    };

  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to fetch payment history'
    );
  }
});

// Helper endpoint to provide Razorpay key for client-side
exports.getRazorpayKey = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Validate request method
      if (req.method !== 'GET') {
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
      }

      let razorpayConfig;
      try {
        razorpayConfig = validateRazorpayConfig();
      } catch (configError) {
        console.error('Razorpay configuration error:', configError);
        return res.status(500).json({
          success: false,
          error: 'Payment service is not configured properly'
        });
      }

      return res.status(200).json({
        success: true,
        key_id: razorpayConfig.keyId
      });

    } catch (error) {
      console.error('Error fetching Razorpay key:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch Razorpay key'
      });
    }
  });
});

// Export all functions
module.exports = {
  createPaymentOrder: exports.createPaymentOrder,
  verifyPayment: exports.verifyPayment,
  razorpayWebhook: exports.razorpayWebhook,
  getUserPaymentHistory: exports.getUserPaymentHistory,
  getRazorpayKey: exports.getRazorpayKey
};