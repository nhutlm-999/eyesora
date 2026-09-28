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
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Họ và Tên</th>
                        <th className="px-6 py-4">Giới tính</th>
                        <th className="px-6 py-4">Lớp</th>
                        <th className="px-6 py-4">Trường học</th>
                        <th className="px-6 py-4">Chiến dịch khám</th>
                        <th className="px-6 py-4">Ngày khám</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan="7" className="text-center py-8 font-semibold text-gray-500 text-xs">Đang tải dữ liệu...</td></tr>
                    ) : records.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-8 text-gray-500 italic font-medium text-xs">Không tìm thấy hồ sơ phù hợp</td></tr>
                    ) : (
                        records.map((record) => (
                            <tr key={record.examId} className="hover:bg-blue-50/30 transition-colors duration-150">
                                <td className="px-6 py-4 font-bold text-gray-900 text-xs">{record.patientName ?? "N/A"}</td>
                                <td className="px-6 py-4 text-gray-700 font-semibold text-xs">
                                    {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                                </td>
                                <td className="px-6 py-4 text-gray-700 font-semibold text-xs">{record.className ?? "-"}</td>

                                <td className="px-6 py-4 text-gray-700 font-semibold text-xs max-w-[180px] truncate" title={record.facilityName}>{record.facilityName ?? "-"}</td>

                                <td className="px-6 py-4 text-gray-700 text-xs min-w-[200px]" title={record.campaignTitle}>{record.campaignTitle ?? "-"}</td>

                                <td className="px-6 py-4 text-gray-600 text-xs font-medium">{formatDate(record.examDate)}</td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(record)}
                                            className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-emerald-600 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openUpdateModal(record)}
                                            className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-[#004194] hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                            title="Chỉnh sửa"
                                        >
                                            <SquarePen size={16}/>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => triggerDeleteModal(record)}
                                            className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-rose-600 hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer"
                                            title="Xóa hồ sơ"
                                        >
                                            <Trash size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500">
                    Trang <span className="text-[#004194] font-bold">{pageData.page + 1}</span> / {pageData.totalPages || 1}
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