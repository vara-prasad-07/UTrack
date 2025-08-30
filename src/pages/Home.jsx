import React, { useEffect, useState, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; 
import SkeletonLayout from "../components/SkeletonLayout";
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
  ArrowDownRight,
  Wallet,
  CreditCard,
  PieChart
} from 'lucide-react';

// ===== BUDGET ALERT SYSTEM =====
const checkBudgetAlerts = async (userSpendings, userEmail) => {
  if (!userEmail) return;

  const alerts = [];
  
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

  if (alerts.length > 0) {
    await sendBudgetAlert(userEmail, alerts);
  }
};

const sendBudgetAlert = async (email, alerts) => {
  try {
    console.log('📧 Sending email to:', email);
    console.log('⚠️ Alerts:', alerts);
    
    if (!window.emailjs) {
      console.error('❌ EmailJS not loaded!');
      return;
    }
    
    const emailjs = window.emailjs;
    
    const alertDetails = alerts.map(alert => 
      `• ${alert.period}: Spent ₹${alert.spent} (${alert.percentage}% of budget)`
    ).join('\n');

    const templateParams = {
      to_email: email,
      user_name: email.split('@')[0],
      alert_details: alertDetails,
      total_alerts: alerts.length
    };

    await emailjs.send(
      'service_budgetalert',
      'template_spending',
      templateParams,
      'T7EQumvfZ3OqTcmrm'
    );

    console.log('✅ Budget alert email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};

// Last alert tracking
let lastAlertTime = {};

const shouldSendAlert = (email, exceededBudgets) => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  const alertKey = email + JSON.stringify(exceededBudgets);
  
  if (!lastAlertTime[alertKey] || (now - lastAlertTime[alertKey]) > oneHour) {
    lastAlertTime[alertKey] = now;
    return true;
  }
  return false;
};

// Modern Dashboard Background
function DashboardBackground() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
      </div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
    </div>
  );
}

const CircularProgress = ({ percentage, color, size = 48 }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  
  // Safely handle percentage for display and calculation
  const safePercentage = Math.max(0, Math.min(percentage || 0, 100)); // Cap at 100% for visual
  const displayPercentage = isFinite(percentage) && percentage !== null ? 
    (percentage > 999 ? '999+' : Math.round(percentage * 10) / 10) : 0;
  
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        className="transform -rotate-90" 
        viewBox="0 0 40 40"
        style={{ width: size, height: size }}
      >
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-white/10"
        />
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-white">
          {displayPercentage}%
        </span>
      </div>
    </div>
  );
};

