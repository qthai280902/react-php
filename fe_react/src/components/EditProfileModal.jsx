import React, { useState, useContext } from 'react';
import { X, Upload, Info, ImagePlus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, profile, token, onSuccess }) => {
    const { setAuthUser } = useContext(AuthContext);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    
    // Previews
    const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_image ? `http://localhost:8000/uploads/${profile.avatar_image}` : '');
    const [coverPreview, setCoverPreview] = useState(profile?.cover_image ? `http://localhost:8000/uploads/${profile.cover_image}` : '');
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Avatar phải nhỏ hơn 2MB');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Ảnh bìa phải nhỏ hơn 2MB');
            return;
        }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            // DO NOT append username or id - backend will block it anyway

            if (avatarFile) formData.append('avatar_image', avatarFile);
            if (coverFile) formData.append('cover_image', coverFile);

            const res = await axiosClient.post('/api/users/update_profile.php', formData, {
                headers: { 
                    'Authorization': 'Bearer ' + token
                }
            });

            console.log("Dữ liệu API trả về:", res);

            // Do Axios tạo ra thêm một vỏ bọc, ta lấy res.data vì PHP trả về key "data"
            // (res là object JSON đã được axios parse)
            const userData = res.data;

            if (res.status === 'success' && userData) {
                // Đẩy thẳng dữ liệu user mới vào Context để Header đổi liền
                setAuthUser(userData);
                
                // Hiển thị Toast xanh lá góc trên phải
                toast.success('Đã cập nhật thông tin thành công');
                
                // Báo cho UserProfile
                onSuccess(userData);
                
                // Đóng modal THEO ĐÚNG CTO YÊU CẦU
                onClose();
            } else {
                throw new Error("Dữ liệu trả về không hợp lệ.");
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình cập nhật hồ sơ.';
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={!loading ? onClose : undefined} />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Chỉnh sửa hồ sơ</h2>
                    <button onClick={onClose} disabled={loading} className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold flex items-start gap-2">
                            <Info size={18} className="mt-0.5 shrink-0" /> {errorMsg}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Cụm Ảnh Bìa & Đại Diện */}
                        <div className="relative mb-12">
                            {/* Cover Image Upload */}
                            <div className="relative w-full aspect-[21/9] bg-slate-100 rounded-2xl overflow-hidden group border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <ImagePlus size={28} strokeWidth={1.5} className="mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tải ảnh bìa (Max 2MB)</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Upload size={14}/> Thay đổi Ảnh bìa</span>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                </label>
                            </div>

                            {/* Avatar Upload */}
                            <div className="absolute -bottom-10 left-6">
                                <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-xl group">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={32} />
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                                        <Upload size={16} className="text-white mb-1" />
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Định danh (Không thể đổi)</label>
                                <input 
                                    type="text" 
                                    value={`@${profile?.username || ''}`}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-400 font-bold outline-none cursor-not-allowed"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tên hiển thị (Tên thật)</label>
                                <input 
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 font-bold outline-none ring-4 ring-transparent focus:ring-blue-50 transition-all"
                                    required
                                />
                                <p className="text-xs text-orange-500 font-semibold mt-1.5 ml-1">
                                    Lưu ý: Để bảo vệ định danh, tên hiển thị chỉ được thay đổi 7 ngày 1 lần.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs"
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2 ${loading && 'opacity-50 cursor-not-allowed'}`}
                        >
                            {loading ? 'Đang lưu...' : 'Cập nhật thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
