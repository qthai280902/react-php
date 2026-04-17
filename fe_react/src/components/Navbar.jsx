import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, PlusSquare, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // [ĐỒNG BỘ HIỂN THỊ]: Ưu tiên Full Name, dùng initials làm fallback
  const displayName = user?.full_name || user?.username || 'Guest';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black text-slate-900 tracking-tighter no-underline flex items-center">
              MY<span className="text-blue-600">BLOG</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors no-underline">Trang chủ</Link>
            
            {user ? (
              <>
                <Link to="/create" className="hover:text-blue-600 transition-colors no-underline flex items-center gap-2">
                  <PlusSquare size={18} strokeWidth={1.5} /> Viết bài
                </Link>
                {user.role === 'admin' && (
                  <Link to="/sys-control-0x2026" className="text-purple-600 hover:text-purple-700 transition-colors no-underline flex items-center gap-2">
                    <LayoutDashboard size={18} strokeWidth={1.5} /> Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                  <Link to={`/profile/${user.uid}`} className="flex items-center space-x-2 text-slate-900 hover:text-blue-600 transition-colors no-underline">
                    {/* Avatar Container chuẩn UI Premium */}
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shadow-sm uppercase border border-white">
                      {user?.avatar_image ? (
                        <img 
                          src={`http://localhost:8000/uploads/${user.avatar_image}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{displayName.charAt(0)}</span>
                      )}
                    </div>
                    <span className="normal-case font-bold">{displayName}</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-all active:scale-90 uppercase text-[10px] border border-red-100 px-3 py-1.5 rounded-lg"
                  >
                    <LogOut size={12} strokeWidth={1.5} /> Thoát
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-all no-underline shadow-lg shadow-slate-200">Đăng nhập</Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
              {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
          <Link to="/" className="block font-bold text-slate-600 no-underline px-4 py-2">Trang chủ</Link>
          {user ? (
            <>
              <Link to="/create" className="flex items-center gap-3 font-bold text-slate-600 no-underline px-4 py-2">
                <PlusSquare size={20} strokeWidth={1.5} /> Viết bài
              </Link>
              {user.role === 'admin' && (
                <Link to="/sys-control-0x2026" className="flex items-center gap-3 font-bold text-purple-600 no-underline px-4 py-2">
                  <LayoutDashboard size={20} strokeWidth={1.5} /> Dashboard Admin
                </Link>
              )}
              <Link to={`/profile/${user.uid}`} className="flex items-center gap-3 font-bold text-slate-900 no-underline px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shadow-sm uppercase">
                   {user?.avatar_image ? (
                        <img src={`http://localhost:8000/uploads/${user.avatar_image}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : <span>{displayName.charAt(0)}</span>}
                </div>
                Hồ sơ cá nhân
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left font-bold text-red-500 uppercase text-sm px-4 py-2">
                <LogOut size={20} strokeWidth={1.5} /> Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="block font-bold text-blue-600 no-underline px-4 py-2">Đăng nhập</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
