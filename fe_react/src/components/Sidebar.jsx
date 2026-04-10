import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const hashtags = ['php', 'react', 'webdev', 'javascript', 'database', 'laravel', 'frontend', 'backend'];

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Từ khóa Hot
        </h3>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag) => (
            <Link 
              key={tag}
              to={`/?tag=${tag}`}
              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm font-medium border border-slate-100 cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all duration-200 transform hover:scale-105 active:scale-95 no-underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50">
        <h3 className="font-bold text-lg mb-2">Bắt đầu viết Blog</h3>
        <p className="text-sm text-blue-100 mb-4 opacity-90">
          Chia sẻ kiến thức của bạn và kết nối với cộng đồng lập trình viên trên toàn thế giới.
        </p>
        <Link to="/create" className="block text-center w-full py-2.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors no-underline">
          Đăng bài ngay
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
