import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import './AskStyles.css';
import {auth,db} from '../firebase';
import { doc,getDoc, updateDoc,arrayUnion } from "firebase/firestore";

const Ask = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [allChats, setAllChats] = useState([[]]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const [username,setUserName]=useState(null);
  const [userpresentChat,setUserPresentChat]=useState(null);
  const [isChats, setIsChats] = useState(false);
  const [dbchats, setDbChats] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const uid=auth.currentUser.uid;

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
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewChat = () => {
    const newChatIndex = allChats.length;
    setAllChats([...allChats, []]);
    setCurrentChatIndex(newChatIndex);
    setChats([]);
    // Only close sidebar on mobile
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const switchToChat = (index) => {
    setCurrentChatIndex(index);
    setChats(dbchats[index].chat);
    // Only close sidebar on mobile
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const TypingAnimation = () => {
    return (
      <div className="typing-animation">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  };

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
    <div className={`page ask-page ${isDesktop ? 'desktop-layout' : ''}`}>
      {/* Sidebar Overlay - only show on mobile */}
      {sidebarOpen && !isDesktop && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${isDesktop ? 'desktop-sidebar' : ''}`}>
        <div className="sidebar-header">
          <h3>Recent Chats</h3>
          {!isDesktop && (
            <button className="close-sidebar" onClick={toggleSidebar}>×</button>
          )}
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>
          + New Chat
        </button>
        {isChats && (
          <div className="chat-list">
            {dbchats.map((chat, index) => (
              <div
                key={index}
                className={`chat-item ${index === currentChatIndex ? 'active' : ''}`}
                onClick={() => switchToChat(index)}
              >
                <span>{chat.timestamp}</span>
                {dbchats[index].chat[0].user.length > 0 && (
                  <p>{chat.chat[0].user.substring(0, 30)}...</p>
                )}
              </div>
            ))}
          </div>
        )}
        
      </div>

      {/* Main Content */}
      <div className={`ask-content ${isDesktop ? 'desktop-content' : ''}`}>
        {/* Header with hamburger menu */}
        <div className="ask-header">
          {!isDesktop && (
            <button className="hamburger-menu" onClick={toggleSidebar}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </button>
          )}
          <button className='save-chat-btn' onClick={saveChats}>
            Save Chat
          </button>
        </div>

        {/* Chat Messages or Welcome Screen */}
        <div className="chat-container" ref={chatContainerRef}>
          {chats.length === 0 ? (
            <div className="welcome-screen">
              <h1>Hey!</h1>
              <p>Ask me anything about your money — I'm listening.</p>
            </div>
          ) : (
            <div className="messages">
              {chats.map((message, index) => (
                <div key={index} className="message-pair">
                  {/* User message */}
                  <div className="message user-message">
                    <div className="message-content">
                      {message.user}
                    </div>
                  </div>
                  
                  {/* Chatbot message */}
                  {message.chatbot && (
                    <div className="message bot-message">
                      <div className="message-content">
                        {message.chatbot}
                      </div>
                    </div>
                  )}
                  
                  {/* Show typing animation if this is the last message and bot hasn't responded yet */}
                  {index === chats.length - 1 && !message.chatbot && isTyping && (
                    <div className="message bot-message">
                      <div className="message-content">
                        <TypingAnimation />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="what is my present spending"
              className="message-input"
            />
            <button className="send-button" onClick={handleSendMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Ask;

