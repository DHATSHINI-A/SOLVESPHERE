import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ChevronRight, Home } from 'lucide-react';
import { ToastContainer } from './ToastContainer';

export const DashboardShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Generate dynamic breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#1A1D29]">
      <Navbar onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <div className="flex-1 flex w-full">
        {/* Role-Specific Collapsible Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Breadcrumb Strip */}
          {pathSegments.length > 0 && pathSegments[0] !== 'login' && pathSegments[0] !== 'register' && (
            <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
              <nav className="flex items-center gap-1.5 text-xs text-slate-500 max-w-7xl mx-auto">
                <Link to="/" className="hover:text-[#1E2A5E] flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                {pathSegments.map((segment, index) => {
                  const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathSegments.length - 1;
                  const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

                  return (
                    <React.Fragment key={url}>
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      {isLast ? (
                        <span className="font-bold text-[#1E2A5E] truncate max-w-[200px]">{label}</span>
                      ) : (
                        <Link to={url} className="hover:text-[#1E2A5E] truncate max-w-[150px]">
                          {label}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>
          )}

          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>

          <Footer />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
