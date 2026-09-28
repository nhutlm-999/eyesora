import { NavLink } from 'react-router-dom';
import { LayoutDashboard, University, GraduationCap, UsersRound, CalendarDays, ShieldAlert, ClipboardList, X } from "lucide-react";
import { useAuthStore } from '../../features/auth/store/authStore';

const MENU_ITEMS = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Bảng điều khiển', path: '/', roles: ['ROLE_ADMIN'] },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Thống kê cơ sở', path: '/facility-dashboard', roles: ['ROLE_FACILITY_ADMIN'] },
    { icon: <ClipboardList className="w-5 h-5" />, label: 'Hồ sơ khám mắt', path: '/eye-exam-records', roles: ['ROLE_ADMIN', 'ROLE_FACILITY_ADMIN', 'ROLE_EXAMINER'] },
    { icon: <UsersRound className="w-5 h-5" />, label: 'Danh sách học sinh', path: '/patients', roles: ['ROLE_ADMIN', 'ROLE_FACILITY_ADMIN', 'ROLE_EXAMINER'] },
    { icon: <CalendarDays className="w-5 h-5" />, label: 'Chiến dịch khám', path: '/campaigns', roles: ['ROLE_ADMIN'] },
    { icon: <ShieldAlert className="w-5 h-5" />, label: 'Quản lý tài khoản', path: '/admin/users', roles: ['ROLE_ADMIN'] },
    { icon: <University className="w-5 h-5" />, label: 'Trường học & Cơ sở', path: '/facilities', roles: ['ROLE_ADMIN'] },
];

const SideBar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuthStore();
    const userRoles = user?.roles || [];

    const allowedMenuItems = MENU_ITEMS.filter(item =>
        item.roles ? item.roles.some(role => userRoles.includes(role)) : true
    );

    return (
        <>
            {isOpen && (
                <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs transition-opacity duration-300" />
            )}

            <aside
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className={`fixed top-0 left-0 z-50 flex h-screen flex-col bg-[#faf9ff] border-r border-[#c2c6d5] shadow-sm transition-all duration-300 ease-in-out select-none ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'}`}
            >
                <div className="p-4 flex flex-col items-start w-full h-full">
                    <div className="mb-8 h-12 flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="text-[#004194] flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#e3e8f9] rounded-lg">
                                <img src={"/favicon.svg"} alt={"LOGO"} className="w-15 h-15" />
                            </div>
                            <div className={`flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 pointer-events-none'}`}>
                                <span className="text-sm font-extrabold text-[#004194] uppercase tracking-wider whitespace-nowrap">Eyesora</span>
                                <span className="text-[10px] text-[#424753] font-medium tracking-tight whitespace-nowrap">Hệ thống y tế</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-[#424753] hover:bg-gray-200 p-1 rounded-lg transition-colors cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1.5 w-full flex-1">
                        {allowedMenuItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
                                className={({ isActive }) => `flex items-center py-3 rounded-xl transition-all w-full group cursor-pointer ${isOpen ? 'justify-start gap-3.5 px-3.5' : 'justify-start md:justify-center gap-0 px-3'} ${isActive ? 'text-[#004194] font-extrabold bg-blue-50/80 border-l-4 border-[#004194] shadow-2xs' : 'text-gray-700 font-semibold hover:bg-gray-100/80 hover:text-[#004194]'}`}
                            >
                                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">{item.icon}</div>
                                <span className={`text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs visible' : 'opacity-0 max-w-0 invisible md:hidden'}`}>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {isOpen && (
                        <div className="w-full pt-3 border-t border-gray-100 text-[11px] font-semibold text-gray-400 text-center">
                            Giao diện Y tế REMS v2.0
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default SideBar;