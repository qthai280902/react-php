import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const PublicLayout = () => {
  const location = useLocation();
  // Danh sách các trang KHÔNG hiển thị Sidebar
  const hideSidebarRoutes = ['/login', '/register'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content: Mở rộng 100% nếu ẩn Sidebar */}
          <main className={shouldHideSidebar ? 'md:col-span-12' : 'md:col-span-8'}>
            <Outlet />
          </main>

          {/* Sidebar: Chỉ hiện nếu không nằm trong danh sách ẩn */}
          {!shouldHideSidebar && (
            <>
              <div className="md:col-span-4 hidden md:block">
                <div className="sticky top-24">
                  <Sidebar />
                </div>
              </div>
              <div className="md:hidden mt-8">
                <Sidebar />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLayout;
