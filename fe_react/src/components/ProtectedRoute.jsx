import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Kiểm tra nếu không có token hoặc không phải admin
  if (!token || user.role !== 'admin') {
    console.warn('Truy cập bị từ chối: Cần quyền Admin.');
    return <Navigate to="/login" replace />;
  }

  // Nếu là admin, cho phép vào route bên trong (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
