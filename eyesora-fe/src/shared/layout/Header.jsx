import  { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../features/auth/store/authStore.js";

const Header = ({ onMenuClick }) => {
    const navigate = useNavigate();

    const { user, isAuthenticated, logout } = useAuthStore();
    const { id, username, name, roles } = user || {};

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-30 gap-4 ">

            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 bg-white border border-gray-300 rounded-xl md:hidden text-[#004194] flex items-center justify-center cursor-pointer shadow-xs"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h1 className="text-base md:text-lg font-semibold text-blue-900 min-w-max">
                    Quản lí tật khúc xạ học đường
                </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                <div className="relative" ref={dropdownRef}>
                    {isAuthenticated ? (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 border-l pl-3 md:pl-4 border-gray-200 cursor-pointer text-left bg-transparent focus:outline-none group"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-extrabold text-gray-900 whitespace-nowrap group-hover:text-[#004194] transition-colors">
                                    {name || username || 'Người dùng'}
                                </p>
                                <p className="text-[11px] font-extrabold text-[#004194] uppercase tracking-wider">
                                    {Array.isArray(roles) ? roles.join(', ') : roles || 'Cán bộ Y tế'}
                                </p>
                            </div>
                            <img
                                src={`https://ui-avatars.com/api/?name=${username || 'U'}&background=004194&color=fff&bold=true`}
                                alt="Avatar"
                                className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-gray-300 object-cover group-hover:border-blue-500 shadow-xs transition-all"
                            />
                            <ChevronDown size={16} className={`text-gray-500 hidden md:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-1.5 pr-3.5 rounded-xl border border-gray-300 transition-colors cursor-pointer shadow-xs"
                        >
                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                <User size={18} className="text-gray-600" />
                            </div>
                            <span className="text-xs font-extrabold text-gray-800">Khách</span>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    )}

                    {/* Nội dung chi tiết bên trong Dropdown */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-50 transform origin-top-right transition-all font-sans">
                            {isAuthenticated ? (
                                <>
                                    {/* Khối User Info hiển thị trên Mobile */}
                                    <div className="px-4 py-3 border-b border-gray-100 md:hidden bg-gray-50/80">
                                        <p className="text-sm font-extrabold text-gray-900 truncate">{name || username}</p>
                                        <p className="text-[11px] font-bold text-[#004194] uppercase tracking-wider mt-0.5">{Array.isArray(roles) ? roles.join(', ') : roles}</p>
                                    </div>

                                    {/* Khối quản trị nếu Role là Admin */}
                                    {roles === 'admin' && (
                                        <button
                                            onClick={() => { setDropdownOpen(false); navigate('/admin'); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#004194] hover:bg-blue-50/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                            <LayoutDashboard size={18} />
                                            <span>Bảng quản trị</span>
                                        </button>
                                    )}

                                    {/* Menu Account cá nhân */}
                                    <button
                                        onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <User size={18} className="text-[#004194]" />
                                        <span>Thông tin tài khoản</span>
                                    </button>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    {/* Nút đăng xuất */}
                                    <button
                                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                        <LogOut size={18} />
                                        <span>Đăng xuất hệ thống</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setDropdownOpen(false); navigate('/login'); }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#004194] hover:bg-blue-50/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                    <LogOut size={18} className="transform rotate-180" />
                                    <span>Đăng nhập</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;