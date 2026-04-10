import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const CreatePost = () => {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return navigate('/login');
        
        setLoading(true);
        setErrorMsg('');
        
        try {
            const res = await axiosClient.post('/api/posts/create.php', formData, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            alert(res.message);
            navigate('/');
        } catch (err) {
            console.error('Create Post Error:', err);
            // Bắt lỗi Gamification (403 Forbidden)
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
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Khai hỏa nội dung</h1>
                    <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.3em]">Ignite your ideas in the blogosphere</p>
                </header>

                {errorMsg && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl mb-10 animate-in bounce-in duration-500">
                        <div className="flex items-center space-x-3 text-amber-700">
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-bold text-sm leading-relaxed">{errorMsg}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Post Title</label>
                        <input 
                            type="text" 
                            placeholder="Tiêu đề bài viết gây ấn tượng..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 text-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Content Pack</label>
                        <textarea 
                            placeholder="Chia sẻ kiến thức của bạn với thế giới..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-8 text-lg text-slate-700 min-h-[350px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-inner leading-relaxed"
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            required
                        />
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-6 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm ${loading && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {loading ? 'Processing Transaction...' : 'Deploy Content Packet'}
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
