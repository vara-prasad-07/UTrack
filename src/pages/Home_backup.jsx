import React from 'react';
import BottomNav from '../components/BottomNav';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 
import SkeletonLayout from "../components/SkeletonLaconst ReceiptItem = ({ amount, type, onViewClick }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col items-center justify-between min-w-[120px] max-w-[140px] hover:bg-white/10 transition-all duration-300 group">
    <div className="flex items-center justify-between w-full mb-3">
      <Receipt className="w-4 h-4 text-white/60" />
      <div className={`w-2 h-2 rounded-full ${type === 'expense' ? 'bg-red-400' : 'bg-green-400'}`}></div>
    </div>
    
    <div className="text-center mb-3">
      <div className="text-xs text-white/60 mb-1">Amount</div>
      <div className={`text-lg font-bold ${type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
        ₹{amount.total_amount}
      </div>
    </div>
    
    <button
      onClick={onViewClick}
      className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-1"
    >
      <Eye className="w-3 h-3" />
      View
    </button>
  </div>
); { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Receipt, 
  MessageSquare,
  Target,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// ===== BUDGET ALERT SYSTEM =====
const checkBudgetAlerts = async (userSpendings, userEmail) => {
  if (!userEmail) return;

  const alerts = [];
  
  // Check each spending category
  Object.entries(userSpendings).forEach(([period, data]) => {
    if (data.spent > data.budget) {
      const overAmount = data.spent - data.budget;
      const percentage = ((data.spent / data.budget) * 100).toFixed(1);
      
      alerts.push({
        period: period.replace('_', ' '),
        spent: data.spent,
        budget: data.budget,
        overAmount,
        percentage
      });
    }
  });

  // Send email if there are alerts
  if (alerts.length > 0) {
    await sendBudgetAlert(userEmail, alerts);
  }
};

// Using EmailJS for direct frontend email sending
const sendBudgetAlert = async (email, alerts) => {
  try {
    console.log('📧 Sending email to:', email);
    console.log('⚠️ Alerts:', alerts);
    
    // Check if EmailJS is loaded
    if (!window.emailjs) {
      console.error('❌ EmailJS not loaded! Add script to index.html');
      return;
    }
    
    const emailjs = window.emailjs;
    
    const templateParams = {
      to_email: email,
      from_name: 'UTrack Budget Tracker',
      subject: '⚠️ Budget Alert - Spending Limit Exceeded',
      message: generateEmailContent(alerts),
      user_name: email.split('@')[0] || 'User'
    };
    
    console.log('📤 Email params:', templateParams);
    
    const result = await emailjs.send(
      'service_ful4uz9',    // Replace with your actual service ID
      'template_mclzm0d',   // Replace with your actual template ID
      templateParams,
      'fLOITCpvOwm6RubYs'     // Replace with your actual public key
    );
    
    console.log('✅ Budget alert sent successfully:', result);
  } catch (error) {
    console.error('❌ Failed to send budget alert:', error);
  }
};

// Generate email content
const generateEmailContent = (alerts) => {
  let content = `🚨 BUDGET ALERT 🚨\n\nYou have exceeded your budget limits:\n\n`;
  
  alerts.forEach(alert => {
    content += `📊 ${alert.period.toUpperCase()}:\n`;
    content += `   • Spent: ₹${alert.spent.toFixed(2)}\n`;
    content += `   • Budget: ₹${alert.budget.toFixed(2)}\n`;
    content += `   • Over by: ₹${alert.overAmount.toFixed(2)} (${alert.percentage}%)\n\n`;
  });
  
  content += `💡 Consider reviewing your expenses to stay on track!\n\nBest regards,\nUTrack Budget Tracker`;
  return content;
};

// Rate limiting to prevent spam
let lastAlertTime = {};
const shouldSendAlert = (email, alerts) => {
  const now = Date.now();
  const key = `${email}_${alerts.map(a => a.period).join('_')}`;
  const lastSent = lastAlertTime[key] || 0;
  const cooldown = 6 * 60 * 60 * 1000; // 6 hours cooldown
  
  if (now - lastSent > cooldown) {
    lastAlertTime[key] = now;
    return true;
  }
  return false;
};
// ===== END BUDGET ALERT SYSTEM =====

const CircularProgress = ({ percentage, color, size = 48 }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        viewBox="0 0 40 40"
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white">
          {percentage > 999 ? '999+' : percentage}%
        </span>
      </div>
    </div>
  );
};

const SpendingCard = ({ keyValue, title, spent, budget, color, percentage }) => {
  const isOverBudget = percentage > 100;
  const trendIcon = isOverBudget ? ArrowUpRight : ArrowDownRight;
  const TrendIcon = trendIcon;

  if (keyValue === "overall") {
    return (
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 min-w-[200px] relative overflow-hidden group hover:from-white/10 hover:to-white/[0.05] transition-all duration-300">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
              <TrendIcon className={`w-4 h-4 ${isOverBudget ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-white text-lg font-bold mb-1">₹{spent}</div>
              <div className="w-full h-[2px] bg-white/20 rounded-full mb-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-white/60 text-sm">of ₹{budget}</div>
            </div>
            
            <div className="ml-4">
              <CircularProgress 
                percentage={percentage} 
                color={isOverBudget ? '#f87171' : '#4ade80'} 
                size={56}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex-1 min-w-[160px] hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/70 text-xs font-medium uppercase tracking-wide">
          {title.replace('_', ' ')}
        </h3>
        <div className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-white text-base font-semibold mb-1">₹{spent}</div>
          <div className="text-white/50 text-xs">₹{budget} budget</div>
        </div>
        <CircularProgress 
          percentage={percentage} 
          color={isOverBudget ? '#f87171' : '#4ade80'} 
          size={40}
        />
      </div>
    </div>
  );
};

const ReceiptItem = ({ amount, type, onViewClick }) => (
  <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center justify-between min-w-[80px] max-w-[100px]">
    <div className="text-xs text-gray-200 mb-1 whitespace-nowrap">You spend</div>
    <div className={`text-sm font-semibold mb-2 ${type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
      {amount.total_amount}
    </div>
    <button
      onClick={onViewClick}
      className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 transition"
    >
      View
    </button>
  </div>
);

const ChatItem = ({ is_chat, title, description }) => {
  if (is_chat) {
    return (
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
  } else {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg text-center shadow-md max-w-xs mx-auto">
        <p className="text-lg font-semibold mb-2">No Chat Logs</p>
        <p className="text-sm text-gray-400">
          Use our <span className="text-blue-400 font-medium">advanced AI-budget-planner</span> tool to get started!
        </p>
      </div>
    );
  }
}

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [userBills, setUserBills] = useState(null);
  const [htmlData, setHtmlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalHtml, setModalHtml] = useState(null);
  const [chats, setChats] = useState(false);
  const [dbchats, setDbChats] = useState([]);
  const [useruid, setUserUid] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUserUid(user.uid)
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            
            if (docSnap.data().user_chats.length > 0) {
              setChats(docSnap.data().user_chats.length > 0);
              setDbChats(docSnap.data().user_chats);
            }
            setLoading(false);
            console.log("retrieved successfully");
          } else {
            console.log("No user data found in Firestore");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        console.log("No user logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  const openModal = (htmlContent) => {
    setModalHtml(htmlContent);
  };

  const closeModal = () => {
    setModalHtml(null);
  };

  const budget = userData?.usersettings?.montly_budget

  const recieptsData = userData?.user_bills != null;
  const userBill = userData?.user_bills;
  let value = 0;
  console.log(userBill)
  if (recieptsData) {
    value = calculateTotalSpending(userData?.user_bills)
  }

  function parseFlexibleDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;

    // Try ISO first
    let parsed = new Date(dateStr);
    if (!isNaN(parsed)) return parsed;

    // Try DD/MM/YYYY HH:mm
    const slashMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
    if (slashMatch) {
      const [, dd, mm, yyyy, hh = "00", min = "00"] = slashMatch;
      return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`);
    }

    // Try DD-MM-YYYY HH:mm:ss AM/PM
    const dashMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (dashMatch) {
      let [, dd, mm, yyyy, hh, min, sec, ampm] = dashMatch;
      hh = parseInt(hh);
      if (ampm.toUpperCase() === "PM" && hh !== 12) hh += 12;
      if (ampm.toUpperCase() === "AM" && hh === 12) hh = 0;
      return new Date(`${yyyy}-${mm}-${dd}T${String(hh).padStart(2, '0')}:${min}:${sec}`);
    }

    return null;
  }

  function calculateSpendingByTime(userbill) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let total = 0, today = 0, week = 0, month = 0;

    for (const bill of userbill) {
      const amountRaw = bill?.json?.total_amount;
      const dateStr = bill?.json?.time_stamp;

      if (!amountRaw || !dateStr) continue;

      const amount = typeof amountRaw === "string"
        ? parseFloat(amountRaw.match(/\d+(\.\d+)?/)?.[0] || 0)
        : amountRaw;

      if (isNaN(amount)) continue;

      const billDate = parseFlexibleDate(dateStr);
      if (!billDate || isNaN(billDate)) continue;

      total += amount;

      if (billDate.toISOString().slice(0, 10) === todayStr) {
        today += amount;
      }

      if (billDate >= startOfWeek && billDate <= now) {
        week += amount;
      }

      if (billDate >= startOfMonth && billDate <= now) {
        month += amount;
      }
    }

    return { total, today, week, month };
  }

  const { total, today, week, month } = calculateSpendingByTime(userBill || []);
  console.log({ total, today, week, month });

  function calculateTotalSpending(userbill) {
    return userbill.reduce((sum, bill) => {
      const amount = bill["json"].total_amount;
      console.log(bill["json"].time_stamp)
      if (typeof amount === "string") {
        const digits = amount.match(/\d+(\.\d+)?/);
        if (digits) {
          return sum + parseFloat(digits[0]);
        }
      } else if (typeof amount === "number") {
        return sum + amount;
      }
      return sum;
    }, 0);
  }
  
  console.log(value)
  const chatData = userData?.chatLogs != null;
  const budgetObject = {
    month: budget,
    week: (budget) / 4,
    day: (budget) / 30
  }

  const data = {
    This_Month: { spent: month, budget: budget, percentage: parseInt((month / budget) * 100) },
    This_week: { spent: week, budget: parseInt((budget) / 4), percentage: parseInt((week / 4) / (budget / 4) * 100) },
    Today: { spent: today, budget: parseInt((budget) / 30), percentage: parseInt((today / 30) / (budget / 30) * 100) },
    overall: { spent: total, budget: budget, percentage: parseInt((total / budget) * 100) }
  };

  const userSpendings = {
    today: { spent: today, budget: parseInt((budget) / 30) },
    this_week: { spent: week, budget: parseInt((budget) / 4) },
    this_month: { spent: month, budget: budget },
    overall: { spent: total, budget: budget }
  }

  const updateUserSpendings = async () => {
    try {
      const userRef = doc(db, "users", useruid);
      await updateDoc(userRef, {
        userspendings: userSpendings
      });
      console.log("✅ userspendings updated successfully.");
      
      // ===== CHECK FOR BUDGET ALERTS AFTER UPDATING =====
      const user = auth.currentUser;
      console.log('🔍 Checking alerts for user:', user?.email);
      console.log('📊 User spendings:', userSpendings);
      
      if (user?.email) {
        const exceededBudgets = Object.entries(userSpendings).filter(([_, data]) => data.spent > data.budget);
        console.log('⚠️ Exceeded budgets:', exceededBudgets);
        
        if (exceededBudgets.length > 0 && shouldSendAlert(user.email, exceededBudgets)) {
          console.log('📧 Sending alert to:', user.email);
          await checkBudgetAlerts(userSpendings, user.email);
        }
      }
      // ===== END BUDGET ALERT CHECK =====
      
    } catch (error) {
      console.error("❌ Error updating userspendings:", error);
    }
  };

  // Call updateUserSpendings when data is ready
  useEffect(() => {
    if (userData && useruid && budget) {
      updateUserSpendings();
    }
  }, [userData, useruid, budget, total, today, week, month]);

  console.log(budgetObject)
  if (loading) return <SkeletonLayout />;

  return (
    <div>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-start p-6 pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full"></div>
              </div>
              <span className="text-xl text-white font-semibold">UTrack</span>
            </div>
          </div>

          {/* Spending Overview */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              {Object.entries(data).map(([key, values], index) => (
                <SpendingCard
                  key={index}
                  keyValue={key}
                  title={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                  spent={`${values.spent}/-`}
                  budget={`${values.budget}/-`}
                  color="#10B981"
                  percentage={values.percentage}
                />
              ))}
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
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {Array.isArray(userData?.user_bills) && userData.user_bills.length > 0 ? (
                userData.user_bills.slice().reverse().map((bill, index) => (
                  <ReceiptItem key={index} amount={bill["json"]} type="expense" onViewClick={() => openModal(bill["html"])} />
                ))
              ) : (
                <div className="bg-gray-800 text-white p-4 rounded-lg text-center shadow-md max-w-xs mx-auto">
                  <p className="text-lg font-semibold mb-2">No receipts added yet</p>
                  <p className="text-sm text-gray-400">
                    Use our <span className="text-blue-400 font-medium">advanced receipt scanning</span> tool to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {modalHtml && (
            <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center px-4">
              <div className="bg-black rounded-lg max-w-full max-h-[90vh] overflow-auto hide-scrollbar relative scroll p-6 shadow-lg">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-white text-xl font-bold"
                >
                  &times;
                </button>
                <div dangerouslySetInnerHTML={{ __html: modalHtml }} />
              </div>
            </div>
          )}

          {/* Recent Chat */}
          {chats ? (
            <div className="chat-list">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Recent chat</h2>
                <button className="text-gray-400 text-sm hover:text-white transition-colors">
                  view all
                </button>
              </div>
              {dbchats.map((chat, index) => (
                <div
                  key={index}
                  className='chat-item'
                  onClick={() => console.log("clicked")}
                >
                  <span>{chat.timestamp}</span>
                  {dbchats[index].chat[0].user.length > 0 && (
                    <p>{chat.chat[0].user.substring(0, 30)}...</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Recent chat</h2>
                <button className="text-gray-400 text-sm hover:text-white transition-colors">
                  view all
                </button>
              </div>
              <div>
                <ChatItem
                  is_chat={chatData}
                  title="Food & Delivery"
                  description="You spent ₹2,350 on food delivery this week 🍕 — that's 15% more than last week. Want to set a weekly limit?"
                />
              </div>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default Home;