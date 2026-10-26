import { Trash, SquarePen, Users } from "lucide-react";

const ClassTable = ({ classes, loading, page, onOpenDetail, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4.5 py-4 text-center w-12">STT</th>
                <th className="px-6 py-4">Tên lớp</th>
                <th className="px-6 py-4">Khối</th>
                <th className="px-6 py-4">Cơ sở</th>
                <th className="px-6 py-4">Năm học</th>
                <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr>
                    <td colSpan="6" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">Đang tải dữ liệu...</td>
                </tr>
            ) : classes.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">Không tìm thấy dữ liệu</td>
                </tr>
            ) : (
                classes.map((cls, index) => (
                    <tr key={cls.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                        <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">{(page * 10) + index + 1}</td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">{cls.className}</td>
                        <td className="px-6 py-4 text-gray-600 text-xs font-semibold">{cls.grade}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{cls.facilityName || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{cls.schoolYear}</td>
                        <td className="px-6 py-4 text-center align-middle">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onOpenDetail(cls)}
                                    className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                    title="Xem chi tiết"
                                >
                                    <Users size={16}/>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onEdit(cls)}
                                    className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                    title="Chỉnh sửa"
                                >
                                    <SquarePen size={16}/>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(cls)}
                                    className="inline-flex p-2 bg-gradient-to-l from-white to-red-50/30 border border-gray-200 text-gray-500 rounded-lg hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer"
                                    title="Xóa lớp"
                                >
                                    <Trash size={16}/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
            </tbody>
        </table>
    </div>
);
export default ClassTable;