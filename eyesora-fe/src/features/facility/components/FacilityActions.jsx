import { Plus } from "lucide-react";

const FacilityActions = ({ onAdd }) => (
    <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-blue-500 to-[#004194] text-white rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all shadow-sm cursor-pointer"
    >
        <Plus size={16}/>
        Thêm cơ sở
    </button>
);

export default FacilityActions;