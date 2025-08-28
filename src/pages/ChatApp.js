import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../hooks/useAuth';
import io from 'socket.io-client';
import '../styles/Chat.css';

const ChatApp = () => {
  // const { user } = useAuth();
  
  // Default user for chat (you can modify this)
  const user = {
    name: 'User',
    email: 'user@example.com'
  };
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO server - using localhost for development
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
      
      // Join the chat room
      newSocket.emit('join', {
        userId: user.email,
        username: user.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    // Message events
    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userJoined', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.username} joined the chat`,
        timestamp: new Date().toISOString()
      }]);
      setOnlineUsers(data.onlineUsers);
    });

    newSocket.on('userLeft', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.username} left the chat`,
        timestamp: new Date().toISOString()
      }]);
      setOnlineUsers(data.onlineUsers);
    });

    newSocket.on('typing', (data) => {
      if (data.userId !== user.email) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { userId: data.userId, username: data.username }];
        });
      }
    });

    newSocket.on('stopTyping', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage,
      userId: user.email,
      username: user.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      timestamp: new Date().toISOString()
    };

    socket.emit('message', messageData);
    setNewMessage('');
    socket.emit('stopTyping', { userId: user.email, username: user.name });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    if (e.target.value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { userId: user.email, username: user.name });
      }
    } else {
      setIsTyping(false);
      socket.emit('stopTyping', { userId: user.email, username: user.name });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // if (!user) {
  //   return (
  //     <div className="chat-container">
  //       <div className="chat-login-prompt">
  //         <i className="fas fa-comments"></i>
  //         <h2>Please login to join the chat</h2>
  //         <p>You need to be logged in to access the real-time chat</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <i className="fas fa-comments"></i>
          <h2>Real-Time Chat</h2>
        </div>
        <div className="chat-header-right">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <i className={`fas fa-circle ${isConnected ? 'connected' : 'disconnected'}`}></i>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="online-count">
            <i className="fas fa-users"></i>
            {onlineUsers.length} online
          </div>
        </div>
      </div>

      <div className="chat-main">
        {/* Online Users Sidebar */}
        <div className="chat-sidebar">
          <h3><i className="fas fa-users"></i> Online Users</h3>
          <div className="online-users-list">
            {onlineUsers.map((user, index) => (
              <div key={index} className="online-user">
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="user-avatar"
                />
                <span className="username">{user.username}</span>
                <div className="online-indicator"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type === 'system' ? 'system-message' : message.userId === user.email ? 'own-message' : 'other-message'}`}>
                {message.type === 'system' ? (
                  <div className="system-message-content">
                    <i className="fas fa-info-circle"></i>
                    {message.content}
                  </div>
                ) : (
                  <>
                    <div className="message-avatar">
                      <img src={message.avatar} alt={message.username} />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">{message.username}</span>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                      <div className="message-text">{message.content}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">
                  {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form className="chat-input-form" onSubmit={sendMessage}>
            <div className="chat-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="chat-input"
                disabled={!isConnected}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!newMessage.trim() || !isConnected}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
