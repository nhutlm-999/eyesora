import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertTriangle, Building2, GraduationCap } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";
import RecommendationGroup from "./RecommendationGroup.jsx";

const TOP_N = 5;

const AnalyticsDrawer = ({ isOpen, onClose, type, campaignId, startDate, endDate, onViewList }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAllFacilities, setShowAllFacilities] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = type === 'grade' ? '/dashboard/analysis/grade' : '/dashboard/analysis/facility';
                const params = {
                    campaignId: campaignId || '',
                    startDate: startDate || '',
                    endDate: endDate || ''
                };
                const res = await axiosClient.get(endpoint, { params });
                if (!cancelled) {
                    setData(res.data);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Lỗi khi tải dữ liệu phân tích:", err);
                    setError("Không thể tải dữ liệu phân tích. Vui lòng kiểm tra lại kết nối.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [isOpen, type, campaignId, startDate, endDate]);

    if (!isOpen) return null;

    const recommendations = data?.recommendations || [];
    const urgentRecs = recommendations.filter(r => r.priority === 'HIGH');
    const watchRecs = recommendations.filter(r => r.priority !== 'HIGH');

    const rankings = data?.rankings || [];
    const visibleRankings = showAllFacilities ? rankings : rankings.slice(0, TOP_N);
    const maxRate = rankings.length > 0 ? Math.max(...rankings.map(r => r.rate), 1) : 1;

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-2">
                    {type === 'grade' ? (
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                    ) : (
                        <Building2 className="w-5 h-5 text-sky-600" />
                    )}
                    <h2 className="text-base font-bold text-gray-800">
                        {type === 'grade' ? 'Đề xuất & Phân tích Khối' : 'Đề xuất & Phân tích Trường'}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                    aria-label="Đóng bảng phân tích"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-3">
                        <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                        <span className="text-sm font-medium">Đang tổng hợp dữ liệu y tế...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-semibold">Đã xảy ra lỗi</p>
                            <p className="text-xs mt-1 text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Summary highlight pill */}
                        {type === 'grade' && data.highestGrade && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-gray-500">Tỷ lệ cận cao nhất:</span>
                                    <span className="font-bold text-red-600 ml-1.5">{data.highestGrade} ({data.highestRate}%)</span>
                                </div>
                                {data.lowestGrade && (
                                    <div>
                                        <span className="text-gray-500">Thấp nhất:</span>
                                        <span className="font-bold text-emerald-600 ml-1.5">{data.lowestGrade} ({data.lowestRate}%)</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Medical Recommendations Section */}
                        {recommendations.length === 0 ? (
                            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-emerald-900">Chỉ số ổn định</h4>
                                <p className="text-xs text-emerald-700 mt-1">
                                    Không ghi nhận cảnh báo bất thường vượt ngưỡng tại các nhóm được phân tích trong kỳ này.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <RecommendationGroup
                                    title="Cần ưu tiên xử lý"
                                    items={urgentRecs}
                                    defaultOpen={true}
                                    onViewList={onViewList}
                                    iconColor="text-red-500"
                                />

                                <RecommendationGroup
                                    title="Khuyến nghị theo dõi"
                                    items={watchRecs}
                                    defaultOpen={urgentRecs.length === 0}
                                    onViewList={onViewList}
                                    iconColor="text-amber-500"
                                />
                            </div>
                        )}

                        {/* Ranking breakdown for Facility */}
                        {type === 'facility' && rankings.length > 0 && (
                            <section className="pt-2 border-t border-gray-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                        Xếp hạng tỷ lệ cận ({rankings.length} trường)
                                    </h4>
                                    {typeof data.averageRate === 'number' && (
                                        <span className="text-xs text-gray-500 font-medium">
                                            TB: <strong className="text-gray-700">{data.averageRate}%</strong>
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {visibleRankings.map((school, idx) => (
                                        <div key={school.facilityName || idx} className="text-xs space-y-1">
                                            <div className="flex justify-between items-center text-gray-700">
                                                <span className="font-medium truncate pr-2 max-w-[200px]" title={school.facilityName}>
                                                    {idx + 1}. {school.facilityName}
                                                </span>
                                                <span className="font-bold text-sky-800">{school.rate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, Math.max(3, (school.rate / maxRate) * 100))}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {rankings.length > TOP_N && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllFacilities(!showAllFacilities)}
                                        className="w-full text-center text-xs font-semibold text-sky-700 hover:text-sky-900 py-1.5 hover:bg-sky-50 rounded-lg transition-colors"
                                    >
                                        {showAllFacilities ? 'Thu gọn danh sách' : `Xem toàn bộ ${rankings.length} trường`}
                                    </button>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDrawer;
