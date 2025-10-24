import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { TopBar } from '@/components/dashboard/TopBar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-20">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <main className="min-h-[calc(100vh-73px)] pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
};