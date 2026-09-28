import { CircleCheck, AlertTriangle } from 'lucide-react';

const ImportResultAlert = ({ result }) => {
    if (!result) return null;

    const isSuccessAll = result.failureCount === 0;

    return (
        <div className={`p-5 border rounded-2xl space-y-3 font-sans shadow-xs ${
            isSuccessAll ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
            <div className="flex items-center gap-2.5 font-extrabold text-sm">
                {isSuccessAll ? <CircleCheck className="text-emerald-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
                {isSuccessAll
                    ? `Import thành công hoàn toàn! (Đã lưu ${result.successCount}/${result.totalRows} dòng)`
                    : `Import hoàn tất nhưng có lỗi xuất hiện! (${result.successCount} thành công, ${result.failureCount} thất bại)`
                }
            </div>

            <div className="flex items-center gap-2.5 text-xs font-semibold mt-1">
                <span className="px-3 py-1 bg-gray-200/70 rounded-lg text-gray-800">Tổng số dòng: {result.totalRows}</span>
                <span className="px-3 py-1 bg-emerald-100/80 rounded-lg text-emerald-800 font-extrabold">Thành công: {result.successCount}</span>
                <span className="px-3 py-1 bg-rose-100/80 rounded-lg text-rose-800 font-extrabold">Lỗi dữ liệu: {result.failureCount}</span>
            </div>

            {result.errors && result.errors.length > 0 && (
                <div className="mt-4 border border-rose-200 bg-white rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-rose-50/70 px-4 py-2.5 text-xs font-bold text-rose-900 border-b border-rose-200">
                        Danh sách chi tiết lỗi cần sửa đổi trong file Excel:
                    </div>
                    <div className="max-h-[220px] overflow-y-auto scrollbar-thin text-xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 sticky top-0">
                                <th className="p-3 w-24 text-center">Vị trí dòng</th>
                                <th className="p-3">Nội dung chi tiết lỗi từ hệ thống</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                            {result.errors.map((err, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                                    <td className="p-3 text-center text-rose-700 font-bold bg-rose-50/40">Dòng {err.rowNumber}</td>
                                    <td className="p-3 text-gray-700 font-semibold">{err.errorMessage}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportResultAlert;