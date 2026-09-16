import { Eye, SquarePen, Trash } from "lucide-react";
import Pagination from "../../../shared/components/Pagination.jsx";

const ExamRecordTable = ({
                             records,
                             loading,
                             pageData,
                             fetchData,
                             openDetail,
                             openUpdateModal,
                             triggerDeleteModal,
                             formatDate
                         }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4">Họ và Tên</th>
                        <th className="px-6 py-4">Giới tính</th>
                        <th className="px-6 py-4">Lớp</th>
                        <th className="px-6 py-4">Trường học</th>
                        <th className="px-6 py-4">Chiến dịch khám</th>
                        <th className="px-6 py-4">Ngày khám</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="7" className="text-center py-8 font-semibold text-gray-500">Đang tải dữ liệu...</td></tr>
                    ) : records.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-500 italic font-medium">Không tìm thấy hồ sơ phù hợp</td></tr>
                    ) : (
                        records.map((record) => (
                            <tr key={record.examId} className="hover:bg-blue-50/50 transition-all text-sm font-medium text-gray-900">
                                <td className="px-6 py-5 font-bold text-gray-900 text-sm">{record.patientName ?? "N/A"}</td>
                                <td className="px-6 py-5 text-gray-600 font-semibold text-sm">
                                    {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                                </td>
                                <td className="px-6 py-5 text-gray-600 font-semibold text-sm">{record.className ?? "-"}</td>

                                <td className="px-6 py-5 text-gray-600 font-semibold text-sm max-w-[180px] truncate" title={record.facilityName}>{record.facilityName ?? "-"}</td>

                                <td className="px-6 py-5 text-gray-600 text-sm min-w-[200px]" title={record.campaignTitle}>{record.campaignTitle ?? "-"}</td>

                                <td className="px-6 py-5 text-gray-600 text-sm">{formatDate(record.examDate)}</td>

                                <td className="px-6 py-5 text-right flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => openDetail(record)}
                                        className="text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button type="button" onClick={() => openUpdateModal(record)} className="text-blue-700 hover:text-blue-900 transition-colors cursor-pointer" title="Chỉnh sửa"><SquarePen size={20}/></button>
                                    <button type="button" onClick={() => triggerDeleteModal(record)} className="text-red-600 hover:text-red-800 transition-colors cursor-pointer" title="Xóa hồ sơ"><Trash size={20}/></button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-6 py-5 bg-white border-t border-gray-100">
                <div className="text-sm font-semibold text-gray-500">
                    Trang <span className="text-blue-900 font-bold">{pageData.page + 1}</span> / {pageData.totalPages || 1}
                </div>

                <Pagination
                    currentPage={pageData.page}
                    totalPages={pageData.totalPages || 1}
                    onPageChange={fetchData}
                />
            </div>
        </div>
    );
};

export default ExamRecordTable;