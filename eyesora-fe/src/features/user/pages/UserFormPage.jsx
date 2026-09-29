import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from "lucide-react";
import axiosClient from "../../../shared/axios/axiosClient.js";

const UserFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        username: '', password: '', email: '', fullName: '', facilityId: '', roleNames: []
    });
    const [options, setOptions] = useState({ facilities: [] });
    const [errors, setErrors] = useState({});
    const [pageLoading, setPageLoading] = useState(isEditMode);

    const availableRoles = [
        { id: 'FACILITY_ADMIN', name: 'Quản trị cơ sở' },
        { id: 'EXAMINER', name: 'Người khám' },
        { id: 'ADMIN', name: 'Quản trị viên hệ thống' }
    ];

    const ErrorMsg = ({ field }) => errors[field] ? (
        <div className="flex items-center gap-1 mt-1.5 text-red-600">
            <AlertCircle size={14} />
            <span className="text-[11px] font-bold">{errors[field]}</span>
        </div>
    ) : null;

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const res = await axiosClient.get('/master-data/facilities?size=999');
                setOptions({ facilities: res.data.content || res.data || [] });
            } catch (err) { console.error(err); }
        };
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchUser = async () => {
                try {
                    const res = await axiosClient.get(`/admin/users/${id}`);
                    const user = res.data;
                    setFormData({
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        facilityId: user.facilityId ? String(user.facilityId) : '',
                        roleNames: user.roles || []
                    });
                } catch (err) {
                    setErrors({ server: "Không thể tải dữ liệu người dùng." });
                } finally {
                    setPageLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, isEditMode]);

    const handleRoleChange = (roleId) => {
        setFormData(prev => {
            const currentRoles = prev.roleNames || [];
            const newRoles = currentRoles.includes(roleId)
                ? currentRoles.filter(r => r !== roleId)
                : [...currentRoles, roleId];
            return { ...prev, roleNames: newRoles };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        let newErrors = {};
        if (!formData.username?.trim()) newErrors.username = "Tên đăng nhập là bắt buộc";
        if (!isEditMode && !formData.password) newErrors.password = "Mật khẩu là bắt buộc";
        if (!formData.fullName?.trim()) newErrors.fullName = "Họ và tên là bắt buộc";
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }
        if (formData.roleNames.length === 0) newErrors.roleNames = "Vui lòng chọn ít nhất một vai trò";

        const hasAdminOrExaminer = formData.roleNames.includes('ADMIN') || formData.roleNames.includes('EXAMINER');
        const isFacilityAdmin = formData.roleNames.includes('FACILITY_ADMIN');
        const needsFacility = isFacilityAdmin && !hasAdminOrExaminer;

        if (needsFacility && (!formData.facilityId || formData.facilityId === "")) {
            newErrors.facilityId = "Với vai trò Quản trị cơ sở, bạn bắt buộc phải chọn cơ sở!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload = {
                ...formData,
                facilityId: (formData.facilityId && formData.facilityId !== "") ? formData.facilityId : null
            };

            if (isEditMode) {
                await axiosClient.put(`/admin/users/${id}`, payload);
            } else {
                await axiosClient.post('/admin/users/create', payload);
            }
            navigate('/admin/users');
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ server: err.response?.data?.message || "Thao tác thất bại." });
            }
        }
    };

    const inputStyle = `w-full border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs`;
    const labelStyle = `text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block`;

    if (pageLoading) return (
        <div className="p-6 bg-[#f5f7fa] h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-[#004194] animate-ping" />
                Đang tải dữ liệu...
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-[#f5f7fa] text-gray-950 font-sans h-full overflow-y-auto scrollbar-thin">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/admin/users')} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#004194] hover:border-blue-300 shadow-xs transition-all cursor-pointer">
                    <ArrowLeft size={18}/>
                </button>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">{isEditMode ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}</h1>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 max-w-3xl">
                {errors.server && <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"><AlertCircle size={16}/> {errors.server}</div>}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelStyle}>Tên đăng nhập (*)</label>
                            <input className={`${inputStyle} ${errors.username ? 'border-red-500 focus:border-red-500' : ''} ${isEditMode ? 'bg-gray-100/70 text-gray-500 cursor-not-allowed' : ''}`} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} disabled={isEditMode} />
                            <ErrorMsg field="username" />
                        </div>
                        {!isEditMode && (
                            <div>
                                <label className={labelStyle}>Mật khẩu (*)</label>
                                <input className={`${inputStyle} ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`} type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                                <ErrorMsg field="password" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelStyle}>Họ và Tên (*)</label>
                            <input className={`${inputStyle} ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                            <ErrorMsg field="fullName" />
                        </div>
                        <div>
                            <label className={labelStyle}>Email (*)</label>
                            <input className={`${inputStyle} ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <ErrorMsg field="email" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelStyle}>Vai trò (*)</label>
                            <div className="space-y-2 mt-2 p-3 bg-gray-50/70 border border-gray-200 rounded-xl">
                                {availableRoles.map(role => (
                                    <label key={role.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                                        <input type="checkbox" checked={formData.roleNames.includes(role.id)} onChange={() => handleRoleChange(role.id)} className="w-4 h-4 text-[#004194] rounded border-gray-300 focus:ring-[#004194] cursor-pointer" />
                                        <span className="text-xs font-semibold text-gray-800">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            <ErrorMsg field="roleNames" />
                        </div>
                        <div>
                            <label className={labelStyle}>Cơ sở</label>
                            <select className={`${inputStyle} ${errors.facilityId ? 'border-red-500 focus:border-red-500' : ''}`} value={formData.facilityId} onChange={e => setFormData({...formData, facilityId: e.target.value})}>
                                <option value="">Chọn cơ sở...</option>
                                {options.facilities.map(f => <option key={f.id} value={f.id}>{f.facilityName}</option>)}
                            </select>
                            <ErrorMsg field="facilityId" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                        <button type="button" onClick={() => navigate('/admin/users')} className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs">Hủy</button>
                        <button type="submit" className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95">Lưu tài khoản</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UserFormPage;