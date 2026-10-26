import { Plus } from "lucide-react";

const AddressActions = ({ onAdd }) => (
    <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-gradient-to-l from-blue-500 to-[#004194] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm active:scale-95"
    >
        <Plus size={16} /> Thêm mới
    </button>
);
export default AddressActions;