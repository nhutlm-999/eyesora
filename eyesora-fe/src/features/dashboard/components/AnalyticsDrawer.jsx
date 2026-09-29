import { X, TrendingUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const AnalyticsDrawer = ({ isOpen, onClose, type, gradeStats, facilityStats }) => {
    

    // Helper functions for analysis
    const getGradeAnalysis = () => {
        if (!gradeStats || gradeStats.length === 0) return null;
        
        // Sort by rate descending
        const sorted = [...gradeStats].sort((a, b) => (b.rate || 0) - (a.rate || 0));
        const highest = sorted[0];
        const lowest = sorted[sorted.length - 1];
        
        return (
            <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Điểm nóng (Cần chú ý)
                    </h4>
                    <p className="text-sm text-orange-900">
                        <strong>Khối {highest.gradeName}</strong> đang có tỷ lệ cận thị cao nhất ({highest.rate}%). 
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
                            <span className="font-bold text-red-600">{highest.gradeName} ({highest.rate}%)</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span>Khối nguy cơ thấp nhất:</span>
                            <span className="font-bold text-green-600">{lowest.gradeName} ({lowest.rate}%)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">Khuyến nghị chuyên môn</h4>
                    <ul className="list-disc pl-4 text-sm text-blue-900 space-y-1">
                        <li><strong>Dành cho Giám đốc/Lãnh đạo:</strong> Phân bổ nguồn lực ngân sách khám mắt tập trung vào các khối có tỷ lệ trên 30%.</li>
                        <li><strong>Dành cho Bác sĩ:</strong> Lên phác đồ kiểm tra chuyên sâu (đo độ trục nhãn cầu) cho khối {highest.gradeName}.</li>
                        <li><strong>Dành cho Hiệu trưởng:</strong> Tăng cường các tiết hoạt động ngoài trời, giảm áp lực nhìn gần (màn hình) cho học sinh.</li>
                    </ul>
                </div>
            </div>
        );
    };

    const getFacilityAnalysis = () => {
        if (!facilityStats || facilityStats.length === 0) return null;
        
        // Sort by rate descending
        const sorted = [...facilityStats].sort((a, b) => (b.rate || 0) - (a.rate || 0));
        
        const top3 = sorted.slice(0, 3);
        
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-4 h-4" /> Báo động đỏ (Top Trường tỷ lệ cao)
                    </h4>
                    <div className="space-y-3">
                        {top3.map((school, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-red-900 font-medium">{idx + 1}. {school.facilityName}</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{school.rate}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-500" /> Bảng xếp hạng toàn diện
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {sorted.map((school, idx) => (
                            <div key={idx} className="flex justify-between text-xs border-b border-gray-50 pb-2">
                                <span className="text-gray-600 truncate pr-2">{idx + 1}. {school.facilityName}</span>
                                <span className="font-semibold text-gray-800">{school.rate}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">Định hướng hành động</h4>
                    <ul className="list-disc pl-4 text-sm text-blue-900 space-y-1">
                        <li><strong>Lãnh đạo Sở:</strong> Cần tổ chức đoàn thanh tra y tế học đường ưu tiên kiểm tra hệ thống ánh sáng, bàn ghế tại các trường thuộc Top 3.</li>
                        <li><strong>Cơ sở y tế:</strong> Phối hợp với Top 3 trường để mở chiến dịch khám mắt lưu động khẩn cấp.</li>
                        <li><strong>Hiệu trưởng:</strong> (Với các trường Top) Rà soát lại thời khóa biểu, tăng thời gian tập thể dục giữa giờ.</li>
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
                    {type === 'grade' ? 'Phân tích theo Khối lớp' : 'Phân tích theo Trường'}
                </h2>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
                {type === 'grade' ? getGradeAnalysis() : getFacilityAnalysis()}
            </div>
        </div>
    );
};

export default AnalyticsDrawer;
