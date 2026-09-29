import React from 'react';
import { Users, TrendingUp, AlertTriangle } from 'lucide-react';

const FacilityStatsCards = ({ summary }) => {
    const stats = [
        {
            title: "Tổng số học sinh đã khám",
            value: (summary?.totalExaminedStudents || 0).toLocaleString('vi-VN') + " học sinh",
            icon: <Users className="w-5 h-5" />,
            bgColor: "bg-blue-900/10 text-[#004194]"
        },
        {
            title: "Tỷ lệ cận thị hiện tại",
            value: `${summary?.currentMyopiaRate || 0}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            bgColor: "bg-amber-500/10 text-amber-700",
            hasProgress: true
        },
        {
            title: "Số ca báo động cận nặng",
            value: (summary?.totalAlertCases || 0).toString() + " ca",
            icon: <AlertTriangle className="w-5 h-5 animate-pulse" />,
            bgColor: "bg-red-500/20 text-[#ba1a1a]",
            isAlert: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {stats.map((stat, index) => {
                if (stat.isAlert) {
                    return (
                        <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stat.title}</h3>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-[#93000a]">{stat.value}</h2>
                                <p className="text-[11px] text-red-600 font-semibold mt-1">Cần lưu ý theo dõi đặc biệt</p>
                            </div>
                        </div>
                    );
                }
                return (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stat.title}</h3>
                            {stat.bgColor && (
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{stat.value}</h2>
                            {stat.hasProgress && (
                                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(summary?.currentMyopiaRate || 0, 100)}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FacilityStatsCards;