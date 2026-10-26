import { X, MapPin, ExternalLink } from "lucide-react";

const FacilityDetailModal = ({ data, onClose }) => {
    if (!data) return null;
    const isSchool = data.facilityType === 'SCHOOL';

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
                        { label: 'Loại hình', value: isSchool ? 'Trường học' : data.facilityType === 'HOSPITAL' ? 'Bệnh viện' : 'Phòng khám' },
                        { label: 'Điện thoại', value: data.phone },
                        { label: 'Địa chỉ', value: data.address },
                        { label: 'Phường/Xã', value: data.wardName }
                    ].map((i, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-200/60 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">{i.label}</span>
                            <span className="font-bold text-gray-900">{i.value || 'N/A'}</span>
                        </div>
                    ))}

                    {/* Thông tin Hiệu trưởng nếu là Trường học hoặc nếu có dữ liệu */}
                    {(isSchool || data.principalName) && (
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Hiệu trưởng</span>
                            <span className="font-bold text-gray-900">{data.principalName || 'Chưa cập nhật'}</span>
                        </div>
                    )}

                    {(isSchool || data.principalPhone) && (
                        <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">SĐT Hiệu trưởng</span>
                            <span className="font-bold text-gray-900">{data.principalPhone || 'Chưa cập nhật'}</span>
                        </div>
                    )}

                    {data.googleMapsUrl && (
                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-200/60">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Google Maps</span>
                            <a
                                href={data.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg font-bold text-xs transition-colors border border-red-200"
                            >
                                <MapPin size={14} className="text-red-500 shrink-0" />
                                <span>Xem trên Google Maps</span>
                                <ExternalLink size={12} className="opacity-70" />
                            </a>
                        </div>
                    )}
                </div>

                <button onClick={onClose} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer shadow-sm">
                    Đóng chi tiết
                </button>
            </div>
        </div>
    );
};
export default FacilityDetailModal;
