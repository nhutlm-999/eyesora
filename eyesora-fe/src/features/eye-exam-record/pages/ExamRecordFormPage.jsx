import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import axiosClient from "../../../shared/axios/axiosClient.js";

const ExamRecordFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [updateForm, setUpdateForm] = useState({
        examId: '', patientName: '', gender: '', className: '', facilityName: '', campaignTitle: '', // THÊM facilityName VÀO STATE

        vaLeftWithoutGlasses: '',
        vaLeftOldGlasses: '',
        vaLeftPinhole: '',
        vaLeftWithGlasses: '',
        sphLeft: '',
        cylLeft: '',
        axisLeft: '',
        pdLeft: '',

        vaRightWithoutGlasses: '',
        vaRightOldGlasses: '',
        vaRightPinhole: '',
        vaRightWithGlasses: '',
        sphRight: '',
        cylRight: '',
        axisRight: '',
        pdRight: ''
    });

    const [pageLoading, setPageLoading] = useState(true);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        const fetchRecordDetail = async () => {
            try {
                setPageLoading(true);

                const res = await axiosClient.get(`/eye-exam-records/${id}`);
                const data = res.data;

                setUpdateForm({
                    examId: data.examId || '',
                    patientName: data.patientName || '',
                    gender: data.gender || '',
                    className: data.className || '',
                    facilityName: data.facilityName || '', // ĐỌC DỮ LIỆU TỪ API TRẢ VỀ
                    campaignTitle: data.campaignTitle || '',

                    vaLeftWithoutGlasses: data.vaLeftWithoutGlasses ?? '',
                    vaLeftOldGlasses: data.vaLeftOldGlasses ?? '',
                    vaLeftPinhole: data.vaLeftPinhole ?? '',
                    vaLeftWithGlasses: data.vaLeftWithGlasses ?? '',
                    sphLeft: data.sphLeft ?? '',
                    cylLeft: data.cylLeft ?? '',
                    axisLeft: data.axisLeft ?? '',
                    pdLeft: data.pdLeft ?? '',

                    vaRightWithoutGlasses: data.vaRightWithoutGlasses ?? '',
                    vaRightOldGlasses: data.vaRightOldGlasses ?? '',
                    vaRightPinhole: data.vaRightPinhole ?? '',
                    vaRightWithGlasses: data.vaRightWithGlasses ?? '',
                    sphRight: data.sphRight ?? '',
                    cylRight: data.cylRight ?? '',
                    axisRight: data.axisRight ?? '',
                    pdRight: data.pdRight ?? ''

                });
            } catch (error) {
                console.error("Lỗi khi tải thông tin hồ sơ:", error);
                setServerError("Không thể tải thông tin hồ sơ để chỉnh sửa.");
            } finally {
                setPageLoading(false);
            }
        };

        if (id) {
            fetchRecordDetail();
        }

    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleConfirmUpdate = async (e) => {
        e.preventDefault();
        setServerError('');
        try {

            const cleanedForm = { ...updateForm };

            const numericFields = [

                'vaLeftWithoutGlasses',
                'vaLeftOldGlasses',
                'vaLeftPinhole',
                'vaLeftWithGlasses',
                'sphLeft',
                'cylLeft',
                'axisLeft',

                'vaRightWithoutGlasses',
                'vaRightOldGlasses',
                'vaRightPinhole',
                'vaRightWithGlasses',
                'sphRight',
                'cylRight',
                'axisRight'

            ];

            numericFields.forEach(field => {
                if (cleanedForm[field] === '') {
                    cleanedForm[field] = null;
                } else if (cleanedForm[field] !== null && cleanedForm[field] !== undefined) {
                    cleanedForm[field] = parseFloat(cleanedForm[field]);
                }

            });

            await axiosClient.put(
                `/eye-exam-records/edit/${cleanedForm.examId}`,
                cleanedForm
            );

            navigate('/eye-exam-records');

        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật hồ sơ."
            );

        }

    };

    const inputStyle = `w-full border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs`;
    const labelStyle = `block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5`;

    if (pageLoading) {
        return (
            <div className="p-6 bg-[#f5f7fa] h-full flex items-center justify-center font-sans">
                <div className="flex items-center gap-2 text-gray-500 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#004194] animate-ping" />
                    Đang tải dữ liệu hồ sơ khám...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950 font-sans">
            <div className="flex items-center gap-3 mb-6 w-full">
                <button
                    type="button"
                    onClick={() => navigate('/eye-exam-records')}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#004194] hover:border-blue-300 shadow-xs transition-all cursor-pointer"
                >
                    <ArrowLeft size={18}/>
                </button>

                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">
                            Chỉnh sửa hồ sơ khám
                        </h1>
                    </div>

                    <p className="text-xs text-[#004194] font-bold mt-1">
                        Học sinh: {updateForm.patientName} ({updateForm.className})
                        {updateForm.facilityName ? ` - Trường: ${updateForm.facilityName}` : ''} -
                        {updateForm.gender === "MALE" ? " Nam" : updateForm.gender === "FEMALE" ? " Nữ" : " Khác"}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full p-6 md:p-8">
                {serverError && (
                    <div className="mb-6 p-4 bg-red-50/80 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <AlertCircle size={16}/>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleConfirmUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border border-blue-200 rounded-2xl p-5 bg-white shadow-xs">
                            <h4 className="text-xs font-black text-[#004194] uppercase tracking-wider mb-4 border-b border-blue-100 pb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Mắt Trái (L)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Thị lực không kính</label>
                                    <input type="number" step="0.1" name="vaLeftWithoutGlasses" value={updateForm.vaLeftWithoutGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Thị lực kính cũ</label>
                                    <input type="number" step="0.1" name="vaLeftOldGlasses" value={updateForm.vaLeftOldGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Kính lỗ</label>
                                    <input type="number" step="0.1" name="vaLeftPinhole" value={updateForm.vaLeftPinhole} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Thị lực có kính</label>
                                    <input type="number" step="0.1" name="vaLeftWithGlasses" value={updateForm.vaLeftWithGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Độ cầu (Sph L)</label>
                                    <input type="number" step="0.25" name="sphLeft" value={updateForm.sphLeft} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Độ trụ (Cyl L)</label>
                                    <input type="number" step="0.25" name="cylLeft" value={updateForm.cylLeft} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Trục (Axis L)</label>
                                    <input type="number" min="0" max="180" name="axisLeft" value={updateForm.axisLeft} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>KCĐT</label>
                                    <input type="text" name="pdLeft" value={updateForm.pdLeft} onChange={handleInputChange} className={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div className="border border-emerald-200 rounded-2xl p-5 bg-white shadow-xs">
                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2.5 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                Mắt Phải (R)
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Thị lực không kính</label>
                                    <input type="number" step="0.1" name="vaRightWithoutGlasses" value={updateForm.vaRightWithoutGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Thị lực kính cũ</label>
                                    <input type="number" step="0.1" name="vaRightOldGlasses" value={updateForm.vaRightOldGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Kính lỗ</label>
                                    <input type="number" step="0.1" name="vaRightPinhole" value={updateForm.vaRightPinhole} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Thị lực có kính</label>
                                    <input type="number" step="0.1" name="vaRightWithGlasses" value={updateForm.vaRightWithGlasses} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Độ cầu (Sph R)</label>
                                    <input type="number" step="0.25" name="sphRight" value={updateForm.sphRight} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Độ trụ (Cyl R)</label>
                                    <input type="number" step="0.25" name="cylRight" value={updateForm.cylRight} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>Trục (Axis R)</label>
                                    <input type="number" min="0" max="180" name="axisRight" value={updateForm.axisRight} onChange={handleInputChange} className={inputStyle} />
                                </div>

                                <div>
                                    <label className={labelStyle}>KCĐT</label>
                                    <input type="text" name="pdRight" value={updateForm.pdRight} onChange={handleInputChange} className={inputStyle} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
                        <button type="button" onClick={() => navigate('/eye-exam-records')} className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs">
                            Hủy bỏ
                        </button>

                        <button type="submit" className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2">
                            <Save size={16}/> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );

};

export default ExamRecordFormPage;