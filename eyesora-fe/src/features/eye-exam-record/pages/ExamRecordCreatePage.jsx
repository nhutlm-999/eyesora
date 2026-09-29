import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, AlertCircle,
    UserCheck, UserPlus, Search
} from "lucide-react";
import axiosClient from "../../../shared/axios/axiosClient.js";

const ExamRecordCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const [patientMode, setPatientMode] = useState('NEW');

    const [campaigns, setCampaigns] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [classes, setClasses] = useState([]);
    const [wards, setWards] = useState([]);
    const [examiners, setExaminers] = useState([]);

    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);

    const todayStr = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        campaignId: '',
        facilityId: '',
        classId: '',
        examinerId: '',
        patientId: null,

        newPatientName: '',
        newPatientDob: '',
        newPatientGender: 'MALE',
        newPatientParentPhone: '',
        newPatientWardId: '',

        vaLeftWithoutGlasses: '', vaLeftOldGlasses: '',
        vaLeftPinhole: '', vaLeftWithGlasses: '',
        sphLeft: '', cylLeft: '', axisLeft: '', pdLeft: '',

        vaRightWithoutGlasses: '', vaRightOldGlasses: '',
        vaRightPinhole: '', vaRightWithGlasses: '',
        sphRight: '', cylRight: '', axisRight: '', pdRight: ''
    });

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [
                    campaignRes,
                    facilityRes,
                    wardRes,
                    examinerRes
                ] = await Promise.all([
                    axiosClient.get('/campaigns', { params: { size: 1000 } })
                        .catch(() => ({ data: [] })),
                    axiosClient.get('/master-data/facilities', { params: { size: 1000 } })
                        .catch(() => ({ data: {} })),
                    axiosClient.get('/master-data/wards', { params: { size: 1000 } })
                        .catch(() => ({ data: [] })),
                    axiosClient.get('/admin/users', { params: { size: 1000 } })
                        .catch(() => ({ data: {} }))
                ]);

                setCampaigns(campaignRes.data?.content || campaignRes.data || []);
                setFacilities(facilityRes.data?.content || facilityRes.data || []);
                setWards(wardRes.data?.content || wardRes.data || []);

                const userRaw = examinerRes.data;
                const listExaminers = userRaw?.content || (Array.isArray(userRaw) ? userRaw : []);
                setExaminers(listExaminers);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu cấu hình ban đầu:", error);
            }
        };
        fetchMasterData();
    }, []);

    const handleFacilityChange = async (facilityId) => {
        setClasses([]);
        setPatients([]);
        setSelectedPatient(null);
        setPatientSearch('');
        setFormData(prev => ({
            ...prev,
            facilityId: facilityId,
            classId: '',
            patientId: null,
            newPatientName: '',
            newPatientDob: '',
            newPatientWardId: ''
        }));

        if (!facilityId) return;

        try {
            const classRes = await axiosClient.get(`/master-data/classes`, {
                params: { facilityId: facilityId, size: 1000 }
            });
            const classRaw = classRes.data;
            const extractedClasses = classRaw?.content || (Array.isArray(classRaw) ? classRaw : []);

            const currentFacility = facilities.find(f => (f.id || f.facilityId) === facilityId);
            const nameToFilter = currentFacility?.facilityName || currentFacility?.name;
            const safeFilteredClasses = extractedClasses.filter(cls => cls.facilityName === nameToFilter);
            setClasses(safeFilteredClasses);
        } catch (error) {
            console.error("Lỗi hệ thống khi tải danh sách lớp học:", error);
        }
    };

    const handleClassChange = async (classId) => {
        setPatients([]);
        setSelectedPatient(null);
        setPatientSearch('');
        setFormData(prev => ({
            ...prev,
            classId: classId,
            patientId: null
        }));

        if (!classId || !formData.facilityId || classId === '') return;

        try {
            const patientRes = await axiosClient.get(`/patients`, {
                params: {
                    facilityId: formData.facilityId,
                    classId: classId,
                    size: 500
                }
            });
            const patientRaw = patientRes.data;
            const finalPatients = patientRaw?.content || (Array.isArray(patientRaw) ? patientRaw : []);

            const tripleCheckPatients = finalPatients.filter(p =>
                String(p.facilityId) === String(formData.facilityId) &&
                String(p.classId) === String(classId)
            );

            setPatients(tripleCheckPatients);
        } catch (error) {
            console.error("Lỗi hệ thống khi tải danh sách học sinh theo lớp:", error);
        }
    };

    const filteredPatients = useMemo(() => {
        if (!patientSearch.trim()) return patients;
        const keyword = patientSearch.toLowerCase().trim();
        return patients.filter(p =>
            (p.patientName && p.patientName.toLowerCase().includes(keyword)) ||
            (p.patientId && p.patientId.toLowerCase().includes(keyword))
        );
    }, [patients, patientSearch]);

    const handleSelectExistingPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData(prev => ({
            ...prev,
            patientId: patient.patientId || patient.id,
            campaignId: patient.campaignId || patient.campaign?.id || prev.campaignId
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setLoading(true);

        const payload = { ...formData };

        if (patientMode === 'EXISTING') {
            payload.newPatientName = null;
            payload.newPatientDob = null;
            payload.newPatientWardId = null;
            payload.newPatientParentPhone = null;

            if (!payload.patientId) {
                setServerError("Vui lòng chọn một học sinh trong danh sách trước khi lưu.");
                setLoading(false);
                return;
            }
        } else {
            payload.patientId = null;
        }

        const floatFields = [
            'vaLeftWithoutGlasses', 'vaLeftOldGlasses', 'vaLeftPinhole',
            'vaLeftWithGlasses', 'sphLeft', 'cylLeft',
            'vaRightWithoutGlasses', 'vaRightOldGlasses', 'vaRightPinhole',
            'vaRightWithGlasses', 'sphRight', 'cylRight'
        ];
        floatFields.forEach(field => {
            if (payload[field] === '') payload[field] = null;
            else if (payload[field] !== null) payload[field] = parseFloat(payload[field]);
        });

        const intFields = ['axisLeft', 'axisRight'];
        intFields.forEach(field => {
            if (payload[field] === '') payload[field] = null;
            else if (payload[field] !== null) payload[field] = parseInt(payload[field], 10);
        });

        Object.keys(payload).forEach(key => {
            if (payload[key] === '') payload[key] = null;
        });

        try {
            await axiosClient.post('/eye-exam-records', payload);
            navigate('/eye-exam-records');
        } catch (error) {
            console.error("Chi tiết lỗi nhận được từ Hệ thống:", error);

            if (error.response && error.response.data) {
                const backendData = error.response.data;

                if (backendData.message) {
                    setServerError(backendData.message);
                } else if (typeof backendData === 'string') {
                    setServerError(backendData);
                } else if (backendData.errors && Array.isArray(backendData.errors)) {
                    const validationMessages = backendData.errors
                        .map(err => err.defaultMessage || err.message)
                        .join(' | ');
                    setServerError(`Lỗi nhập liệu: ${validationMessages}`);
                } else {
                    setServerError(JSON.stringify(backendData));
                }
            } else if (error.request) {
                setServerError("Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra lại mạng.");
            } else {
                setServerError(`Lỗi khởi tạo yêu cầu: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = `w-full border border-gray-300 bg-white px-4 py-2.5 rounded-xl text-gray-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs`;
    const labelStyle = `block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5`;

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950 font-sans">
            {/* Thanh tiêu đề */}
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
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Thêm mới hồ sơ khám mắt</h1>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                        Khởi tạo hoặc liên kết kết quả kiểm tra thị lực cho học sinh bệnh nhân
                    </p>
                </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#004194]"></span>
                        Hình thức nhập thông tin học sinh:
                    </span>
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner w-full sm:w-fit">
                        <button
                            type="button"
                            onClick={() => setPatientMode('NEW')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${patientMode === 'NEW' ? 'bg-white text-[#004194] shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <UserPlus size={14}/> Học sinh mới tại chỗ
                        </button>
                        <button
                            type="button"
                            onClick={() => setPatientMode('EXISTING')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${patientMode === 'EXISTING' ? 'bg-white text-[#004194] shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <UserCheck size={14}/> Học sinh có sẵn trong lớp
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h4 className="text-xs font-black text-[#004194] uppercase tracking-wider mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#004194]"></span>
                        1. Thông tin vị trí & Đối tượng cấu hình
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelStyle}>Chiến dịch <span className="text-rose-500">*</span></label>
                            <select
                                name="campaignId"
                                required
                                value={formData.campaignId}
                                onChange={handleInputChange}
                                className={inputStyle}
                            >
                                <option value="">-- Chọn chiến dịch --</option>
                                {campaigns.map(c => (
                                    <option key={c.campaignId || c.id} value={c.campaignId || c.id}>
                                        {c.campaignTitle || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Trường học <span className="text-rose-500">*</span></label>
                            <select
                                name="facilityId"
                                required
                                value={formData.facilityId}
                                onChange={(e) => handleFacilityChange(e.target.value)}
                                className={inputStyle}
                            >
                                <option value="">-- Chọn trường học --</option>
                                {facilities.map(f => (
                                    <option key={f.id || f.facilityId} value={f.id || f.facilityId}>
                                        {f.facilityName || f.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Lớp học <span className="text-rose-500">*</span></label>
                            <select
                                name="classId"
                                required
                                value={formData.classId}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className={inputStyle}
                            >
                                <option value="">-- Chọn lớp học --</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.className}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Người khám <span className="text-rose-500">*</span></label>
                            <select
                                name="examinerId"
                                required
                                value={formData.examinerId}
                                onChange={handleInputChange}
                                className={inputStyle}
                            >
                                <option value="">-- Chọn người khám --</option>
                                {examiners.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName || u.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h4 className="text-xs font-black text-[#004194] uppercase tracking-wider border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#004194]"></span>
                        2. Chi tiết học sinh nhận bản ghi khám
                    </h4>

                    {patientMode === 'NEW' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div>
                                <label className={labelStyle}>Họ và tên <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    name="newPatientName"
                                    required={patientMode === 'NEW'}
                                    value={formData.newPatientName}
                                    onChange={handleInputChange}
                                    placeholder="Nguyễn Văn A"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Ngày sinh <span className="text-rose-500">*</span></label>
                                <input
                                    type="date"
                                    name="newPatientDob"
                                    required={patientMode === 'NEW'}
                                    max={todayStr}
                                    value={formData.newPatientDob}
                                    onChange={handleInputChange}
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Giới tính <span className="text-rose-500">*</span></label>
                                <select
                                    name="newPatientGender"
                                    value={formData.newPatientGender}
                                    onChange={handleInputChange}
                                    className={inputStyle}
                                >
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelStyle}>SĐT Phụ huynh</label>
                                <input
                                    type="tel"
                                    name="newPatientParentPhone"
                                    value={formData.newPatientParentPhone}
                                    onChange={handleInputChange}
                                    placeholder="0912345xxx"
                                    className={inputStyle}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Phường/Xã cư trú <span className="text-rose-500">*</span></label>
                                <select
                                    name="newPatientWardId"
                                    required={patientMode === 'NEW'}
                                    value={formData.newPatientWardId}
                                    onChange={handleInputChange}
                                    className={inputStyle}
                                >
                                    <option value="">-- Chọn Phường/Xã --</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.id}>{w.wardName || w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {patientMode === 'EXISTING' && (
                        <div className="space-y-4">
                            {!formData.facilityId || !formData.classId ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-xs font-semibold text-gray-500">
                                    ⚠️ Vui lòng chọn cả "Trường học" và "Lớp học" ở mục 1 để hiển thị danh sách học sinh.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1 border border-gray-200 rounded-xl p-3.5 bg-gray-50/40 space-y-3 flex flex-col max-h-[340px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 text-gray-400" size={15}/>
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm tên học sinh..."
                                                value={patientSearch}
                                                onChange={(e) => setPatientSearch(e.target.value)}
                                                className="w-full border border-gray-300 bg-white pl-9 pr-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all"
                                            />
                                        </div>

                                        <div className="overflow-y-auto flex-1 border border-gray-200 rounded-xl bg-white scrollbar-thin divide-y divide-gray-100">
                                            {filteredPatients.length === 0 ? (
                                                <div className="text-center py-8 text-xs font-medium text-gray-400">
                                                    Không có học sinh nào trong lớp này
                                                </div>
                                            ) : (
                                                filteredPatients.map(p => {
                                                    const isSelected = selectedPatient &&
                                                        (selectedPatient.patientId === p.patientId || selectedPatient.id === p.id);
                                                    return (
                                                        <button
                                                            key={p.patientId || p.id}
                                                            type="button"
                                                            onClick={() => handleSelectExistingPatient(p)}
                                                            className={`w-full text-left px-3 py-2.5 text-xs transition-colors block 
                                                            ${isSelected ? 'bg-blue-50/70 text-[#004194] font-bold border-l-4 border-[#004194]' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        >
                                                            <div className="font-bold truncate">{p.patientName}</div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5">Mã số: {p.patientId || 'N/A'}</div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 border border-gray-200 bg-white rounded-xl p-4 flex flex-col justify-center items-center min-h-[160px]">
                                        {selectedPatient ? (
                                            <div className="w-full space-y-3">
                                                <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                                                    <div className="bg-blue-50 text-[#004194] p-2 rounded-xl border border-blue-100">
                                                        <UserCheck size={18}/>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold text-gray-900">{selectedPatient.patientName}</h5>
                                                        <p className="text-[11px] font-medium text-gray-500">Ghi nhận bản ghi kiểm tra thị lực cho học sinh này.</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
                                                    <div className="bg-gray-50/80 border border-gray-200 p-2.5 rounded-xl">
                                                        <span className="text-gray-400 block font-bold text-[10px] uppercase">Mã học sinh</span>
                                                        <span className="text-gray-900">{selectedPatient.patientId || 'N/A'}</span>
                                                    </div>
                                                    <div className="bg-gray-50/80 border border-gray-200 p-2.5 rounded-xl">
                                                        <span className="text-gray-400 block font-bold text-[10px] uppercase">Ngày sinh</span>
                                                        <span className="text-gray-900">{selectedPatient.dob || '---'}</span>
                                                    </div>
                                                    <div className="bg-gray-50/80 border border-gray-200 p-2.5 rounded-xl">
                                                        <span className="text-gray-400 block font-bold text-[10px] uppercase">Giới tính</span>
                                                        <span className="text-gray-900">
                                                            {selectedPatient.gender === 'MALE' ? 'Nam' : selectedPatient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-1">
                                                <div className="text-[#004194]/30 font-bold text-3xl">👤</div>
                                                <div className="text-xs font-bold text-gray-400">Chưa chọn học sinh</div>
                                                <div className="text-[10px] text-gray-400 max-w-[280px]">
                                                    Hãy click chọn một học sinh từ danh sách lớp bên trái.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {serverError && (
                    <div className="p-4 bg-red-50/80 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                        <AlertCircle size={18}/> {serverError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border border-blue-200 rounded-2xl p-5 bg-white shadow-xs">
                        <h4 className="text-xs font-black text-[#004194] uppercase tracking-wider mb-4 border-b border-blue-100 pb-2.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Mắt Trái (L)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Thị lực không kính <span className="text-rose-500">*</span></label><input type="number" min="0" required name="vaLeftWithoutGlasses" value={formData.vaLeftWithoutGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Thị lực kính cũ</label><input type="number" min="0" name="vaLeftOldGlasses" value={formData.vaLeftOldGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Kính lỗ</label><input type="number" min="0" name="vaLeftPinhole" value={formData.vaLeftPinhole} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Thị lực có kính</label><input type="number" min="0" name="vaLeftWithGlasses" value={formData.vaLeftWithGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Độ cầu (Sph L)</label><input type="number" max="0" name="sphLeft" value={formData.sphLeft} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Độ trụ (Cyl L)</label><input type="number" max="0" name="cylLeft" value={formData.cylLeft} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Trục (Axis L)</label><input type="number" min="0" max="180" name="axisLeft" value={formData.axisLeft} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>KCĐT</label><input type="text" name="pdLeft" value={formData.pdLeft} onChange={handleInputChange} className={inputStyle} /></div>
                        </div>
                    </div>

                    {/* Mắt Phải */}
                    <div className="border border-emerald-200 rounded-2xl p-5 bg-white shadow-xs">
                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-4 border-b border-emerald-100 pb-2.5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            Mắt Phải (R)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Thị lực không kính <span className="text-rose-500">*</span></label><input type="number" min="0" required name="vaRightWithoutGlasses" value={formData.vaRightWithoutGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Thị lực kính cũ</label><input type="number" min="0" name="vaRightOldGlasses" value={formData.vaRightOldGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Kính lỗ</label><input type="number" min="0" name="vaRightPinhole" value={formData.vaRightPinhole} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Thị lực có kính</label><input type="number" min="0" name="vaRightWithGlasses" value={formData.vaRightWithGlasses} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Độ cầu (Sph R)</label><input type="number" max="0" name="sphRight" value={formData.sphRight} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Độ trụ (Cyl R)</label><input type="number" max="0" name="cylRight" value={formData.cylRight} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Trục (Axis R)</label><input type="number" min="0" max="180" name="axisRight" value={formData.axisRight} onChange={handleInputChange} className={inputStyle} /></div>
                            <div><label className={labelStyle}>KCĐT</label><input type="text" name="pdRight" value={formData.pdRight} onChange={handleInputChange} className={inputStyle} /></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/eye-exam-records')}
                        className="px-5 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        <Save size={16}/> {loading ? 'Đang tạo...' : 'Lưu bản ghi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExamRecordCreatePage;