import { Eye, PlusCircle, Phone } from "lucide-react";

const OverduePatientTable = ({ students, loading, pageInfo, onDetail, onNewExam, formatDate }) => {
    const pageIndex = pageInfo?.pageNumber || 0;
    const pageSize = pageInfo?.pageSize || 10;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4.5 py-4 text-center w-12">STT</th>
                    <th className="px-6 py-4">Mã học sinh</th>
                    <th className="px-6 py-4">Họ và Tên</th>
                    <th className="px-6 py-4">Lớp</th>
                    <th className="px-6 py-4">Cơ sở / Trường học</th>
                    <th className="px-6 py-4">SĐT Phụ huynh</th>
                    <th className="px-6 py-4 text-center">Khám lần cuối</th>
                    <th className="px-6 py-4 text-center">Thời gian quá hạn</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr>
                        <td colSpan="9" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                            Đang kiểm tra danh sách học sinh quá hạn...
                        </td>
                    </tr>
                ) : students.length === 0 ? (
                    <tr>
                        <td colSpan="9" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                            Không tìm thấy học sinh nào quá hạn tái khám.
                        </td>
                    </tr>
                ) : (
                    students.map((s, index) => (
                        <tr key={s.patientId} className="hover:bg-blue-50/30 transition-colors duration-150">
                            <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">
                                {pageIndex * pageSize + index + 1}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-blue-950 font-bold">
                                {s.patientId}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                {s.patientName}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-blue-800">
                                {s.className || '---'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium max-w-[200px] truncate" title={s.facilityName}>
                                {s.facilityName || '---'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                                {s.parentPhone ? (
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        {s.parentPhone}
                                        </span>
                                ) : (
                                    <span className="text-gray-400 italic">Chưa có</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-semibold text-gray-800">
                                {formatDate(s.lastExamDate)}
                            </td>
                            <td className="px-6 py-4 text-center align-middle">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-xs ${
                                        s.monthsSinceLastExam >= 12
                                            ? 'bg-red-50 text-red-700 border-red-200'
                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                        {s.monthsSinceLastExam} tháng trước
                                    </span>
                            </td>
                            <td className="px-6 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onDetail(s)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Xem hồ sơ chi tiết"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onNewExam(s)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-blue-50/50 border border-blue-200 text-blue-700 rounded-lg hover:text-blue-900 hover:bg-blue-100/50 hover:shadow-xs transition-all cursor-pointer"
                                        title="Ghi nhận lần tái khám mới"
                                    >
                                        <PlusCircle className="w-4 h-4" />
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

export default OverduePatientTable;