import { useState } from 'react';
import { Plus, X, RefreshCcw } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const CampaignModal = ({ isOpen, onClose, onSuccess, inputStyle }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Khởi tạo form data với ngày mặc định theo yêu cầu hệ thống (Năm 2026)
    const [form, setForm] = useState({
        title: '',
        startDate: '2026-07-15T00:00:00'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setError('Vui lòng nhập tiêu đề chiến dịch');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await axiosClient.post('/campaigns', form);

            // Lấy ID trả về từ API tùy thuộc vào cấu trúc thực tế (campaignId hoặc id)
            const newId = res.data?.campaignId || res.data?.id;

            // Gọi callback thông báo thành công cho component cha
            onSuccess(String(newId));
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo mới chiến dịch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all scale-100 animate-fade-in">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Plus size={16} className="text-blue-900" />
                        Thêm nhanh chiến dịch khám mới
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Field Tiêu đề chiến dịch */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Tiêu đề chiến dịch (*)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ví dụ: Khám mắt học đường Hè 2026"
                            className={inputStyle}
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    {/* Field Ngày bắt đầu */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Ngày bắt đầu
                        </label>
                        <input
                            type="datetime-local"
                            className={inputStyle}
                            // Cắt chuỗi để hiển thị chính xác trên input datetime-local (yyyy-MM-ddTHH:mm)
                            value={form.startDate.substring(0, 16)}
                            onChange={e => setForm({
                                ...form,
                                startDate: e.target.value ? `${e.target.value}:00` : '2026-07-15T00:00:00'
                            })}
                        />
                    </div>

                    {/* Modal Footer / Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <RefreshCcw size={12} className="animate-spin" />
                            ) : (
                                <Plus size={14} />
                            )}
                            Lưu chiến dịch
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CampaignModal;