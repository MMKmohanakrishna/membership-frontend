import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  ClipboardList, 
  CreditCard, 
  UserCog,
  Building2
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['superadmin', 'gymowner', 'staff', 'trainer'],
    },
    {
      name: 'Clubs',
      href: '/gyms',
      icon: Building2,
      roles: ['superadmin'], // Super Admin only
    },
    {
      name: 'Members',
      href: '/members',
      icon: Users,
      roles: ['gymowner', 'staff', 'trainer'], // Removed superadmin
    },
    {
      name: 'QR Scanner',
      href: '/scanner',
      icon: QrCode,
      roles: ['gymowner', 'staff'], // Removed superadmin
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: ClipboardList,
      roles: ['gymowner', 'staff', 'trainer'], // Removed superadmin
    },
    {
      name: 'Plans',
      href: '/plans',
      icon: CreditCard,
      roles: ['gymowner', 'staff'], // Removed superadmin
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserCog,
      roles: ['gymowner'], // Removed superadmin
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className="w-64 bg-white shadow-lg h-full">
      <div className="flex flex-col h-full">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl shadow flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-tight">CLUB</span>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-800">FitHub</span>
              <div className="text-xs text-gray-500">Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto touch-pan-y">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            © 2025 Club Management System
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
