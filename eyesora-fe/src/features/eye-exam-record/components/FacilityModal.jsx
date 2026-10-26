import { useState } from 'react';
import { Plus, X, RefreshCcw } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const FacilityModal = ({ isOpen, onClose, onSuccess, inputStyle }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ facilityName: '', facilityType: 'SCHOOL', address: '' });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.facilityName.trim()) {
            setError('Vui lòng nhập tên cơ sở');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await axiosClient.post('/master-data/facilities', form);
            const newId = res.data?.id || res.data?.facilityId;
            onSuccess(String(newId));
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tạo mới cơ sở y tế / trường học.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Plus size={16} className="text-blue-900" /> Thêm nhanh cơ sở tiếp nhận</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">{error}</div>}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tên cơ sở (*)</label>
                        <input type="text" required placeholder="Ví dụ: Trường THPT Chu Văn An" className={inputStyle} value={form.facilityName} onChange={e => setForm({...form, facilityName: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Loại hình</label>
                        <select className={inputStyle} value={form.facilityType} onChange={e => setForm({...form, facilityType: e.target.value})}>
                            <option value="SCHOOL">Trường học (SCHOOL)</option>
                            <option value="HOSPITAL">Bệnh viện / Cơ sở y tế (HOSPITAL)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Địa chỉ</label>
                        <input type="text" placeholder="Không bắt buộc" className={inputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50" disabled={loading}>Hủy</button>
                        <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 flex items-center gap-1.5" disabled={loading}>
                            {loading ? <RefreshCcw size={12} className="animate-spin" /> : <Plus size={14} />} Lưu cơ sở
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacilityModal;