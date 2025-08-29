import React, { useState, useEffect, useRef } from 'react';
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

// Modern Chat Background
function ChatBackground() {
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

// Modern Typing Animation
const TypingAnimation = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
    <span className="text-white/60 text-sm ml-2">AI is thinking...</span>
  </div>
);

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
  const uid = auth.currentUser.uid;

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo('.chat-header', 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.message-pair', 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out' }, 
      '-=0.3'
    )
    .fromTo('.input-area', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.2'
    );
  }, { scope: containerRef, dependencies: [chats] });

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

  const userChatDb= async()=>{
    try {
            const userRef = doc(db, 'users', uid);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists()) {
              setIsChats(true)
              setDbChats(docSnap.data().user_chats);
              
              console.log("retrieved successfully");
            } else {
              console.log("No user data found in Firestore");
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }

    
  }
  userChatDb();
  console.log(username)

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
    if (!message) return "No message provided";
  
    try {
      const res = await fetch('https://bill-assistant-1.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message,uid })
      });
  
      const text = await res.text();
  
      try {
        const json = JSON.parse(text);
        if (json.success) {
          return json.response;
        } else {
          return `Server error: ${json.error || "Unknown error"}`;
        }
      } catch (jsonErr) {
        return `Failed to parse JSON: ${text}`;
      }
  
    } catch (fetchErr) {
      return `Network error: ${fetchErr.message}`;
    }
  };
  

  const handleSendMessage = async () => {
  const trimmedMessage = inputValue.trim();
  if (trimmedMessage === '') return;

  // Step 1: Show user message instantly
  const userMessage = { user: trimmedMessage, chatbot: null };
  const newChats = [...chats, userMessage];
  setChats(newChats);
  
  // Step 2: Clear input and set typing state
  setInputValue('');
  setIsTyping(true);
  console.log("User new chat", newChats);
  // Step 3: Update allChats state for current chat index
  const updatedAllChats = [...allChats];
  updatedAllChats[currentChatIndex] = newChats;
  console.log("Updated allChats:", updatedAllChats);
  setAllChats(updatedAllChats);

  // Step 4: Fetch API response
  const response = await getData(trimmedMessage);

  // Step 5: Replace the last message with the bot response
  const updatedLastMessage = { ...userMessage, chatbot: response };
  const updatedChats = [...newChats.slice(0, -1), updatedLastMessage];
  setChats(updatedChats);
  setIsTyping(false);

  // Step 6: Update allChats again
  const updatedAllChatsWithResponse = [...updatedAllChats];
  updatedAllChatsWithResponse[currentChatIndex] = updatedChats;
  setAllChats(updatedAllChatsWithResponse);
  console.log("Updated allChats with response:", updatedAllChatsWithResponse);
};
const saveChats = async () => {
  if (allChats[currentChatIndex].length === 0) {
    alert('No chats to save.');
    return;
  }

  const userRef = doc(db, "users", uid);
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
    alert('Failed to save chat. Please try again.');
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

  return (
    <div ref={containerRef} className="min-h-screen">
      <ChatBackground />
      <div className="min-h-screen relative z-10 text-white flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                Chat History
              </h2>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={startNewChat}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
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
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        index === currentChatIndex 
                          ? 'bg-white/20 border border-white/20' 
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-white/60" />
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {chat.chat[0]?.user && (
                        <p className="text-white/80 text-sm line-clamp-2">
                          {chat.chat[0].user.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No chat history yet</p>
                  <p className="text-white/40 text-xs mt-1">Start a conversation to see your chats here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
          {/* Chat Header */}
          <div className="chat-header bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-semibold">AI Financial Assistant</h1>
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={saveChats}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Save Chat
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 lg:pb-4" ref={chatContainerRef} style={{ minHeight: 'calc(100vh - 200px)' }}>
            {chats.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Hey there! 👋</h2>
                  <p className="text-white/70 text-lg mb-8">
                    Ask me anything about your finances — I'm here to help you track, analyze, and optimize your spending!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {chats.map((message, index) => (
                  <div key={index} className="message-pair space-y-4">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md p-4 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-xs opacity-80">You</span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.user}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chatbot message */}
                    {message.chatbot && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl rounded-bl-md p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-blue-400">AI Assistant</span>
                            </div>
                            <p className="text-sm leading-relaxed text-white/90">{message.chatbot}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Typing animation */}
                    {index === chats.length - 1 && !message.chatbot && isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl rounded-bl-md p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-blue-400">AI Assistant</span>
                            </div>
                            <TypingAnimation />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="input-area p-4 lg:p-6 bg-black/50 backdrop-blur-xl border-t border-white/10 pb-24 lg:pb-6 fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto z-30 lg:z-auto">
            <div className="max-w-4xl mx-auto lg:ml-0">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your spending, budget, or financial goals..."
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 lg:py-5 px-6 lg:px-8 pr-16 lg:pr-20 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 focus:bg-white/15 hover:bg-white/12 transition-all duration-300 text-base lg:text-lg shadow-lg focus:shadow-blue-500/20"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              </div>
              
              {/* Desktop: Add helpful text */}
              <div className="hidden lg:block mt-3 text-center">
                <p className="text-white/40 text-sm">
                  Press Enter to send • Powered by AI Financial Assistant
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

