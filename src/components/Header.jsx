import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { alertService } from '../services/apiService';
import { getRoleLabel } from '../utils/roleDisplay';
import { Menu } from 'lucide-react';

const Header = ({ onToggleMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await alertService.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user?.role === 'owner' || user?.role === 'staff') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button onClick={onToggleMenu} className="md:hidden p-2 text-gray-600 hover:text-gray-800 focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
            FitHub Management System
          </h1>
        </div>

          <div className="flex items-center space-x-4">
          {/* Notifications */}
          {(user?.role === 'owner' || user?.role === 'staff') && (
            <button
              onClick={() => navigate('/dashboard')}
              className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-gray-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-800">{user?.name}</p>
                <p className="text-gray-500">{getRoleLabel(user?.role)}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
