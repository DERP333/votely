import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('votely_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [socket, setSocket] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    // In dev, connects to proxy or direct port
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5002' : '/';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Votely real-time stream via Socket.io');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((prev) => (prev && prev.id === toastMessage?.id ? null : prev));
    }, 4000);
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('votely_user', JSON.stringify(userData));
    showToast(`Welcome, ${userData.name}!`, 'success');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('votely_user', JSON.stringify(updated));
      return updated;
    });
    showToast('Profile updated successfully!', 'success');
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('votely_user');
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginUser,
        updateUser,
        logoutUser,
        socket,
        showToast
      }}
    >
      {children}
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
            }`}
          >
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

