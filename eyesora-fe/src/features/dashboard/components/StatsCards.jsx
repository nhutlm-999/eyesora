import { useNavigate } from 'react-router-dom';
import { Users, Eye, AlertTriangle, Building2, ArrowRight } from 'lucide-react';

const StatsCards = ({ summary, onViewAlerts }) => {
    const navigate = useNavigate();

    const handleViewAlertList = () => {
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
        if (trend === 'INCREASED') return 'text-red-600 font-bold';
        if (trend === 'DECREASED') return 'text-green-600 font-bold';
        return 'text-gray-700 font-bold';
    };

    // 4 Thẻ thống kê chính (Bao gồm đầy đủ 4 thẻ gốc + các nút bấm hỗ trợ)
    const cards = [
        {
            id: 'students',
            title: "Thông tin học sinh",
            icon: <Users className="w-5 h-5 text-[#004194]" />,
            bgColor: "bg-blue-50 text-[#004194]",
            mainValue: (summary?.students?.examined || 0).toLocaleString('vi-VN'),
            mainLabel: "Đã khám",
            details: [
                { label: "Mục tiêu", value: (summary?.students?.target || 1500).toLocaleString('vi-VN') },
                { label: "Hoàn thành", value: `${summary?.students?.completionRate || 0}%` }
            ],
            action: () => navigate('/eye-exam-records'),
            actionTooltip: "Bấm để xem danh sách hồ sơ khám mắt học sinh",
            buttonLabel: null
        },
        {
            id: 'myopia',
            title: "Tỷ lệ cận thị",
            icon: <Eye className="w-5 h-5 text-amber-700" />,
            bgColor: "bg-amber-100 text-amber-700",
            mainValue: `${summary?.myopia?.currentRate || 0}%`,
            mainLabel: "Tỉ lệ hiện tại",
            details: [
                { label: "Kỳ trước", value: `${summary?.myopia?.trendComparison?.previousPeriodRate || 0}%` },
                {
                    label: "Xu hướng",
                    value: `${summary?.myopia?.trendComparison?.diff > 0 ? '+' : ''}${summary?.myopia?.trendComparison?.diff || 0}%`,
                    trend: summary?.myopia?.trendComparison?.direction || 'STABLE'
                }
            ],
            action: null,
            actionTooltip: null,
            buttonLabel: null
        },
        // {
        //     id: 'alerts',
        //     title: "Cảnh báo nguy cấp",
        //     icon: <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />,
        //     bgColor: "bg-red-100 text-[#ba1a1a]",
        //     mainValue: (summary?.criticalAlerts?.severeMyopiaCount || 0).toString(),
        //     mainLabel: "Cận nặng (Cần can thiệp)",
        //     details: [
        //         { label: "Loạn thị cao", value: (summary?.criticalAlerts?.highAstigmatismCount || 0).toString() },
        //         { label: "Chưa xử lý", value: (summary?.criticalAlerts?.pendingActionCount || 0).toString() }
        //     ],
        //     isAlert: true,
        //     action: handleViewAlertList,
        //     actionTooltip: "Bấm để cuộn xuống danh sách các ca bệnh khẩn cấp",
        //     buttonLabel: "Xem danh sách"
        // },
        {
            id: 'alerts',
            title: "Cảnh báo nguy cấp",
            icon: <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />,
            bgColor: "bg-red-100 text-[#ba1a1a]",

            mainValue: (summary?.criticalAlerts?.severeMyopiaCount || 0).toString(),
            mainLabel: "Cận nặng",

            secondaryValue: (summary?.criticalAlerts?.highAstigmatismCount || 0).toString(),
            secondaryLabel: "Loạn thị cao",

            isAlert: true,
            action: handleViewAlertList,
            actionTooltip: "Bấm để cuộn xuống danh sách các ca bệnh khẩn cấp",
            buttonLabel: "Xem danh sách"
        },
        {
            id: 'facilities',
            title: "Cơ sở y tế",
            icon: <Building2 className="w-5 h-5 text-green-700" />,
            bgColor: "bg-green-100 text-green-700",
            mainValue: (summary?.facilities?.participating || 0).toString(),
            mainLabel: "Tham gia",
            details: [
                { label: "Tổng số", value: (summary?.facilities?.totalManaged || 0).toString() },
                { label: "Phủ sóng", value: `${summary?.facilities?.coverageRate || 0}%` }
            ],
            action: () => navigate('/facilities'),
            actionTooltip: "Bấm để xem danh sách các cơ sở y tế / trường học",
            buttonLabel: null
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
                                className="bg-gradient-to-br from-red-50 via-orange-50/50 to-red-100/60 rounded-2xl p-6 border border-red-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor} shadow-xs`}>
                                                {card.icon}
                                            </span>
                                            {card.title}
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={card.action}
                                            title={card.actionTooltip}
                                            className="px-3 py-1.5 rounded-full bg-[#001f54] hover:bg-[#003380] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                        >
                                            <span>{card.buttonLabel}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-white/70 border border-red-100 px-3 py-3">
                                            <p className="text-3xl font-extrabold tracking-tight text-[#93000a]">
                                                {card.mainValue}
                                            </p>

                                            <p className="text-xs font-semibold text-gray-600 mt-1">
                                                {card.mainLabel}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-white/70 border border-red-100 px-3 py-3">
                                            <p className="text-3xl font-extrabold tracking-tight text-[#93000a]">
                                                {card.secondaryValue}
                                            </p>

                                            <p className="text-xs font-semibold text-gray-600 mt-1">
                                                {card.secondaryLabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/*<div className="space-y-2 mt-2 pt-3 border-t border-red-200/50">*/}
                                {/*    {card.details.map((detail, idx) => (*/}
                                {/*        <div key={idx} className="flex justify-between items-center bg-white/70 backdrop-blur-xs rounded-lg px-3 py-2 border border-red-100/50">*/}
                                {/*            <span className="text-xs font-medium text-gray-700">{detail.label}</span>*/}
                                {/*            <span className="text-xs font-bold text-gray-900">{detail.value}</span>*/}
                                {/*        </div>*/}
                                {/*    ))}*/}
                                {/*</div>*/}
                            </div>
                        );
                    }

                    return (
                        <div 
                            key={card.id}
                            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-5">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={card.action || undefined}
                                            title={card.actionTooltip || undefined}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bgColor} shadow-xs ${card.action ? 'hover:scale-110 cursor-pointer' : ''} transition-transform`}
                                        >
                                            {card.icon}
                                        </button>
                                        {card.title}
                                    </h3>

                                    {card.action && (
                                        <button
                                            type="button"
                                            onClick={card.action}
                                            title={card.actionTooltip}
                                            className="px-2.5 py-1.5 rounded-lg bg-[#001f54] hover:bg-[#003380] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                        >
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <p className="text-4xl font-extrabold tracking-tight text-gray-900">
                                        {card.mainValue}
                                    </p>

                                    <p className="text-sm font-medium text-gray-500 mt-1">
                                        {card.mainLabel}
                                    </p>
                                </div>
                            </div>

                            {/*<div className="space-y-2 mt-2 pt-3 border-t border-gray-100">*/}
                            {/*    {card.details.map((detail, idx) => (*/}
                            {/*        <div key={idx} className="flex justify-between items-center bg-gray-50/80 rounded-lg px-3 py-2 border border-gray-100">*/}
                            {/*            <span className="text-xs font-medium text-gray-600">{detail.label}</span>*/}
                            {/*            <span className={`text-xs ${detail.trend ? getTrendColor(detail.trend) : 'font-bold text-gray-900'}`}>*/}
                            {/*                {detail.value}*/}
                            {/*            </span>*/}
                            {/*        </div>*/}
                            {/*    ))}*/}
                            {/*</div>*/}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatsCards;