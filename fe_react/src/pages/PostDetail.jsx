import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Heart, Repeat2, Star, Trash2, ArrowLeft, Send, X } from 'lucide-react';
import UserBadge from '../components/UserBadge';

const PostDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [reposted, setReposted] = useState(false);

    // Lightbox state cho gallery
    const [lightboxImg, setLightboxImg] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isAdmin = currentUser.role === 'admin';
    const isPostOwner = post && post.author_id == currentUser.id;

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resData = await axiosClient.get(`/api/posts/read_single.php?id=${id}`);
            setPost(resData);
            setLikeCount(resData.total_likes);
            
            const commentData = await axiosClient.get(`/api/comments/read.php?post_id=${id}`);
            setComments(commentData);
            
            setLoading(false);
        } catch (err) {
            console.error('Fetch Detail Error:', err);
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert("Vui lòng đăng nhập để bình luận.");
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await axiosClient.post('/api/comments/create.php', 
                { post_id: id, content: newComment },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            const newCommentObj = { ...res.comment, user_id: currentUser.id };
            setComments([newCommentObj, ...comments]);
            setNewComment("");
            setSubmittingComment(false);
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi gửi bình luận.");
            setSubmittingComment(false);
        }
    };

    const canDeleteComment = (comment) => {
        if (!currentUser.id) return false;
        if (isAdmin) return true;
        if (comment.user_id == currentUser.id) return true;
        if (isPostOwner) return true;
        return false;
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
        try {
            await axiosClient.post('/api/comments/delete.php', 
                { id: commentId },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi xóa bình luận.");
        }
    };

    const handleRating = async (stars) => {
        if (!token) return alert("Vui lòng đăng nhập để đánh giá.");
        try {
            const res = await axiosClient.post('/api/ratings/rate.php', 
                { post_id: id, stars },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setUserRating(stars);
            setPost({...post, avg_rating: res.new_avg});
            alert(res.message);
        } catch (err) {
            alert("Lỗi đánh giá.");
        }
    };

    const handleLike = async () => {
        if (!token) return alert("Vui lòng đăng nhập để thả tim.");
        try {
            const res = await axiosClient.post('/api/social/like.php', 
                { post_id: id },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setLiked(res.status === 'liked');
            setLikeCount(res.total_likes);
        } catch (err) {
            alert("Lỗi khi thả tim.");
        }
    };

    const handleRepost = async () => {
        if (!token) return alert("Vui lòng đăng nhập để Repost.");
        try {
            const res = await axiosClient.post('/api/social/repost.php', 
                { post_id: id },
                { headers: { 'Authorization': 'Bearer ' + token } }
            );
            setReposted(res.status === 'reposted');
            alert(res.message);
        } catch (err) {
            alert("Lỗi khi Repost.");
        }
    };

    if (loading) return <div className="text-center py-20 font-mono text-cyan-600 animate-pulse uppercase tracking-widest text-sm">Synchronizing Node Data...</div>;
    if (!post) return <div className="text-center py-20 font-bold text-red-500 uppercase tracking-widest">404: Node Not Found</div>;

    const gallery = post.gallery || [];

    return (
        <article className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest mb-8 no-underline group transition-all active:scale-90">
                    <ArrowLeft size={16} strokeWidth={1.5} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
                </Link>
                <div className="flex flex-wrap gap-2 mb-6">
                    {(post.tags || []).map(tag => (
                        <Link key={tag} to={`/?tag=${tag}`} className="text-blue-600 font-black text-[10px] uppercase bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 no-underline tracking-widest">
                            #{tag}
                        </Link>
                    ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">{post.title}</h1>
                <div className="flex items-center space-x-6 text-slate-400">
                    <Link to={`/profile/${post.author_id}`} className="flex items-center group no-underline gap-1">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 mr-2 flex items-center justify-center font-black text-white group-hover:bg-blue-600 transition-colors uppercase">
                            {post.author_name[0]}
                        </div>
                        <span className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">@{post.author_name}</span>
                        <UserBadge followers={post.author_followers || 0} size={16} />
                    </Link>
                    <span className="text-xs font-mono">{new Date(post.created_at).toLocaleDateString('vi-VN', { dateStyle: 'long' })}</span>
                </div>
            </header>

            {/* ── ẢNH BÌA: Chỉ render khi có cover_image ── */}
            {post.cover_image && (
                <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-12 border-[12px] border-white ring-1 ring-slate-100">
                    <img src={`http://localhost:8000/uploads/${post.cover_image}`} className="w-full object-cover" alt={post.title} />
                </div>
            )}

            {/* ── NỘI DUNG BÀI VIẾT ── */}
            <div className="prose prose-lg prose-slate max-w-none text-slate-800 leading-[1.8] text-justify mb-12 px-4 whitespace-pre-line">
                {post.content}
            </div>

            {/* ── GALLERY ẢNH PHỤ ── */}
            {gallery.length > 0 && (
                <div className="mb-16 px-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Attached Media ({gallery.length})</h3>
                    <div className={`grid gap-3 ${
                        gallery.length === 1 ? 'grid-cols-1' :
                        gallery.length === 2 ? 'grid-cols-2' :
                        'grid-cols-2 md:grid-cols-3'
                    }`}>
                        {gallery.map((img, idx) => (
                            <div
                                key={img.id || idx}
                                className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group relative aspect-square hover:shadow-xl transition-all duration-500"
                                onClick={() => setLightboxImg(`http://localhost:8000/uploads/${img.image_url}`)}
                            >
                                <img
                                    src={`http://localhost:8000/uploads/${img.image_url}`}
                                    alt={`Gallery ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full transition-all">
                                        Phóng to
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── LIGHTBOX OVERLAY ── */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
                    onClick={() => setLightboxImg(null)}
                >
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors active:scale-90" onClick={() => setLightboxImg(null)}>
                        <X size={32} strokeWidth={1.5} />
                    </button>
                    <img src={lightboxImg} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
                </div>
            )}

            {/* ── INTERACTION ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Rating Stats</p>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-3xl font-black text-slate-900">{post.avg_rating}</h3>
                            <span className="text-slate-300 font-bold text-lg">/ 5</span>
                        </div>
                        <div className="flex space-x-1 mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button 
                                    key={s} 
                                    onMouseEnter={() => setHoverRating(s)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => handleRating(s)}
                                    className={`transition-all duration-300 transform active:scale-90 bg-transparent border-none p-0 outline-none shadow-none ${
                                        (hoverRating || userRating || Math.round(post.avg_rating)) >= s ? 'text-yellow-400' : 'text-slate-200'
                                    }`}
                                >
                                    <Star 
                                        size={20} 
                                        fill={(hoverRating || userRating || Math.round(post.avg_rating)) >= s ? "currentColor" : "none"} 
                                        strokeWidth={1.5} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Love</p>
                        <h3 className="text-3xl font-black text-slate-900">{likeCount}</h3>
                    </div>
                    <button 
                        onClick={handleLike} 
                        className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 border-2 active:scale-90 ${
                            liked 
                            ? 'bg-red-50 border-red-500 text-red-500 shadow-lg shadow-red-100' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-400 shadow-md'
                        }`}
                    >
                        <Heart size={32} fill={liked ? "currentColor" : "none"} strokeWidth={1.5} />
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Repost</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{reposted ? 'YES' : 'NO'}</h3>
                    </div>
                    <button 
                        onClick={handleRepost} 
                        className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 border-2 active:scale-90 ${
                            reposted 
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-500 shadow-lg shadow-cyan-100' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 shadow-md'
                        }`}
                    >
                        <Repeat2 size={32} strokeWidth={1.5} />
                    </button>
                </div>
            </div>

            {/* ── COMMENTS SECTION ── */}
            <section className="border-t border-slate-100 pt-16">
                <h2 className="text-3xl font-black text-slate-900 mb-10 uppercase tracking-tighter">Bình luận ({comments.length})</h2>
                <div className="bg-slate-900 rounded-[2.5rem] p-10 mb-12 shadow-2xl relative overflow-hidden group">
                    {token ? (
                        <form onSubmit={handleCommentSubmit} className="space-y-6">
                            <textarea 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                placeholder="Chia sẻ góc nhìn của bạn..." 
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-white text-lg focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none shadow-inner" 
                                disabled={submittingComment} 
                            />
                            <div className="flex justify-end">
                                <button 
                                    type="submit" 
                                    className={`flex items-center gap-2 px-10 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:bg-cyan-400 active:scale-95 uppercase text-sm tracking-widest ${submittingComment && 'opacity-50'}`}
                                >
                                    <Send size={18} strokeWidth={2} /> Post Comment
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <Link to="/login" className="inline-block px-12 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl no-underline hover:bg-cyan-400 transition-all uppercase text-sm tracking-widest active:scale-95">
                                Login to Comment
                            </Link>
                        </div>
                    )}
                </div>

                <div className="space-y-10 mb-20">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-6 group/item animate-in fade-in slide-in-from-left duration-500">
                            <Link to={`/profile/${comment.user_id}`} className="flex-shrink-0 no-underline">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-300 text-xl border border-slate-50 transition-all group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:shadow-xl group-hover/item:shadow-blue-200">
                                    {comment.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm relative group hover:shadow-lg transition-all duration-500">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/profile/${comment.user_id}`} className="font-black text-slate-900 hover:text-blue-600 no-underline text-lg uppercase tracking-tight">
                                                @{comment.username}
                                            </Link>
                                            {comment.followers !== undefined && (
                                                <UserBadge followers={comment.followers || 0} size={14} />
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-[10px] text-slate-300 font-mono italic uppercase">{comment.created_at}</span>
                                            {canDeleteComment(comment) && (
                                                <button 
                                                    onClick={() => handleDeleteComment(comment.id)} 
                                                    className="text-red-300 hover:text-red-500 transition-all active:scale-90 p-1"
                                                    title={isAdmin ? 'Xóa (Admin)' : 'Xóa bình luận'}
                                                >
                                                    <Trash2 size={18} strokeWidth={1.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-base">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </article>
    );
};

export default PostDetail;
