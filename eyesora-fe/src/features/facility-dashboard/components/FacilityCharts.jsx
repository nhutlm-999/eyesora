import React from 'react';

const FacilityCharts = ({ gradeStats, animateBars }) => {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col mb-6">
            <div className="mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-base font-bold text-gray-900">Tỷ lệ cận thị theo khối lớp</h3>
            </div>
            <div className="flex flex-col w-full h-72">
                {gradeStats && gradeStats.length > 0 ? (
                    <>
                        <div className="relative flex-1 border-t border-r border-l border-b border-gray-200 rounded-t-xl flex items-end justify-around bg-gradient-to-b from-gray-50/30 to-white">
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full border-b border-dashed border-gray-200 h-0"></div>
                                ))}
                            </div>

                            {gradeStats.map((item, index) => (
                                <div key={index} className="relative flex flex-col items-center w-full h-full justify-end border-r border-dashed border-gray-200 last:border-r-0">
                                        <span className="absolute text-xs font-bold text-blue-900 pb-1.5 transition-all duration-1000 select-none"
                                              style={{ bottom: animateBars ? `${item.rate}%` : '0%' }}>
                                              {item.rate}%
                                        </span>
                                    <div
                                        className="w-12 bg-gradient-to-t from-[#004194] to-blue-500 rounded-t-md transition-all duration-1000 ease-out shadow-xs"
                                        style={{ height: animateBars ? `${item.rate}%` : '0%' }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 border-b border-l border-r border-gray-200 rounded-b-xl h-9 flex justify-around items-center">
                            {gradeStats.map((item, index) => (
                                <div key={index} className="w-full text-center border-r border-gray-200 last:border-r-0">
                                    <p className="text-xs font-bold text-gray-700 select-none">
                                        {item.gradeName}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
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