import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
    Eye, X, FileText, MessageSquare, Repeat2,
    Star, Loader2, Users, ThumbsUp, Hash
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const StatCard = ({ label, value, color }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
    </div>
);

const ActivityList = ({ items, renderItem, emptyMsg }) => (
    <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 pr-1">
        {items.length === 0
            ? <p className="text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest py-10">{emptyMsg}</p>
            : items.map((item, i) => <div key={i}>{renderItem(item)}</div>)
        }
    </div>
);

const ActivityRow = ({ main, sub, right }) => (
    <div className="flex items-start justify-between py-3 gap-3">
        <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-xs font-semibold truncate">{main}</p>
            {sub && <p className="text-slate-600 text-[10px] font-mono truncate mt-0.5">{sub}</p>}
        </div>
        {right && <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap flex-shrink-0">{right}</span>}
    </div>
);

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drawer state
    const [drawerOpen, setDrawerOpen]       = useState(false);
    const [drawerUser, setDrawerUser]       = useState(null);
    const [details, setDetails]             = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [activeTab, setActiveTab]         = useState('posts');

    const token = localStorage.getItem('token');

    /* ── Fetch user list ── */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await axiosClient.get('/api/users/list.php', {
                    headers: { Authorization: 'Bearer ' + token }
                });
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Fetch users error:', err);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    /* ── Open drawer & fetch user details ── */
    const openDrawer = async (user) => {
        setDrawerUser(user);
        setDrawerOpen(true);
        setDetails(null);
        setActiveTab('posts');
        setDetailsLoading(true);
        try {
            const res = await axiosClient.get(
                `/api/admin/user_details.php?user_id=${user.id}`,
                { headers: { Authorization: 'Bearer ' + token } }
            );
            setDetails(res);
        } catch (err) {
            console.error('User details error:', err);
            setDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setDrawerUser(null);
        setDetails(null);
    };

    /* ── Tab config ── */
    const tabs = [
        { id: 'posts',    label: 'Posts',    icon: FileText },
        { id: 'comments', label: 'Comments', icon: MessageSquare },
        { id: 'reposts',  label: 'Reposts',  icon: Repeat2 },
        { id: 'ratings',  label: 'Ratings',  icon: Star },
    ];

    if (loading) return (
        <div className="text-cyan-500 font-mono animate-pulse uppercase tracking-widest text-sm pt-10">
            Syncing User Directory...
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ── HEADER ── */}
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Quản lý người dùng</h1>
                <p className="text-cyan-500/50 font-mono text-[10px] uppercase tracking-widest mt-1">
                    Tổng số: <span className="text-cyan-400 font-black">{users.length}</span>
                </p>
            </div>

            {/* ── USER TABLE ── */}
            <div className="bg-slate-950 rounded-2xl border border-cyan-500/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 border-b border-cyan-500/10">
                        <tr>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">UID</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Username</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Quyền hạn</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                            <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/5 text-sm">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-16 text-center text-slate-600 font-mono text-xs uppercase italic tracking-widest">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-cyan-500/[0.015] transition-colors group">
                                    <td className="p-5 font-mono text-xs text-cyan-500/60 italic">U_0x{user.id}</td>
                                    <td className="p-5 text-slate-200 font-bold">@{user.username}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            user.role === 'admin'
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-500 font-mono text-xs italic">
                                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="p-5 text-center">
                                        <button
                                            onClick={() => openDrawer(user)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400 rounded-xl transition-all active:scale-90 text-[11px] font-black uppercase tracking-widest"
                                        >
                                            <Eye size={14} strokeWidth={1.5} /> Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ══════════════════════════════════════
                HÀNH ĐỘNG — DRAWER
            ══════════════════════════════════════ */}
            {drawerOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={closeDrawer}
                    />

                    {/* Drawer Panel */}
                    <div className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-[520px] bg-slate-950 border-l border-cyan-500/20 shadow-[−4px_0_60px_rgba(6,182,212,0.15)] flex flex-col animate-in slide-in-from-right duration-300">

                        {/* ── Drawer Header ── */}
                        <div className="flex-shrink-0 px-8 py-6 border-b border-cyan-500/10 bg-slate-900/40">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-cyan-500/50 uppercase tracking-[0.3em] mb-1">
                                        // CHI TẾT NGƯỜI DÙNG
                                    </p>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        @{drawerUser?.username}
                                    </h2>
                                    <span className={`inline-block mt-2 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${
                                        drawerUser?.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                        {drawerUser?.role}
                                    </span>
                                </div>
                                <button
                                    onClick={closeDrawer}
                                    className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all active:scale-90"
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* ── Drawer Body (scrollable) ── */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">

                            {detailsLoading && (
                                <div className="flex flex-col items-center justify-center py-24 gap-4 text-cyan-500">
                                    <Loader2 size={36} strokeWidth={1.5} className="animate-spin" />
                                    <p className="font-mono text-[11px] uppercase tracking-[0.3em]">Accessing Neural Network...</p>
                                </div>
                            )}

                            {!detailsLoading && !details && (
                                <div className="text-center py-20 text-red-500 font-mono text-xs uppercase tracking-widest">
                                    Failed to load intelligence data.
                                </div>
                            )}

                            {!detailsLoading && details && (
                                <>
                                    {/* ── 6 STAT CARDS ── */}
                                    <section>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
                                            // Tổng hợp hoạt động
                                        </p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <StatCard label="Posts"       value={details.info.total_posts}          color="text-cyan-400" />
                                            <StatCard label="Comments"    value={details.info.total_comments}       color="text-blue-400" />
                                            <StatCard label="Reposts"     value={details.info.total_reposts}        color="text-green-400" />
                                            <StatCard label="Likes nhận"  value={details.info.total_likes_received} color="text-red-400" />
                                            <StatCard label="Đánh giá"    value={details.info.total_ratings}        color="text-amber-400" />
                                            <StatCard label="Followers"   value={details.info.followers}            color="text-purple-400" />
                                        </div>
                                    </section>

                                    {/* ── METADATA ── */}
                                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">// Metadata</p>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">User ID</span>
                                            <span className="text-cyan-400">U_0x{details.info.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ngày tạo TK</span>
                                            <span className="text-slate-300">{new Date(details.info.created_at).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Following</span>
                                            <span className="text-slate-300">{details.info.following}</span>
                                        </div>
                                    </section>

                                    {/* ── ACTIVITY TABS ── */}
                                    <section>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
                                            // Lịch sử hoạt động
                                        </p>

                                        {/* Tab Bar */}
                                        <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1 mb-5">
                                            {tabs.map(({ id, label, icon: Icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setActiveTab(id)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                                        activeTab === id
                                                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                                                            : 'text-slate-500 hover:text-slate-300'
                                                    }`}
                                                >
                                                    <Icon size={11} strokeWidth={2} /> {label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content */}
                                        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl px-5 py-2">
                                            {activeTab === 'posts' && (
                                                <ActivityList
                                                    items={details.posts}
                                                    emptyMsg="Chưa có bài viết nào"
                                                    renderItem={p => (
                                                        <ActivityRow
                                                            main={p.title}
                                                            sub={`♥${p.likes}  💬${p.comments}`}
                                                            right={new Date(p.created_at).toLocaleDateString('vi-VN')}
                                                        />
                                                    )}
                                                />
                                            )}
                                            {activeTab === 'comments' && (
                                                <ActivityList
                                                    items={details.comments}
                                                    emptyMsg="Chưa có bình luận nào"
                                                    renderItem={c => (
                                                        <ActivityRow
                                                            main={c.content}
                                                            sub={`→ Bài: ${c.post_title}`}
                                                            right={new Date(c.created_at).toLocaleDateString('vi-VN')}
                                                        />
                                                    )}
                                                />
                                            )}
                                            {activeTab === 'reposts' && (
                                                <ActivityList
                                                    items={details.reposts}
                                                    emptyMsg="Chưa có bài repost nào"
                                                    renderItem={r => (
                                                        <ActivityRow
                                                            main={r.title}
                                                            sub={`by @${r.original_author} — ${r.is_hidden ? '🔒 Ẩn' : '🌐 Công khai'}`}
                                                            right={new Date(r.reposted_at).toLocaleDateString('vi-VN')}
                                                        />
                                                    )}
                                                />
                                            )}
                                            {activeTab === 'ratings' && (
                                                <ActivityList
                                                    items={details.ratings}
                                                    emptyMsg="Chưa có đánh giá nào"
                                                    renderItem={r => (
                                                        <ActivityRow
                                                            main={r.title}
                                                            sub={'★'.repeat(r.stars) + '☆'.repeat(5 - r.stars)}
                                                            right={new Date(r.rated_at).toLocaleDateString('vi-VN')}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* ── Drawer Footer ── */}
                        <div className="flex-shrink-0 px-8 py-5 border-t border-cyan-500/10 bg-slate-900/20">
                            <button
                                onClick={closeDrawer}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-3.5 rounded-2xl transition-all uppercase tracking-widest text-xs active:scale-95"
                            >
                                ĐÓNG
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminUsers;
