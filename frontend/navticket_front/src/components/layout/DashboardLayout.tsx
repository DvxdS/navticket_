// Frontend/src/layouts/DashboardLayout.tsx

import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { TopBar } from '@/components/dashboard/TopBar';
import { useState, useEffect } from 'react';

export const DashboardLayout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(256);

  
  useEffect(() => {
    
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    setSidebarWidth(isCollapsed ? 80 : 256);

    
    const handleSidebarToggle = () => {
      const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      setSidebarWidth(isCollapsed ? 80 : 256);
    };

    window.addEventListener('sidebar:toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar:toggle', handleSidebarToggle);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      
      <div 
        className="lg:pl-64 transition-all duration-300"
        style={{ 
          paddingLeft: window.innerWidth >= 1024 ? `${sidebarWidth}px` : '0' 
        }}
      >
       
        <TopBar />
        
        
        <main className="min-h-[calc(100vh-73px)] pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      
      <MobileNav />
    </div>
  );
};