import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Save } from "lucide-react";
import axiosClient from "../../../shared/axios/axiosClient.js";

const WardsFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({ wardName: '', districtId: '' });
    const [districts, setDistricts] = useState([]);
    const [error, setError] = useState(null);

    const inputStyle = `w-full border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all text-sm shadow-xs placeholder:text-gray-400 placeholder:font-normal`;
    const labelStyle = `text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block`;

    useEffect(() => {
        const loadData = async () => {
            try {
                const dRes = await axiosClient.get("/master-data/districts?size=1000");
                setDistricts(dRes.data.content || []);
                if (isEditMode) {
                    const wRes = await axiosClient.get(`/master-data/wards/${id}`);
                    setFormData({
                        wardName: wRes.data.wardName || '',
                        districtId: String(wRes.data.districtId || '')
                    });
                }
            } catch (err) { setError("Không thể tải dữ liệu"); }
        };
        loadData();
    }, [id, isEditMode]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.wardName.trim() || !formData.districtId) {
            setError("Vui lòng nhập đầy đủ thông tin bắt buộc (*)");
            return;
        }
        try {
            if (isEditMode) await axiosClient.put(`/master-data/wards/${id}`, formData);
            else await axiosClient.post("/master-data/wards", formData);
            navigate('/wards');
        } catch (err) {
            let message = "Có lỗi xảy ra khi lưu dữ liệu";
            if (err.response?.data) {
                if (typeof err.response.data === 'object' && err.response.data.message) {
                    message = err.response.data.message;
                } else if (typeof err.response.data === 'string') {
                    message = err.response.data;
                }
            }
            setError(message);
        }
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">
            <div className="flex items-center gap-3 mb-6 w-full">
                <button onClick={() => navigate('/wards')} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-900 shadow-xs transition-colors cursor-pointer flex items-center justify-center">
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{isEditMode ? "Chỉnh sửa Phường/Xã" : "Thêm mới Phường/Xã"}</h1>
                    <p className="text-xs text-gray-500">Quản lý danh mục hành chính địa phương</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-xl p-6 md:p-8">
                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className={labelStyle}>Tên Phường/Xã (*)</label>
                        <input className={inputStyle} value={formData.wardName} onChange={e => setFormData({...formData, wardName: e.target.value})} placeholder="Ví dụ: Phường An Phú" />
                    </div>
                    <div>
                        <label className={labelStyle}>Quận/Huyện (*)</label>
                        <select className={inputStyle} value={formData.districtId} onChange={e => setFormData({...formData, districtId: e.target.value})}>
                            <option value="">Chọn quận/huyện...</option>
                            {districts.map(d => <option key={d.id} value={String(d.id)}>{d.districtName}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-8 w-full">
                        <button type="button" onClick={() => navigate('/wards')} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all rounded-xl text-xs cursor-pointer">Hủy bỏ</button>
                        <button type="submit" className="px-8 py-2.5 bg-gradient-to-l from-blue-500 to-[#004194] text-white font-semibold hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all rounded-xl text-xs cursor-pointer shadow-sm flex items-center gap-2"><Save size={16}/> Lưu dữ liệu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default WardsFormPage;