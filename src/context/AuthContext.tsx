import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (user: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 👇 Lấy token từ localStorage khi app load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(savedUser);
  }, []);

  // 👇 Global logout detection
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Khi token bị remove từ tab khác
      if (e.key === 'token' && e.newValue === null) {
        console.log('🚪 Token removed from another tab, clearing local state...');
        setUser(null);
        setToken(null);
      }
      
      // Khi có logout event từ tab khác
      if (e.key === 'logout-event') {
        console.log('🚪 Logout event received from another tab');
        setUser(null);
        setToken(null);
        // Clean up the event (no need to remove here, it will auto-expire)
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (user: string, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // 👇 Trigger global logout event cho các tabs khác
    localStorage.setItem('logout-event', Date.now().toString());
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
