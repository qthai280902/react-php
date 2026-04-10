import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Dữ liệu mẫu (Giả lập cho đến khi có API thực tế)
    const mockUsers = [
        { id: 1, username: 'admin', role: 'admin', created_at: '2026-04-09 12:00:00' },
        { id: 2, username: 'thaib', role: 'user', created_at: '2026-04-10 08:30:00' },
        { id: 3, username: 'honghanh', role: 'user', created_at: '2026-04-10 14:15:00' },
    ];

    useEffect(() => {
        // Giả lập load dữ liệu
        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 800);
    }, []);

    const openDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) return <div className="text-cyan-500 font-mono animate-pulse uppercase">Syncing User Directory...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Quản lý người dùng</h1>
                <p className="text-cyan-500/50 font-mono text-[10px] tracking-widest uppercase mt-1">Directory Node: Users_0x01</p>
            </div>

            {/* User Table */}
            <div className="bg-slate-950 rounded-2xl border border-cyan-500/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 border-b border-cyan-500/10">
                        <tr>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">UID</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">Username</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">Quyền hạn</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/5 text-sm">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                                <td className="p-5 text-cyan-500/70 font-mono text-xs italic">U_0x{user.id}</td>
                                <td className="p-5 text-slate-300 font-bold tracking-tight">{user.username}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-5 text-center">
                                    <button 
                                        onClick={() => openDetails(user)}
                                        className="text-cyan-500 hover:text-cyan-400 p-2 bg-cyan-500/5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Chi tiết User */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-950 border border-cyan-500/30 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                        <div className="p-8 border-b border-cyan-500/10 flex justify-between items-center bg-slate-900/30">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight uppercase">Phân tích người dùng</h3>
                                <p className="text-cyan-500/50 font-mono text-xs uppercase tracking-tighter">Identity: @{selectedUser.username}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm font-mono uppercase tracking-tighter">
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px]">Ngày tạo TK</p>
                                    <p className="text-slate-200 mt-1">{selectedUser.created_at}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px]">Số bài viết</p>
                                    <p className="text-cyan-400 mt-1 font-black">24</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px]">Tổng bình luận</p>
                                    <p className="text-cyan-400 mt-1 font-black">156</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                    <p className="text-slate-500 text-[10px]">Số bài Repost</p>
                                    <p className="text-cyan-400 mt-1 font-black">12</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 col-span-2">
                                    <p className="text-slate-500 text-[10px]">Đánh giá trung bình</p>
                                    <p className="text-amber-400 mt-1 font-black flex items-center">
                                        4.8 / 5.0 
                                        <span className="ml-2 text-[10px] text-slate-500 font-normal underline">View 32 Ratings</span>
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-full bg-cyan-500 text-slate-950 font-black py-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_4px_15px_rgba(6,182,212,0.3)] uppercase tracking-widest text-sm"
                            >
                                CLOSE_TERMINAL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
