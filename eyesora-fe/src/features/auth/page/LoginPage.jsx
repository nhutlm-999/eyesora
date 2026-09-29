import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, BarChart3, FileText, Eye as EyeIcon, ArrowRight, Loader2, ScanEye } from 'lucide-react';
import { authService } from '../api/authService.js';
import { useAuthStore } from "../store/authStore.js";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ username: '', password: '', apiError: '' });
    const loginSuccess = useAuthStore(state => state.loginSuccess);

    const translateErrorMessage = (rawMsg) => {
        if (!rawMsg) return 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
        if (typeof rawMsg === 'object') {
            rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
        }
        const lower = String(rawMsg).toLowerCase();

        if (lower.includes('invalid username or password') || 
            lower.includes('bad credentials') || 
            lower.includes('unauthorized') ||
            lower.includes('wrong password') ||
            lower.includes('incorrect password') ||
            lower.includes('invalid credentials')) {
            return 'Tên đăng nhập hoặc mật khẩu không chính xác!';
        }
        if (lower.includes('user not found') || lower.includes('account not found')) {
            return 'Tài khoản không tồn tại trong hệ thống!';
        }
        if (lower.includes('account is locked') || lower.includes('disabled') || lower.includes('inactive')) {
            return 'Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!';
        }
        if (lower.includes('network error') || lower.includes('failed to fetch') || lower.includes('timeout')) {
            return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!';
        }

        return String(rawMsg);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = { username: '', password: '', apiError: '' };

        if (!username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
            isValid = false;
        }

        if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            setIsLoading(true);
            try {
                const data = await authService.login(username, password);
                loginSuccess(data);

                if (data.roles?.includes("ROLE_ADMIN")) {
                    window.location.href = "/";
                } else {
                    window.location.href = "/";
                }
            } catch (error) {
                const rawMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.message;
                const translatedMsg = translateErrorMessage(rawMsg);
                setErrors(prev => ({ ...prev, apiError: translatedMsg }));
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <main className="flex min-h-screen bg-[#f8fafc] text-gray-900 font-sans antialiased">
            {/* LEFT SIDE: Professional Medical Banner (Split Screen Premium Navy Theme) */}
            <section className="hidden md:flex md:w-7/12 bg-gradient-to-br from-[#001838] via-[#00377a] to-[#0052b3] relative flex-col justify-between p-12 lg:p-16 overflow-hidden border-r border-blue-900/30 text-white">
                {/* Background Subtle Glowing Circles & Ambient Light */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

                {/* Top Brand Logo Header */}
                <div className="flex items-center space-x-3.5 z-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/25 shadow-lg">
                        <img src="/favicon.svg" alt="Eyesora Logo" className="w-7 h-7" />
                    </div>
                    <div>
                        <span className="font-extrabold text-2xl tracking-tight text-white font-mono block leading-none">Eyesora</span>
                    </div>
                </div>

                {/* Hero Body Content */}
                <div className="max-w-xl my-auto z-10 space-y-8 py-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-sky-100 tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-sky-300"></span>
                            Phòng Chống & Quản Lý Tật Khúc Xạ
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                            Hệ thống Giám sát & Quản lý Tật Khúc Xạ
                        </h1>

                        <p className="text-base font-semibold text-blue-100/90 leading-relaxed">
                            Nền tảng chuẩn hóa dữ liệu khám mắt học đường, số hóa hồ sơ thị lực và hỗ trợ theo dõi sức khỏe khúc xạ cho các cơ sở y tế & trường học.
                        </p>
                    </div>

                    {/* 3 Enhanced Key Feature Cards */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-md flex flex-col items-center text-center space-y-2 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                            <div className="p-3 bg-sky-500/20 text-sky-200 rounded-xl shadow-xs border border-sky-400/30">
                                <BarChart3 size={24} />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-extrabold text-white">Phân Tích Số Liệu</p>
                                <p className="text-[10px] font-medium text-blue-200/80 mt-0.5">Thống kê trực quan</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-md flex flex-col items-center text-center space-y-2 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                            <div className="p-3 bg-indigo-500/20 text-indigo-200 rounded-xl shadow-xs border border-indigo-400/30">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-extrabold text-white">Số Hóa Hồ Sơ</p>
                                <p className="text-[10px] font-medium text-blue-200/80 mt-0.5">Lưu trữ điện tử</p>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-md flex flex-col items-center text-center space-y-2 hover:bg-white/15 transition-all transform hover:-translate-y-1">
                            <div className="p-3 bg-amber-500/20 text-amber-200 rounded-xl shadow-xs border border-amber-400/30">
                                <EyeIcon size={24} />
                            </div>
                            <div>
                                <p className="text-xs md:text-sm font-extrabold text-white">Giám Sát Thị Lực</p>
                                <p className="text-[10px] font-medium text-blue-200/80 mt-0.5">Cảnh báo kịp thời</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Copyright */}
                <div className="z-10 text-xs font-semibold text-blue-200/80 flex items-center justify-between pt-4 border-t border-white/10">
                    <span>© 2026 Eyesora</span>
                </div>
            </section>

            {/* RIGHT SIDE: Clean & Refined Form Section */}
            <section className="w-full md:w-5/12 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 bg-[#f8fafc]">
                {/* Mobile Header Logo */}
                <div className="flex items-center justify-center space-x-3 md:hidden mb-6">
                    <div className="w-10 h-10 bg-[#004194] rounded-xl flex items-center justify-center text-white shadow-xs">
                        <ScanEye size={22} />
                    </div>
                    <span className="font-black text-2xl text-[#004194] font-mono">Eyesora</span>
                </div>

                {/* Main Login Form Wrapper Card */}
                <div className="w-full max-w-md mx-auto my-auto space-y-7 bg-white p-8 sm:p-9 rounded-3xl shadow-xl border border-gray-200/80">
                    <div className="text-left space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#004194] shadow-xs"></span>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Đăng nhập hệ thống</h2>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* API Error Box */}
                        {errors.apiError && (
                            <div className="p-4 text-xs md:text-sm font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
                                <span>{errors.apiError}</span>
                            </div>
                        )}

                        {/* Input Username */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                                Tên đăng nhập <span className="text-[#004194]">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#004194] transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nhập tên đăng nhập..."
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`block w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm font-bold transition-all outline-none bg-gray-50/50 text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:bg-white ${
                                        errors.username
                                            ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                                            : 'border-gray-300 focus:border-[#004194] focus:ring-2 focus:ring-blue-900/20'
                                    }`}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-xs text-rose-600 font-extrabold pl-1 pt-0.5">{errors.username}</p>
                            )}
                        </div>

                        {/* Input Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                                Mật khẩu <span className="text-[#004194]">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#004194] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`block w-full pl-11 pr-11 py-3.5 border rounded-2xl text-sm font-bold transition-all outline-none bg-gray-50/50 text-gray-900 placeholder:font-normal placeholder:text-gray-400 focus:bg-white ${
                                        errors.password
                                            ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                                            : 'border-gray-300 focus:border-[#004194] focus:ring-2 focus:ring-blue-900/20'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-600 font-extrabold pl-1 pt-0.5">{errors.password}</p>
                            )}
                        </div>

                        {/* Options Row */}
                        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                            <label className="flex items-center space-x-2.5 cursor-pointer select-none text-gray-800 font-bold hover:text-gray-900 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#004194] focus:ring-[#004194] transition-colors cursor-pointer"
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="/forgot-password" className="font-extrabold text-[#004194] hover:underline hover:text-blue-900">
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#003b87] to-[#0057c2] text-white font-extrabold text-sm md:text-base rounded-2xl shadow-md hover:from-[#002f6c] hover:to-[#0049a3] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Đang xác thực tài khoản...</span>
                                </>
                            ) : (
                                <>
                                    <span>Đăng nhập ngay</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center text-xs font-bold text-gray-400 mt-6">
                    Eyesora REMS Clinical System - Dành cho Cán bộ Y tế & Nhà trường
                </div>
            </section>
        </main>
    );
}