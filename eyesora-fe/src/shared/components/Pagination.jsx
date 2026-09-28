import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex items-center gap-1.5 select-none">
            <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
                title="Trang trước"
            >
                <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
                if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    return (
                        <button
                            key={i}
                            onClick={() => onPageChange(i)}
                            className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                currentPage === i
                                    ? 'bg-gradient-to-l from-blue-500 to-[#004194] text-white shadow-xs scale-105'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-900 shadow-2xs'
                            }`}
                        >
                            {i + 1}
                        </button>
                    );
                }
                if (i === currentPage - 2 || i === currentPage + 2) {
                    return <span key={i} className="px-1 text-gray-400 font-bold select-none text-xs">...</span>;
                }
                return null;
            })}

            <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all cursor-pointer shadow-2xs disabled:cursor-not-allowed"
                title="Trang sau"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;