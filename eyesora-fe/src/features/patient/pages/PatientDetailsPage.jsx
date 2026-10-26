import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, School, Calendar, MapPin, Phone, Shield, RefreshCw, AlertCircle, Eye } from "lucide-react";
import axiosClient from "../../../shared/axios/axiosClient.js";

const PatientDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [patient, setPatient] = useState(null);
    const [eyeExams, setEyeExams] = useState([]); // State lưu thông tin khám mắt
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi song song cả 2 API để tối ưu tốc độ
                const [patientRes, eyeExamRes] = await Promise.all([
                    axiosClient.get(`/patients/${id}`),
                    axiosClient.get(`/eye-exam-records/patient/${id}`) // Thay bằng endpoint tương ứng nếu chạy qua axiosClient base URL khác
                ]);

                setPatient(patientRes.data);
                setEyeExams(eyeExamRes.data || []);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết hồ sơ hoặc lịch sử khám mắt:", err);
                setError("Không thể tải thông tin chi tiết học sinh hoặc dữ liệu khám mắt.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAllData();
    }, [id]);

    const renderGender = (gender) => {
        if (gender === 'MALE') return 'Nam';
        if (gender === 'FEMALE') return 'Nữ';
        return '---';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="p-6 bg-[#f5f7fa] h-full flex items-center justify-center">
                <p className="text-gray-500 font-semibold text-sm flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-900" /> Đang tải thông tin chi tiết hồ sơ...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-[#f5f7fa] h-full flex flex-col items-center justify-center gap-4">
                <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-sm font-bold flex items-center gap-2 max-w-md">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
                <button
                    onClick={() => navigate('/patients')}
                    className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                    Quay về danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin space-y-6 text-gray-950">

            {/* Header Toolbar */}
            <div className="flex items-center gap-3 w-full">
                <button
                    onClick={() => navigate('/patients')}
                    className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-900 shadow-xs transition-colors cursor-pointer flex items-center justify-center"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ học sinh</h1>
                    <p className="text-xs text-gray-500">Xem toàn bộ thông tin hành chính và lịch sử khám lâm sàng</p>
                </div>
            </div>

            {/* Khối chính hiển thị thông tin hành chính */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-6 md:p-8 space-y-6">

                {/* Panel tóm tắt đầu trang */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 pb-6 border-b border-gray-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-blue-900/10 border border-blue-900/20 flex items-center justify-center text-blue-900 shadow-sm flex-shrink-0">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-950">{patient?.patientName}</h2>
                            <p className="text-xs font-bold text-blue-900 mt-0.5">Mã học sinh (ID): {patient?.patientId || "-"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/patients/edit/${patient?.patientId}`)}
                        className="px-4 py-2 border border-gray-200 bg-white text-gray-700 hover:text-blue-900 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        Chỉnh sửa thông tin
                    </button>
                </div>

                {/* Grid 1: Dữ liệu chung */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-gray-50/70 p-5 rounded-2xl border border-gray-100 text-sm">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider"><Calendar size={14}/> Ngày sinh</span>
                        <p className="font-bold text-gray-900">{formatDate(patient?.dob)}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider"><User size={14}/> Giới tính</span>
                        <p className="font-bold text-gray-900">{renderGender(patient?.gender)}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider"><Shield size={14}/> Chiến dịch tham gia</span>
                        <p className="font-bold text-gray-900">{patient?.campaignTitle || "---"}</p>
                    </div>
                    <div className="lg:col-span-4 space-y-1 border-t border-gray-200/60 pt-3 mt-1">
                        <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider"><MapPin size={14}/> Địa chỉ (Phường / Xã)</span>
                        <p className="font-bold text-gray-900">{patient?.wardName || "---"}</p>
                    </div>
                </div>

                {/* Grid 2: Hai cột nhóm dữ liệu con */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Nhóm Học tập */}
                    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                            <School size={16} className="text-blue-900"/> Thông tin học tập / Cơ sở
                        </h4>
                        <div className="space-y-4">
                            <InfoRow label="Lớp học hiện tại" value={patient?.className} />
                            <InfoRow label="Cơ sở y tế / Trường học" value={patient?.facilityName} />
                        </div>
                    </div>

                    {/* Nhóm Liên hệ cá nhân */}
                    <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                            <Phone size={16} className="text-blue-900"/> Thông tin phụ huynh liên hệ
                        </h4>
                        <div className="space-y-4">
                            <InfoRow label="Số điện thoại liên lạc" value={patient?.parentPhone} />
                            <InfoRow label="Mối quan hệ bảo hộ" value="Phụ huynh học sinh" />
                        </div>
                    </div>
                </div>
            </div>

            {/* KHỐI HIỂN THỊ LỊCH SỬ KHÁM MẮT */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-6 md:p-8 space-y-6">
                <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Eye className="text-blue-900 w-5 h-5" /> Lịch sử khám mắt học đường
                    </h3>
                    <p className="text-xs text-gray-500">Danh sách kết quả các đợt đo thị lực và tật khúc xạ</p>
                </div>

                {eyeExams.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <p className="text-sm text-gray-400 font-medium">Học sinh chưa có lịch sử ghi nhận khám mắt.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {eyeExams.map((exam, index) => (
                            <div key={exam.examId || index} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                                {/* Header của đợt khám */}
                                <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <span className="text-xs font-black text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                            Đợt {index + 1}
                                        </span>
                                        <span className="ml-2 text-sm font-bold text-gray-800">{exam.campaignTitle}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-500">
                                        Ngày khám: <span className="font-bold text-gray-900">{formatDate(exam.examDate)}</span>
                                    </div>
                                </div>

                                {/* Chi tiết thông số mắt */}
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* MẮT PHẢI (RIGHT EYE) */}
                                    <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-4 space-y-3">
                                        <h5 className="text-xs font-black text-orange-800 uppercase tracking-widest border-b border-orange-100 pb-1.5 flex justify-between">
                                            <span>Mắt Phải (OD)</span>
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <ExamItem label="Thị lực không kính" value={exam.vaRightWithoutGlasses} />
                                            <ExamItem label="Thị lực kính cũ" value={exam.vaRightOldGlasses} />
                                            <ExamItem label="Thị lực kính mới" value={exam.vaRightWithGlasses} />
                                            <ExamItem label="Thị lực lỗ kính" value={exam.vaRightPinhole} />
                                            <ExamItem label="Độ cầu (Sph)" value={exam.sphRight != null ? `${exam.sphRight > 0 ? '+' : ''}${exam.sphRight.toFixed(2)}` : null} />
                                            <ExamItem label="Độ trụ (Cyl)" value={exam.cylRight != null ? `${exam.cylRight > 0 ? '+' : ''}${exam.cylRight.toFixed(2)}` : null} />
                                            <ExamItem label="Trục (Axis)" value={exam.axisRight} unit="°" />
                                            <ExamItem label="Khoảng cách KC (PD)" value={exam.pdRight} unit="mm" />
                                        </div>
                                    </div>

                                    {/* MẮT TRÁI (LEFT EYE) */}
                                    <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4 space-y-3">
                                        <h5 className="text-xs font-black text-blue-800 uppercase tracking-widest border-b border-blue-100 pb-1.5 flex justify-between">
                                            <span>Mắt Trái (OS)</span>
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <ExamItem label="Thị lực không kính" value={exam.vaLeftWithoutGlasses} />
                                            <ExamItem label="Thị lực kính cũ" value={exam.vaLeftOldGlasses} />
                                            <ExamItem label="Thị lực kính mới" value={exam.vaLeftWithGlasses} />
                                            <ExamItem label="Thị lực lỗ kính" value={exam.vaLeftPinhole} />
                                            <ExamItem label="Độ cầu (Sph)" value={exam.sphLeft != null ? `${exam.sphLeft > 0 ? '+' : ''}${exam.sphLeft.toFixed(2)}` : null} />
                                            <ExamItem label="Độ trụ (Cyl)" value={exam.cylLeft != null ? `${exam.cylLeft > 0 ? '+' : ''}${exam.cylLeft.toFixed(2)}` : null} />
                                            <ExamItem label="Trục (Axis)" value={exam.axisLeft} unit="°" />
                                            <ExamItem label="Khoảng cách KC (PD)" value={exam.pdLeft} unit="mm" />
                                        </div>
                                    </div>

                                </div>

                                {/* Footer phụ thông tin người khám */}
                                {exam.examinerName && (
                                    <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-right text-xs text-gray-500">
                                        Người khám: <span className="font-semibold text-gray-700">{exam.examinerName}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

// Component Row phụ trợ hiển thị nhãn giá trị hành chính
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-gray-50 pb-2.5 last:border-b-0 last:pb-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-extrabold text-blue-950">{value || "---"}</span>
    </div>
);

// Component hiển thị thông số chi tiết của từng mắt
const ExamItem = ({ label, value, unit = "" }) => (
    <div className="bg-white p-2 rounded-lg border border-gray-100/80 flex flex-col justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 block leading-tight">{label}</span>
        <span className="text-sm font-black text-gray-800">
            {value !== null && value !== undefined ? `${value}${unit}` : "---"}
        </span>
    </div>
);

export default PatientDetailPage;