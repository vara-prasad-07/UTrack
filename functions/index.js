const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

admin.initializeApp();

const db = admin.firestore();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

sgMail.setApiKey(SENDGRID_API_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Create Payment Order
exports.createPaymentOrder = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { amount, currency, receipt, description, userId } = req.body;

    if (!amount || !currency || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency, userId'
      });
    }

    const options = {
      amount: amount, // amount in the smallest currency unit
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: userId,
        description: description || 'Payment via UTrack',
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Store order in Firestore
    await db.collection('payment_orders').doc(order.id).set({
      ...order,
      userId: userId,
      status: 'created',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    });
  }
});

// Verify Payment
exports.verifyPayment = functions.https.onRequest(async (req, res) => {
  // Add CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    // Update order status in Firestore
    await db.collection('payment_orders').doc(razorpay_order_id).update({
      status: 'completed',
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      payment_details: payment,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create transaction record
    const transactionData = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: payment.amount / 100, // Convert from paise to main currency unit
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      userId: userId,
      email: payment.email,
      contact: payment.contact,
      description: payment.description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: new Date().toISOString()
    };

    const transactionRef = await db.collection('transactions').add(transactionData);

    // Update user's transaction history
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      [`transactions.${transactionRef.id}`]: transactionData,
      lastTransactionAt: new Date().toISOString(),
      totalTransactions: admin.firestore.FieldValue.increment(1),
      totalAmountSpent: admin.firestore.FieldValue.increment(payment.amount / 100)
    });

    res.json({
      success: true,
      payment: payment,
      transactionId: transactionRef.id
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

// Webhook endpoint for Razorpay
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      default:
        console.log('Unhandled event:', event.event);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

const handlePaymentCaptured = async (payment) => {
  try {
    // Update transaction status
    const transactionQuery = await db.collection('transactions')
      .where('paymentId', '==', payment.id)
      .limit(1)
      .get();

    if (!transactionQuery.empty) {
      const transactionDoc = transactionQuery.docs[0];
      await transactionDoc.ref.update({
        status: 'captured',
        capturedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log('Payment captured:', payment.id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

const handlePaymentFailed = async (payment) => {
  try {
    // Update transaction status
    const transactionQuery = await db.collection('transactions')
      .where('paymentId', '==', payment.id)
      .limit(1)
      .get();

    if (!transactionQuery.empty) {
      const transactionDoc = transactionQuery.docs[0];
      await transactionDoc.ref.update({
        status: 'failed',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        error_description: payment.error_description
      });
    }

    console.log('Payment failed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

exports.sendSpendingAlert = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    const spendings = after.user_spendings;
    const email = after.email;
    const name = after.name;

    if (spendings?.today?.spent > spendings?.today?.budget) {
      const msg = {
        to: email,
        from: ADMIN_EMAIL,
        subject: `Alert: You're over budget today`,
        text: `Hi ${name}, you have spent ₹${spendings.today.spent} today, which exceeds your daily budget of ₹${spendings.today.budget}.`,
      };

      try {
        await sgMail.send(msg);
        console.log("Email sent to", email);
      } catch (err) {
        console.error("Error sending email:", err);
      }
    }
  });