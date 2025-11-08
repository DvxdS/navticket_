// Frontend/src/components/dashboard/Sidebar.tsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Route,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  Ticket,
} from 'lucide-react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true); // ✅ Changed to true by default
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useCompanyAuth();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bus, label: 'Trajets', path: '/dashboard/trips' },
    { icon: Route, label: 'Routes', path: '/dashboard/routes' },
    { icon: Calendar, label: 'Réservations', path: '/dashboard/bookings' },
    { icon: BarChart3, label: 'Statistiques', path: '/dashboard/analytics' },
    { icon: Ticket, label: 'Voyage', path: '/dashboard/voyage' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out z-40
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {isExpanded && (
              <span className="text-xl font-bold text-slate-900 whitespace-nowrap">
                NavTicket
              </span>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200 group relative
                  ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon
                  className={`
                    w-6 h-6 flex-shrink-0 transition-transform duration-200
                    ${active ? 'scale-110' : 'group-hover:scale-110'}
                  `}
                />
                {isExpanded && (
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                
                {/* Active Indicator */}
                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-3 space-y-1">
          {/* Settings */}
          <button
            onClick={() => navigate('/dashboard/settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              transition-all duration-200 group
              ${
                location.pathname === '/dashboard/settings'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            `}
            title={!isExpanded ? 'Paramètres' : undefined}
          >
            <Settings className="w-6 h-6 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            {isExpanded && (
              <span className="font-medium whitespace-nowrap">Paramètres</span>
            )}
          </button>

          {/* User Profile / Logout */}
          <div className="pt-3 border-t border-slate-200">
            {isExpanded ? (
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};