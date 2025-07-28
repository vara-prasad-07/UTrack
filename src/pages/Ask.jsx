import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/BottomNav';
import './AskStyles.css';
import {auth} from '../firebase';

const Ask = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [allChats, setAllChats] = useState([[]]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const uid=auth.currentUser.uid;
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewChat = () => {
    const newChatIndex = allChats.length;
    setAllChats([...allChats, []]);
    setCurrentChatIndex(newChatIndex);
    setChats([]);
    setSidebarOpen(false);
  };

  const switchToChat = (index) => {
    setCurrentChatIndex(index);
    setChats(allChats[index]);
    setSidebarOpen(false);
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
      const res = await fetch('https://bill-assist.onrender.com/chat', {
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
    if (inputValue.trim() === '') return;
    const Response= await getData(inputValue.trim())
    
    const userMessage = { user: inputValue.trim(), chatbot: Response };
    const newChats = [...chats, userMessage];
    setChats(newChats);
    
    // Update the current chat in allChats
    const updatedAllChats = [...allChats];
    updatedAllChats[currentChatIndex] = newChats;
    setAllChats(updatedAllChats);
    
    setInputValue('');

    // Simulate chatbot response with typing animation
      const botResponse = "Hey, how can I help you?";
      let typingMessage = { user: userMessage.user, chatbot: '' };
      
      const updatedChatsWithBot = [...newChats.slice(0, -1), typingMessage];
      setChats(updatedChatsWithBot);
      
      simulateTyping(Response, (currentText) => {
        const updatedTypingMessage = { user: userMessage.user, chatbot: currentText };
        const updatedChatsWithTyping = [...newChats.slice(0, -1), updatedTypingMessage];
        setChats(updatedChatsWithTyping);
        
        // Update allChats as well
        const updatedAllChatsWithTyping = [...allChats];
        updatedAllChatsWithTyping[currentChatIndex] = updatedChatsWithTyping;
        setAllChats(updatedAllChatsWithTyping);
      });
   
  };

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
  useEffect(() => {
    console.log('Current chat messages:', chats);
  }, [chats]);

  return (
    <div className="page ask-page">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Chats</h3>
          <button className="close-sidebar" onClick={toggleSidebar}>×</button>
        </div>
        <button className="new-chat-btn" onClick={startNewChat}>
          + New Chat
        </button>
        <div className="chat-list">
          {allChats.map((chat, index) => (
            <div
              key={index}
              className={`chat-item ${index === currentChatIndex ? 'active' : ''}`}
              onClick={() => switchToChat(index)}
            >
              <span>Chat {index + 1}</span>
              {chat.length > 0 && (
                <small>{chat[0].user.substring(0, 30)}...</small>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="ask-content">
        {/* Header with hamburger menu */}
        <div className="ask-header">
          <button className="hamburger-menu" onClick={toggleSidebar}>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>

        {/* Chat Messages or Welcome Screen */}
        <div className="chat-container" ref={chatContainerRef}>
          {chats.length === 0 ? (
            <div className="welcome-screen">
              <h1>Hey vara!</h1>
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

      <BottomNav />
    </div>
  );
};

export default Ask;

