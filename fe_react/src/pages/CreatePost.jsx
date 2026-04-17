import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Send, Image as ImageIcon, Type, Tag, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    // [HỒI SINH TRÌNH SOẠN THẢO]: Sử dụng Native Quill để tránh crash React 19
    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Hãy viết gì đó thật bùng nổ...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            // Đồng bộ nội dung từ Quill sang React State
            quillRef.current.on('text-change', () => {
                setContent(quillRef.current.root.innerHTML);
            });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Vui lòng đăng nhập để viết bài.");
            return;
        }

        if (!title.trim() || !content.trim() || content === '<p><br></p>') {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('tags', tags);
        if (coverImage) {
            formData.append('cover_image', coverImage);
        }

        try {
            await axiosClient.post('/api/posts/create.php', formData, {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Đã xuất bản bài viết thành công!");
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi đăng bài.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in duration-700">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest mb-8 transition-colors"
            >
                <ArrowLeft size={14} /> Trở lại
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-10 py-8 text-white">
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Type size={28} className="text-blue-400" /> VIẾT BÀI MỚI
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Sáng tạo nội dung không giới hạn</p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {/* Tiêu đề */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề bài viết</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề ấn tượng..."
                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tags (Cách nhau bằng dấu phẩy)</label>
                        <div className="relative">
                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="congnghe, lifestyle, dev..."
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Ảnh bìa */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ảnh bìa bài viết</label>
                        <div className="relative group/upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverImage(e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover/upload:border-blue-400 group-hover/upload:bg-blue-50/30 transition-all">
                                <ImageIcon size={32} className="text-slate-300 group-hover/upload:text-blue-500 transition-colors" />
                                <span className="text-xs font-bold text-slate-400 group-hover/upload:text-blue-600 uppercase tracking-widest">
                                    {coverImage ? coverImage.name : "Chọn hoặc kéo ảnh vào đây"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Native Quill Editor Container */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nội dung bài viết</label>
                        <div className="bg-slate-50 rounded-[2rem] overflow-hidden border-2 border-slate-100 focus-within:border-blue-500/20 transition-all">
                            <div ref={editorRef} style={{ minHeight: '300px' }} className="native-quill-editor" />
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? "Đang xử lý..." : <><Send size={20} strokeWidth={2.5} /> XUẤT BẢN NGAY</>}
                    </button>
                </form>
            </div>

            <style>{`
                .native-quill-editor .ql-toolbar {
                    background: #f8fafc;
                    border: none !important;
                    border-bottom: 2px solid #f1f5f9 !important;
                    padding: 1.25rem !important;
                    border-radius: 2rem 2rem 0 0;
                }
                .native-quill-editor .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: 1rem;
                    min-height: 300px;
                }
                .native-quill-editor .ql-editor {
                    min-height: 300px;
                    padding: 2rem !important;
                    line-height: 1.8;
                    color: #1e293b;
                }
                .native-quill-editor .ql-editor.ql-blank::before {
                    color: #cbd5e1;
                    font-style: normal;
                    left: 32px;
                }
            `}</style>
        </div>
    );
};

export default CreatePost;
