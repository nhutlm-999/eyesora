import React from 'react';
import { X } from "lucide-react";

const PatientDetailModal = ({ patient, onClose, formatDate }) => {
    if (!patient) return null;

    const renderGender = (gender) => {
        if (gender === 'MALE') return 'Nam';
        if (gender === 'FEMALE') return 'Nữ';
        return '---';
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-950">Chi tiết học sinh</h2>
                        <p className="text-sm font-semibold text-blue-900 mt-1">Học sinh: {patient.patientName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <X size={22} className="text-gray-400"/>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                    <div><span className="text-gray-500 font-medium">Mã HS:</span> <p className="font-bold text-gray-950">{patient.patientId || "-"}</p></div>
                    <div><span className="text-gray-500 font-medium">Ngày sinh:</span> <p className="font-bold text-gray-950">{formatDate(patient.dob)}</p></div>
                    <div className="col-span-2"><span className="text-gray-500 font-medium">Chiến dịch:</span> <p className="font-bold text-gray-950">{patient.campaignTitle || "-"}</p></div>
                    <div className="col-span-2"><span className="text-gray-500 font-medium">Địa chỉ (Phường/Xã):</span> <p className="font-bold text-gray-950">{patient.wardName || "-"}</p></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Thông tin học tập</h4>
                        <div className="space-y-4">
                            <InfoRow label="Lớp" value={patient.className} />
                            <InfoRow label="Cơ sở" value={patient.facilityName} />
                        </div>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Thông tin cá nhân</h4>
                        <div className="space-y-4">
                            <InfoRow label="Giới tính" value={renderGender(patient.gender)} />
                            <InfoRow label="SĐT" value={patient.parentPhone} />
                        </div>
                    </div>
                </div>

                <button type="button" onClick={onClose} className="w-full mt-8 py-4 bg-gray-950 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 cursor-pointer">
                    Đóng chi tiết
                </button>
            </div>
        </div>
    );
};
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-black text-blue-900">{value || "---"}</span>
    </div>
);

export default PatientDetailModal;