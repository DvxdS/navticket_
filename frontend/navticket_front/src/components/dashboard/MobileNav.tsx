// Frontend/src/components/dashboard/MobileNav.tsx

import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Route,
  Calendar,
  Settings,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Bus, label: 'Trajets', path: '/dashboard/trips' },
    { icon: Route, label: 'Routes', path: '/dashboard/routes' },
    { icon: Calendar, label: 'Bookings', path: '/dashboard/bookings' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-40">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-200 min-w-[64px]
                ${
                  active
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-900'
                }
              `}
            >
              <Icon
                className={`
                  w-6 h-6 transition-transform duration-200
                  ${active ? 'scale-110' : ''}
                `}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};