const SpendingCard = ({ keyValue, title, spent, budget, color, percentage }) => {
  const isOverBudget = percentage > 100;
  const TrendIcon = isOverBudget ? ArrowUpRight : ArrowDownRight;

  if (keyValue === "overall") {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 w-full hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/70 text-xs font-medium uppercase tracking-wide">
            {title}
          </h3>
          <div className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-red-400' : 'bg-green-400'} animate-pulse`}></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-white text-lg sm:text-base font-bold mb-1">₹{spent}</div>
            <div className="text-white/50 text-xs">of ₹{budget}</div>
          </div>
          <div className="flex-shrink-0">
            <CircularProgress 
              percentage={percentage} 
              color={isOverBudget ? '#f87171' : '#4ade80'} 
              size={36}
            />
            <div className="text-center mt-1">
              <span className="text-xs text-white/60">
                {isFinite(percentage) ? (percentage > 999 ? '999+' : Math.round(percentage * 10) / 10) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 w-full hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-white/70 text-xs sm:text-xs font-medium uppercase tracking-wide truncate">
          {title.replace('_', ' ')}
        </h3>
        <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${isOverBudget ? 'bg-red-400' : 'bg-green-400'} animate-pulse flex-shrink-0`}></div>
      </div>
      
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-white text-lg sm:text-base font-bold mb-1 truncate">₹{spent}</div>
            <div className="text-white/50 text-xs truncate">₹{budget} budget</div>
          </div>
          <div className="hidden sm:block flex-shrink-0">
            <CircularProgress 
              percentage={percentage} 
              color={isOverBudget ? '#f87171' : '#4ade80'} 
              size={40}
            />
          </div>
        </div>
        
        {/* Mobile progress bar */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Progress</span>
            <span>
              {isFinite(percentage) ? (percentage > 999 ? '999+' : Math.round(percentage * 10) / 10) : 0}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min(Math.max(percentage || 0, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptItem = ({ amount, type, onViewClick }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-between min-w-[140px] sm:min-w-[120px] max-w-[160px] sm:max-w-[140px] hover:bg-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl">
    <div className="flex items-center justify-between w-full mb-4">
      <Receipt className="w-5 h-5 sm:w-4 sm:h-4 text-white/60" />
      <div className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full ${type === 'expense' ? 'bg-red-400' : 'bg-green-400'}`}></div>
    </div>
    
    <div className="text-center mb-4 w-full">
      <div className="text-xs text-white/60 mb-2">Amount</div>
      <div className={`text-xl sm:text-lg font-bold ${type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
        ₹{amount.total_amount}
      </div>
    </div>
    
    <button
      onClick={onViewClick}
      className="w-full bg-white/10 hover:bg-white/20 text-white text-sm sm:text-xs py-3 sm:py-2 px-4 sm:px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-1 font-medium"
    >
      <Eye className="w-4 h-4 sm:w-3 sm:h-3" />
      View Receipt
    </button>
  </div>
);

const ChatItem = ({ is_chat, title, description }) => {
  if (is_chat) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-3 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg sm:text-base">{title}</h4>
                <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full mt-1 inline-block">
                  Active Chat
                </div>
              </div>
            </div>
            <p className="text-white/80 text-base sm:text-sm leading-relaxed mb-4">{description}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm py-3 sm:py-2 px-4 rounded-xl transition-all duration-300 font-medium">
                Continue Chat
              </button>
              <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm py-3 sm:py-2 px-4 rounded-xl transition-all duration-300 font-medium">
                Details
              </button>
            </div>
          </div>
          <div className="ml-3">
            <div className="w-3 h-3 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
        <MessageSquare className="w-12 h-12 sm:w-8 sm:h-8 text-white/40 mx-auto mb-4 sm:mb-3" />
        <p className="text-xl sm:text-lg font-semibold mb-3 sm:mb-2 text-white">No Chat Logs</p>
        <p className="text-base sm:text-sm text-white/60 max-w-md mx-auto">
          Use our <span className="text-blue-400 font-medium">advanced AI-budget-planner</span> tool to get started!
        </p>
      </div>
    );
  }
};

const Home = () => {
  const [userData, setUserData] = useState(null);
  const [userBills, setUserBills] = useState(null);
  const [htmlData, setHtmlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalHtml, setModalHtml] = useState(null);
  const [chats, setChats] = useState(false);
  const [dbchats, setDbChats] = useState([]);
  const [useruid, setUserUid] = useState(null);
  
  const containerRef = useRef(null);
  const cardsRef = useRef(null);

  // Update calculations when userData changes
  useEffect(() => {
    if (userData && useruid) {
      updateUserSpendings();
    }
  }, [userData, useruid]);

  // All hooks must be called before any conditional returns
  useGSAP(() => {
    if (containerRef.current && !loading) {
      const cards = containerRef.current.querySelectorAll('.spending-card');
      const receipts = containerRef.current.querySelectorAll('.receipt-item');
      
      gsap.set(cards, { y: 50, opacity: 0 });
      gsap.set(receipts, { y: 30, opacity: 0 });
      
      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });
      
      gsap.to(receipts, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.3
      });
    }
  }, { scope: containerRef, dependencies: [loading] });
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setUserUid(user.uid);
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            
            if (docSnap.data().user_chats && docSnap.data().user_chats.length > 0) {
              setChats(true);
              setDbChats(docSnap.data().user_chats);
            }
            setLoading(false);
            console.log("Retrieved successfully");
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

  // Calculate data only when userData is available
  const budget = userData?.usersettings?.montly_budget || 0; // Fixed: use usersettings.montly_budget
  const bills = userData?.user_bills || [];
  
  const calculateTotal = (bills) => {
    return bills.reduce((sum, bill) => {
      const amount = bill.json?.total_amount;
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
  };

  // Parse flexible date formats from the original code
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

  // Original working calculation logic
  function calculateSpendingByTime(userbill) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday start
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

  // Get spending data using original logic
  const { total, today, week, month } = calculateSpendingByTime(bills || []);

  console.log('Debug - Spending data:', {
    today,
    week,
    month,
    total,
    budget,
    budgetSource: userData?.usersettings?.montly_budget
  });

  // Original working data structure with corrected percentage calculations
  const data = {
    Today: { 
      spent: today, 
      budget: budget > 0 ? parseInt(budget / 30) : 0, 
      percentage: budget > 0 ? parseInt((today / (budget / 30)) * 100) : 0
    },
    This_week: { 
      spent: week, 
      budget: budget > 0 ? parseInt(budget / 4) : 0, 
      percentage: budget > 0 ? parseInt((week / (budget / 4)) * 100) : 0
    },
    This_Month: { 
      spent: month, 
      budget: budget, 
      percentage: budget > 0 ? parseInt((month / budget) * 100) : 0
    },
    overall: { 
      spent: total, 
      budget: budget, 
      percentage: budget > 0 ? parseInt((total / budget) * 100) : 0
    }
  };

  const userSpendings = {
    today: { 
      spent: today, 
      budget: budget > 0 ? parseInt(budget / 30) : 0 
    },
    this_week: { 
      spent: week, 
      budget: budget > 0 ? parseInt(budget / 4) : 0 
    },
    this_month: { 
      spent: month, 
      budget: budget 
    },
    overall: { 
      spent: total, 
      budget: budget 
    }
  };

  const updateUserSpendings = async () => {
    try {
      const userRef = doc(db, "users", useruid);
      await updateDoc(userRef, {
        userspendings: userSpendings
      });
      console.log("✅ User spendings updated successfully.");
      
      const user = auth.currentUser;
      if (user?.email) {
        const exceededBudgets = Object.entries(userSpendings).filter(([_, data]) => data.spent > data.budget);
        
        if (exceededBudgets.length > 0 && shouldSendAlert(user.email, exceededBudgets)) {
          console.log('📧 Sending alert to:', user.email);
          await checkBudgetAlerts(userSpendings, user.email);
        }
      }
    } catch (error) {
      console.error("❌ Error updating user spendings:", error);
    }
  };

  useEffect(() => {
    if (userData && useruid && budget) {
      updateUserSpendings();
    }
  }, [userData, useruid, budget, total, today, week, month]);

  const openModal = (html) => {
    setModalHtml(html);
  };

  const closeModal = () => {
    setModalHtml(null);
  };

  // Early returns after all hooks have been called
  if (loading) return <SkeletonLayout />;
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Found</h2>
          <p className="text-gray-400">Please complete your setup first.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <DashboardBackground />
      <div className="min-h-screen relative z-10 text-white">
        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-md sm:max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 mb-4 sm:mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 sm:w-5 sm:h-5 bg-white rounded-full"></div>
              </div>
              <span className="text-xl sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">UTrack</span>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-white/60">Welcome back,</div>
              <div className="text-sm sm:text-base font-semibold text-white truncate max-w-[100px] sm:max-w-none">{userData?.userdetails?.name || 'User'}</div>
            </div>
          </div>

          {/* Budget Warning */}
          {budget <= 0 && (
            <div className="mb-6 sm:mb-8 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-200 font-semibold text-sm">No Budget Set</h3>
                  <p className="text-yellow-300/80 text-xs mt-1">
                    Set a monthly budget to track your spending progress accurately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Spending Overview */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 px-1">
              <PieChart className="w-6 h-6 sm:w-6 sm:h-6 text-blue-400" />
              Spending Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
              {Object.entries(data).map(([key, values], index) => (
                <div key={index} className="spending-card">
                  <SpendingCard
                    keyValue={key}
                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                    spent={values.spent}
                    budget={values.budget}
                    color="#10B981"
                    percentage={values.percentage}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Receipts */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
              <h2 className="text-xl sm:text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 sm:w-6 sm:h-6 text-green-400" />
                Recent receipts
              </h2>
              <button className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20">
                <span className="hidden sm:inline">view all</span>
                <span className="sm:hidden">view all</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 hide-scrollbar">
              {Array.isArray(bills) && bills.length > 0 ? (
                bills.slice().reverse().map((bill, index) => (
                  <div key={index} className="receipt-item flex-shrink-0">
                    <ReceiptItem 
                      amount={bill["json"]} 
                      type="expense" 
                      onViewClick={() => openModal(bill["html"])} 
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 text-center w-full shadow-lg">
                  <Receipt className="w-12 h-12 sm:w-8 sm:h-8 text-white/40 mx-auto mb-4 sm:mb-3" />
                  <p className="text-xl sm:text-lg font-semibold mb-3 sm:mb-2 text-white">No receipts added yet</p>
                  <p className="text-base sm:text-sm text-white/60 max-w-md mx-auto">
                    Use our <span className="text-blue-400 font-medium">advanced receipt scanning</span> tool to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {modalHtml && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative shadow-2xl">
                <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Receipt Details</h3>
                  <button
                    onClick={closeModal}
                    className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 touch-target"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  <div dangerouslySetInnerHTML={{ __html: modalHtml }} />
                </div>
              </div>
            </div>
          )}

          {/* Recent Chat */}
          <div className="mb-20 sm:mb-24">
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
              <h2 className="text-xl sm:text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 sm:w-6 sm:h-6 text-purple-400" />
                Recent chat
              </h2>
              <button className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20">
                <span className="hidden sm:inline">view all</span>
                <span className="sm:hidden">view all</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            {chats ? (
              <div className="space-y-3 sm:space-y-4 px-2">
                {dbchats.map((chat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => console.log("clicked")}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full">{chat.timestamp}</span>
                      <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 text-white/40" />
                    </div>
                    {dbchats[index].chat[0]?.user && (
                      <p className="text-white/80 text-base sm:text-sm leading-relaxed">{chat.chat[0].user.substring(0, 80)}...</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-2">
                <ChatItem
                  is_chat={userData?.chatLogs != null}
                  title="Food & Delivery"
                  description="You spent ₹2,350 on food delivery this week 🍕 — that's 15% more than last week. Want to set a weekly limit?"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;
