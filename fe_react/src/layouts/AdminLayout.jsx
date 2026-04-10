import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/sys-control-0x2026', label: 'Tổng quan', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { path: '/sys-control-0x2026/posts', label: 'Quản lý bài viết', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
      </svg>
    )},
    { path: '/sys-control-0x2026/users', label: 'Người dùng', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-black flex overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Sidebar - High-Tech Style */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 border-r border-cyan-500/20 transition-all duration-300 flex flex-col fixed h-full z-50 shadow-[0_0_20px_rgba(6,182,212,0.1)]`}>
        <div className="p-6 flex items-center justify-between border-b border-cyan-500/10 bg-slate-950">
          {isSidebarOpen && (
            <span className="text-cyan-500 font-black text-lg tracking-tighter flex items-center">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
              SYS-CONTROL
            </span>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-cyan-400 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 mt-8 px-3 space-y-3">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
              }`}
            >
              <div className={`${location.pathname === item.path ? 'text-cyan-400' : 'text-slate-600 group-hover:text-cyan-500'} transition-colors`}>
                {item.icon}
              </div>
              {isSidebarOpen && <span className="ml-3 font-semibold">{item.label}</span>}
              {isSidebarOpen && location.pathname === item.path && (
                <div className="ml-auto w-1 h-4 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 bg-slate-950/50">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full p-3 text-slate-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarOpen && <span className="font-bold">EXIT_SYSTEM</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header - Glassmorphism */}
        <header className="bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10 h-20 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-slate-200 font-black text-xl tracking-tight uppercase">Admin Terminal</h2>
            <p className="text-cyan-500/50 text-[10px] font-mono tracking-widest uppercase">Secured Connection Active</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right flex flex-col">
              <span className="text-slate-300 text-sm font-bold tracking-tight">{user.username}</span>
              <span className="text-cyan-400/70 text-[10px] uppercase font-mono tracking-tighter">Authority: Admin</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 p-1 bg-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-black text-lg">
                {user.username?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-10 bg-black min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
