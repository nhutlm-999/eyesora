import { X } from "lucide-react";

const DetailModal = ({ campaign, onClose }) => {
    if (!campaign) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Chi tiết chiến dịch</h2>
                        <p className="text-xs font-bold text-blue-900 mt-0.5">{campaign.campaignTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-400 hover:text-gray-700"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5 text-xs">
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <span className="block font-bold text-gray-400 uppercase text-[10px] mb-1">Năm thực hiện:</span>
                            <p className="font-bold text-gray-900">{campaign.facilityYear}</p>
                        </div>
                        <div>
                            <span className="block font-bold text-gray-400 uppercase text-[10px] mb-1">Trạng thái:</span>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${campaign.status === 'LOCKED' ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                {campaign.status === 'LOCKED' ? 'Đã khóa' : 'Hoạt động'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <InfoRow label="Thời gian diễn ra" value={`${campaign.startDate} đến ${campaign.endDate}`} />
                        <InfoRow label="Người quản lý" value={campaign.managerName} />
                        <InfoRow label="Đơn vị tổ chức" value={campaign.organizationName} />
                        <InfoRow label="Trường học mục tiêu" value={campaign.targetFacilityName} />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-900 uppercase text-xs">Tổng học sinh đã khám:</span>
                        <p className="font-extrabold text-blue-950 text-2xl">{campaign.patientCount || 0}</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                >
                    Đóng chi tiết
                </button>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="border-b border-gray-100 pb-3">
        <span className="block font-bold text-gray-400 uppercase text-[10px] mb-1">{label}</span>
        <p className="font-bold text-gray-900">{value || '---'}</p>
    </div>
);

export default DetailModal;