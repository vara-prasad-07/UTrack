const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

admin.initializeApp();

const db = admin.firestore();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY);

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