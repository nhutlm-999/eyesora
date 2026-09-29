import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleAlert, RefreshCcw } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

// Import các sub-components
import PageHeader from '../components/ImportExcelPageHeader';
import ImportResultAlert from '../components/ImportResultAlert';
import DragDropUpload from '../components/DragDropUpload';
import FacilityModal from '../components/FacilityModal';
import CampaignModal from '../components/CampaignModal'; // Giả định bạn đã tách file riêng

const ExamRecordImportPage = () => {
    const navigate = useNavigate();

    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');
    const [selectedExaminer, setSelectedExaminer] = useState('');
    const [examDate, setExamDate] = useState('2026-07-09T15:00');
    const [file, setFile] = useState(null);

    const [options, setOptions] = useState({ facilities: [], examiners: [], campaigns: [] });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [importResult, setImportResult] = useState(null);

    const [activeModal, setActiveModal] = useState(null);

    const fetchDropdownData = async () => {
        try {
            const [fRes, eRes, cRes] = await Promise.all([
                axiosClient.get('/master-data/facilities?size=999').catch(() => ({ data: [] })),
                axiosClient.get('/admin/users?role=examiner&size=999').catch(() => ({ data: [] })),
                axiosClient.get('/campaigns?status=active&size=999').catch(() => ({ data: [] }))
            ]);
            setOptions({
                facilities: fRes.data.content || fRes.data || [],
                examiners: eRes.data.content || eRes.data || [],
                campaigns: cRes.data.content || cRes.data || []
            });
        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
        }
    };

    useEffect(() => { fetchDropdownData(); }, []);

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setImportResult(null);

        let localErrors = {};
        if (!selectedFacility) localErrors.facilityId = "Vui lòng chọn cơ sở khám";
        if (!selectedExaminer) localErrors.examinerId = "Vui lòng chọn người khám";
        if (!selectedCampaign) localErrors.campaignId = "Vui lòng chọn chiến dịch";
        if (!examDate) localErrors.examDate = "Vui lòng chọn ngày khám";
        if (!file) localErrors.file = "Vui lòng tải lên file dữ liệu mẫu";

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('facilityId', selectedFacility);
        formData.append('examinerId', selectedExaminer);
        formData.append('campaignId', selectedCampaign);
        formData.append('examDate', examDate.includes(':') && examDate.split(':').length === 2 ? `${examDate}:00` : examDate);

        try {
            const response = await axiosClient.post('/eye-exam-records/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImportResult(response.data);
            if (response.data.failureCount === 0) setFile(null);
        } catch (err) {
            setErrors({ server: err.response?.data?.message || "Quá trình Import thất bại." });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = `w-full border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs cursor-pointer`;
    const labelStyle = `text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block`;

    return (
        <div className="p-6 bg-[#f5f7fa] text-gray-950 font-sans h-full overflow-y-auto scrollbar-thin relative">
            <PageHeader
                onBack={() => navigate('/eye-exam-records')}
                onDownloadTemplate={() => {
                    const link = document.createElement('a');
                    link.href = '/templates/mau_import_hoc_sinh.xlsx';
                    link.setAttribute('download', 'Mau_Import_Hoc_Sinh.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }}
            />

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-6 md:p-8 space-y-6">
                {errors.server && (
                    <div className="p-4 bg-red-50/80 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <CircleAlert size={18}/>{errors.server}
                    </div>
                )}

                <ImportResultAlert result={importResult} />

                <form onSubmit={handleImportSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelStyle}>Cơ sở y tế / Trường học (*)</label>
                            <select
                                className={`${inputStyle} text-[#004194]`}
                                value={selectedFacility}
                                onChange={e => e.target.value === '__NEW_FACILITY__' ? (setActiveModal('facility'), setSelectedFacility('')) : (setSelectedFacility(e.target.value), setImportResult(null))}
                            >
                                <option value="" className="text-gray-700">Chọn cơ sở tiếp nhận...</option>
                                <option value="__NEW_FACILITY__" className="text-[#004194] font-bold bg-blue-50">+ Thêm mới cơ sở...</option>
                                {options.facilities.map(f => <option key={f.id} value={String(f.id)} className="text-gray-900">{f.facilityName}</option>)}
                            </select>
                            {errors.facilityId && <p className="text-rose-600 text-[10px] font-bold mt-1.5">{errors.facilityId}</p>}
                        </div>

                        <div>
                            <label className={labelStyle}>Cán bộ / Người khám chịu trách nhiệm (*)</label>
                            <select className={inputStyle} value={selectedExaminer} onChange={e => { setSelectedExaminer(e.target.value); setImportResult(null); }}>
                                <option value="">Chọn bác sĩ...</option>
                                {options.examiners.map(e => <option key={e.id} value={String(e.id)}>{e.examinerName || e.fullName}</option>)}
                            </select>
                            {errors.examinerId && <p className="text-rose-600 text-[10px] font-bold mt-1.5">{errors.examinerId}</p>}
                        </div>

                        <div>
                            <label className={labelStyle}>Chiến dịch (*)</label>
                            <select
                                className={`${inputStyle} text-[#004194]`}
                                value={selectedCampaign}
                                onChange={e => e.target.value === '__NEW_CAMPAIGN__' ? (setActiveModal('campaign'), setSelectedCampaign('')) : (setSelectedCampaign(e.target.value), setImportResult(null))}
                            >
                                <option value="" className="text-gray-700">Chọn chiến dịch...</option>
                                <option value="__NEW_CAMPAIGN__" className="text-[#004194] font-bold bg-blue-50">+ Thêm mới chiến dịch...</option>
                                {options.campaigns.map(c => <option key={c.campaignId} value={String(c.campaignId)} className="text-gray-900">{c.campaignTitle || c.name}</option>)}
                            </select>
                            {errors.campaignId && <p className="text-rose-600 text-[10px] font-bold mt-1.5">{errors.campaignId}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelStyle}>Ngày khám lâm sàng (*)</label>
                            <input type="datetime-local" className={inputStyle} value={examDate} onChange={e => { setExamDate(e.target.value); setImportResult(null); }} />
                            {errors.examDate && <p className="text-rose-600 text-[10px] font-bold mt-1.5">{errors.examDate}</p>}
                        </div>
                    </div>

                    <DragDropUpload
                        file={file}
                        setFile={setFile}
                        error={errors.file}
                        setError={(msg) => setErrors(prev => ({...prev, file: msg}))}
                        onFileSelect={() => setImportResult(null)}
                    />

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8 w-full">
                        <button type="button" onClick={() => navigate('/eye-exam-records')} className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs" disabled={loading}>Hủy bỏ</button>
                        <button type="submit" disabled={loading} className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2">
                            {loading ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Đang xử lý...</> : "Tiến hành Import"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modals độc lập */}
            <FacilityModal
                isOpen={activeModal === 'facility'}
                onClose={() => setActiveModal(null)}
                inputStyle={inputStyle}
                onSuccess={async (newId) => { await fetchDropdownData(); setSelectedFacility(newId); setActiveModal(null); }}
            />

            <CampaignModal
                isOpen={activeModal === 'campaign'}
                onClose={() => setActiveModal(null)}
                inputStyle={inputStyle}
                onSuccess={async (newId) => { await fetchDropdownData(); setSelectedCampaign(newId); setActiveModal(null); }}
            />
        </div>
    );
};

export default ExamRecordImportPage;