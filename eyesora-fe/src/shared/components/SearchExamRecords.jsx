import { Search } from "lucide-react";

const SearchExamRecords = ({
                               searchQuery,
                               setSearchQuery,
                               placeholder = "Tìm kiếm..."
                           }) => {
    return (
        <div className="relative w-full font-sans">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs md:text-sm font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all shadow-xs"
                placeholder={placeholder}
            />
        </div>
    );
};

export default SearchExamRecords;