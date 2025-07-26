import React from 'react';
import BottomNav from '../components/BottomNav';
import './PageStyles.css';

const CircularProgress = ({ percentage, color }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-700"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};

const SpendingCard = ({ title, spent, budget, color, percentage }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex-1 min-w-[140px]">
    <h3 className="text-white text-sm mb-3">{title}</h3>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white text-lg font-semibold">{spent}</div>
        <div className="text-gray-400 text-sm">{budget}</div>
      </div>
      <CircularProgress percentage={percentage} color={color} />
    </div>
  </div>
);

const ReceiptItem = ({ amount, type }) => (
  <div className="bg-gray-700 p-4 rounded-lg flex-1 min-w-[80px] max-w-[100px]">
    <div className="w-full h-12 bg-gray-600 rounded mb-2 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
    </div>
    <div className="text-xs text-gray-400 mb-1">You spend</div>
    <div className={`text-sm font-semibold ${type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
      {amount}
    </div>
  </div>
);

const ChatItem = ({ title, description, icon }) => (
  <div className="bg-gray-800 p-4 rounded-lg mb-3">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="ml-3 text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
  </div>
);


const Home = () => {
  return (
    <div>
      <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-lg font-medium">Track your spending's, Vara!</h1>
        </div>

        {/* Spending Overview */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <SpendingCard
              title="This Month"
              spent="12,500/-"
              budget="15,000/-"
              color="#10B981"
              percentage={83}
            />
            <SpendingCard
              title="This Week"
              spent="4,500/-"
              budget="3,750/-"
              color="#F59E0B"
              percentage={120}
            />
            <SpendingCard
              title="Today"
              spent="400/-"
              budget="500/-"
              color="#10B981"
              percentage={80}
            />
            <SpendingCard
              title="Over All"
              spent="1,2,5000/-"
              budget="1,5,0000/-"
              color="#10B981"
              percentage={83}
            />
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent receipts</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors">
              view all
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2  hide-scrollbar">
            <ReceiptItem amount="250/-" type="expense" />
            <ReceiptItem amount="600/-" type="income" />
            <ReceiptItem amount="150/-" type="expense" />
            <ReceiptItem amount="300/-" type="income" />
          </div>
        </div>

        {/* Recent Chat */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent chat</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors">
              view all
            </button>
          </div>
          <div>
            <ChatItem
              title="Food & Delivery"
              description="You spent ₹2,350 on food delivery this week 🍕 — that's 15% more than last week. Want to set a weekly limit?"
              icon="refresh"
            />
            <ChatItem
              title="Travel Expenses"
              description="₹6,100 went into fuel and cab rides this month 🚗. You've been traveling more than usual. Shall I suggest budget tips?"
              icon="refresh"
            />
            <ChatItem
              title="Subscriptions"
              description="You spent ₹1,250 in subscriptions this month 💳 — Netflix, Spotify, and 3 others. Want a reminder before they renew?"
              icon="refresh"
            />
          </div>
        </div>
      </div>
    </div>

      <BottomNav />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
    </div>
  );
};

export default Home; 