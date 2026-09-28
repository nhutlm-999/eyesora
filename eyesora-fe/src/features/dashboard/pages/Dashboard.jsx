import  { useEffect, useState, useCallback } from 'react';
import axiosClient from "../../../shared/axios/axiosClient.js";

import StatsCards from "../components/StatsCards.jsx";
import AnalyticsCharts from '../components/AnalyticsCharts.jsx';
import AlertRecordsTable from '../components/AlertRecordsTable.jsx';
// import MyopiaTimelineChart from '../components/MyopiaTimelineChart.jsx';
// import DrillDownTree from '../components/DrillDownTree.jsx';

import ExamRecordDetailModal from "../../eye-exam-record/components/ExamRecordDetailModal.jsx";

const Dashboard = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');
    const [timelineData, setTimelineData] = useState([]);
    const [summary, setSummary] = useState({
        students: {
            examined: 0,
            target: 1500,
            completionRate: 0
        },
        myopia: {
            currentRate: 0,
            trendComparison: {
                previousPeriodRate: 0,
                diff: 0,
                direction: 'STABLE'
            }
        },
        criticalAlerts: {
            totalCases: 0,
            severeMyopiaCount: 0,
            highAstigmatismCount: 0,
            pendingActionCount: 0
        },
        facilities: {
            participating: 0,
            inProgress: 0,
            totalManaged: 0,
            coverageRate: 0
        }
    });
    const [gradeStats, setGradeStats] = useState([]);
    const [facilityStats, setFacilityStats] = useState([]);

    const [records, setRecords] = useState([]);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 1, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [animateBars, setAnimateBars] = useState(false);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchDashboardStaticData = async () => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (campaignId) params.campaignId = campaignId;

            const [countersRes, gradeRes, facilityRes, timelineRes] = await Promise.all([
                axiosClient.get('/dashboard/counters', { params }),
                axiosClient.get('/dashboard/grade-stats', { params }),
                axiosClient.get('/dashboard/facility-stats', { params }),
                axiosClient.get('/dashboard/myopia-timeline', { params })
            ]);

            setSummary(countersRes.data || {
                students: { examined: 0, target: 1500, completionRate: 0 },
                myopia: { currentRate: 0, trendComparison: { previousPeriodRate: 0, diff: 0, direction: 'STABLE' } },
                criticalAlerts: { totalCases: 0, severeMyopiaCount: 0, highAstigmatismCount: 0, pendingActionCount: 0 },
                facilities: { participating: 0, inProgress: 0, totalManaged: 0, coverageRate: 0 },
                followUpNeededCount: 0,
                screeningRate: 0
            });
            setGradeStats(gradeRes.data || []);
            setFacilityStats(facilityRes.data || []);
            setTimelineData(timelineRes.data || []);
            setLastUpdated(new Date().toLocaleString('vi-VN'));

            setTimeout(() => setAnimateBars(true), 150);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu cấu trúc bảng thống kê", error);
        }
    };

    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchData = useCallback(async (page = 0, filter = 'ALL') => {
        try {
            const res = await axiosClient.get(`/dashboard/critical-alerts`, {
                params: {
                    statusFilter: filter,
                    page: page,
                    size: 10
                }
            });

            const data = res.data;
            setRecords(data?.content || []);
            setPageData({
                page: data.number !== undefined ? data.number : page,
                totalPages: data.totalPages || 1,
                totalElements: data.totalElements || 0
            });
            setStatusFilter(filter);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await axiosClient.get('/campaigns?size=1000');
                setCampaigns(res.data.content || []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCampaigns();
    }, []);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await Promise.all([
                fetchDashboardStaticData(),
                fetchData(0, 'ALL')
            ]);
            setLoading(false);
        };

        initDashboard().catch(console.error);
    }, []);

    const openDetail = async (record) => {
        try {
            const res = await axiosClient.get(`/eye-exam-records/${record.examId}`);
            setSelectedRecord(res.data);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Chi tiết lỗi:", error);
            alert("Lỗi khi tải chi tiết hồ sơ khám mắt");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        try {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error(error);
            return '---';
        }
    };

    const formatVA = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const num = parseFloat(value);
        if (isNaN(num)) return "-";
        if (num >= 1) return `${Math.round(num)}/10`;
        return `${Math.round(num * 10)}/10`;
    };

    const formatDiopter = (value) => {
        if (value === null || value === undefined || value === "") return "0.00";
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return "0.00";
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    };

    const formatAxis = (value) => {
        if (value === null || value === undefined || value === "") return "0°";
        return `${value}°`;
    };

    const handleViewAlerts = () => {
        const tableEl = document.getElementById('alert-records-table');
        if (tableEl) {
            tableEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#004194] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-gray-500 font-semibold tracking-wide">Đang đồng bộ dữ liệu đồ thị tổng quan từ hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">Từ:</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">Đến:</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <select value={campaignId} onChange={e => setCampaignId(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[200px]">
                        <option value="">Tất cả chiến dịch</option>
                        {campaigns.map(c => <option key={c.campaignId} value={c.campaignId}>{c.campaignName}</option>)}
                    </select>
                    <button onClick={fetchDashboardStaticData} className="bg-[#004194] text-white px-4 py-1.5 rounded text-sm hover:bg-blue-800 transition-colors font-medium">Lọc</button>
                </div>
                {lastUpdated && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 whitespace-nowrap">
                        Cập nhật lần cuối: <span className="font-semibold">{lastUpdated}</span>
                    </div>
                )}
            </div>

            <StatsCards summary={summary} onViewAlerts={handleViewAlerts} />

            {/*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">*/}
            {/*    <MyopiaTimelineChart data={timelineData} />*/}
            {/*    <DrillDownTree />*/}
            {/*</div>*/}

            {/* Đã dọn dẹp các prop timelineStats, path, circles không cần thiết */}
            <AnalyticsCharts
                gradeStats={gradeStats}
                facilityStats={facilityStats}
                animateBars={animateBars}
            />

            <AlertRecordsTable
                records={records}
                pageData={pageData}
                fetchData={fetchData}
                statusFilter={statusFilter}
                onFilterChange={(newFilter) => fetchData(0, newFilter)}
                openDetail={openDetail}
                formatDiopter={formatDiopter}
            />

            <ExamRecordDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                record={selectedRecord}
                formatDate={formatDate}
                formatVA={formatVA}
                formatDiopter={formatDiopter}
                formatAxis={formatAxis}
            />
        </div>
    );
};

export default Dashboard;