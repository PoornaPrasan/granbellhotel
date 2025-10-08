import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  Building2,
  UserCheck,
  FileText,
  Shield
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { hasRole } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'clerk', 'customer', 'travel_company'],
    },
    {
      id: 'reservations',
      name: 'Reservations',
      icon: Calendar,
      roles: ['admin', 'clerk', 'customer', 'travel_company'],
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Shield,
      roles: ['admin'],
    },
    {
      id: 'checkin',
      name: 'Check-In/Out',
      icon: UserCheck,
      roles: ['admin', 'clerk'],
    },
    {
      id: 'rooms',
      name: 'Room Management',
      icon: Building2,
      roles: ['admin', 'manager'],
    },
    {
      id: 'guests',
      name: 'Guests',
      icon: Users,
      roles: ['admin', 'manager', 'clerk'],
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: CreditCard,
      roles: ['admin', 'clerk', 'customer'],
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      roles: ['admin', 'manager', 'clerk', 'travel_company'],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const visibleItems = navigationItems.filter(item => 
    hasRole(item.roles)
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="whitespace-nowrap">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;