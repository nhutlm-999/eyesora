import React from 'react';

const Y_AXIS_STEPS = [100, 75, 50, 25, 0];

const AnalyticsCharts = ({ gradeStats = [], facilityStats = [], animateBars = true }) => {
    const isSingleFacility = facilityStats && facilityStats.length === 1;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full font-sans">
            {/* Tỷ lệ cận thị theo khối lớp */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900">
                        Tỷ lệ cận thị theo khối lớp
                    </h3>

                    <span className="text-xs text-gray-800 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Đơn vị: %
                    </span>
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
                                            const rate = item.myopiaRate || 0;

                                            // Đổi màu theo tỷ lệ
                                            let barColor = "bg-orange-400 hover:bg-orange-500";

                                            if (rate >= 80) {
                                                barColor = "bg-red-500 hover:bg-red-600";
                                            } else if (rate >= 50) {
                                                barColor = "bg-orange-500 hover:bg-orange-600";
                                            }

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col items-center h-full justify-end group z-10 w-full max-w-[64px]"
                                                >
                                                    <div
                                                        className={`relative w-9 sm:w-11 rounded-t-md transition-all duration-700 ease-out shadow-xs ${barColor}`}
                                                        style={{
                                                            height: animateBars ? `${rate}%` : '0%'
                                                        }}
                                                    >
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
                        <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 italic">
                            Không có dữ liệu phân tích theo khối lớp
                        </div>
                    )}
                </div>
            </div>

            {/* Tỷ lệ cận thị giữa các trường học */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900">
                        {isSingleFacility
                            ? 'Tỷ lệ cận thị trường học'
                            : 'Tỷ lệ cận thị giữa các trường học'}
                    </h3>

                    <span className="text-xs text-gray-800 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Đơn vị: %
                    </span>
                </div>

                <div className="w-full h-80 flex items-center pt-6">
                    {facilityStats && facilityStats.length > 0 ? (
                        isSingleFacility ? (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-orange-50/40 rounded-xl p-6 border border-orange-100">
                                <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-2">
                                    {facilityStats[0].facilityName}
                                </span>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-orange-600 tracking-tight">
                                        {facilityStats[0].rate}
                                    </span>

                                    <span className="text-2xl font-bold text-orange-500">
                                        %
                                    </span>
                                </div>

                                <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: animateBars
                                                ? `${facilityStats[0].rate}%`
                                                : '0%'
                                        }}
                                    />
                                </div>

                                <p className="text-xs text-gray-500 mt-2 font-medium">
                                    Tỷ lệ học sinh mắc tật khúc xạ
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center gap-3 w-full h-full overflow-y-auto pr-1">
                                {facilityStats.map((item, index) => {
                                    const rate = item.rate || 0;

                                    // Đổi màu theo tỷ lệ
                                    let progressColor = "bg-orange-400";

                                    if (rate >= 80) {
                                        progressColor = "bg-red-500";
                                    } else if (rate >= 50) {
                                        progressColor = "bg-orange-500";
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-1"
                                        >
                                            <div className="flex justify-between text-xs font-semibold text-gray-700">
                                                <span
                                                    className="truncate max-w-[70%]"
                                                    title={item.facilityName}
                                                >
                                                    {item.facilityName}
                                                </span>

                                                <span className="text-orange-600 font-bold">
                                                    {rate}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                <div
                                                    className={`${progressColor} h-full rounded-full transition-all duration-1000 ease-out`}
                                                    style={{
                                                        width: animateBars
                                                            ? `${rate}%`
                                                            : '0%'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 italic">
                            Không có dữ liệu phân tích theo trường học
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;