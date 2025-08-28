#!/usr/bin/env node

/**
 * Simple local server to test Firebase Functions without emulators
 * This simulates the createPaymentOrder function for testing
 */

const http = require('http');
const url = require('url');

// Set up the environment like Firebase Functions would
process.env.NODE_ENV = 'development';
require('dotenv').config();

// Import our functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (same as in functions/index.js)
admin.initializeApp({
    projectId: 'utrack-d3efb'
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Import Razorpay
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Simulate the createPaymentOrder function
async function createPaymentOrder(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // Handle GET requests differently
                if (req.method === 'GET') {
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Method not allowed. Use POST with JSON body.'
                    }));
                    return;
                }

                // Only parse JSON for POST requests with body
                if (!body) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Request body is required'
                    }));
                    return;
                }

                const { amount, currency, receipt, description, userId } = JSON.parse(body);

                if (!amount || !currency || !userId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Missing required fields: amount, currency, userId'
                    }));
                    return;
                }

                const options = {
                    amount: amount,
                    currency: currency,
                    receipt: receipt || `receipt_${Date.now()}`,
                    notes: {
                        userId: userId,
                        description: description || 'Payment via UTrack',
                        timestamp: new Date().toISOString()
                    }
                };

                console.log('Creating Razorpay order with options:', options);

                // Mock Razorpay order creation (since we're using test keys)
                const mockOrder = {
                    id: `order_${Date.now()}`,
                    entity: 'order',
                    amount: options.amount,
                    amount_paid: 0,
                    amount_due: options.amount,
                    currency: options.currency,
                    receipt: options.receipt,
                    status: 'created',
                    attempts: 0,
                    notes: options.notes,
                    created_at: Math.floor(Date.now() / 1000)
                };

                console.log('Mock order created:', mockOrder);

                // Simulate storing in Firestore (without actually writing to prevent errors)
                const firestoreDoc = {
                    ...mockOrder,
                    userId: userId,
                    status: 'created',
                    createdAt: FieldValue.serverTimestamp()
                };

                console.log('Would store in Firestore:', firestoreDoc);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    order: mockOrder,
                    message: 'Mock order created successfully (test mode)'
                }));

            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Invalid JSON in request body'
                }));
            }
        });

    } catch (error) {
        console.error('Error creating payment order:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Failed to create payment order'
        }));
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    console.log(`${req.method} ${req.url}`);

    if (parsedUrl.pathname === '/createPaymentOrder') {
        createPaymentOrder(req, res);
    } else if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>UTrack Payment Function Test Server</h1>
            <p>Server is running on port 3001</p>
            <p>Endpoints:</p>
            <ul>
                <li><strong>POST /createPaymentOrder</strong> - Test payment order creation</li>
            </ul>
            <p>Use the payment-test.html page to test the function.</p>
            <p>Make sure to set the endpoint URL to: <code>http://localhost:3001/createPaymentOrder</code></p>
        `);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 UTrack Payment Function Test Server running on http://localhost:${PORT}`);
    console.log(`📋 Test the function at: http://localhost:${PORT}/createPaymentOrder`);
    console.log(`🌐 Open payment-test.html and set endpoint to: http://localhost:${PORT}/createPaymentOrder`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set'}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});