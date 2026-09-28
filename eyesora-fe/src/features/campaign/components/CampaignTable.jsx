import { Eye, Lock, Unlock, Trash2, Edit2 } from "lucide-react";

const CampaignTable = ({ campaigns, onOpenDetail, onToggleStatus, onDelete, onEdit }) => {

    const getStatusLabel = (status) => {
        return status === 'LOCKED' ? "Đã khóa" : "Hoạt động";
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Tên chiến dịch</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Người quản lý</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {campaigns.length > 0 ? (
                    campaigns.map((c) => (
                        <tr key={c.campaignId} className="hover:bg-blue-50/30 transition-colors duration-150">
                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{c.campaignTitle}</td>
                            <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                                {c.startDate} <br /> đến {c.endDate}
                            </td>
                            <td className="px-6 py-4 text-gray-800 text-sm font-semibold">{c.managerName}</td>
                            <td className="px-6 py-4 text-center align-middle">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs ${
                                    c.status === 'LOCKED'
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                    {getStatusLabel(c.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onOpenDetail(c)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(c.campaignId)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 size={16}/>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onToggleStatus(c)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-amber-600 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer"
                                        title={c.status === 'LOCKED' ? "Mở khóa" : "Khóa"}
                                    >
                                        {c.status === 'LOCKED' ? <Unlock size={16}/> : <Lock size={16}/>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(c.campaignId)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-red-50/30 border border-gray-200 text-gray-500 rounded-lg hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer"
                                        title="Xóa chiến dịch"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-400 font-medium italic bg-gray-50/30">
                            Chưa có chiến dịch nào được tạo.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignTable;