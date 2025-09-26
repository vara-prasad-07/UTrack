import React, { useState, useEffect, useRef, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { 
  MessageSquare, 
  Send, 
  Menu, 
  X, 
  Plus,
  Bot,
  User,
  Sparkles,
  Clock,
  Zap
} from 'lucide-react';

// Professional Chat Background
function ChatBackground() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"></div>
    </div>
  );
}

// Professional Typing Animation
const TypingAnimation = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
    <span className="text-gray-500 dark:text-gray-400 text-sm">Finzi is typing...</span>
  </div>
);

// Professional Message Component
const MessagePair = React.memo(({ message, index, isLast, isTyping }) => (
  <div className="message-pair space-y-6 py-4">
    {/* User message */}
    <div className="flex justify-end">
      <div className="max-w-3xl">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed">{message.user}</p>
        </div>
      </div>
    </div>
    
    {/* Assistant message or typing animation */}
    {message.chatbot ? (
      <div className="flex justify-start">
        <div className="max-w-3xl">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.chatbot}</p>
          </div>
        </div>
      </div>
    ) : isLast && isTyping && (
      <div className="flex justify-start">
        <div className="max-w-3xl">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            <TypingAnimation />
          </div>
        </div>
      </div>
    )}
  </div>
));

const Ask = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [allChats, setAllChats] = useState([[]]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [username, setUserName] = useState(null);
  const [userpresentChat, setUserPresentChat] = useState(null);
  const [isChats, setIsChats] = useState(false);
  const [dbchats, setDbChats] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // GSAP Animations - Only run once on mount
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo('.chat-header', 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.input-area', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.2'
    );
  }, { scope: containerRef });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewChat = () => {
    const newChats = [...allChats, []];
    setAllChats(newChats);
    setCurrentChatIndex(newChats.length - 1);
    setChats([]);
    setSidebarOpen(false);
  };

  const switchToChat = (index) => {
    setCurrentChatIndex(index);
    setChats(dbchats[index].chat || []);
    setSidebarOpen(false);
  };

  // Check if screen is desktop size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      // Auto-open sidebar on desktop
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const userChatDb = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        setIsChats(true);
        setDbChats(docSnap.data().user_chats);
        console.log("retrieved successfully");
      } else {
        console.log("No user data found in Firestore");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      
      // Handle specific Firebase errors
      if (err.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        console.warn('Firebase blocked by browser/extension. Chat history may not be available.');
        // Continue without chat history rather than failing completely
        setIsChats(false);
        setDbChats([]);
      } else if (err.code === 'permission-denied') {
        console.error('Firebase permission denied. Check Firestore rules.');
      } else if (err.code === 'unavailable') {
        console.error('Firebase service temporarily unavailable.');
      }
    }
  };

  // Call userChatDb when user is available
  useEffect(() => {
    if (user?.uid) {
      userChatDb();
    }
  }, [user]);

  console.log(username);

  const simulateTyping = (text, callback) => {
    setIsTyping(true);
    let index = 0;
    let displayText = '';
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        displayText += text[index];
        callback(displayText);
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 50);
  };

  const getData = async (message) => {
    if (!message || !user?.uid) return "No message provided or user not authenticated";
  
    try {
      // Add request timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, 30000); // 30 seconds
      
      const res = await fetch('https://bill-assistant-1.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, uid: user.uid }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle specific HTTP status codes
      if (res.status === 500) {
        return "🚫 **Server Error**: Finzi is temporarily experiencing technical difficulties. The AI service is currently unavailable. Please try again in a few minutes.";
      }
      
      if (res.status === 503) {
        return "🔧 **Service Unavailable**: Finzi is temporarily down for maintenance. Please try again in a few minutes.";
      }
      
      if (res.status === 429) {
        return "⏰ **Rate Limited**: Too many requests. Please wait a moment before sending another message.";
      }
      
      if (!res.ok) {
        return `🚫 **Service Error** (${res.status}): Finzi is having trouble responding. Please try again or contact support if this continues.`;
      }
  
      const text = await res.text();
      
      try {
        const json = JSON.parse(text);
        if (json.success) {
          return json.response;
        } else {
          return `🤖 **Finzi**: ${json.error || "I'm having trouble processing your request. Please try rephrasing your question or try again."}`;
        }
      } catch (jsonErr) {
        console.error('JSON parsing error:', jsonErr);
        return `🚫 **Communication Error**: Unable to understand the server response. Please try again or contact support.`;
      }
  
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      
      if (fetchErr.name === 'AbortError') {
        // Don't show error message for aborted requests (user navigated away or new request started)
        return null;
      }
      
      if (fetchErr.name === 'TypeError' && fetchErr.message.includes('Failed to fetch')) {
        return "🌐 **Connection Error**: Unable to reach Finzi. Please check your internet connection and try again.";
      }
      
      if (fetchErr.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        return "🔒 **Browser Block**: Your browser or an extension is blocking the request. Please disable ad blockers or try a different browser.";
      }
      
      return `🚫 **Network Error**: ${fetchErr.message}. Please check your connection and try again.`;
    }
  };
  

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputValue.trim();
    if (trimmedMessage === '') return;

    // Clear input immediately for better UX
    setInputValue('');

    // Step 1: Show user message instantly
    const userMessage = { user: trimmedMessage, chatbot: null };
    const newChats = [...chats, userMessage];
    setChats(newChats);
    
    // Step 2: Set typing state
    setIsTyping(true);
    
    // Step 3: Update allChats state for current chat index
    const updatedAllChats = [...allChats];
    updatedAllChats[currentChatIndex] = newChats;
    setAllChats(updatedAllChats);

    try {
      // Step 4: Fetch API response
      const response = await getData(trimmedMessage);

      // Step 5: Update the message with bot response (only if response is not null)
      if (response !== null) {
        const updatedMessage = { ...userMessage, chatbot: response };
        const updatedChats = [...newChats.slice(0, -1), updatedMessage];
        
        // Update both chats and allChats atomically to prevent flicker
        setChats(updatedChats);
        const finalAllChats = [...updatedAllChats];
        finalAllChats[currentChatIndex] = updatedChats;
        setAllChats(finalAllChats);
      } else {
        // If response is null (aborted), remove the user message
        const updatedChats = newChats.slice(0, -1);
        setChats(updatedChats);
        const finalAllChats = [...updatedAllChats];
        finalAllChats[currentChatIndex] = updatedChats;
        setAllChats(finalAllChats);
      }
      
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage = { 
        ...userMessage, 
        chatbot: "🚫 I'm having trouble connecting to the AI service right now. This might be due to high traffic or server maintenance. Please try again in a moment, or contact support if the issue persists." 
      };
      const errorChats = [...newChats.slice(0, -1), errorMessage];
      setChats(errorChats);
      
      const errorAllChats = [...updatedAllChats];
      errorAllChats[currentChatIndex] = errorChats;
      setAllChats(errorAllChats);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, chats, allChats, currentChatIndex, user]);

const saveChats = async () => {
  if (!user?.uid || allChats[currentChatIndex].length === 0) {
    alert('No chats to save or user not authenticated.');
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const chatData = {
    chat: allChats[currentChatIndex],
    timestamp: new Date().toISOString(),
  };
  console.log("Saving chat data:", chatData);
  
  try {
    await updateDoc(userRef, {
      user_chats: arrayUnion(chatData)
    });
    console.log("Chat saved successfully");
    alert('Chat saved successfully!');
  } catch (error) {
    console.error("Error saving chat:", error);
    
    // Handle specific Firebase errors
    if (error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
      alert('⚠️ Unable to save chat: Your browser or an extension is blocking the connection to Firebase. Please disable ad blockers or try a different browser.');
    } else if (error.code === 'permission-denied') {
      alert('❌ Permission denied: Unable to save chat. Please contact support.');
    } else if (error.code === 'unavailable') {
      alert('🔄 Service temporarily unavailable: Please try saving again in a moment.');
    } else {
      alert('Failed to save chat. Please try again or contact support if the issue persists.');
    }
  }
}

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Console log the chats for debugging

console.log(allChats)

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Please log in to access the chat</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-white dark:bg-gray-900">
      <ChatBackground />
      <div className="min-h-screen relative z-10 text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Chat History
              </h2>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={startNewChat}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {isChats && dbchats ? (
                <div className="space-y-2">
                  {dbchats.map((chat, index) => (
                    <div
                      key={index}
                      onClick={() => switchToChat(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        index === currentChatIndex 
                          ? 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                          : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {chat.chat[0]?.user && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                          {chat.chat[0].user.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No chat history yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start a conversation to see your chats here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          {/* Chat Header */}
          <div className="chat-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white dark:text-gray-900" />
                </div>
                <div>
                  <h1 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Finzi</h1>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                    <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={saveChats}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Save Chat
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 lg:pb-6" ref={chatContainerRef} style={{ minHeight: 'calc(100vh - 200px)' }}>
            {chats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-8 h-8 text-white dark:text-gray-900" />
                  </div>
                  <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">How can I help you today?</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    I'm Finzi, your AI financial assistant. I can help you analyze your spending, create budgets, track expenses, and provide insights to optimize your financial health.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Budget Planning</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Create and manage budgets</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Expense Analysis</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Analyze spending patterns</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Financial Goals</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Set and track objectives</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Savings Tips</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Get saving recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {chats.map((message, index) => (
                  <MessagePair
                    key={`${index}-${message.user}`}
                    message={message}
                    index={index}
                    isLast={index === chats.length - 1}
                    isTyping={isTyping}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6 pb-24 lg:pb-6 fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto z-30 lg:z-auto">
            <div className="max-w-4xl mx-auto lg:ml-0">
              <div className="relative">
                <div className="flex items-end bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-colors">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Message Finzi..."
                    rows={1}
                    className="flex-1 bg-transparent border-0 resize-none py-4 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-base leading-6 max-h-32"
                    style={{
                      minHeight: '24px',
                      height: 'auto',
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="m-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Desktop: Add helpful text */}
              <div className="hidden lg:block mt-3 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Ask;

