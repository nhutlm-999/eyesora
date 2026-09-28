import {useState} from 'react';
import {User, Lock, Eye, EyeOff, ShieldCheck, BarChart3, FileText, ScanEye, ArrowRight, Loader2} from 'lucide-react';
import {authService} from '../api/authService.js';
import {useAuthStore} from "../store/authStore.js"; // Import service vừa tạo

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({username: '', password: '', apiError: ''}); // Thêm apiError
    const loginSuccess = useAuthStore(state => state.loginSuccess);

    const handleLogin = async (e) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = {username: '', password: '', apiError: ''};

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

                await loginSuccess();

                if (data.roles?.includes("ROLE_ADMIN")) {
                    window.location.href = "/";
                } else {
                    window.location.href = "/";
                }

            } catch (error) {
                const serverMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
                setErrors(prev => ({...prev, apiError: serverMessage}));
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <main className="flex min-h-screen bg-[#faf9f9] text-[#1b1c1c] font-sans antialiased">
            <section
                className="hidden md:flex md:w-3/5 bg-gradient-to-br from-[#faf9f9] to-[#f0f5ff] relative flex-col justify-between p-12 overflow-hidden border-r border-slate-200">
                <div
                    className="absolute top-0 right-0 w-96 h-96 bg-[#006ef2] opacity-5 rounded-full -mr-48 -mt-48 blur-3xl"/>
                <div className="flex items-center space-x-2 z-10">
                    <div
                        className="w-10 h-10  rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                        {/*<ScanEye size={22} />*/}
                        <img src={"/favicon.svg"} alt="Eyesora Logo"/>

                    </div>
                    <span className="font-bold text-2xl tracking-tight text-[#0057c2] font-mono">Eyesora</span>
                </div>

                <div className="max-w-xl my-auto z-10 space-y-8">
                    <div className="space-y-4">
                        <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#bcd6fe] text-[#435d7f] rounded-full text-xs font-semibold tracking-wide uppercase">
                          <ShieldCheck size={14}/> Tiêu chuẩn Y khoa
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0057c2] tracking-tight leading-tight font-display">
                            Hệ thống Giám sát & Quản lý Tật Khúc Xạ
                        </h1>
                    </div>

                    {/*<div className="max-w-xl my-auto z-10 space-y-8">*/}
                    {/*    <img src={"/eyesora-logo.png"} alt="Eyesora Logo" />*/}

                    {/*</div>*/}

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div
                            className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-blue-300 transition-colors">
                            <div className="p-2.5 bg-blue-50 text-[#0057c2] rounded-xl">
                                <BarChart3 size={20}/>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">Phân Tích Số Liệu</span>
                        </div>
                        <div
                            className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-blue-300 transition-colors">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileText size={20}/>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">Số Hóa Hồ Sơ</span>
                        </div>
                        <div
                            className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center text-center space-y-2 hover:border-blue-300 transition-colors">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Eye size={20}/>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">Giám Sát Thị Lực</span>
                        </div>

                    </div>
                </div>

            </section>

            {/* RIGHT SIDE: Minimalist Login Form */}
            <section className="w-full md:w-2/5 flex flex-col justify-between p-8 md:p-12 bg-white shadow-2xl">
                <div className="flex items-center justify-center space-x-2 md:hidden mb-8">
                    <div className="w-8 h-8 bg-[#0057c2] rounded-lg flex items-center justify-center text-white">
                        <ScanEye size={18}/>
                    </div>
                    <span className="font-bold text-xl text-[#0057c2] font-mono">OptiCore</span>
                </div>

                <div className="w-full max-w-sm mx-auto my-auto space-y-6">
                    <div className="text-center md:text-left space-y-1.5">
                        <h2 className="text-2xl font-bold tracking-tight text-[#1b1c1c]">Chào mừng trở lại</h2>
                        <p className="text-sm text-slate-500">Đăng nhập để vào hệ thống làm việc.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* 🌟 Hiển thị thông báo lỗi từ API nếu có */}
                        {errors.apiError && (
                            <div
                                className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
                                {errors.apiError}
                            </div>
                        )}

                        {/* 📦 CARD BỌC INPUT VÀ BUTTON */}
                        <div
                            className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">

                            {/* Input Tên đăng nhập */}
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0057c2] transition-colors">
                                        <User size={18}/>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Tên đăng nhập"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all outline-none bg-white
            ${errors.username ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-[#0057c2] focus:ring-4 focus:ring-blue-50'}`}
                                    />
                                </div>
                                {errors.username &&
                                    <p className="text-xs text-red-500 font-medium pl-1">{errors.username}</p>}
                            </div>

                            {/* Input Mật khẩu */}
                            <div className="space-y-1">
                                <div className="relative group">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0057c2] transition-colors">
                                        <Lock size={18}/>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`block w-full pl-10 pr-10 py-3 border rounded-xl text-sm transition-all outline-none bg-white
            ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-[#0057c2] focus:ring-4 focus:ring-blue-50'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                                {errors.password &&
                                    <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>}
                            </div>

                            {/* Options Row */}
                            <div className="flex items-center justify-between text-xs">
                                <label
                                    className="flex items-center space-x-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 bg-white dark:bg-white text-[#0057c2] focus:ring-[#0057c2] transition-colors cursor-pointer"
                                    />
                                    <span>Ghi nhớ</span>
                                </label>
                                <a href="/forgot-password" className="font-medium text-[#0057c2] hover:underline">Quên
                                    mật khẩu?</a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-[#0057c2] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-100 hover:bg-[#004398] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all duration-150 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin"/>
                                        <span>Đang xác thực...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Đăng nhập</span>
                                        <ArrowRight size={16}/>
                                    </>
                                )}
                            </button>

                            {/*<div className="text-center text-xs text-slate-500 mt-8">*/}
                            {/*    Chưa có tài khoản?{' '}*/}
                            {/*    <a href="#admin" className="font-bold text-[#0057c2] hover:underline">*/}
                            {/*        Đăng kí ngay*/}
                            {/*    </a>*/}
                            {/*</div>*/}
                        </div>
                    </form>
                </div>


            </section>
        </main>
    );
}