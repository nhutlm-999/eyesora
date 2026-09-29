import {Download, Upload, Plus, SquarePen} from "lucide-react";
import {useNavigate} from "react-router-dom";

const ExamRecordAction = ({onAddClick}) => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center gap-2.5">
            <button
                className="flex items-center gap-1.5 px-4 py-2.5 text-[#004194] bg-white font-semibold hover:bg-gray-50 transition-all text-xs rounded-xl border border-gray-200 hover:border-blue-300 shadow-xs cursor-pointer"
                onClick={() => navigate('/eye-exam-records/import')}
            >
                <Upload size={16}/>
                Nhập dữ liệu Excel
            </button>
            <button
                onClick={onAddClick}
                className="flex items-center gap-1.5 bg-gradient-to-l from-blue-500 to-[#004194] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95"
            >
                <Plus size={16}/>
                Thêm bản ghi
            </button>
        </div>
    );
};

export default ExamRecordAction;