import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const Home = () => {
  return (
    <div className="page home-page">
      <div className="spending-card">
        <div className="spending-title">Track your spending's, Vara!</div>
        <div className="spending-summary-grid">
          <div className="summary-card">
            <div className="summary-label">This Month</div>
            <div className="summary-amount">12,500/-<br/><span className="summary-range">15,000/-</span></div>
            <div className="summary-progress green"></div>
          </div>
          <div className="summary-card">
            <div className="summary-label">This Week</div>
            <div className="summary-amount">4,500/-<br/><span className="summary-range">3,750/-</span></div>
            <div className="summary-progress red"></div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Today</div>
            <div className="summary-amount">400/-<br/><span className="summary-range">500/-</span></div>
            <div className="summary-progress green"></div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Over All</div>
            <div className="summary-amount">1,2,5000/-<br/><span className="summary-range">1,5,0000/-</span></div>
            <div className="summary-progress green"></div>
          </div>
        </div>
      </div>
      <div className="receipts-card">
        <div className="section-title-row">
          <span>Recent receipts</span>
          <span className="view-all">view all</span>
        </div>
        <div className="receipts-list">
          <div className="receipt-img"><div className="receipt-x" /></div>
          <div className="receipt-img"><div className="receipt-x" /></div>
          <div className="receipt-img"><div className="receipt-x" /></div>
          <div className="receipt-img"><div className="receipt-x" /></div>
        </div>
        <div className="receipts-labels">
          <span className="receipt-label red">You spend 20000/-</span>
          <span className="receipt-label green">You spend 2000/-</span>
          <span className="receipt-label red">You spend 10000/-</span>
          <span className="receipt-label green">You spend 5000/-</span>
        </div>
      </div>
      <div className="chat-card">
        <div className="section-title-row">
          <span>Recent chat</span>
          <span className="view-all">view all</span>
        </div>
        <div className="chat-list">
          <div className="chat-item">
            <div className="chat-title-row">
              <span className="chat-title">Food & Delivery</span>
              <span className="chat-icon">↗</span>
            </div>
            <div className="chat-msg">You spent ₹2,350 on food delivery this week 🍔— that’s 15% more than last week. Want to set a weekly limit?</div>
          </div>
          <div className="chat-item">
            <div className="chat-title-row">
              <span className="chat-title">Travel Expenses</span>
              <span className="chat-icon">↗</span>
            </div>
            <div className="chat-msg">₹6,100 went into fuel and cab rides this month 🚕. You’ve been traveling more than usual. Shall I suggest budget tips?</div>
          </div>
          <div className="chat-item">
            <div className="chat-title-row">
              <span className="chat-title">Subscriptions</span>
              <span className="chat-icon">↗</span>
            </div>
            <div className="chat-msg">You paid ₹1,299 in subscriptions this month — Netflix, Spotify, and 3 others. Want a reminder before renewals?</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home; 