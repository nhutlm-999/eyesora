import { Plus } from "lucide-react";

const UserAction = ({ onAddClick }) => (
    <button
        onClick={onAddClick}
        className="flex items-center gap-2 bg-gradient-to-l from-blue-500 to-[#004194] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all shadow-sm cursor-pointer"
    >
        <Plus size={16} /> Thêm tài khoản
    </button>
);
export default UserAction;