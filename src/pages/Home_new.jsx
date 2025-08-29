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
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          {percentage > 999 ? '999+' : percentage}%
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
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 min-w-[200px] relative overflow-hidden group hover:from-white/10 hover:to-white/[0.05] transition-all duration-300">
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
);

const ChatItem = ({ is_chat, title, description }) => {
  if (is_chat) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-3 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">{title}</h4>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </div>
          <div className="ml-3 text-white/40">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
        <MessageSquare className="w-8 h-8 text-white/40 mx-auto mb-3" />
        <p className="text-lg font-semibold mb-2 text-white">No Chat Logs</p>
        <p className="text-sm text-white/60">
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

  const openModal = (html) => {
    setModalHtml(html);
  };

  const closeModal = () => {
    setModalHtml(null);
  };

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

  // Calculate spending data
  const budget = userData.userdetails?.budget || 0;
  const bills = userData.user_bills || [];
  
  const calculateTotal = (bills) => {
    return bills.reduce((sum, bill) => {
      const amount = bill.json?.total_amount;
      if (typeof amount === "string") {
        return sum + parseFloat(amount.replace(/[^\d.-]/g, '')) || 0;
      } else if (typeof amount === "number") {
        return sum + amount;
      }
      return sum;
    }, 0);
  };

  const now = new Date();
  const today = now.toDateString();
  const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayBills = bills.filter(bill => new Date(bill.date).toDateString() === today);
  const weekBills = bills.filter(bill => new Date(bill.date) >= currentWeekStart);
  const monthBills = bills.filter(bill => new Date(bill.date) >= currentMonthStart);

  const total = calculateTotal(bills);
  const todaySpent = calculateTotal(todayBills);
  const weekSpent = calculateTotal(weekBills);
  const monthSpent = calculateTotal(monthBills);

  const data = {
    This_Month: { 
      spent: Math.round(monthSpent), 
      budget: budget, 
      percentage: Math.round((monthSpent / budget) * 100) || 0
    },
    This_week: { 
      spent: Math.round(weekSpent), 
      budget: Math.round(budget / 4), 
      percentage: Math.round((weekSpent / (budget / 4)) * 100) || 0
    },
    Today: { 
      spent: Math.round(todaySpent), 
      budget: Math.round(budget / 30), 
      percentage: Math.round((todaySpent / (budget / 30)) * 100) || 0
    },
    overall: { 
      spent: Math.round(total), 
      budget: budget, 
      percentage: Math.round((total / budget) * 100) || 0
    }
  };

  const userSpendings = {
    today: { spent: todaySpent, budget: Math.round(budget / 30) },
    this_week: { spent: weekSpent, budget: Math.round(budget / 4) },
    this_month: { spent: monthSpent, budget: budget },
    overall: { spent: total, budget: budget }
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
  }, [userData, useruid, budget, total, todaySpent, weekSpent, monthSpent]);

  return (
    <div ref={containerRef}>
      <DashboardBackground />
      <div className="min-h-screen relative z-10 text-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pt-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">UTrack</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60">Welcome back,</div>
              <div className="text-lg font-semibold text-white">{userData?.userdetails?.name || 'User'}</div>
            </div>
          </div>

          {/* Spending Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-blue-400" />
              Spending Overview
            </h2>
            <div className="flex flex-wrap gap-4">
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-green-400" />
                Recent Receipts
              </h2>
              <button className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {Array.isArray(bills) && bills.length > 0 ? (
                bills.slice().reverse().map((bill, index) => (
                  <div key={index} className="receipt-item">
                    <ReceiptItem 
                      amount={bill["json"]} 
                      type="expense" 
                      onViewClick={() => openModal(bill["html"])} 
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center min-w-[300px]">
                  <Receipt className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <p className="text-lg font-semibold mb-2 text-white">No receipts added yet</p>
                  <p className="text-sm text-white/60">
                    Use our <span className="text-blue-400 font-medium">advanced receipt scanning</span> tool to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {modalHtml && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl max-w-full max-h-[90vh] overflow-auto relative p-6 shadow-2xl">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white/60 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  ×
                </button>
                <div dangerouslySetInnerHTML={{ __html: modalHtml }} />
              </div>
            </div>
          )}

          {/* Recent Chat */}
          <div className="mb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                Recent Chat
              </h2>
              <button className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            {chats ? (
              <div className="space-y-4">
                {dbchats.map((chat, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all duration-300"
                    onClick={() => console.log("clicked")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60">{chat.timestamp}</span>
                      <MessageSquare className="w-4 h-4 text-white/40" />
                    </div>
                    {dbchats[index].chat[0]?.user && (
                      <p className="text-white/80 text-sm">{chat.chat[0].user.substring(0, 80)}...</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ChatItem
                is_chat={userData?.chatLogs != null}
                title="Food & Delivery"
                description="You spent ₹2,350 on food delivery this week 🍕 — that's 15% more than last week. Want to set a weekly limit?"
              />
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;
