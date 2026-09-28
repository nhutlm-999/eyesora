import { Plus } from "lucide-react";

const CampaignActions = ({ onAdd }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-blue-500 to-[#004194] text-white font-semibold hover:from-blue-600 hover:to-blue-900 active:scale-95 transition-all text-xs rounded-xl shadow-sm cursor-pointer"
            >
                <Plus size={16}/> Thêm chiến dịch
            </button>
        </div>
    );
};

export default CampaignActions;