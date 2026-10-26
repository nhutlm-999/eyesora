import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        if (!email.trim()) {
            setErrors({ email: "Vui lòng nhập địa chỉ email của bạn" });
            return;
        }

        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/forgot-password', { email: email.trim() });
            alert(res.data || "Mã khôi phục đã được gửi vào email của bạn!");

        } catch (err) {
            setErrors({ server: err.response?.data || err.message || "Email không tồn tại trong hệ thống." });
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim()) {
            setErrors({ email: "Vui lòng nhập email phía trên trước khi bấm gửi lại mã kích hoạt" });
            return;
        }
        setResendLoading(true);
        setErrors({});
        setSuccessMessage('');
        try {
            const res = await axiosClient.post(`/api/resend-verification?email=${encodeURIComponent(email.trim())}`);
            setSuccessMessage(res.data || "Đã gửi lại email xác thực thành công.");
        } catch (err) {
            setErrors({ server: err.response?.data || "Không thể gửi lại email xác thực. Tài khoản có thể đã được kích hoạt." });
        } finally {
            setResendLoading(false);
        }
    };

    const labelStyle = `text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block`;
    const inputStyle = `block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-xs text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs`;

    return (
        <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-sans text-gray-950">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">

                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#004194] mb-6 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} /> <span>Quay lại Đăng nhập</span>
                </button>

                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Khôi phục mật khẩu</h2>
                    </div>
                    <p className="text-xs font-medium text-gray-500">Nhập email hệ thống để nhận liên kết xác thực cấu hình lại tài khoản</p>
                </div>

                {successMessage && (
                    <div className="mb-4 p-3.5 bg-emerald-50/80 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs animate-fade-in">
                        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {errors.server && (
                    <div className="mb-4 p-3.5 bg-rose-50/80 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs animate-fade-in">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{errors.server}</span>
                    </div>
                )}

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                        <label className={labelStyle}>Địa chỉ Email đăng ký</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#004194] transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                                className={`${inputStyle} ${errors.email ? 'border-rose-500 focus:ring-rose-200' : ''}`}
                                placeholder="canbo_healthcare@gmail.com"
                            />
                        </div>
                        {errors.email && <p className="text-rose-600 text-xs font-bold mt-1.5 pl-1">{errors.email}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-l from-blue-500 to-[#004194] text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        <span>Gửi mã xác nhận</span>
                    </button>

                    <div className="pt-4 border-t border-gray-100 text-center">
                        <button
                            type="button"
                            disabled={resendLoading}
                            onClick={handleResendVerification}
                            className="text-xs font-bold text-gray-500 hover:text-[#004194] underline transition-colors cursor-pointer disabled:opacity-40"
                        >
                            {resendLoading ? "Đang gửi..." : "Tài khoản chưa xác thực? Gửi lại mail xác minh"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;