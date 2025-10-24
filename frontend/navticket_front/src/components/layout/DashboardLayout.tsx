// Frontend/src/layouts/DashboardLayout.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-20 pb-20 lg:pb-0">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
};