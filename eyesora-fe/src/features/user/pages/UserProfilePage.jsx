import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { ArrowLeft, User, Mail, ShieldAlert, ShieldCheck, Activity, Landmark, RefreshCw } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";
import {useAuthStore} from "../../auth/store/authStore.js";

const UserProfilePage = () => {
    // State quản lý thông tin người dùng lâm sàng
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { id } = user || {};

    // Fetch thông tin profile từ endpoint API của bạn
    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/admin/users/${id}`);
                // Hoặc nếu endpoint động: await axiosClient.get(`/api/admin/users/${currentUserId}`);

                setProfile(response.data);
            } catch (err) {
                console.error("Lỗi khi tải thông tin hồ sơ tài khoản:", err);
                setError("Không thể kết nối dữ liệu tài khoản cá nhân. Vui lòng thử lại sau!");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const labelStyle = `text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block`;
    const infoBoxStyle = `w-full border border-gray-200 bg-gray-50/60 p-3.5 rounded-xl text-gray-900 font-semibold text-xs flex items-center gap-3 shadow-xs`;

    if (loading) {
        return (
            <div className="p-6 bg-[#f5f7fa] h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#004194]" />
                    Đang nạp thông tin hồ sơ...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-[#f5f7fa] h-full flex items-center justify-center">
                <div className="bg-red-50/80 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold max-w-md text-center shadow-xs">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f5f7fa] text-gray-950 font-sans h-full overflow-y-auto scrollbar-thin">

            {/* Header đồng bộ layout hệ thống */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-[#004194] text-white flex items-center justify-center shadow-md flex-shrink-0">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">{profile?.fullName || 'Họ tên người dùng'}</h2>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-1">Mã số tài khoản: <span className="font-mono font-bold text-gray-700">{profile?.id}</span></p>
                    </div>
                </div>

                {/* Trạng thái tài khoản */}
                <div className="w-fit">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-xs ${
                        profile?.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                        <Activity size={14} />
                        {profile?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                    </span>
                </div>
            </div>

            {/* Vùng thông tin chi tiết */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-6 md:p-8">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3.5 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#004194]"></span>
                    Thông tin tài khoản y tế
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                        <label className={labelStyle}>Tên đăng nhập (Username)</label>
                        <div className={infoBoxStyle}>
                            <User size={16} className="text-[#004194]" />
                            <span>{profile?.username}</span>
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>Địa chỉ Email</label>
                        <div className={infoBoxStyle}>
                            <Mail size={16} className="text-[#004194]" />
                            <span>{profile?.email}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                        <label className={labelStyle}>Cơ sở lâm sàng trực thuộc</label>
                        <div className={infoBoxStyle}>
                            <Landmark size={16} className="text-[#004194]" />
                            <span className={profile?.facilityName === 'N/A' ? 'text-gray-400 italic font-normal' : 'text-gray-900 font-semibold'}>
                                {profile?.facilityName === 'N/A' ? 'Không thuộc cơ sở cố định (Trung tâm điều hành)' : profile?.facilityName}
                            </span>
                        </div>
                    </div>

                    {/* Danh sách phân quyền Roles */}
                    <div>
                        <label className={labelStyle}>Quyền hạn hệ thống (Roles)</label>
                        <div className="w-full border border-gray-200 bg-gray-50/60 p-3 rounded-xl flex flex-wrap gap-2 items-center min-h-[46px] shadow-xs">
                            {profile?.roles?.map((role, idx) => {
                                let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
                                if (role === 'OWNER') badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
                                if (role === 'ADMIN') badgeStyle = "bg-blue-50 text-[#004194] border-blue-200";

                                return (
                                    <span key={idx} className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider ${badgeStyle}`}>
                                        {role}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Phần lưu ý bảo mật phụ */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 bg-blue-50/40 p-4.5 rounded-xl border border-blue-100 shadow-xs">
                    <ShieldCheck className="text-[#004194] w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-xs font-black text-gray-900 tracking-tight">Thông báo về quyền tài khoản</h4>
                        <p className="text-[11px] font-medium text-gray-600 mt-1 leading-relaxed">
                            Tài khoản của bạn nắm giữ các vai trò quản trị tối cao của hệ thống dữ liệu lâm sàng <strong>REMS Clinical</strong>. Mọi thao tác chỉnh sửa hoặc import danh sách học sinh từ tài khoản này sẽ được ghi nhận trực tiếp vào Nhật ký kiểm toán (Audit Logs). Hãy bảo vệ mật khẩu của bạn định kỳ.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserProfilePage;