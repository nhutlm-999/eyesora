import { Eye, SquarePen } from "lucide-react";

const FacilityTable = ({ facilities, page, onEdit, onView }) => {

    const getFacilityTypeConfig = (type) => {
        const typeLower = type?.toLowerCase();

        const configs = {
            school: { label: 'Trường học', style: 'bg-purple-100 text-purple-800 border-purple-200' },
            hospital: { label: 'Bệnh viện', style: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
            clinic: { label: 'Phòng khám', style: 'bg-amber-100 text-amber-800 border-amber-200' },
        };

        return configs[typeLower] || { label: type || 'N/A', style: 'bg-gray-100 text-gray-800 border-gray-200' };
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4.5 py-4 text-center w-12">STT</th>
                    <th className="px-6 py-4">Tên cơ sở</th>
                    <th className="px-6 py-4 text-center">Loại hình</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {facilities.map((f, index) => {
                    const config = getFacilityTypeConfig(f.facilityType);
                    return (
                        <tr key={f.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                            <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">{(page * 10) + index + 1}</td>
                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{f.facilityName}</td>
                            <td className="px-6 py-4 text-center align-middle">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs ${config.style}`}>
                                    {config.label}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onView(f.id)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit(f.id)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <SquarePen size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default FacilityTable;