import { ArrowLeft, Download } from 'lucide-react';

const PageHeader = ({ onBack, onDownloadTemplate }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 w-full font-sans">
        <div className="flex items-center gap-3">
            <button
                onClick={onBack}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-[#004194] hover:border-blue-300 shadow-xs transition-all cursor-pointer flex items-center justify-center"
            >
                <ArrowLeft size={18} />
            </button>
            <div>
                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Import hồ sơ bằng Excel / CSV</h1>
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-1">Thêm danh sách học sinh hàng loạt vào hệ thống lâm sàng</p>
            </div>
        </div>

        <button
            onClick={onDownloadTemplate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 text-[#004194] font-semibold hover:bg-gray-50 hover:border-blue-300 transition-all rounded-xl text-xs shadow-xs cursor-pointer w-fit"
        >
            <Download size={16} /> Tải file Excel mẫu
        </button>
    </div>
);

export default PageHeader;