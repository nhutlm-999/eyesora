import { useNavigate } from 'react-router-dom';
import { Users, Eye, AlertTriangle, Building2, ArrowRight } from 'lucide-react';

const StatsCards = ({ summary, onViewAlerts }) => {
    const navigate = useNavigate();

    const handleViewAlertList = (e) => {
        e.stopPropagation(); // Prevent card click if we click the button specifically
        if (onViewAlerts) {
            onViewAlerts();
        } else {
            const element = document.getElementById('alert-records-table');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const getTrendColor = (trend) => {
        if (trend === 'INCREASED') return 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded';
        if (trend === 'DECREASED') return 'text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded';
        return 'text-gray-700 font-bold bg-gray-50 px-1.5 py-0.5 rounded';
    };

    // 4 Thẻ thống kê chính
    const cards = [
        {
            id: 'students',
            title: "Học sinh",
            icon: <Users className="w-4 h-4 text-[#004194]" />,
            bgColor: "bg-blue-100",
            mainValue: (summary?.students?.examined || 0).toLocaleString('vi-VN'),
            mainLabel: "Đã khám",
            details: [
                { label: "Mục tiêu", value: (summary?.students?.target || 1500).toLocaleString('vi-VN') },
                { label: "Tiến độ", value: `${summary?.students?.completionRate || 0}%` }
            ],
            action: () => navigate('/eye-exam-records'),
            isAlert: false
        },
        {
            id: 'myopia',
            title: "Tỷ lệ cận thị",
            icon: <Eye className="w-4 h-4 text-amber-700" />,
            bgColor: "bg-amber-100",
            mainValue: `${summary?.myopia?.currentRate || 0}%`,
            mainLabel: "Tổng quan",
            details: [
                { label: "Kỳ trước", value: `${summary?.myopia?.trendComparison?.previousPeriodRate || 0}%` },
                {
                    label: "Xu hướng",
                    value: `${summary?.myopia?.trendComparison?.diff > 0 ? '+' : ''}${summary?.myopia?.trendComparison?.diff || 0}%`,
                    trend: summary?.myopia?.trendComparison?.direction || 'STABLE'
                }
            ],
            action: null,
            isAlert: false
        },
        {
            id: 'alerts',
            title: "Cảnh báo nguy cấp",
            icon: <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />,
            bgColor: "bg-red-200",
            mainValue: (summary?.criticalAlerts?.severeMyopiaCount || 0).toString(),
            mainLabel: "Cận nặng cần theo dõi",
            details: [], // Theo yêu cầu, không hiển thị details
            action: handleViewAlertList,
            isAlert: true
        },
        {
            id: 'facilities',
            title: "Cơ sở y tế",
            icon: <Building2 className="w-4 h-4 text-green-700" />,
            bgColor: "bg-green-200",
            mainValue: (summary?.facilities?.participating || 0).toString(),
            mainLabel: "Đang tham gia",
            details: [
                { label: "Tổng số", value: (summary?.facilities?.totalManaged || 0).toString() },
                { label: "Phủ sóng", value: `${summary?.facilities?.coverageRate || 0}%` }
            ],
            action: () => navigate('/facilities'),
            isAlert: false
        }
    ];

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    if (card.isAlert) {
                        return (
                            <div 
                                key={card.id} 
                                onClick={card.action}
                                className="bg-gradient-to-br from-red-50 via-orange-50/30 to-red-100/50 rounded-2xl p-5 border border-red-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bgColor} shadow-sm`}>
                                            {card.icon}
                                        </span>
                                        {card.title}
                                    </h3>
                                    <div className="px-2.5 py-1 rounded-full bg-[#93000a] text-white text-[10px] font-bold shadow-sm flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <span>Xem danh sách</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-3xl font-extrabold text-[#93000a]">{card.mainValue}</p>
                                    <p className="text-xs font-semibold text-gray-600 mt-1">{card.mainLabel}</p>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={card.id}
                            onClick={card.action || undefined}
                            className={`bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm transition-all group ${card.action ? 'cursor-pointer hover:shadow-md hover:border-blue-200' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bgColor} shadow-sm`}>
                                        {card.icon}
                                    </span>
                                    {card.title}
                                </h3>
                                {card.action && (
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                )}
                            </div>

                            <div className="flex items-end justify-between">
                                {/* Left side: Main Metric */}
                                <div>
                                    <p className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                                        {card.mainValue}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1.5">
                                        {card.mainLabel}
                                    </p>
                                </div>

                                {/* Right side: Details */}
                                {card.details && card.details.length > 0 && (
                                    <div className="flex flex-col gap-1.5 text-right">
                                        {card.details.map((detail, idx) => (
                                            <div key={idx} className="text-[11px] leading-tight">
                                                <span className="text-gray-500 mr-1">{detail.label}:</span>
                                                <span className={detail.trend ? getTrendColor(detail.trend) : 'font-bold text-gray-900'}>
                                                    {detail.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsCards;
