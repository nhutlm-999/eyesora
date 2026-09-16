import { Filter, Download, Eye, Info } from 'lucide-react';
import Pagination from "../../../shared/components/Pagination.jsx";
import axiosClient from "../../../shared/axios/axiosClient.js";

const handleExport = async () => {
    try {
        const res = await axiosClient.get('/dashboard/export/city', {responseType: 'blob'});
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao_Cao_Tu_EyeSora.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Lỗi xuất file", error);
        alert("Có lỗi xảy ra khi xuất báo cáo!");
    }
};

const AlertRecordsTable = ({ records, pageData, fetchData, statusFilter, onFilterChange, openDetail, formatDiopter }) => {
    const totalPages = pageData.totalPages || 1;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mt-6 font-sans">
            {/* Header & Công cụ */}
            <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap justify-between items-center bg-gray-50/80 gap-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                    Danh sách ca bệnh cần lưu ý khẩn cấp

                    {/* Tooltip giải thích */}
                    <div className="relative flex items-center group ml-1">
                        <Info className="w-4 h-4 text-gray-400 hover:text-red-600 cursor-help transition-colors" />
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-80 p-3.5 bg-gray-900 text-white text-xs font-normal rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl text-left leading-relaxed">
                            Hiển thị học sinh mắc <strong className="text-red-300">cận thị hoặc loạn thị mức độ nặng</strong>.<br/><br/>
                            • Độ cầu (SPH) từ <strong>-6.00 Diop</strong> trở xuống.<br/>
                            • HOẶC độ trụ (CYL) từ <strong>1.50 Diop</strong> trở lên.
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900"></div>
                        </div>
                    </div>
                </h3>

                <div className="flex gap-3 items-center">
                    {/* Bộ Lọc */}
                    <div className="relative flex items-center">
                        <Filter className="w-4 h-4 text-gray-500 absolute left-3" />
                        <select
                            value={statusFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="pl-9 pr-9 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-600 transition-colors cursor-pointer shadow-sm appearance-none outline-none"
                        >
                            <option value="ALL">Tất cả cảnh báo</option>
                            <option value="MYOPIA">Chỉ Cận nặng</option>
                            <option value="ASTIGMATISM">Chỉ Loạn thị cao</option>
                            <option value="BOTH">Bị cả Cận & Loạn</option>
                        </select>
                        <div className="absolute right-3 pointer-events-none border-[4px] border-transparent border-t-gray-500 mt-1"></div>
                    </div>

                    {/* Nút Xuất báo cáo */}
                    <button onClick={handleExport} className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#004194] text-white text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shadow-sm">
                        <Download className="w-4 h-4"/> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-4.5 py-4 text-center w-12">STT</th>
                        <th className="px-6 py-4">Học Sinh</th>
                        <th className="px-6 py-4">Lớp / Trường</th>
                        <th className="px-6 py-4">Mắt Trái (Khúc xạ)</th>
                        <th className="px-6 py-4">Mắt Phải (Khúc xạ)</th>
                        <th className="px-6 py-4 text-center">Trạng thái</th>
                        <th className="px-6 py-4 text-center">Chi tiết</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                                Không tìm thấy hồ sơ nào khớp với bộ lọc hiện tại.
                            </td>
                        </tr>
                    ) : (
                        records.map((record, index) => {
                            const isSevereMyopia = record.sphLeft <= -6.0 || record.sphRight <= -6.0;
                            const isHighAstigmatism = Math.abs(record.cylLeft) >= 1.5 || Math.abs(record.cylRight) >= 1.5;

                            return (
                                <tr key={index} className="hover:bg-gray-50/60 transition-colors duration-150">
                                    {/* STT */}
                                    <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">
                                        {pageData.page * 10 + index + 1}
                                    </td>

                                    {/* Học Sinh */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{record.patientName ?? "N/A"}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                                                {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Lớp / Trường */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-800">{record.className ?? "-"}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 max-w-[180px] truncate" title={record.facilityName}>
                                            {record.facilityName ?? "-"}
                                        </div>
                                    </td>

                                    {/* Mắt Trái */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${record.sphLeft <= -6.0 ? 'bg-orange-100 text-orange-900 border-orange-300 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                SPH: {formatDiopter(record.sphLeft)}
                                            </div>
                                            <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${Math.abs(record.cylLeft) >= 1.5 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                CYL: {formatDiopter(record.cylLeft)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Mắt Phải */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${record.sphRight <= -6.0 ? 'bg-orange-100 text-orange-900 border-orange-300 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                SPH: {formatDiopter(record.sphRight)}
                                            </div>
                                            <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${Math.abs(record.cylRight) >= 1.5 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                CYL: {formatDiopter(record.cylRight)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Trạng thái (Màu sắc tách biệt rõ: Vàng -> Cam -> Đỏ đậm) */}
                                    <td className="px-6 py-4 text-center align-middle">
                                        {isSevereMyopia && isHighAstigmatism ? (
                                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-red-600 text-white border border-red-700 whitespace-nowrap shadow-xs">
                                                Cận & Loạn Cao
                                            </span>
                                        ) : isSevereMyopia ? (
                                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-orange-500 text-white border border-orange-600 whitespace-nowrap shadow-xs">
                                                Cận nặng
                                            </span>
                                        ) : isHighAstigmatism ? (
                                            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-400 text-amber-950 border border-amber-500 whitespace-nowrap shadow-xs">
                                                Loạn thị cao
                                            </span>
                                        ) : null}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="px-6 py-4 text-center align-middle">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(record)}
                                            className="inline-flex p-2 bg-white border border-gray-200 text-gray-500 rounded-lg hover:text-[#004194] hover:border-[#004194] transition-all cursor-pointer shadow-xs"
                                            title="Xem chi tiết hồ sơ"
                                        >
                                            <Eye className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600">
                    Trang <span className="text-[#004194] font-bold">{pageData.page + 1}</span> / {totalPages}
                </div>
                <Pagination currentPage={pageData.page} totalPages={totalPages} onPageChange={(newPage) => fetchData(newPage, statusFilter)} />
            </div>
        </div>
    );
};

export default AlertRecordsTable;