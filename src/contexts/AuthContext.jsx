import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          // Validate that user object has required fields
          if (parsed && parsed.email && parsed.role) {
            setUser(parsed);
            setIsAuthenticated(true);
          } else {
            // Invalid user data, clear storage
            console.warn('Invalid user data, clearing storage');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // `authService.login` returns the API wrapper (success, message, data)
      const payload = await authService.login(email, password);
      const { accessToken, user: userData } = payload.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      // If server indicates gym blocked, return blocked flag so UI can redirect
      if (message && message.toLowerCase().includes('blocked')) {
        toast.error(message);
        return { success: false, error: message, blocked: true };
      }

      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Logged out successfully');
    }
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
