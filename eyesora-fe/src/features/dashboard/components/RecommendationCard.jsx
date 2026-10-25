import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Layers, CheckSquare, BarChart3, Clock } from 'lucide-react';

const PRIORITY_THEMES = {
    HIGH: {
        border: 'border-l-red-500',
        badge: 'bg-red-100 text-red-700',
        label: 'Ưu tiên cao',
        highlightBg: 'bg-red-50/50',
    },
    MEDIUM: {
        border: 'border-l-amber-500',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Trung bình',
        highlightBg: 'bg-amber-50/40',
    },
    LOW: {
        border: 'border-l-blue-400',
        badge: 'bg-blue-100 text-blue-700',
        label: 'Khuyến nghị',
        highlightBg: 'bg-blue-50/30',
    },
};

const AUDIENCE_TAGS = {
    SCHOOL_HEALTH: 'Y tế học đường',
    PARENT: 'Phụ huynh',
    SCHOOL_BOARD: 'Ban giám hiệu',
    HEALTH_DEPARTMENT: 'Cơ quan y tế',
};

const RecommendationCard = ({ item, onViewList }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [showAllActions, setShowAllActions] = useState(false);

    const theme = PRIORITY_THEMES[item.priority] || PRIORITY_THEMES.LOW;
    const hasBreakdown = item.scopeBreakdown && item.scopeBreakdown.length > 0;
    const hasActionPlan = item.actionPlan && item.actionPlan.length > 0;
    const hasInsights = item.statisticalInsights && item.statisticalInsights.length > 0;

    // Hiển thị tối đa 2 hành động đầu tiên, nếu muốn xem thêm thì click toggle
    const visibleActions = hasActionPlan
        ? (showAllActions ? item.actionPlan : item.actionPlan.slice(0, 2))
        : [];

    return (
        <div className={`border border-gray-200 border-l-4 ${theme.border} rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 space-y-3`}>
            {/* Header: Tiêu đề, đối tượng và badge mức độ */}
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-gray-900 leading-snug">{item.title}</h5>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {item.scopeName}
                        </span>
                        {item.audience && (
                            <span className="text-gray-500">
                                · Phối hợp: <strong className="text-gray-700">{AUDIENCE_TAGS[item.audience] || item.audience}</strong>
                            </span>
                        )}
                    </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 ${theme.badge}`}>
                    {theme.label}
                </span>
            </div>

            {/* Phân tích số liệu thống kê (Statistical Insights) */}
            <div className={`p-3 rounded-lg text-xs leading-relaxed space-y-1.5 border border-gray-100 ${theme.highlightBg}`}>
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Phân tích dữ liệu & Bằng chứng dịch tễ:</span>
                </div>
                <p className="text-gray-700">{item.reason}</p>

                {hasInsights && (
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 pt-1">
                        {item.statisticalInsights.map((ins, idx) => (
                            <li key={idx} className="leading-normal">{ins}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Danh sách phân rã theo nhóm nếu gộp nhiều khối/trường */}
            {hasBreakdown && (
                <div className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/60">
                    <button
                        type="button"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-sky-800"
                    >
                        <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                            Chi tiết phân bổ tại các nhóm ({item.scopeBreakdown.length})
                        </span>
                        {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showBreakdown && (
                        <div className="mt-2.5 space-y-1.5 pt-2 border-t border-gray-200">
                            {item.scopeBreakdown.map((sc, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1 px-1.5 hover:bg-white rounded border-b border-gray-100 last:border-b-0">
                                    <span className="font-medium text-gray-800">{sc.scopeName}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">{sc.count}/{sc.total} HS ({sc.rate}%)</span>
                                        {sc.listFilter && onViewList && (
                                            <button
                                                type="button"
                                                onClick={() => onViewList(sc.listFilter)}
                                                className="text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center"
                                                title="Lọc danh sách học sinh của nhóm này"
                                            >
                                                Lọc <ArrowRight className="w-3 h-3 ml-0.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Kế hoạch hành động đa dạng phân tầng theo vai trò và thời gian */}
            {hasActionPlan ? (
                <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                        <span className="flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            Đề xuất giải pháp can thiệp ({item.actionPlan.length}):
                        </span>
                    </div>

                    <div className="space-y-2">
                        {visibleActions.map((act, idx) => (
                            <div key={idx} className="bg-white border border-gray-200/80 rounded-lg p-2.5 text-xs shadow-2xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                        {act.role}
                                    </span>
                                    {act.timeframe && (
                                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            {act.timeframe}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 leading-relaxed pt-0.5">{act.action}</p>
                            </div>
                        ))}
                    </div>

                    {item.actionPlan.length > 2 && (
                        <button
                            type="button"
                            onClick={() => setShowAllActions(!showAllActions)}
                            className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline pt-0.5 inline-block"
                        >
                            {showAllActions ? 'Thu gọn bớt giải pháp' : `+ Xem thêm ${item.actionPlan.length - 2} giải pháp khác`}
                        </button>
                    )}
                </div>
            ) : (
                item.action && (
                    <div className="text-xs text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <span className="font-semibold text-emerald-800">Hành động: </span>{item.action}
                    </div>
                )
            )}

            {/* Nút lọc cho trường hợp chỉ có 1 nhóm duy nhất */}
            {item.listFilter && onViewList && (
                <div className="pt-1 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => onViewList(item.listFilter)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900"
                    >
                        Xem danh sách học sinh thuộc cảnh báo này <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecommendationCard;
