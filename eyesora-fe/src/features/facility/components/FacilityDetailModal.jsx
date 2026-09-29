import { X } from "lucide-react";

const FacilityDetailModal = ({ data, onClose }) => {
    if (!data) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100">

                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Chi tiết cơ sở</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-xl mb-6 text-xs border border-gray-100">
                    {[
                        { label: 'Tên cơ sở', value: data.facilityName },
                        { label: 'Loại hình', value: data.facilityType === 'SCHOOL' ? 'Trường học' : data.facilityType === 'HOSPITAL' ? 'Bệnh viện' : 'Phòng khám' },
                        { label: 'Điện thoại', value: data.phone },
                        { label: 'Địa chỉ', value: data.address },
                        { label: 'Phường/Xã', value: data.wardName }
                    ].map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">{i.label}</span>
                            <span className="font-bold text-gray-900">{i.value || 'N/A'}</span>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer shadow-sm">
                    Đóng chi tiết
                </button>
            </div>
        </div>
    );
};
export default FacilityDetailModal;