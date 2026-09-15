import React from 'react';

const Y_AXIS_STEPS = [100, 75, 50, 25, 0];

const AnalyticsCharts = ({ gradeStats = [], facilityStats = [], animateBars = true }) => {
    const isSingleFacility = facilityStats && facilityStats.length === 1;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* 1. Tỷ lệ cận thị theo khối lớp */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900">Tỷ lệ cận thị theo khối lớp</h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Đơn vị: %
                    </span>
                </div>

                <div className="w-full h-64 flex flex-col">
                    {gradeStats && gradeStats.length > 0 ? (
                        <div className="flex h-full w-full">
                            {/* Trục Y */}
                            <div className="flex flex-col justify-between pr-3 text-[11px] font-medium text-gray-400 select-none pb-7 text-right w-10">
                                {Y_AXIS_STEPS.map((val) => (
                                    <span key={val}>{val}%</span>
                                ))}
                            </div>

                            {/* Khu vực vẽ biểu đồ */}
                            <div className="flex-1 flex flex-col h-full">
                                <div className="relative flex-1 border-b border-gray-200 flex items-end justify-around px-4">
                                    {/* Gridlines ngang */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        {Y_AXIS_STEPS.map((_, i) => (
                                            <div key={i} className="w-full border-b border-dashed border-gray-150 h-0" />
                                        ))}
                                    </div>

                                    {/* Các cột */}
                                    {gradeStats.map((item, index) => (
                                        <div
                                            key={index}
                                            className="relative flex flex-col items-center h-full justify-end group z-10 w-full max-w-[72px]"
                                        >
                                            {/* Tooltip / Nhãn giá trị */}
                                            <span
                                                className="absolute text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shadow-xs mb-1 select-none transition-all duration-700 ease-out whitespace-nowrap"
                                                style={{ bottom: animateBars ? `${item.myopiaRate}%` : '0%' }}
                                            >
                                                {item.myopiaRate}%
                                            </span>

                                            {/* Thanh Bar */}
                                            <div
                                                className="w-10 sm:w-12 bg-blue-600 rounded-t-md hover:bg-blue-700 transition-all duration-700 ease-out"
                                                style={{ height: animateBars ? `${item.myopiaRate}%` : '0%' }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Trục X */}
                                <div className="h-7 flex justify-around items-center px-4 pt-2">
                                    {gradeStats.map((item, index) => (
                                        <div key={index} className="w-full max-w-[72px] text-center">
                                            <p className="text-xs font-semibold text-gray-600 truncate">
                                                {item.gradeName}
                                            </p>
                                        </div>
                                    ))}
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

            {/* 2. Tỷ lệ cận thị giữa các trường học */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-900">
                        {isSingleFacility ? 'Tỷ lệ cận thị trường học' : 'Tỷ lệ cận thị giữa các trường học'}
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        Đơn vị: %
                    </span>
                </div>

                <div className="w-full h-64 flex items-center">
                    {facilityStats && facilityStats.length > 0 ? (
                        isSingleFacility ? (
                            /* Giao diện Metric Card khi chỉ có 1 trường */
                            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50/70 rounded-xl p-6 border border-slate-100">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    {facilityStats[0].facilityName}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold text-blue-600 tracking-tight">
                                        {facilityStats[0].rate}
                                    </span>
                                    <span className="text-2xl font-bold text-blue-500">%</span>
                                </div>
                                <div className="w-48 bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: animateBars ? `${facilityStats[0].rate}%` : '0%' }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Tỷ lệ học sinh mắc tật khúc xạ</p>
                            </div>
                        ) : (
                            /* Giao diện Biểu đồ thanh ngang khi có từ 2 trường trở lên */
                            <div className="flex flex-col justify-center gap-3 w-full h-full overflow-y-auto pr-1">
                                {facilityStats.map((item, index) => (
                                    <div key={index} className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                                            <span className="truncate max-w-[70%]" title={item.facilityName}>
                                                {item.facilityName}
                                            </span>
                                            <span className="text-blue-600">{item.rate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: animateBars ? `${item.rate}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
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