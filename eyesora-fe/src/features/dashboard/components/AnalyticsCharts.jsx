import React from 'react';
import GradeChart from './GradeChart.jsx';

const Y_AXIS_STEPS = [100, 75, 50, 25, 0];

const AnalyticsCharts = ({ gradeStats = [], facilityStats = [], animateBars = true, onOpenAnalysis }) => {
    const isSingleFacility = facilityStats && facilityStats.length === 1;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full font-sans">
            {/* Tỷ lệ cận thị theo khối lớp dùng chung GradeChart */}
            <GradeChart
                gradeStats={gradeStats}
                animateBars={animateBars}
                onOpenAnalysis={onOpenAnalysis}
            />

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
                    <button onClick={() => onOpenAnalysis && onOpenAnalysis('facility')} className="ml-3 text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-100 font-semibold flex items-center gap-1 transition-colors">✨ Xem phân tích</button>
                </div>

                <div className="w-full h-80 flex items-center pt-6">
                    {facilityStats && facilityStats.length > 0 ? (
                        isSingleFacility ? (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-sky-50/40 rounded-xl p-6 border border-sky-100">
                                <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider mb-2">
                                    {facilityStats[0].facilityName}
                                </span>

                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-sky-600 tracking-tight">
                                        {facilityStats[0].rate}
                                    </span>

                                    <span className="text-2xl font-bold text-sky-500">
                                        %
                                    </span>
                                </div>

                                <div className="w-48 bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-l from-sky-300/80 to-sky-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
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
                                    let progressColor = "bg-sky-400";

                                    if (rate >= 80) {
                                        progressColor = "bg-red-500";
                                    } else if (rate >= 50) {
                                        progressColor = "bg-sky-500";
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

                                                <span className="text-sky-600 font-bold">
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