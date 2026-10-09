import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const AnalyticsDrawer = ({ isOpen, onClose, type, campaignId, startDate, endDate }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = type === 'grade' ? '/dashboard/analysis/grade' : '/dashboard/analysis/facility';
                const params = {
                    campaignId: campaignId || '',
                    startDate: startDate || '',
                    endDate: endDate || ''
                };
                const res = await axiosClient.get(endpoint, { params });
                setData(res.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu phân tích:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, type, campaignId, startDate, endDate]);

    const getGradeAnalysis = () => {
        if (loading) return <div className="text-center text-gray-500 py-10">Đang phân tích dữ liệu...</div>;
        if (!data) return <div className="text-center text-gray-500 py-10">Không có dữ liệu phân tích.</div>;
        
        return (
            <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                    <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Cảnh báo trọng điểm
                    </h4>
                    <p className="text-sm text-orange-900">
                        <strong>{data.highestGrade}</strong> ghi nhận tỷ lệ cận thị cao nhất ({data.highestRate}%). 
                        Cần ưu tiên bố trí khám sàng lọc chuyên khoa mắt và kiểm soát tiến triển cận thị cho học sinh khối này.
                    </p>
                </div>
                
                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-blue-500" /> Thống kê theo khối
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex justify-between border-b pb-2">
                            <span>Khối có tỷ lệ cao nhất:</span>
                            <span className="font-bold text-red-600">{data.highestGrade} ({data.highestRate}%)</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span>Khối có tỷ lệ thấp nhất:</span>
                            <span className="font-bold text-emerald-600">{data.lowestGrade} ({data.lowestRate}%)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">Insight Y khoa (Hệ thống tự động)</h4>
                    <ul className="list-disc pl-4 text-sm text-blue-900 space-y-2">
                        {data.autoInsights && data.autoInsights.map((insight, idx) => (
                            <li key={idx}><strong>{insight}</strong></li>
                        ))}
                        <li><strong>Khuyến nghị Ban Giám hiệu:</strong> Tăng cường thời gian hoạt động ngoài trời (tối thiểu 60 phút/ngày dưới ánh sáng tự nhiên), giảm áp lực nhìn gần (màn hình/sách vở) và đảm bảo ánh sáng phòng học đạt chuẩn (300-500 lux).</li>
                    </ul>
                </div>
            </div>
        );
    };

    const getFacilityAnalysis = () => {
        if (loading) return <div className="text-center text-gray-500 py-10">Đang phân tích dữ liệu...</div>;
        if (!data || !data.rankings) return <div className="text-center text-gray-500 py-10">Không có dữ liệu phân tích.</div>;
        
        const top3 = data.rankings.slice(0, 3);
        
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                        <ShieldAlert className="w-4 h-4" /> Báo động trọng điểm (Top trường tỷ lệ cao)
                    </h4>
                    <div className="space-y-3">
                        {top3.map((school, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-red-100/60 pb-1.5 last:border-b-0">
                                <span className="text-red-900 font-medium">{idx + 1}. {school.facilityName}</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{school.rate}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-emerald-600" /> Bảng xếp hạng các trường ({data.rankings.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {data.rankings.map((school, idx) => (
                            <div key={idx} className="flex justify-between text-xs border-b border-gray-50 pb-2">
                                <span className="text-gray-700 truncate pr-2">{idx + 1}. {school.facilityName}</span>
                                <span className="font-bold text-sky-700">{school.rate}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <h4 className="font-bold text-blue-800 mb-2">Insight Y khoa (Hệ thống tự động)</h4>
                    <ul className="list-disc pl-4 text-sm text-blue-900 space-y-2">
                        {data.autoInsights && data.autoInsights.map((insight, idx) => (
                            <li key={idx}><strong>{insight}</strong></li>
                        ))}
                        <li><strong>Khuyến nghị Y tế Cơ sở:</strong> Phối hợp với Ban Giám hiệu các trường có tỷ lệ cận cao để mở chiến dịch khám mắt lưu động, cấp đơn kính chuẩn và tư vấn giải pháp kiểm soát độ cận.</li>
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
                    {type === 'grade' ? '📊 Phân tích theo Khối lớp' : '📊 Phân tích theo Trường'}
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
