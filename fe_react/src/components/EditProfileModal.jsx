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

    // [CHUẨN HÓA DATE]: MySQL datetime "YYYY-MM-DD HH:MM:SS" -> ISO "YYYY-MM-DDTHH:MM:SS"
    const parseMySQLDate = (dateStr) => {
        if (!dateStr) return 0;
        return new Date(dateStr.replace(' ', 'T')).getTime();
    };

    const lastChange = parseMySQLDate(profile?.last_name_change_at);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const elapsed = now - lastChange;
    
    // [PHÒNG THỦ NULL]: Chỉ tính cooldown nếu có lịch sử đổi tên hợp lệ
    const isCoolingDown = profile?.last_name_change_at ? (elapsed < sevenDaysMs) : false;

    let cooldownText = '';
    let isNameChangeDisabled = false;

    if (isCoolingDown) {
        isNameChangeDisabled = true;
        const remainingMs = sevenDaysMs - elapsed;
        const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

        if (days > 0) {
            cooldownText = `Thời gian còn lại: ${days} ngày ${hours} giờ`;
        } else {
            cooldownText = `Thời gian còn lại: ${hours} giờ ${minutes} phút`;
        }
    } else {
        cooldownText = "Bạn có thể thay đổi tên hiển thị lúc này.";
    }

    if (!isOpen) return null;

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // CHẶN CỨNG FRONTEND: Chỉ JPG
        if (file.type !== 'image/jpeg') {
            toast.error('Lỗi: Chỉ hỗ trợ định dạng ảnh JPG/JPEG');
            e.target.value = ''; // Reset input
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Avatar phải nhỏ hơn 2MB');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // CHẶN CỨNG FRONTEND: Chỉ JPG
        if (file.type !== 'image/jpeg') {
            toast.error('Lỗi: Chỉ hỗ trợ định dạng ảnh JPG/JPEG');
            e.target.value = ''; // Reset input
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh bìa phải nhỏ hơn 2MB');
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
            // [BẮT BUỘC DÙNG FORMDATA] - Ngăn chặn trôi dữ liệu JSON làm mất data DB
            const formData = new FormData();
            formData.append('full_name', fullName);

            if (avatarFile) {
                formData.append('avatar_image', avatarFile);
            }
            if (coverFile) {
                formData.append('cover_image', coverFile);
            }

            const res = await axiosClient.post('/api/users/update_profile.php', formData, {
                headers: { 
                    'Authorization': 'Bearer ' + token,
                    // Ép Axios tự động tính toán boundary, không được để mặc định JSON của client
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Dữ liệu Update trả về (Raw):", res);
            
            // [BỐC TÁCH AN TOÀN]
            const updatedUser = res?.data?.data || res?.data;
            console.log("Dữ liệu User đã bóc tách:", updatedUser);

            // [INTEGRITY CHECK] - Chỉ gọi update nếu thực sự có data hợp lệ
            if (res.status === 'success' && updatedUser && updatedUser.full_name) {
                // ÉP RE-RENDER: Dùng Clone Object
                setAuthUser({ ...updatedUser });
                
                toast.success('Hồ sơ đã được đồng bộ thành công');
                
                // Cập nhật state trang Profile (nếu có)
                if (onSuccess) onSuccess({ ...updatedUser });
                
                onClose();
            } else {
                console.error("Lỗi: Dữ liệu trả về bị rỗng hoặc thiếu full_name.");
                throw new Error("Cập nhật thất bại. Vui lòng kiểm tra lại kết nối.");
            }
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || err.message || 'Lỗi: Không thể kết nối với máy chủ.';
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
                                    className={`w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 font-bold outline-none ring-4 ring-transparent focus:ring-blue-50 transition-all ${isNameChangeDisabled ? 'bg-slate-300 opacity-50 cursor-not-allowed text-slate-500' : ''}`}
                                    required
                                    disabled={isNameChangeDisabled}
                                />
                                <div className={`text-[10px] font-black mt-2 flex items-center gap-1 uppercase tracking-tight ${isNameChangeDisabled ? 'text-red-500' : 'text-emerald-500'}`}>
                                    <Info size={12} /> {isNameChangeDisabled ? cooldownText : (!isCoolingDown && "Bạn có thể thay đổi tên hiển thị lúc này.")}
                                </div>
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
                            disabled={loading || isNameChangeDisabled}
                            className={`px-8 py-3 bg-slate-900 hover:bg-black text-white font-black rounded-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2 ${(loading || isNameChangeDisabled) && 'opacity-50 cursor-not-allowed bg-slate-300 text-slate-500 shadow-none'}`}
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
