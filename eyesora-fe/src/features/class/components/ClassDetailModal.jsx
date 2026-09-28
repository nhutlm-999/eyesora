import { X } from "lucide-react";
import Pagination from "../../../shared/components/Pagination.jsx";

const ClassDetailModal = ({ onClose, data, onPageChange }) => {
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 uppercase">Lớp: {data.className || '---'}</h2>
                        <p className="text-xs font-semibold text-blue-900 mt-0.5">{data.patientCount || 0} học sinh trong danh sách</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-700">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-xs border-b border-gray-200 z-10">
                        <tr className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                            <th className="py-3 px-3">Họ và tên</th>
                            <th className="py-3 px-3">Ngày sinh</th>
                            <th className="py-3 px-3">Phường/Xã</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {Array.isArray(data.patients) && data.patients.length > 0 ? (
                            data.patients.map((p, idx) => (
                                <tr key={p.patientId || idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="py-3 px-3 font-bold text-gray-900">{p.patientName || '---'}</td>
                                    <td className="py-3 px-3 text-gray-600 font-medium">{p.dob || '---'}</td>
                                    <td className="py-3 px-3 text-gray-600 font-medium italic">{p.wardName || 'Chưa cập nhật'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-12 text-center text-gray-400 font-medium italic bg-gray-50/30">Chưa có học sinh nào.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center bg-gray-50/50 -mx-6 -mb-6 p-4">
                    <span className="text-xs font-semibold text-gray-600">Trang <span className="text-blue-700 font-bold">{(data.number || 0) + 1}</span> / {data.totalPages || 1}</span>
                    <Pagination currentPage={data.number || 0} totalPages={data.totalPages || 1} onPageChange={onPageChange} />
                </div>
            </div>
        </div>
    );
};
export default ClassDetailModal;