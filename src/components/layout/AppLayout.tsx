import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-[padding] duration-300 lg:pl-72">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-3 md:p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
