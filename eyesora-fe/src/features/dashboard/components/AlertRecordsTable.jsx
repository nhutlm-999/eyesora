import {Filter, Download, Eye, Info} from 'lucide-react';
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

const getInitials = (name) => {
    if (!name) return "N/A";
    const words = name.trim().split(/\s+/);
    return words.map(w => w[0] ? w[0].toUpperCase() : '').join('');
};

const AlertRecordsTable = ({records, pageData, fetchData, statusFilter, onFilterChange, openDetail, formatDiopter}) => {
    const totalPages = pageData.totalPages || 1;

    return (
        <div id="alert-records-table" className="bg-white border border-gray-200 rounded-2xl shadow-sm mt-6 font-sans">
            {/* Header & Công cụ */}
            <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap justify-between items-center bg-gray-50 gap-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2.5">
                    <span
                        className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-xs"></span>
                    Danh sách ca bệnh cần lưu ý khẩn cấp
                    <div className="relative flex items-center group ml-1">
                        <Info className="w-4 h-4 text-gray-400 hover:text-sky-500 cursor-help transition-colors"/>
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 w-84 p-4 bg-gray-900/95 backdrop-blur-md text-white text-xs font-normal rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-2xl border border-gray-800 text-left leading-relaxed">
                            <div className="font-bold text-sm mb-2 pb-2 border-b border-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Tiêu chí cảnh báo khẩn cấp
                            </div>
                            <p className="text-gray-300 mb-2.5">
                                Hệ thống tự động lọc các học sinh có kết quả đo khúc xạ nằm trong ngưỡng nguy hiểm cần
                                lưu ý đặc biệt:
                            </p>
                            <ul className="space-y-1.5 text-gray-200">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-sky-400 font-bold">•</span>
                                    <span><strong>Cận thị nặng:</strong> Độ cầu (SPH) từ <strong
                                        className="text-orange-400 font-bold">-6.00 Diop</strong> trở xuống.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-sky-400 font-bold">•</span>
                                    <span><strong>Loạn thị cao:</strong> Độ trụ (CYL) từ <strong
                                        className="text-amber-400 font-bold">-1.50 Diop</strong> trở xuống.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </h3>

                <div className="flex gap-3 items-center">
                    {/* Bộ Lọc */}
                    <div className="relative flex items-center">
                        <Filter className="w-4 h-4 text-gray-500 absolute left-3"/>
                        <select
                            value={statusFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="pl-9 pr-9 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-600 transition-colors cursor-pointer shadow-xs appearance-none outline-none"
                        >
                            <option value="ALL">Tất cả cảnh báo</option>
                            <option value="MYOPIA">Chỉ Cận nặng</option>
                            <option value="ASTIGMATISM">Chỉ Loạn thị cao</option>
                            <option value="BOTH">Bị cả Cận & Loạn</option>
                        </select>
                        <div
                            className="absolute right-3 pointer-events-none border-4 border-transparent border-t-gray-500 mt-1"></div>
                    </div>

                    <button onClick={handleExport}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#004194] text-white text-xs font-semibold hover:bg-blue-900 transition-all cursor-pointer shadow-sm">
                        <Download className="w-4 h-4"/> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <th className="px-3 py-3.5 text-center w-10">STT</th>
                        <th className="px-4 py-3.5 text-center w-28">Bệnh nhân</th>
                        <th className="px-3 py-3.5 text-center w-24">Lớp</th>
                        <th className="px-3 py-3.5 text-center text-xs font-bold text-gray-700 w-36">👁️ Mắt Trái (OS)</th>
                        <th className="px-3 py-3.5 text-center text-xs font-bold text-gray-700 w-36">👁️ Mắt Phải (OD)</th>
                        <th className="px-3 py-3.5 text-center w-32">Trạng thái</th>
                        <th className="px-3 py-3.5 text-center w-16">Chi tiết</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan="7"
                                className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">
                                Không tìm thấy hồ sơ nào khớp với bộ lọc hiện tại.
                            </td>
                        </tr>
                    ) : (
                        records.map((record, index) => {
                            const isSevereMyopiaLeft = record.sphLeft <= -6.0;
                            const isHighAstigmatismLeft = Math.abs(record.cylLeft) >= 1.5;

                            const isSevereMyopiaRight = record.sphRight <= -6.0;
                            const isHighAstigmatismRight = Math.abs(record.cylRight) >= 1.5;

                            const isSevereMyopia = isSevereMyopiaLeft || isSevereMyopiaRight;
                            const isHighAstigmatism = isHighAstigmatismLeft || isHighAstigmatismRight;
                            const initials = getInitials(record.patientName);

                            return (
                                <tr key={index} className="hover:bg-blue-50/20 transition-colors duration-150">
                                    {/* STT */}
                                    <td className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                                        {pageData.page * 10 + index + 1}
                                    </td>

                                    {/* Bệnh Nhân (Viết tắt 3 chữ cái đầu - Chữ to) */}
                                    <td className="px-3 py-2.5 text-center">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(record)}
                                            className="inline-flex items-center justify-center font-black text-sm text-sky-950 bg-sky-100 border border-sky-300 px-3 py-1 rounded-lg tracking-widest font-mono shadow-xs hover:bg-sky-200 hover:scale-105 transition-all cursor-pointer"
                                            title={`Xem chi tiết tên đầy đủ: ${record.patientName ?? "N/A"}`}
                                        >
                                            {initials}
                                        </button>
                                        <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                            {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                                        </div>
                                    </td>

                                    {/* Lớp / Trường (Hiển thị dạng chữ thường, không bọc) */}
                                    <td className="px-3 py-2.5 text-center">
                                        <div className="text-xs font-bold text-gray-900">
                                            {record.className ?? "-"}
                                        </div>
                                        {record.facilityName && (
                                            <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[100px] mx-auto"
                                                 title={record.facilityName}>
                                                {record.facilityName}
                                            </div>
                                        )}
                                    </td>

                                    {/* Mắt Trái (OS) - Chữ to rõ */}
                                    <td className="px-3 py-2.5 w-40">
                                        <div className="flex flex-col gap-1.5">
                                            <div className={`flex items-center justify-between px-2.5 py-1 rounded-md border transition-all ${
                                                isSevereMyopiaLeft
                                                    ? 'bg-red-50 border-red-300 text-red-950 font-extrabold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-700 text-xs">Độ cầu SPH</span>
                                                    <span className="text-xs text-gray-500 font-medium">(Cận)</span>
                                                </div>
                                                <span className="font-mono font-extrabold text-sm">{formatDiopter(record.sphLeft)}</span>
                                            </div>

                                            <div className={`flex items-center justify-between px-2.5 py-1 rounded-md border transition-all ${
                                                isHighAstigmatismLeft
                                                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-extrabold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-700 text-xs"> Độ trụ CYL</span>
                                                    <span className="text-xs text-gray-500 font-medium">(Loạn)</span>
                                                </div>
                                                <span className="font-mono font-extrabold text-sm">{formatDiopter(record.cylLeft)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Mắt Phải (OD) - Chữ to rõ */}
                                    <td className="px-3 py-2.5 w-40">
                                        <div className="flex flex-col gap-1.5">
                                            <div className={`flex items-center justify-between px-2.5 py-1 rounded-md border transition-all ${
                                                isSevereMyopiaRight
                                                    ? 'bg-red-50 border-red-300 text-red-950 font-extrabold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-700 text-xs">Độ cầu SPH</span>
                                                    <span className="text-xs text-gray-500 font-medium">(Cận)</span>
                                                </div>
                                                <span className="font-mono font-extrabold text-sm">{formatDiopter(record.sphRight)}</span>
                                            </div>

                                            <div className={`flex items-center justify-between px-2.5 py-1 rounded-md border transition-all ${
                                                isHighAstigmatismRight
                                                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-extrabold'
                                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                            }`}>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-gray-700 text-xs">Độ trụ CYL</span>
                                                    <span className="text-xs text-gray-500 font-medium">(Loạn)</span>
                                                </div>
                                                <span className="font-mono font-extrabold text-sm">{formatDiopter(record.cylRight)}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-center align-middle">
                                        {isSevereMyopia && isHighAstigmatism ? (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white border border-red-700 whitespace-nowrap shadow-2xs">
                                                Cận & Loạn Cao
                                            </span>
                                        ) : isSevereMyopia ? (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-orange-500 text-white border border-orange-600 whitespace-nowrap shadow-2xs">
                                                Cận nặng
                                            </span>
                                        ) : isHighAstigmatism ? (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-yellow-400 text-yellow-950 border border-yellow-500 whitespace-nowrap shadow-2xs">
                                                Loạn thị cao
                                            </span>
                                        ) : null}
                                    </td>

                                    {/* Thao tác */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <button
                                            type="button"
                                            onClick={() => openDetail(record)}
                                            className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                            title="Xem chi tiết đầy đủ hồ sơ"
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
            <div
                className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-600">
                    Trang <span className="text-blue-700 font-bold">{pageData.page + 1}</span> / {totalPages}
                </div>
                <Pagination currentPage={pageData.page} totalPages={totalPages}
                            onPageChange={(newPage) => fetchData(newPage, statusFilter)}/>
            </div>
        </div>
    );
};

export default AlertRecordsTable;