// Frontend/src/components/dashboard/TopBar.tsx

import { Bell, Search, ChevronDown, User } from 'lucide-react';
import { useCompanyAuth } from '@/hooks/useCompanyAuth';
import { useState } from 'react';

export const TopBar = () => {
  const { user, logout } = useCompanyAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user display name
  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'User';

  // Get role display
  const roleDisplay = user?.role === 'company_admin' ? 'Administrateur' : 'Staff';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un trajet, une réservation..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {/* Avatar with initials */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                {user?.first_name && user?.last_name ? (
                  <span className="text-xs font-semibold text-white">
                    {user.first_name[0].toUpperCase()}{user.last_name[0].toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* User Info (hidden on mobile) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">
                  {userName}
                </p>
                <p className="text-xs text-slate-500">{roleDisplay}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {user?.email}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">{roleDisplay}</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to profile
                    }}
                  >
                    Mon profil
                  </button>

                  <button
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Navigate to settings
                    }}
                  >
                    Paramètres
                  </button>

                  {/* Logout */}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};