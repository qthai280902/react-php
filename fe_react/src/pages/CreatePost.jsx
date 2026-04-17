import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ImagePlus, X, Hash, Upload, Sparkles, AlertTriangle, Images } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtagInput, setHashtagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [subFiles, setSubFiles] = useState([]);
    const [subPreviews, setSubPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const coverInputRef = useRef(null);
    const subInputRef = useRef(null);

    // ── VALIDATE FILE (Client-side) ──
    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `File "${file.name}" không hợp lệ. Chỉ chấp nhận: JPG, PNG, WebP.`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File "${file.name}" vượt quá 2MB (${(file.size / 1024 / 1024).toFixed(2)}MB).`;
        }
        return null;
    };

    // ── COVER IMAGE HANDLER ──
    const handleCoverSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const err = validateFile(file);
        if (err) { alert(err); e.target.value = ''; return; }

        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
        if (coverInputRef.current) coverInputRef.current.value = '';
    };

    // ── SUB IMAGES HANDLER ──
    const handleSubSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const validPreviews = [];

        for (const file of files) {
            const err = validateFile(file);
            if (err) { alert(err); continue; }
            validFiles.push(file);
            validPreviews.push({ url: URL.createObjectURL(file), name: file.name });
        }

        setSubFiles(prev => [...prev, ...validFiles]);
        setSubPreviews(prev => [...prev, ...validPreviews]);
        if (subInputRef.current) subInputRef.current.value = '';
    };

    const removeSubImage = (index) => {
        setSubFiles(prev => prev.filter((_, i) => i !== index));
        setSubPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // ── HASHTAG HANDLER ──
    const handleHashtagKeyDown = (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const val = hashtagInput.trim().replace(/[^a-zA-Z0-9_\-\u00C0-\u1EF9]/g, '');
            if (val && !tags.includes(val)) {
                setTags(prev => [...prev, val]);
            }
            setHashtagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(prev => prev.filter(t => t !== tagToRemove));
    };

    // ── SUBMIT ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return navigate('/login');
        if (!title.trim() || !content.trim()) {
            setErrorMsg('Vui lòng nhập tiêu đề và nội dung.');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('hashtags', tags.join(','));

        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        subFiles.forEach(file => {
            formData.append('sub_images[]', file);
        });

        try {
            const res = await axiosClient.post('/api/posts/create.php', formData, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(res.message || 'Đăng bài thành công!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || "Lỗi hệ thống khi đăng bài.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100 p-12 border border-slate-50">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Đăng bài viết mới</h1>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em]">Chia sẻ ý tưởng của bạn với cộng đồng</p>
                </header>

                {errorMsg && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-10 animate-in slide-in-from-top duration-500">
                        <div className="flex items-center space-x-3 text-amber-700">
                            <AlertTriangle size={20} strokeWidth={2} className="flex-shrink-0" />
                            <span className="font-bold text-sm leading-relaxed">{errorMsg}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* ── TITLE ── */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Post Title</label>
                        <input
                            type="text"
                            placeholder="Tiêu đề bài viết gây ấn tượng..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 text-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* ── CONTENT ── */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Content Pack</label>
                        <textarea
                            placeholder="Chia sẻ kiến thức của bạn với thế giới..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-8 text-lg text-slate-700 min-h-[250px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-inner leading-relaxed"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    {/* ── HASHTAGS ── */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Hash size={12} className="inline mr-1" strokeWidth={2} /> Hashtags
                        </label>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 shadow-inner flex flex-wrap items-center gap-2 min-h-[56px] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
                            {tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider animate-in zoom-in duration-200">
                                    #{tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-200 transition-colors ml-0.5">
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder={tags.length === 0 ? "Gõ tag, nhấn phẩy hoặc Enter..." : "Thêm tag..."}
                                className="flex-1 bg-transparent outline-none text-sm min-w-[120px] text-slate-700 placeholder-slate-400 font-medium"
                                value={hashtagInput}
                                onChange={(e) => setHashtagInput(e.target.value)}
                                onKeyDown={handleHashtagKeyDown}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-2 font-medium">Mỗi tag cách nhau bằng dấu phẩy (,) hoặc phím Enter</p>
                    </div>

                    {/* ── COVER IMAGE ── */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <ImagePlus size={12} className="inline mr-1" strokeWidth={2} /> Ảnh bìa
                        </label>
                        {coverPreview ? (
                            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-lg group animate-in zoom-in duration-300">
                                <img src={coverPreview} alt="Cover preview" className="w-full h-56 object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-3 rounded-full shadow-xl transition-all hover:bg-red-600 active:scale-90"
                                    >
                                        <X size={20} strokeWidth={2} />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Cover Image
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                className="w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
                            >
                                <Upload size={32} strokeWidth={1.5} />
                                <span className="text-xs font-black uppercase tracking-widest">Chọn ảnh bìa</span>
                                <span className="text-[10px] font-medium">JPG, PNG, WebP — Tối đa 2MB</span>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={coverInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleCoverSelect}
                        />
                    </div>

                    {/* ── SUB IMAGES ── */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                            <Images size={12} className="inline mr-1" strokeWidth={2} /> Ảnh đính kèm (Tùy chọn)
                        </label>
                        {subPreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {subPreviews.map((img, idx) => (
                                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm group aspect-square animate-in zoom-in duration-200">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeSubImage(idx)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-90"
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <span className="text-white text-[9px] font-bold truncate block">{img.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => subInputRef.current?.click()}
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
                        >
                            <ImagePlus size={18} strokeWidth={1.5} />
                            <span className="text-xs font-black uppercase tracking-widest">Thêm ảnh phụ</span>
                        </button>
                        <input
                            type="file"
                            ref={subInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleSubSelect}
                        />
                    </div>

                    {/* ── SUBMIT ── */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 ${loading && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <Sparkles size={18} strokeWidth={2} />
                            {loading ? 'Đang xử lý...' : 'Xuất bản bài viết'}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">
                Verified Node Entry // Gamification Rules Applied
            </footer>
        </div>
    );
};

export default CreatePost;
