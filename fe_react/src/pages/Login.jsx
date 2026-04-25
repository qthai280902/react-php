import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const url = isRegister ? '/api/auth/register.php' : '/api/auth/login.php';

        try {
            const data = await axiosClient.post(url, formData);
            
            if (isRegister) {
                alert('Đăng ký thành công! Hãy đăng nhập.');
                setIsRegister(false);
            } else {
                // [DEFENSIVE DIAGNOSTIC]: In log để soi cấu trúc thực tế của Backend
                console.log("CHẨN ĐOÁN LOGIN RESPONSE:", data);

                // [SMART EXTRACTION]: Chuỗi fallback bất bại để lấy User data
                const userData = data.user || data.data?.user || data.data || data;
                const userToken = data.token || data.data?.token;

                // [INTEGRITY GUARD]: Chặn đứng nếu dữ liệu rỗng hoặc sai cấu trúc
                if (!userData || !userData.id) {
                    console.error("LỖI CHÍ MẠNG: Không tìm thấy cục dữ liệu User trong Response!", data);
                    toast.error("Lỗi đồng bộ dữ liệu từ Server!");
                    setErrorMsg("Không thể xác thực thông tin người dùng.");
                    return; 
                }

                // [CENTRALIZED AUTH]: Chỉ kích hoạt khi data đã sạch
                login(userData, userToken);
                
                toast.success('Đăng nhập thành công!');
                navigate('/');
            }
        } catch (err) {
            console.error('Auth Error:', err);
            const message = err.response?.data?.message || 'Lỗi hệ thống, vui lòng thử lại sau.';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 border border-slate-50">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                        {isRegister ? 'Khởi tạo tài khoản' : 'Truy cập hệ thống'}
                    </h2>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
                        {isRegister ? 'Đăng ký thành viên' : 'Chào mừng trở lại'}
                    </p>
                </div>
                
                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded-xl mb-8 text-sm font-bold animate-in slide-in-from-left duration-300">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            placeholder="Nhập tên đăng nhập..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Nhập mật khẩu bí mật..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-widest text-xs ${loading && 'opacity-50 cursor-not-allowed'}`}
                    >
                        {loading ? 'Đang xác thực...' : (isRegister ? 'Đăng ký ngay' : 'Xác minh & Đăng nhập')}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-500 text-sm font-medium">
                        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} 
                        <button 
                            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} 
                            className="text-blue-600 ml-2 font-black hover:underline uppercase text-xs tracking-widest"
                        >
                            {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                        </button>
                    </p>
                </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-400 font-medium uppercase tracking-widest">
                Hệ thống Đăng nhập
            </div>
        </div>
    );
};

export default Login;
