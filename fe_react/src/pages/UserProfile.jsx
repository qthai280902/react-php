import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Eye, EyeOff, Heart, Repeat, User, Users, ThumbsUp, ChevronRight, Hash } from 'lucide-react';

const UserProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); 
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isOwnProfile = currentUser.id == id;

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
        fetchUserReposts();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const data = await axiosClient.get(`/api/users/profile.php?id=${id}`);
            setProfile(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const data = await axiosClient.get('/api/posts/read_public.php');
            // Nếu API trả về cấu trúc mới { data: [...] } thì lấy .data
            const postList = data.data || data; 
            setPosts(postList.filter(p => p.author_id == id));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserReposts = async () => {
        try {
            const data = await axiosClient.get(`/api/users/read_reposts.php?user_id=${id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            setReposts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFollow = async () => {
        if (!token) return alert("Vui lòng đăng nhập để theo dõi.");
        try {
            const res = await axiosClient.post('/api/social/follow.php', 
                { following_id: id },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setIsFollowing(res.status === 'followed');
            setProfile({
                ...profile,
                stats: {
                    ...profile.stats,
                    followers: res.status === 'followed' ? profile.stats.followers + 1 : profile.stats.followers - 1
                }
            });
        } catch (err) {
            alert("Lỗi khi thực hiện hành động.");
        }
    };

    const handleToggleVisibility = async (repostId) => {
        try {
            const res = await axiosClient.post('/api/social/toggle_repost_visibility.php', 
                { repost_id: repostId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setReposts(reposts.map(r => {
                if (r.repost_id === repostId) {
                    return { ...r, is_hidden: !r.is_hidden };
                }
                return r;
            }));
            alert(res.message);
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái hiển thị.");
        }
    };

    if (loading) return <div className="text-center py-20 font-mono text-blue-600 animate-pulse uppercase tracking-[0.2em] text-sm">Accessing Profile Terminal...</div>;
    if (!profile) return <div className="text-center py-20 font-bold text-red-500 uppercase tracking-widest bg-red-50 rounded-[2rem]">404: Identity Not Resolved</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                    <User size={120} strokeWidth={1} />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-200 uppercase">
                        {profile.username[0]}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">@{profile.username}</h1>
                        
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                    <Users size={14} strokeWidth={2} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Followers</span>
                                </div>
                                <p className="text-2xl font-black text-slate-900">{profile.stats.followers}</p>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                    <User size={14} strokeWidth={2} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Following</span>
                                </div>
                                <p className="text-2xl font-black text-slate-900">{profile.stats.following}</p>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                    <ThumbsUp size={14} strokeWidth={2} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Likes</span>
                                </div>
                                <p className="text-2xl font-black text-slate-900">{profile.stats.total_likes}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            {!isOwnProfile ? (
                                <button onClick={handleFollow} className={`px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${isFollowing ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}>
                                    {isFollowing ? 'Unfollow' : 'Follow User'}
                                </button>
                            ) : (
                                <button className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 uppercase text-sm tracking-widest">Configure Identity</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-8 pb-20">
                <div className="flex space-x-8 border-b border-slate-200 pb-1">
                    <button onClick={() => setActiveTab('posts')} className={`text-sm font-black pb-4 uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Posts ({posts.length})</button>
                    <button onClick={() => setActiveTab('reposts')} className={`text-sm font-black pb-4 uppercase tracking-widest transition-all ${activeTab === 'reposts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Shared Nodes ({reposts.length})</button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'posts' ? (
                        posts.map(post => (
                            <Link key={post.id} to={`/post/${post.id}`} className="no-underline group">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group-hover:shadow-xl transition-all group-hover:-translate-y-1 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 p-8 text-slate-50 group-hover:text-blue-50 transition-colors">
                                        <ChevronRight size={48} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 mb-2 tracking-tight transition-colors">/{post.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        reposts.map(repost => (
                            <div key={repost.repost_id} className="relative group/item animate-in slide-in-from-bottom-2 duration-300">
                                <Link to={`/post/${repost.id}`} className="no-underline block">
                                    <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group-hover/item:shadow-xl transition-all ${repost.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                <Repeat size={12} strokeWidth={2} /> Transmitted from @{repost.author_name}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover/item:text-green-600 mb-2 transition-colors">/{repost.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{repost.content}</p>
                                    </div>
                                </Link>
                                
                                {isOwnProfile && (
                                    <button 
                                        onClick={() => handleToggleVisibility(repost.repost_id)}
                                        className={`absolute top-6 right-6 p-3 rounded-xl transition-all shadow-sm active:scale-90 ${repost.is_hidden ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}
                                        title={repost.is_hidden ? "Reveal Node" : "Secure Node"}
                                    >
                                        {repost.is_hidden ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                    {(activeTab === 'posts' ? posts : reposts).length === 0 && (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-300 font-mono text-[10px] uppercase tracking-[0.3em]">
                            End of Data Stream // No Entities Found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
