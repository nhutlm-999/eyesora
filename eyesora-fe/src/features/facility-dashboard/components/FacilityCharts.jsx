import React from 'react';

const Y_AXIS_STEPS = [100, 75, 50, 25, 0];

const FacilityCharts = ({ gradeStats, animateBars, onOpenAnalysis }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col mb-6">
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Tỷ lệ cận thị theo khối lớp
                </h3>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-800 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Đơn vị: %
                    </span>
                    <button onClick={() => onOpenAnalysis && onOpenAnalysis()} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-100 font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                        ✨ Xem phân tích
                    </button>
                </div>
            </div>

            <div className="w-full h-80 flex flex-col pt-2">
                {gradeStats && gradeStats.length > 0 ? (
                    <div className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-thin">
                        <div className="flex h-full w-full min-w-[540px] pr-2 pt-9">
                            {/* Trục Y */}
                            <div className="flex flex-col justify-between pr-3 text-[11px] font-medium text-gray-400 select-none pb-7 text-right w-10 shrink-0">
                                {Y_AXIS_STEPS.map((val) => (
                                    <span key={val}>{val}%</span>
                                ))}
                            </div>

                            {/* Biểu đồ */}
                            <div className="flex-1 flex flex-col h-full">
                                <div className="relative flex-1 border-b border-gray-200 flex items-end justify-around px-3">
                                    {/* Grid */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        {Y_AXIS_STEPS.map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-full border-b border-dashed border-gray-150 h-0"
                                            />
                                        ))}
                                    </div>

                                    {/* Các cột */}
                                    {gradeStats.map((item, index) => {
                                        const rate = item.rate || 0;
                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center h-full justify-end group z-10 w-full max-w-[64px]"
                                            >
                                                <div
                                                    className="relative w-9 sm:w-11 rounded-t-md flex flex-col justify-end group-hover:opacity-80"
                                                    style={{ height: animateBars ? `${rate}%` : '0%' }}
                                                >
                                                    <div className="w-full bg-gradient-to-t from-[#004194] to-blue-400 rounded-t-md transition-all duration-1000 h-full shadow-xs"></div>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 text-xs font-extrabold text-gray-900 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md shadow-xs select-none whitespace-nowrap z-20">
                                                        {rate}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Trục X */}
                                <div className="h-7 flex justify-around items-center px-3 pt-2">
                                    {gradeStats.map((item, index) => (
                                        <div
                                            key={index}
                                            className="w-full max-w-[64px] text-center"
                                        >
                                            <p
                                                className="text-xs font-semibold text-gray-600 truncate"
                                                title={item.gradeName}
                                            >
                                                {item.gradeName}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 italic bg-gray-50/50">
                        Cơ sở giáo dục được chọn chưa có dữ liệu phân tích khối lớp
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacilityCharts;