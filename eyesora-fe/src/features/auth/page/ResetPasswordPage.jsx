import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 🟢 TỰ ĐỘNG LẤY TOKEN TỪ URL PARAMETERS (?token=...)
    const tokenParam = searchParams.get('token') || '';
    const emailParam = searchParams.get('email') || '';

    const [resetData, setResetData] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Kiểm tra và hiển thị thông báo lỗi ngay lập tức nếu thiếu token trên đường dẫn
    useEffect(() => {
        if (!tokenParam) {
            setErrors({ server: "Không tìm thấy liên kết xác minh hoặc mã token hợp lệ. Vui lòng kiểm tra lại email khôi phục mật khẩu!" });
        }
    }, [tokenParam]);

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Nếu không có token từ URL thì chặn đứng hành động submit
        if (!tokenParam) {
            setErrors({ server: "Yêu cầu khôi phục mật khẩu không hợp lệ do thiếu mã token xác thực." });
            return;
        }

        let localErrors = {};
        if (!resetData.newPassword) localErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        if (resetData.newPassword !== resetData.confirmPassword) localErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setLoading(true);
        try {
            // 🟢 TỰ ĐỘNG ĐÓNG GÓI TOKEN TỪ URL VÀO TRONG PAYLOAD GỬI LÊN BACKEND
            const payload = {
                token: tokenParam.trim(),
                newPassword: resetData.newPassword,
                confirmPassword: resetData.confirmPassword
            };
            const res = await axiosClient.post('/auth/reset-password', payload);

            alert(res.data || "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate('/login');
        } catch (err) {
            setErrors({ server: err.response?.data || err.message || "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." });
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = `text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block`;
    const inputStyle = `block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl font-semibold text-xs text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs`;

    return (
        <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4 font-sans text-gray-950">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">

                <button
                    onClick={() => navigate('/forgot-password')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#004194] mb-6 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} /> <span>Quay lại nhập Email</span>
                </button>

                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Đặt lại mật khẩu mới</h2>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mt-1">
                        {emailParam ? `Thiết lập mật khẩu mới cho tài khoản: ${emailParam}` : "Vui lòng nhập mật khẩu mới để bảo mật tài khoản của bạn"}
                    </p>
                </div>

                {errors.server && (
                    <div className="mb-4 p-3.5 bg-rose-50/80 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-start gap-2 shadow-xs animate-fade-in">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{errors.server}</span>
                    </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">

                    {/* New Password Field */}
                    <div>
                        <label className={labelStyle}>Mật khẩu mới (*)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#004194] transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={resetData.newPassword}
                                disabled={!tokenParam}
                                onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                className={`${inputStyle} ${errors.newPassword ? 'border-rose-500 focus:ring-rose-200' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="Từ 8-50 ký tự, đầy đủ định dạng"
                            />
                        </div>
                        {errors.newPassword && <p className="text-rose-600 text-xs font-bold mt-1.5 pl-1">{errors.newPassword}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className={labelStyle}>Xác nhận mật khẩu mới (*)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#004194] transition-colors">
                                <KeyRound size={18} />
                            </div>
                            <input
                                type="password"
                                value={resetData.confirmPassword}
                                disabled={!tokenParam}
                                onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                className={`${inputStyle} ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-200' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="Nhập lại mật khẩu giống hệt phía trên"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-rose-600 text-xs font-bold mt-1.5 pl-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !tokenParam}
                        className="w-full py-3 bg-gradient-to-l from-blue-500 to-[#004194] text-white font-semibold text-xs rounded-xl shadow-md hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        <span>Xác nhận đổi mật khẩu</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;