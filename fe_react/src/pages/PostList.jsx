import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Repeat2, MessageSquare, Star, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const tagFilter = searchParams.get('tag') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const [sortType, setSortType] = useState('newest'); 
    const [pagination, setPagination] = useState({ total_pages: 1, total_posts: 0 });
    
    const token = localStorage.getItem('token');
    const postsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [tagFilter, sortType]);

    useEffect(() => {
        fetchPosts();
    }, [tagFilter, sortType, currentPage]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = `/api/posts/read_public.php?tag=${tagFilter}&page=${currentPage}&limit=${postsPerPage}&sort=${sortType}`;
            const res = await axiosClient.get(url);
            setPosts(res.data);
            setPagination(res.pagination);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
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
            {/* Sort Tabs UI */}
            <div className="flex items-center justify-between bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100 mb-8 overflow-hidden">
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
                <div className="grid grid-cols-1 gap-8">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article key={post.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 group animate-in zoom-in-95 duration-500">
                                <div className="md:flex">
                                    <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                                        <img 
                                            src={`https://picsum.photos/400/400?random=${post.id}`} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                            alt={post.title}
                                        />
                                    </div>
                                    <div className="md:w-2/3 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2 text-xs text-slate-400">
                                                    <Link to={`/profile/${post.author_id}`} className="font-black text-slate-900 hover:text-blue-600 transition-colors no-underline">
                                                        @{post.author_name}
                                                    </Link>
                                                    <span>•</span>
                                                    <span className="font-mono text-[10px]">{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full text-[10px] border border-amber-100 shadow-sm shadow-amber-50">
                                                    <Star size={10} fill="currentColor" strokeWidth={1.5} /> {post.avg_rating > 0 ? post.avg_rating : 'New'}
                                                </div>
                                            </div>
                                            <Link to={`/post/${post.id}`} className="no-underline">
                                                <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{post.title}</h2>
                                            </Link>
                                            <p className="text-slate-500 line-clamp-2 leading-relaxed text-sm mb-4">{post.content}</p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.map(tag => (
                                                    <Link 
                                                        key={tag} 
                                                        to={`/?tag=${tag}`}
                                                        className="text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors no-underline uppercase tracking-tighter"
                                                    >
                                                        #{tag}
                                                    </Link>
                                                ))}
                                            </div>
                                            
                                            <div className="flex items-center space-x-5">
                                                <button 
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center space-x-1.5 transition-all group/btn active:scale-90 ${post.liked ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
                                                >
                                                    <Heart size={20} fill={post.liked ? "currentColor" : "none"} strokeWidth={1.5} />
                                                    <span className="text-xs font-black font-mono">{post.total_likes || 0}</span>
                                                </button>

                                                <button 
                                                    onClick={() => handleRepost(post.id)}
                                                    className={`flex items-center space-x-1.5 transition-all active:scale-90 ${post.reposted ? 'text-green-500' : 'text-slate-300 hover:text-green-400'}`}
                                                >
                                                    <Repeat2 size={20} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{post.reposted ? 'Shared' : 'Share'}</span>
                                                </button>
                                                
                                                <Link to={`/post/${post.id}`} className="flex items-center space-x-1.5 text-slate-300 hover:text-blue-500 transition-colors no-underline active:scale-90">
                                                    <MessageSquare size={20} strokeWidth={1.5} />
                                                    <span className="text-xs font-black font-mono">{post.total_comments || 0}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 font-mono text-xs uppercase tracking-widest">
                            No content found for this criteria.
                        </div>
                    )}

                    {posts.length > 0 && renderPagination()}
                </div>
            )}
        </div>
    );
};

export default PostList;
