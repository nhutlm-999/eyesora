import React from 'react';
import { Users, Eye, AlertTriangle, ArrowRight } from 'lucide-react';

const FacilityStatsCards = ({ summary, onViewAlerts }) => {
    const handleViewAlertList = (e) => {
        e.stopPropagation();
        if (onViewAlerts) {
            onViewAlerts();
        } else {
            const element = document.getElementById('alert-records-table');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const cards = [
        {
            id: 'students',
            title: "Tổng số học sinh",
            icon: <Users className="w-4 h-4 text-[#004194]" />,
            bgColor: "bg-blue-100",
            mainValue: (summary?.totalExaminedStudents || 0).toLocaleString('vi-VN'),
            mainLabel: "Đã khám",
            isAlert: false
        },
        {
            id: 'myopia',
            title: "Tỷ lệ cận thị",
            icon: <Eye className="w-4 h-4 text-amber-700" />,
            bgColor: "bg-amber-100",
            mainValue: `${summary?.currentMyopiaRate || 0}%`,
            mainLabel: "Tổng quan",
            isAlert: false
        },
        {
            id: 'alerts',
            title: "Cảnh báo nguy cấp",
            icon: <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />,
            bgColor: "bg-red-200",
            mainValue: (summary?.totalAlertCases || 0).toString(),
            mainLabel: "Cần lưu ý theo dõi",
            action: handleViewAlertList,
            isAlert: true
        }
    ];

    return (
        <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.bgColor} shadow-sm`}>
                                        {card.icon}
                                    </span>
                                    {card.title}
                                </h3>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
                                        {card.mainValue}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1.5">
                                        {card.mainLabel}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FacilityStatsCards;