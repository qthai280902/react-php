import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Eye, EyeOff, Heart, Repeat, User, Users, ThumbsUp, ChevronRight, Trash2, RotateCcw, AlertTriangle, Archive } from 'lucide-react';
import UserBadge from '../components/UserBadge';
import EditProfileModal from '../components/EditProfileModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [trashItems, setTrashItems] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // State cho ConfirmModal tùy chỉnh
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: () => {}
    });

    const { user: currentUser, setAuthUser } = useAuth();
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // [DỌN DẸP BẢO MẬT]: Không chặn đứng trang nếu là Guest hoặc xem Profile người khác
    // Tuy nhiên nếu chưa login (không có token), vẫn nên đẩy ra login để bảo vệ API Endpoint
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    const isOwnProfile = currentUser?.uid === id;
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        // [DEFENSIVE ROUTING]: Chốt chặn đường dẫn undefined
        if (id === 'undefined') {
            toast.error("Phiên đăng nhập cũ. Vui lòng đăng xuất và đăng nhập lại!");
            navigate('/');
            return;
        }
        if (!id) return;

        fetchProfile();
        fetchUserPosts();
        fetchUserReposts();
    }, [id, navigate]); // BẮT BUỘC: id trong dependency array để fix lỗi cache component khi nhảy profile

    useEffect(() => {
        if (isOwnProfile && activeTab === 'trash') {
            fetchTrash();
        }
    }, [activeTab, isOwnProfile]);

    const fetchProfile = async () => {
        try {
            const res = await axiosClient.get(`/api/users/profile.php?id=${id}`);
            console.log("Dữ liệu fetchProfile:", res);

            // Phòng thủ mức độ đỏ: Bóc tách data an toàn
            const profileData = res?.data?.data || res?.data;
            
            if (profileData && (profileData.id || profileData.username)) {
                setProfile(profileData);
                // [SYNC STATE]: Khởi tạo trạng thái theo dõi từ API
                setIsFollowing(profileData.is_following || false);
            } else {
                console.error("Lỗi: Dữ liệu Profile trả về rỗng hoặc bị lỗi cấu trúc.");
                throw new Error("Mất dữ liệu đồng bộ Profile.");
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const res = await axiosClient.get(`/api/posts/read_user_posts.php?user_id=${id}`, {
                headers: token ? { 'Authorization': 'Bearer ' + token } : {}
            });
            // [BỐC TÁCH AN TOÀN]: API trả về { status: 'success', data: [...] }
            const postData = res?.data || res;
            setPosts(Array.isArray(postData) ? postData : []);
        } catch (err) {
            console.error("Fetch Posts Error:", err);
            setPosts([]);
        }
    };

    const fetchUserReposts = async () => {
        try {
            const res = await axiosClient.get(`/api/users/read_reposts.php?user_id=${id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            // [BỐC TÁCH AN TOÀN]: API trả về { status: 'success', data: [...] }
            const repostData = res?.data || res;
            setReposts(Array.isArray(repostData) ? repostData : []);
        } catch (err) {
            console.error("Fetch Reposts Error:", err);
            setReposts([]);
        }
    };

    const fetchTrash = async () => {
        try {
            const data = await axiosClient.get('/api/posts/trash.php', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            setTrashItems(data.trash || []);
        } catch (err) {
            console.error(err);
            setTrashItems([]);
        }
    };

    const handleFollow = async () => {
        if (!token) return toast.error("Vui lòng đăng nhập để theo dõi.");
        if (followLoading) return; // Chống double-click

        setFollowLoading(true);
        try {
            const res = await axiosClient.post('/api/users/follow.php',
                { user_id: id }, // Truyền UID băm
                { headers: { 'Authorization': 'Bearer ' + token } }
            );

            console.log("Response Follow logic:", res);

            // [PHÒNG THỦ MỨC CAO]: Kiểm tra trạng thái thành công thật từ Backend
            if (res.status !== 'success') {
                toast.error(res.message || "Không thể thực hiện hành động này.");
                return;
            }

            const newFollowerCount = res?.data?.follower_count ?? res?.follower_count;
            const newIsFollowing = res?.data?.is_following ?? res?.is_following;

            // [INTEGRITY CHECK]: Chỉ cập nhật khi có dữ liệu số hợp lệ
            if (newFollowerCount !== undefined) {
                setIsFollowing(!!newIsFollowing);
                setProfile(prev => ({
                    ...prev,
                    stats: {
                        ...(prev?.stats || {}),
                        followers: parseInt(newFollowerCount)
                    }
                }));
            }
            
            toast.success(res?.message || res?.data?.message || (newIsFollowing ? "Đã theo dõi" : "Đã bỏ theo dõi"));
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thực hiện hành động.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleToggleRepostVisibility = async (repostId) => {
        try {
            const res = await axiosClient.post('/api/social/toggle_repost_visibility.php',
                { repost_id: repostId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setReposts(reposts.map(r => {
                if (r.repost_id === repostId) return { ...r, is_hidden: !r.is_hidden };
                return r;
            }));
            toast.success(res.message);
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái hiển thị.");
        }
    };

    // ── POST ACTIONS ──
    const handleTogglePostVisibility = async (postId, currentHidden) => {
        try {
            const res = await axiosClient.post('/api/posts/toggle_visibility.php',
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setPosts(posts.map(p => {
                if (p.id === postId) return { ...p, is_hidden: res.is_hidden };
                return p;
            }));
            toast.success(res.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi thay đổi trạng thái.");
        }
    };

    const handleSoftDelete = (postId) => {
        setConfirmState({
            isOpen: true,
            title: "Xóa bài viết",
            message: "Bài viết sẽ được chuyển vào Thùng rác. Bạn có 30 ngày để khôi phục. Tiếp tục?",
            type: "warning",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await axiosClient.post('/api/posts/soft_delete.php',
                        { post_id: postId },
                        { headers: { 'Authorization': 'Bearer ' + token } }
                    );
                    setPosts(posts.filter(p => p.id !== postId));
                    toast.success(res.message);
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa bài viết.");
                }
            }
        });
    };

    const handleSoftDeleteRepost = (repostId) => {
        setConfirmState({
            isOpen: true,
            title: "Xóa lượt đăng lại",
            message: "Hành động này sẽ chuyển lượt đăng lại này vào Thùng rác. Bạn có thể khôi phục bất cứ lúc nào trong 30 ngày. Xóa?",
            type: "warning",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    await axiosClient.get(`/api/reposts/soft_delete.php?id=${repostId}`, {
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    setReposts(reposts.filter(r => r.repost_id !== repostId));
                    toast.success("Đã chuyển vào thùng rác.");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa lượt đăng lại.");
                }
            }
        });
    };

    const handleRestore = async (postId) => {
        try {
            const res = await axiosClient.post('/api/posts/restore.php',
                { post_id: postId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setTrashItems(trashItems.filter(t => t.id !== postId));
            toast.success(res.message);
            fetchUserPosts(); // Refresh danh sách bài viết
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi khôi phục.");
        }
    };

    const handlePermanentDelete = (postId) => {
        setConfirmState({
            isOpen: true,
            title: "XÓA VĨNH VIỄN",
            message: "⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ hoàn tác! Bài viết và TẤT CẢ hình ảnh sẽ bị xóa vĩnh viễn.",
            type: "danger",
            onConfirm: async () => {
                setConfirmState(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await axiosClient.post('/api/posts/permanent_delete.php',
                        { post_id: postId },
                        { headers: { 'Authorization': 'Bearer ' + token } }
                    );
                    setTrashItems(trashItems.filter(t => t.id !== postId));
                    toast.success(res.message);
                } catch (err) {
                    toast.error(err.response?.data?.message || "Lỗi khi xóa vĩnh viễn.");
                }
            }
        });
    };

    if (loading) return <div className="text-center py-20 font-bold text-slate-400 animate-pulse uppercase tracking-widest text-sm">Đang tải hồ sơ...</div>;
    if (!profile) return <div className="text-center py-20 font-bold text-red-500 uppercase tracking-widest bg-red-50 rounded-[2rem]">404: Không tìm thấy hồ sơ</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* ── HEADER AREA ── */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group mb-8">
                {/* Ảnh bìa 16:9 phủ mờ */}
                <div className="w-full aspect-[21/9] bg-slate-100 relative">
                    {profile?.cover_image ? (
                        <img 
                            src={`http://localhost:8000/uploads/${profile.cover_image}`} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-cyan-900 to-blue-900" />
                    )}
                </div>

                <div className="px-10 pb-10 relative">
                    {/* Avatar nổi lên đè vào cover */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10 -mt-16 md:-mt-24 mb-6">
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-white p-2 shadow-2xl flex-shrink-0">
                            {profile?.avatar_image ? (
                                <img 
                                    src={`http://localhost:8000/uploads/${profile.avatar_image}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-[2rem]"
                                />
                            ) : (
                                <div className="w-full h-full rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-5xl font-black uppercase">
                                     <span>{(profile?.full_name || profile?.username || '?').charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        {/* ── IDENTITY & ACTIONS ── */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center md:items-center mt-4 md:mt-0 w-full gap-4">
                                <div className="min-w-0 flex-1 text-center md:text-left">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3 truncate">
                                        {profile?.full_name || profile?.username}
                                        <UserBadge role={profile?.role} followers={profile?.stats?.followers || 0} size={22} />
                                    </h1>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">@{profile?.username}</p>
                                </div>

                                <div className="flex-shrink-0">
                                    {currentUser ? (
                                        isOwnProfile ? (
                                        <button 
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-900/20 active:scale-95 uppercase text-sm tracking-widest cursor-pointer"
                                        >
                                            Chỉnh sửa hồ sơ
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className={`px-10 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isFollowing 
                                                ? 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100' 
                                                : 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700'
                                            }`}
                                        >
                                            {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Bỏ theo dõi' : 'Theo dõi')}
                                        </button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dải thống kê */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100 max-w-2xl mx-auto md:mx-0">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                <Users size={14} strokeWidth={2} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Followers</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{profile?.stats?.followers ?? 0}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                <User size={14} strokeWidth={2} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Following</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{profile?.stats?.following || 0}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 mb-1 text-slate-400 justify-center md:justify-start">
                                <ThumbsUp size={14} strokeWidth={2} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Likes</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{profile?.stats?.total_likes || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT TABS ── */}
            <div className="space-y-8 pb-20">
                <div className="flex space-x-8 border-b border-slate-200 pb-1 overflow-x-auto">
                    <button onClick={() => setActiveTab('posts')} className={`text-sm font-black pb-4 uppercase tracking-widest transition-all flex-shrink-0 ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        Posts ({posts.length})
                    </button>
                    <button onClick={() => setActiveTab('reposts')} className={`text-sm font-black pb-4 uppercase tracking-widest transition-all flex-shrink-0 ${activeTab === 'reposts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        My Reposts ({reposts.length})
                    </button>
                    {isOwnProfile && (
                        <button onClick={() => setActiveTab('trash')} className={`text-sm font-black pb-4 uppercase tracking-widest transition-all flex-shrink-0 flex items-center gap-2 ${activeTab === 'trash' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-slate-600'}`}>
                            <Trash2 size={14} strokeWidth={2} /> Thùng rác
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* ── TAB: POSTS ── */}
                    {activeTab === 'posts' && (
                        <>
                            {posts.map(post => (
                                <div key={post.id} className="relative group/item animate-in slide-in-from-bottom-2 duration-300">
                                    <Link to={`/post/${post.id}`} className="no-underline block">
                                        <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group-hover/item:shadow-xl transition-all group-hover/item:-translate-y-1 relative overflow-hidden ${post.is_hidden ? 'opacity-50 border-amber-200 bg-amber-50/30' : ''}`}>
                                            <div className="absolute right-0 top-0 p-8 text-slate-50 group-hover/item:text-blue-50 transition-colors">
                                                <ChevronRight size={48} strokeWidth={1} />
                                            </div>
                                            {/* [FIX BUG 0]: Sử dụng > 0 để tránh React in số 0 khi is_hidden = 0 */}
                                            {post.is_hidden > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-full mb-3 uppercase tracking-widest border border-amber-200">
                                                    <EyeOff size={10} strokeWidth={2} /> Đang ẩn
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-900 group-hover/item:text-blue-600 mb-2 tracking-tight transition-colors">/{post.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{post.content}</p>
                                        </div>
                                    </Link>

                                    {/* ── ACTION BUTTONS (Chỉ hiện cho chủ profile) ── */}
                                    {isOwnProfile && (
                                        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                                            <button
                                                onClick={() => handleTogglePostVisibility(post.id, post.is_hidden)}
                                                className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-90 ${post.is_hidden ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}
                                                title={post.is_hidden ? "Hiện bài viết" : "Ẩn bài viết"}
                                            >
                                                {post.is_hidden ? <Eye size={16} strokeWidth={1.5} /> : <EyeOff size={16} strokeWidth={1.5} />}
                                            </button>
                                            <button
                                                onClick={() => handleSoftDelete(post.id)}
                                                className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Chuyển vào thùng rác"
                                            >
                                                <Trash2 size={16} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── TAB: REPOSTS ── */}
                    {activeTab === 'reposts' && (
                        <>
                            {reposts.map(repost => (
                                <div key={repost.repost_id} className="relative group/item animate-in slide-in-from-bottom-2 duration-300">
                                    <Link to={`/post/${repost.id}`} className="no-underline block">
                                        <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group-hover/item:shadow-xl transition-all ${repost.is_hidden ? 'opacity-50 grayscale' : ''}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                    <Repeat size={12} strokeWidth={2} /> Transmitted from @{repost.author_name}
                                                </span>
                                            </div>
                                            {/* [FIX BUG 0]: Đảm bảo không rớt số 0 khi bài viết Repost công khai */}
                                            {repost.is_hidden > 0 && (
                                                 <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-full mb-3 uppercase tracking-widest border border-amber-200">
                                                    <EyeOff size={10} strokeWidth={2} /> Đang ẩn
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-900 group-hover/item:text-green-600 mb-2 transition-colors">/{repost.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{repost.content}</p>
                                        </div>
                                    </Link>

                                    {isOwnProfile && (
                                        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                                            <button
                                                onClick={() => handleToggleRepostVisibility(repost.repost_id)}
                                                className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-90 ${repost.is_hidden ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white'}`}
                                                title={repost.is_hidden ? "Hiện" : "Ẩn"}
                                            >
                                                {repost.is_hidden ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                                            </button>
                                            <button
                                                onClick={() => handleSoftDeleteRepost(repost.repost_id)}
                                                className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                                                title="Xóa đăng lại"
                                            >
                                                <Trash2 size={16} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── TAB: THÙNG RÁC ── */}
                    {activeTab === 'trash' && isOwnProfile && (
                        <>
                            {trashItems.length > 0 ? (
                                <>
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3 mb-2 animate-in fade-in duration-500">
                                        <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                        <div>
                                            <p className="text-sm font-bold text-red-700">Bài viết trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.</p>
                                            <p className="text-xs text-red-500 mt-1">Hãy khôi phục ngay nếu bạn cần giữ lại bất kỳ nội dung nào.</p>
                                        </div>
                                    </div>

                                    {trashItems.map(item => (
                                        <div key={item.id} className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-red-200 shadow-sm relative animate-in slide-in-from-bottom-2 duration-300 group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border border-red-100 uppercase tracking-widest flex items-center gap-1 ${item.item_type === 'repost' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                                            {item.item_type === 'repost' ? <Repeat size={10} /> : <Archive size={10} />}
                                                            {item.item_type === 'repost' ? 'Repost Deleted' : 'Post Deleted'}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${item.days_remaining <= 7 ? 'text-red-600 bg-red-100 border border-red-200' : 'text-amber-600 bg-amber-50 border border-amber-200'}`}>
                                                            Còn {item.days_remaining} ngày
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-500 mb-2 tracking-tight line-through decoration-red-300">/{item.title}</h3>
                                                    <p className="text-[10px] text-slate-400 font-mono">
                                                        Đã xóa: {new Date(item.deleted_at).toLocaleString('vi-VN')} · Tạo: {new Date(item.created_at).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleRestore(item.id)}
                                                        className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-widest"
                                                    >
                                                        <RotateCcw size={14} strokeWidth={2} /> Khôi phục
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDelete(item.id)}
                                                        className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-95 uppercase tracking-widest"
                                                    >
                                                        <Trash2 size={14} strokeWidth={2} /> Xóa hẳn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-300 font-mono text-[10px] uppercase tracking-[0.3em]">
                                    Thùng rác trống // No Deleted Entities
                                </div>
                            )}
                        </>
                    )}

                    {/* ── EMPTY STATE (Dùng ternary để triệt tiêu số 0) ── */}
                    {((activeTab === 'posts' && posts.length === 0) || (activeTab === 'reposts' && reposts.length === 0)) ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-300 font-mono text-[10px] uppercase tracking-[0.3em]">
                            Không có dữ liệu hiển thị
                        </div>
                    ) : null}
                </div>
            </div>
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                profile={profile} 
                token={token}
                onSuccess={(updatedUser) => {
                    if (updatedUser) {
                        setProfile(prev => ({...prev, ...updatedUser}));
                    }
                }}
            />

            {/* Custom confirmation dialog */}
            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                title={confirmState.title}
                message={confirmState.message}
                type={confirmState.type}
            />
        </div>
    );
};

export default UserProfile;
