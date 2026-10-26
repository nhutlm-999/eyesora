import { Eye, SquarePen, Trash } from "lucide-react";

const PatientTable = ({ patients, loading, pageInfo, onDetail, onEdit, onDelete, formatDate }) => {
    const pageIndex = pageInfo?.pageNumber || 0;
    const pageSize = pageInfo?.pageSize || 10;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4.5 py-4 text-center w-12">STT</th>
                    <th className="px-6 py-4">Mã bệnh nhân</th>
                    <th className="px-6 py-4">Họ và Tên</th>
                    <th className="px-6 py-4">Lớp</th>
                    <th className="px-6 py-4">Cơ sở</th>
                    <th className="px-6 py-4 text-center">Giới tính</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr>
                        <td colSpan="7" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                            Đang tải dữ liệu học sinh...
                        </td>
                    </tr>
                ) : patients.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                            Không tìm thấy bệnh nhân nào.
                        </td>
                    </tr>
                ) : (
                    patients.map((p, index) => (
                        <tr key={p.patientId} className="hover:bg-blue-50/30 transition-colors duration-150">
                            <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">
                                {pageIndex * pageSize + index + 1}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-blue-950 font-bold">{p.patientId}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.patientName}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-blue-800">{p.className || '---'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium max-w-[200px] truncate" title={p.facilityName}>{p.facilityName || '---'}</td>
                            <td className="px-6 py-4 text-center align-middle">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs ${
                                    p.gender === 'MALE'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-pink-50 text-pink-700 border-pink-200'
                                }`}>
                                    {p.gender === 'MALE' ? 'Nam' : 'Nữ'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onDetail(p)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Xem chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(p)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <SquarePen className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(p)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-red-50/30 border border-gray-200 text-gray-500 rounded-lg hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer"
                                        title="Xóa bệnh nhân"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};
export default PatientTable;