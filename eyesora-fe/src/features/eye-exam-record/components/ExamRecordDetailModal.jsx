import { X, Eye } from "lucide-react";

const ExamRecordDetailModal = ({ isOpen, onClose, record, formatDate, formatVA, formatDiopter, formatAxis }) => {
    if (!isOpen || !record) return null;

    // Kiểm tra ngưỡng cảnh báo đồng bộ tuyệt đối với AlertRecordsTable
    const isSevereMyopiaLeft = record.sphLeft <= -6.0;
    const isSevereMyopiaRight = record.sphRight <= -6.0;
    const isSevereMyopia = isSevereMyopiaLeft || isSevereMyopiaRight;

    const isHighAstigmatismLeft = Math.abs(record.cylLeft) >= 1.5;
    const isHighAstigmatismRight = Math.abs(record.cylRight) >= 1.5;
    const isHighAstigmatism = isHighAstigmatismLeft || isHighAstigmatismRight;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Modal */}
                <div className="px-6 py-5 bg-gradient-to-r from-gray-50/90 to-gray-100/60 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-[#004194] rounded-2xl border border-blue-100">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Chi tiết hồ sơ khám mắt</h2>
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">Học sinh: <span className="text-gray-900 font-bold">{record.patientName ?? "N/A"}</span></p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Nội dung chi tiết cuộn được */}
                <div className="p-6 overflow-y-auto space-y-5">

                    {/* Bảng trạng thái cảnh báo nổi bật */}
                    <div className="flex items-center justify-between bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80">
                        <div>
                            <span className="text-xs text-gray-500 font-medium block">Đánh giá mức độ:</span>
                            <span className="text-xs font-bold text-gray-800">Tình trạng khúc xạ học sinh</span>
                        </div>
                        <div>
                            {isSevereMyopia && isHighAstigmatism ? (
                                <span className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-700 text-white border border-red-500 shadow-xs">
                                    Cận & Loạn Cao
                                </span>
                            ) : isSevereMyopia ? (
                                <span className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-orange-800 to-orange-600 text-white border border-orange-500 shadow-xs">
                                    Cận nặng
                                </span>
                            ) : isHighAstigmatism ? (
                                <span className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-600 text-white border border-amber-400 shadow-xs">
                                    Loạn thị cao
                                </span>
                            ) : (
                                <span className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-l from-green-200 to-green-600 border border-gray-300">
                                    Bình thường / Theo dõi
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Thông tin chung */}
                    <div className="grid grid-cols-2 gap-3.5 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/60 text-xs">
                        <div>
                            <span className="text-gray-500 font-medium">Giới tính: </span>
                            <span className="font-bold text-gray-900 ml-1">
                                {record.gender === "MALE" ? "Nam" : record.gender === "FEMALE" ? "Nữ" : "Khác"}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500 font-medium">Lớp: </span>
                            <span className="font-bold text-gray-900 ml-1">{record.className || "-"}</span>
                        </div>

                        <div className="col-span-2">
                            <span className="text-gray-500 font-medium">Trường học: </span>
                            <span className="font-bold text-gray-900 ml-1">{record.facilityName || "-"}</span>
                        </div>

                        <div>
                            <span className="text-gray-500 font-medium">Ngày khám: </span>
                            <span className="font-bold text-gray-900 ml-1">{formatDate(record.examDate)}</span>
                        </div>

                        <div>
                            <span className="text-gray-500 font-medium">Người khám: </span>
                            <span className="font-bold text-gray-900 ml-1">{record.examinerName || "-"}</span>
                        </div>

                        <div className="col-span-2 pt-1 border-t border-gray-200/60">
                            <span className="text-gray-500 font-medium">Chiến dịch: </span>
                            <span className="font-bold text-gray-900 ml-1">{record.campaignTitle || "-"}</span>
                        </div>
                    </div>

                    {/* Khúc xạ 2 bên Mắt (Đồng bộ kiểu hiển thị SPH/CYL y hệt bảng AlertRecordsTable) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Mắt Trái */}
                        <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3.5 pb-2.5 border-b border-gray-100 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Mắt Trái (Khúc xạ & Thị lực)
                            </h4>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Không kính)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaLeftWithoutGlasses)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Kính cũ)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaLeftOldGlasses)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Kính lỗ</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaLeftPinhole)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Có kính)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaLeftWithGlasses)}</span>
                                </div>

                                {/* Khối SPH & CYL xếp chồng đồng bộ y hệt AlertRecordsTable */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-medium">Độ khúc xạ</span>
                                    <div className="flex flex-col gap-1.5 items-end">
                                        <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${isSevereMyopiaLeft ? 'bg-red-50 text-red-700 border-red-300 font-extrabold shadow-2xs' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            SPH: {formatDiopter(record.sphLeft)}
                                        </div>
                                        <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${isHighAstigmatismLeft ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold shadow-2xs' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            CYL: {formatDiopter(record.cylLeft)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1 border-t border-gray-50">
                                    <span className="text-gray-500 font-medium">Trục (Axis)</span>
                                    <span className="font-mono font-bold text-gray-800">{formatAxis(record.axisLeft)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">KCĐT (PD)</span>
                                    <span className="font-mono font-bold text-gray-800">{record.pdLeft || "-"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mắt Phải */}
                        <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3.5 pb-2.5 border-b border-gray-100 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                Mắt Phải (Khúc xạ & Thị lực)
                            </h4>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Không kính)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaRightWithoutGlasses)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Kính cũ)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaRightOldGlasses)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Kính lỗ</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaRightPinhole)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                    <span className="text-gray-500 font-medium">Thị lực (Có kính)</span>
                                    <span className="font-bold text-gray-900">{formatVA(record.vaRightWithGlasses)}</span>
                                </div>

                                {/* Khối SPH & CYL xếp chồng đồng bộ y hệt AlertRecordsTable */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 font-medium">Độ khúc xạ</span>
                                    <div className="flex flex-col gap-1.5 items-end">
                                        <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${isSevereMyopiaRight ? 'bg-red-50 text-red-700 border-red-300 font-extrabold shadow-2xs' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            SPH: {formatDiopter(record.sphRight)}
                                        </div>
                                        <div className={`text-xs font-mono px-2.5 py-1 rounded border w-fit ${isHighAstigmatismRight ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold shadow-2xs' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            CYL: {formatDiopter(record.cylRight)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1 border-t border-gray-50">
                                    <span className="text-gray-500 font-medium">Trục (Axis)</span>
                                    <span className="font-mono font-bold text-gray-800">{formatAxis(record.axisRight)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">KCĐT (PD)</span>
                                    <span className="font-mono font-bold text-gray-800">{record.pdRight || "-"}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Footer Đóng */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-[#004194] text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all shadow-sm cursor-pointer"
                    >
                        Đóng chi tiết
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExamRecordDetailModal;