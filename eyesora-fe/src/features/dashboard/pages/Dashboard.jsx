import  { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import axiosClient from "../../../shared/axios/axiosClient.js";

import StatsCards from "../components/StatsCards.jsx";
import AnalyticsCharts from '../components/AnalyticsCharts.jsx';
import AlertRecordsTable from '../components/AlertRecordsTable.jsx';

import ExamRecordDetailModal from "../../eye-exam-record/components/ExamRecordDetailModal.jsx";

const Dashboard = () => {
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
            // Loại bỏ endpoint gọi API /dashboard/myopia-timeline
            const [countersRes, gradeRes, facilityRes] = await axios.all([
                axiosClient.get('/dashboard/counters'),
                axiosClient.get('/dashboard/grade-stats'),
                axiosClient.get('/dashboard/facility-stats')
            ]);

            setSummary(countersRes.data || {
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
            setGradeStats(gradeRes.data || []);
            setFacilityStats(facilityRes.data || []);

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
            <StatsCards summary={summary} />

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