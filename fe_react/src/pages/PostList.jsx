import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Repeat2, MessageSquare, Star, ChevronLeft, ChevronRight, Hash, Search, X, Newspaper } from 'lucide-react';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const tagFilter = searchParams.get('tag') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [sortType, setSortType] = useState('newest'); 
    const [pagination, setPagination] = useState({ total_pages: 1, total_posts: 0 });
    const [searchKeyword, setSearchKeyword] = useState('');
    
    const token = localStorage.getItem('token');
    const postsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [tagFilter, sortType, searchKeyword]);

    // Debounce fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 400);
        return () => clearTimeout(timer);
    }, [tagFilter, sortType, currentPage, searchKeyword]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (tagFilter)              params.append('tag', tagFilter);
            if (searchKeyword.trim())   params.append('keyword', searchKeyword.trim());
            params.append('page',  currentPage);
            params.append('limit', postsPerPage);
            params.append('sort',  sortType);

            const res = await axiosClient.get(`/api/posts/read_public.php?${params.toString()}`);
            setPosts(res.data || []);
            setPagination(res.pagination || { total_pages: 1, total_posts: 0 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId) => {
        if (!token) return alert("Vui lòng đăng nhập để thả tim.");
        try {
            const res = await axiosClient.post('/api/social/like.php', 
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { ...p, liked: res.status === 'liked', total_likes: res.total_likes };
                }
                return p;
            }));
        } catch (err) {
            alert("Lỗi khi thả tim.");
        }
    };

    const handleRepost = async (postId) => {
        if (!token) return alert("Vui lòng đăng nhập để Repost.");
        try {
            const res = await axiosClient.post('/api/social/repost.php', 
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    return { ...p, reposted: res.status === 'reposted' };
                }
                return p;
            }));
            alert(res.message);
        } catch (err) {
            alert("Lỗi khi Repost bài viết.");
        }
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.total_pages; i++) {
            pages.push(
                <button 
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-10 h-10 rounded-xl font-black transition-all active:scale-90 ${currentPage === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="flex items-center justify-center space-x-2 mt-12 py-8 border-t border-slate-100">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all border border-slate-100 active:scale-90"
                >
                    <ChevronLeft size={16} strokeWidth={1.5} /> Trước
                </button>
                {pages}
                <button 
                    disabled={currentPage === pagination.total_pages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-1 px-4 py-2 bg-white text-slate-600 font-bold rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-all border border-slate-100 active:scale-90"
                >
                    Sau <ChevronRight size={16} strokeWidth={1.5} />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">

            {/* ═══ SEARCH BAR + SORT TABS ═══ */}
            <div className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-slate-100 mb-8">
                {/* Search Input */}
                <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={16} className="text-slate-400" strokeWidth={1.5} />
                    </div>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        placeholder="Tìm kiếm bài viết theo tiêu đề hoặc nội dung..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                    {searchKeyword && (
                        <button
                            onClick={() => setSearchKeyword('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} strokeWidth={1.5} />
                        </button>
                    )}
                </div>

                {/* Sort Tabs */}
                <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                        {[
                            { id: 'newest', label: 'Mới nhất' },
                            { id: 'top_rated', label: 'Hay nhất' },
                            { id: 'hot', label: 'Sôi nổi' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSortType(tab.id)}
                                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${sortType === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">
                        Total: {pagination.total_posts} Nodes
                    </div>
                </div>
            </div>

            {/* Search result indicator */}
            {searchKeyword.trim() && (
                <div className="flex items-center space-x-2 text-slate-500 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-left duration-500">
                    <span className="font-bold flex items-center gap-1 mt-0.5"><Search size={14} strokeWidth={2} /> Kết quả cho:</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">&quot;{searchKeyword.trim()}&quot;</span>
                    <button onClick={() => setSearchKeyword('')} className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest ml-4 no-underline">Xóa</button>
                </div>
            )}

            {tagFilter && (
                <div className="flex items-center space-x-2 text-slate-500 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-left duration-500">
                    <span className="font-bold flex items-center gap-1 mt-0.5"><Hash size={14} strokeWidth={2} /> Target:</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm uppercase tracking-tighter">#{tagFilter}</span>
                    <Link to="/" className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest ml-4 no-underline">Clear</Link>
                </div>
            )}

            {loading ? (
                <div className="space-y-8 animate-pulse">
                    {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-100 rounded-[2.5rem] w-full"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group animate-in zoom-in-95 duration-500"
                            >
                                {/* ── THUMBNAIL (Nguyên tắc Image-First) ── */}
                                <Link to={`/post/${post.id}`} className="block overflow-hidden relative w-full shrink-0">
                                    {post.cover_image ? (
                                        <div className="w-full aspect-video">
                                            <img 
                                                src={`http://localhost:8000/uploads/${post.cover_image}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                                                alt={post.title}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-colors duration-500">
                                            <Newspaper size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    
                                    {/* Tag Overlay */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md">
                                            {post.tags[0]}
                                        </div>
                                    )}
                                </Link>

                                {/* ── NỘI DUNG CONTENT ── */}
                                <div className="flex-1 flex flex-col p-5">
                                    {/* Meta data */}
                                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 mb-4 font-medium uppercase tracking-widest">
                                        <Link to={`/profile/${post.author_uid}`} className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors no-underline group/auth">
                                            <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[8px] font-black overflow-hidden shadow-sm group-hover/auth:bg-blue-600 transition-colors">
                                                {post.author_avatar ? (
                                                    <img src={`http://localhost:8000/uploads/${post.author_avatar}`} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <span>{(post.author_full_name || post.author_name || '?').charAt(0)}</span>
                                                )}
                                            </div>
                                            <span>{post.author_full_name || post.author_name}</span>
                                        </Link>
                                        <span>•</span>
                                        <span className="font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    
                                    {/* Title */}
                                    <Link to={`/post/${post.id}`} className="no-underline block group-hover:text-blue-600 transition-colors">
                                        <h2 className="text-xl font-bold text-slate-900 line-clamp-2 mb-2 hover:text-blue-600 cursor-pointer">
                                            {post.title}
                                        </h2>
                                    </Link>
                                    
                                    {/* Excerpt */}
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                                        {post.content}
                                    </p>
                                    
                                    {/* ── INTERACTION FOOTER ── */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                                        <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50/50 px-2 py-1 rounded-md text-[10px] border border-amber-100/50">
                                            <Star size={12} fill="currentColor" strokeWidth={1.5} /> {post.avg_rating > 0 ? post.avg_rating : 'New'}
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <button 
                                                onClick={() => handleLike(post.id)}
                                                className={`flex items-center gap-1.5 transition-colors group/btn ${post.liked ? 'text-red-500' : 'hover:text-blue-600'}`}
                                            >
                                                <Heart size={16} fill={post.liked ? "currentColor" : "none"} strokeWidth={1.5} />
                                                <span className="font-medium">{post.total_likes || 0}</span>
                                            </button>

                                            <button 
                                                onClick={() => handleRepost(post.id)}
                                                className={`flex items-center gap-1.5 transition-colors ${post.reposted ? 'text-green-500' : 'hover:text-blue-600'}`}
                                            >
                                                <Repeat2 size={16} strokeWidth={1.5} />
                                            </button>
                                            
                                            <Link to={`/post/${post.id}#comments`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors no-underline">
                                                <MessageSquare size={16} strokeWidth={1.5} />
                                                <span className="font-medium">{post.total_comments || 0}</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-mono text-xs uppercase tracking-widest">
                            No content found for this criteria.
                        </div>
                    )}

                    {posts.length > 0 && (
                        <div className="col-span-full">
                            {renderPagination()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostList;
