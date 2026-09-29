import React from 'react';

const MyopiaTimelineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">Tiến trình tật khúc xạ theo thời gian</h3>
                <div className="h-64 flex items-center justify-center text-sm text-gray-400 italic">
                    Không có dữ liệu
                </div>
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => Math.max(d.mild || 0, d.moderate || 0, d.severe || 0)), 10);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Tiến trình tật khúc xạ theo thời gian</h3>
            
            <div className="flex justify-end gap-4 mb-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span><span className="text-xs">Nhẹ</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-xs">Vừa</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span><span className="text-xs">Nặng</span></div>
            </div>

            <div className="h-64 flex items-end gap-2 pb-6 relative">
                {/* Y-axis */}
                <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-xs text-gray-400 pb-6 border-r border-gray-100 pr-1">
                    <span>{maxVal}</span>
                    <span>{Math.floor(maxVal/2)}</span>
                    <span>0</span>
                </div>
                
                <div className="flex-1 flex items-end justify-around pl-10 h-full border-b border-gray-100">
                    {data.map((item, index) => {
                        const mildH = ((item.mild || 0) / maxVal) * 100;
                        const modH = ((item.moderate || 0) / maxVal) * 100;
                        const sevH = ((item.severe || 0) / maxVal) * 100;
                        return (
                            <div key={index} className="flex flex-col items-center flex-1 group">
                                <div className="flex items-end justify-center gap-1 w-full h-full relative">
                                    <div className="w-1/3 max-w-[12px] bg-yellow-400 rounded-t-sm transition-all relative group-hover:opacity-80" style={{ height: `${mildH}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs px-1 rounded">{item.mild}</div>
                                    </div>
                                    <div className="w-1/3 max-w-[12px] bg-orange-500 rounded-t-sm transition-all relative group-hover:opacity-80" style={{ height: `${modH}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs px-1 rounded">{item.moderate}</div>
                                    </div>
                                    <div className="w-1/3 max-w-[12px] bg-red-600 rounded-t-sm transition-all relative group-hover:opacity-80" style={{ height: `${sevH}%` }}>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-xs px-1 rounded">{item.severe}</div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2 truncate w-full text-center" title={item.date || item.period}>{item.date || item.period}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyopiaTimelineChart;
