import React from 'react';

const Dashboard = () => {
  // Dữ liệu thống kê giả lập
  const stats = [
    { id: 1, name: 'Tổng bài viết', value: '124', icon: '📝', bgColor: 'bg-blue-500' },
    { id: 2, name: 'Tổng người dùng', value: '48', icon: '👥', bgColor: 'bg-green-500' },
    { id: 3, name: 'Bình luận mới', value: '+12', icon: '💬', bgColor: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Bảng điều khiển</h1>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center text-2xl mr-4 shadow-lg shadow-current/20`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-400 border-dashed border-2">
        <p>Biểu đồ và hoạt động gần đây sẽ được hiển thị ở đây.</p>
      </div>
    </div>
  );
};

export default Dashboard;
