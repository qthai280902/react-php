import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';
import UserProfile from './pages/UserProfile';

// Layout Imports
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Admin Imports
import Dashboard from './pages/admin/Dashboard';
import AdminPosts from './pages/admin/AdminPosts';
import AdminUsers from './pages/admin/AdminUsers';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontWeight: 'bold' } }} />
      <Router>
      <div className="App min-h-screen bg-slate-50">
        <Routes>
          {/* Public Area */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/profile/:id" element={<UserProfile />} />
          </Route>

          {/* Admin Area - Link bí mật: /sys-control-0x2026 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/sys-control-0x2026" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
    </>
  );
}

export default App;
