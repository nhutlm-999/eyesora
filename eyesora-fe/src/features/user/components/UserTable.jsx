import { Eye, SquarePen, Lock, Unlock } from "lucide-react";

const UserTable = ({ users, loading, onDetail, onEdit, onToggle }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Tên đăng nhập</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Hành động</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr>
                    <td colSpan="3" className="text-center py-12 text-sm text-gray-400 font-medium italic bg-gray-50/30">Đang tải danh sách tài khoản...</td>
                </tr>
            ) : users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="px-6 py-4 font-bold text-sm text-gray-900">{u.username}</td>
                    <td className="px-6 py-4 text-center align-middle">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border shadow-xs ${
                            u.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => onDetail(u)}
                                className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                title="Xem chi tiết"
                            >
                                <Eye size={16}/>
                            </button>
                            <button
                                type="button"
                                onClick={() => onEdit(u)}
                                className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                title="Chỉnh sửa"
                            >
                                <SquarePen size={16}/>
                            </button>
                            <button
                                type="button"
                                onClick={() => onToggle(u)}
                                className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-amber-600 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer"
                                title={u.status === 'ACTIVE' ? "Tạm khóa" : "Mở khóa"}
                            >
                                {u.status === 'ACTIVE' ? <Lock size={16}/> : <Unlock size={16}/>}
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);
export default UserTable;