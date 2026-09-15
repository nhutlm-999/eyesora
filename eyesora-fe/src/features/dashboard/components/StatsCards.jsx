import React from 'react';
import { Users, TrendingUp, AlertTriangle, Building2, Eye, Zap } from 'lucide-react';

const StatsCards = ({ summary }) => {
    // 4 Main Category Cards
    const mainCards = [
        {
            id: 'students',
            title: "Thông tin học sinh",
            icon: <Users className="w-6 h-6" />,
            bgColor: "bg-blue-900/10 text-[#004194]",
            mainValue: (summary?.students?.examined || 0).toLocaleString('vi-VN'),
            mainLabel: "Đã khám",
            details: [
                { label: "Mục tiêu", value: (summary?.students?.target || 1500).toLocaleString('vi-VN') },
                { label: "Hoàn thành", value: `${summary?.students?.completionRate || 0}%` }
            ]
        },
        {
            id: 'myopia',
            title: "Tỷ lệ cận thị",
            icon: <Eye className="w-6 h-6" />,
            bgColor: "bg-amber-500/10 text-amber-700",
            mainValue: `${summary?.myopia?.currentRate || 0}%`,
            mainLabel: "Tỉ lệ hiện tại",
            details: [
                { label: "Kỳ trước", value: `${summary?.myopia?.trendComparison?.previousPeriodRate || 0}%` },
                {
                    label: "Xu hướng",
                    value: `${summary?.myopia?.trendComparison?.diff > 0 ? '+' : ''}${summary?.myopia?.trendComparison?.diff || 0}%`,
                    trend: summary?.myopia?.trendComparison?.direction || 'STABLE'
                }
            ]
        },
        {
            id: 'alerts',
            title: "Cảnh báo nguy cấp",
            icon: <AlertTriangle className="w-6 h-6" />,
            bgColor: "bg-red-500/20 text-[#ba1a1a]",
            mainValue: (summary?.criticalAlerts?.severeMyopiaCount || 0).toString(),
            mainLabel: "Cận nặng",
            details: [
                { label: "Loạn thị cao", value: (summary?.criticalAlerts?.highAstigmatismCount || 0).toString() },
                { label: "Chưa xử lý", value: (summary?.criticalAlerts?.pendingActionCount || 0).toString() }
            ],
            isAlert: true
        },
        {
            id: 'facilities',
            title: "Cơ sở y tế",
            icon: <Building2 className="w-6 h-6" />,
            bgColor: "bg-green-500/10 text-green-700",
            mainValue: (summary?.facilities?.participating || 0).toString(),
            mainLabel: "Tham gia",
            details: [
                { label: "Tổng số", value: (summary?.facilities?.totalManaged || 0).toString() },
                { label: "Phủ sóng", value: `${summary?.facilities?.coverageRate || 0}%` }
            ]
        }
    ];

    const renderMainCard = (card) => {
        const getTrendColor = (trend) => {
            if (trend === 'INCREASED') return 'text-red-600';
            if (trend === 'DECREASED') return 'text-green-600';
            return 'text-gray-600';
        };

        if (card.isAlert) {
            return (
                <div key={card.id} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200/50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                                    {card.icon}
                                </span>
                                {card.title}
                            </h3>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-4xl font-bold text-[#93000a]">{card.mainValue}</p>
                        <p className="text-xs text-gray-600 mt-1">{card.mainLabel}</p>
                    </div>

                    <div className="space-y-3">
                        {card.details.map((detail, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/50 rounded px-3 py-2">
                                <span className="text-xs text-gray-600">{detail.label}</span>
                                <span className={`text-sm font-semibold ${detail.trend ? getTrendColor(detail.trend) : 'text-gray-800'}`}>
                                    {detail.value}
                                    {detail.trend && <span className="text-xs ml-1">({detail.trend})</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div key={card.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                                {card.icon}
                            </span>
                            {card.title}
                        </h3>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-4xl font-bold text-gray-900">{card.mainValue}</p>
                    <p className="text-xs text-gray-600 mt-1">{card.mainLabel}</p>
                </div>

                <div className="space-y-3">
                    {card.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                            <span className="text-xs text-gray-600">{detail.label}</span>
                            <span className={`text-sm font-semibold ${detail.trend ? getTrendColor(detail.trend) : 'text-gray-800'}`}>
                                {detail.value}
                                {detail.trend && <span className="text-xs ml-1">({detail.trend})</span>}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainCards.map(card => renderMainCard(card))}
            </div>
        </div>
    );
};

export default StatsCards;