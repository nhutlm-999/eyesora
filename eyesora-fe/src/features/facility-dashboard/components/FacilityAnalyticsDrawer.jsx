import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

const FacilityAnalyticsDrawer = ({ isOpen, onClose, gradeStats }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        // Simulate API delay or calculate directly from gradeStats
        const timer = setTimeout(() => {
            if (gradeStats && gradeStats.length > 0) {
                let highest = gradeStats[0];
                let lowest = gradeStats[0];
                
                gradeStats.forEach(stat => {
                    if (stat.rate > highest.rate) highest = stat;
                    if (stat.rate < lowest.rate) lowest = stat;
                });

                setData({
                    highestGrade: highest.gradeName,
                    highestRate: highest.rate,
                    lowestGrade: lowest.gradeName,
                    lowestRate: lowest.rate,
                    autoInsights: [
                        `Khối ${highest.gradeName} đang có tỷ lệ báo động (${highest.rate}%), cần theo dõi sát sao.`,
                        `Khối ${lowest.gradeName} có tỷ lệ an toàn nhất (${lowest.rate}%).`,
                    ]
                });
            } else {
                setData(null);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen, gradeStats]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (loading) return <div className="text-center text-gray-500 py-10">Đang phân tích dữ liệu...</div>;
        if (!data) return <div className="text-center text-gray-500 py-10">Không có dữ liệu phân tích.</div>;
        
        return (
            <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Điểm nóng (Cần chú ý)
                    </h4>
                    <p className="text-sm text-orange-900">
                        <strong>{data.highestGrade}</strong> đang có tỷ lệ mắc tật khúc xạ cao nhất ({data.highestRate}%). 
                        Cần có biện pháp can thiệp và ưu tiên khám mắt định kỳ cho học sinh khối này.
                    </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-500" /> Tổng quan các khối
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex justify-between border-b pb-2">
                            <span>Khối nguy cơ cao nhất:</span>
                            <span className="font-bold text-red-600">{data.highestGrade} ({data.highestRate}%)</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span>Khối nguy cơ thấp nhất:</span>
                            <span className="font-bold text-green-600">{data.lowestGrade} ({data.lowestRate}%)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">Insight Tự động (Từ hệ thống)</h4>
                    <ul className="list-disc pl-4 text-sm text-blue-900 space-y-2">
                        {data.autoInsights && data.autoInsights.map((insight, idx) => (
                            <li key={idx}><strong>{insight}</strong></li>
                        ))}
                        <li><strong>Dành cho nhà trường:</strong> Tăng cường các tiết hoạt động ngoài trời, giảm áp lực nhìn gần (màn hình) cho học sinh.</li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">
                    📊 Phân tích theo Khối lớp
                </h2>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default FacilityAnalyticsDrawer;
