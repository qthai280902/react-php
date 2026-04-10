import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const AdminPosts = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        keyword: '',
        author: '',
        date: '',
        hashtag: ''
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, posts]);

    const fetchPosts = async () => {
        try {
            const data = await axiosClient.get('/api/posts/read.php');
            setPosts(data);
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = posts;
        if (filters.keyword) {
            result = result.filter(p => p.title.toLowerCase().includes(filters.keyword.toLowerCase()));
        }
        if (filters.author) {
            result = result.filter(p => p.author_name.toLowerCase().includes(filters.author.toLowerCase()));
        }
        if (filters.date) {
            result = result.filter(p => p.created_at.startsWith(filters.date));
        }
        // Hashtag filter logic (giả lập vì DB hiện tại chưa có tags trả về trực tiếp trong read.php)
        if (filters.hashtag) {
            result = result.filter(p => p.title.toLowerCase().includes(filters.hashtag.toLowerCase()));
        }
        setFilteredPosts(result);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xóa bản ghi từ hệ thống?')) {
            try {
                await axiosClient.post('/api/posts/delete.php', { id });
                setPosts(posts.filter(post => post.id !== id));
            } catch (err) {
                alert('LỖI: Truy cập cơ sở dữ liệu thất bại.');
            }
        }
    };

    if (loading) return <div className="text-cyan-500 font-mono animate-pulse">INITIATING DATA RETRIEVAL...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Quản lý bài viết</h1>
                    <p className="text-cyan-500/50 font-mono text-xs uppercase mt-1">Total Records: {filteredPosts.length}</p>
                </div>
            </div>

            {/* Multi-Filter Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-cyan-500/10 backdrop-blur-sm">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tìm theo tiêu đề</label>
                    <input 
                        type="text" 
                        placeholder="Keyword..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={filters.keyword}
                        onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lọc tác giả</label>
                    <input 
                        type="text" 
                        placeholder="Author name..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={filters.author}
                        onChange={(e) => setFilters({...filters, author: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lọc Hashtag</label>
                    <input 
                        type="text" 
                        placeholder="#tag..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={filters.hashtag}
                        onChange={(e) => setFilters({...filters, hashtag: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lọc Ngày</label>
                    <input 
                        type="date" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 [color-scheme:dark] focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={filters.date}
                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                    />
                </div>
            </div>

            {/* High-Tech Table */}
            <div className="bg-slate-950 rounded-2xl border border-cyan-500/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 border-b border-cyan-500/10">
                        <tr>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">CID</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">Tiêu đề bản ghi</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">Authority</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest">Metadata/Date</th>
                            <th className="p-5 font-bold text-[11px] text-slate-400 uppercase tracking-widest text-center">Operation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/5 text-sm">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                                    <td className="p-5 text-cyan-500/70 font-mono text-xs">0x{post.id}</td>
                                    <td className="p-5 text-slate-300 font-semibold group-hover:text-cyan-400 transition-colors">{post.title}</td>
                                    <td className="p-5">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-slate-400 font-mono text-xs">{post.author_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-slate-500 font-mono text-xs italic">
                                        {post.created_at}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex justify-center space-x-3">
                                            <button className="text-cyan-500 hover:text-cyan-400 p-2 bg-cyan-500/5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-500 hover:text-red-400 p-2 bg-red-500/5 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-20 text-center text-slate-600 italic font-mono uppercase tracking-[0.2em]">
                                    NO RECORD MATCHES CURRENT QUERY
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPosts;
