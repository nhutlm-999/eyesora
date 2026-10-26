import React, { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../../shared/axios/axiosClient.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import FacilityStatsCards from '../components/FacilityStatsCards.jsx';
import GradeChart from '../components/GradeChart.jsx';
import AnalyticsDrawer from '../components/AnalyticsDrawer.jsx';
import AlertRecordsTable from '../components/AlertRecordsTable.jsx';
import ExamRecordDetailModal from '../../eye-exam-record/components/ExamRecordDetailModal.jsx';
import useRecordDetail from '../hooks/useRecordDetail.js';
import { recordFormatters, formatDiopter } from '../utils/format.js';

const PAGE_SIZE = 5;

const FacilityDashboardView = () => {
    const { user, fetchProfile } = useAuthStore();
    const [facilityId, setFacilityId] = useState(user?.facilityId || '');
    const [facilityName, setFacilityName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');

    const [summary, setSummary] = useState({
        totalExaminedStudents: 0,
        currentMyopiaRate: 0,
        totalAlertCases: 0
    });
    const [gradeStats, setGradeStats] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 1, totalElements: 0 });
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [chartLoading, setChartLoading] = useState(true);
    const [animateBars, setAnimateBars] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const detail = useRecordDetail();

    // Xác định cơ sở của tài khoản
    useEffect(() => {
        let isMounted = true;
        const initFacility = async () => {
            try {
                let id = facilityId;
                if (!id) {
                    id = await fetchProfile();
                    if (isMounted && id) setFacilityId(id);
                }
                const res = await axiosClient.get('/dashboard/facility/list');
                const matched = (res.data || []).find(f => String(f.id) === String(id));
                if (isMounted && matched) {
                    setFacilityName(matched.facilityName);
                }
            } catch (err) {
                console.error('Lỗi khi tải thông tin cơ sở trường học:', err);
            }
        };
        initFacility();
        return () => { isMounted = false; };
    }, []);

    // Tải dữ liệu thống kê theo cơ sở
    const fetchAllData = useCallback(async () => {
        if (!facilityId) return;
        setChartLoading(true);
        setAnimateBars(false);
        try {
            const params = {
                facilityId,
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {})
            };

            const [gradeRes, summaryRes, alertRes] = await Promise.all([
                axiosClient.get('/dashboard/facility/grade-stats', { params }),
                axiosClient.get('/dashboard/facility/summary', { params }),
                axiosClient.get('/dashboard/facility/alert-records', { params: { facilityId } })
            ]);

            setGradeStats(gradeRes.data || []);
            setSummary(summaryRes.data || { totalExaminedStudents: 0, currentMyopiaRate: 0, totalAlertCases: 0 });

            const rawAlerts = alertRes.data || [];
            const formatted = rawAlerts.map(dto => ({
                examId: dto.examId,
                sphLeft: dto.sphLeft,
                sphRight: dto.sphRight,
                cylLeft: dto.cylLeft,
                cylRight: dto.cylRight,
                examDate: dto.examDate,
                patientName: dto.studentName,
                gender: dto.gender === "Nam" ? "MALE" : dto.gender === "Nữ" ? "FEMALE" : "OTHER",
                className: dto.className,
                facilityName: dto.facilityName
            }));
            setAllRecords(formatted);

            setLastUpdated(new Date().toLocaleString('vi-VN'));
            setTimeout(() => setAnimateBars(true), 150);
        } catch (error) {
            console.error('Lỗi khi tải báo cáo thống kê cơ sở:', error);
        } finally {
            setChartLoading(false);
        }
    }, [facilityId, startDate, endDate]);

    useEffect(() => {
        if (facilityId) {
            fetchAllData();
        }
    }, [facilityId, fetchAllData]);

    // Phân trang và lọc client-side cho danh sách cảnh báo của cơ sở
    useEffect(() => {
        let filtered = allRecords;
        if (statusFilter !== 'ALL') {
            filtered = allRecords.filter(record => {
                const isSevereMyopiaLeft = record.sphLeft != null && record.sphLeft <= -6.0;
                const isHighAstigmatismLeft = record.cylLeft != null && Math.abs(record.cylLeft) >= 1.5;
                const isSevereMyopiaRight = record.sphRight != null && record.sphRight <= -6.0;
                const isHighAstigmatismRight = record.cylRight != null && Math.abs(record.cylRight) >= 1.5;

                const isSevereMyopia = isSevereMyopiaLeft || isSevereMyopiaRight;
                const isHighAstigmatism = isHighAstigmatismLeft || isHighAstigmatismRight;

                if (statusFilter === 'MYOPIA') return isSevereMyopia;
                if (statusFilter === 'ASTIGMATISM') return isHighAstigmatism;
                if (statusFilter === 'BOTH') return isSevereMyopia && isHighAstigmatism;
                return true;
            });
        }

        const offset = pageData.page * PAGE_SIZE;
        const paginated = filtered.slice(offset, offset + PAGE_SIZE);

        setRecords(paginated);
        setPageData(prev => ({
            ...prev,
            totalPages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
            totalElements: filtered.length
        }));
    }, [allRecords, statusFilter, pageData.page]);

    const handleFilterClick = () => {
        fetchAllData();
    };

    const handleViewAlerts = () => {
        const tableEl = document.getElementById('alert-records-table');
        if (tableEl) {
            tableEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePageChange = (newPage) => {
        setPageData(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (newFilter) => {
        setStatusFilter(newFilter);
        setPageData(prev => ({ ...prev, page: 0 }));
    };

    if (chartLoading && !facilityId) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#004194] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-gray-500 font-semibold tracking-wide">Đang đồng bộ dữ liệu cơ sở trường học...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#f5f7fa] overflow-hidden text-gray-950">
            <div className={`transition-all duration-300 ease-in-out h-full overflow-y-auto scrollbar-thin ${isAnalysisOpen ? 'w-2/3' : 'w-full'}`}>
                <div className="p-6">
                    {/* Filter bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                            {facilityName && (
                                <div className="text-sm font-bold text-[#004194] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-150">
                                    🏫 {facilityName}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Từ:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Đến:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleFilterClick}
                                className="bg-[#004194] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-800 transition-colors font-medium cursor-pointer"
                            >
                                Lọc
                            </button>
                        </div>
                        {lastUpdated && (
                            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 whitespace-nowrap">
                                Cập nhật lần cuối: <span className="font-semibold">{lastUpdated}</span>
                            </div>
                        )}
                    </div>

                    <FacilityStatsCards summary={summary} onViewAlerts={handleViewAlerts} />

                    {chartLoading ? (
                        <div className="flex flex-col items-center justify-center h-72 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                            <div className="w-8 h-8 border-4 border-[#004194] border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-xs text-gray-400 italic">Đang đồng bộ dữ liệu đồ thị...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <GradeChart
                                    gradeStats={gradeStats}
                                    animateBars={animateBars}
                                    onOpenAnalysis={() => setIsAnalysisOpen(true)}
                                />
                            </div>

                            <div className="mt-6">
                                <AlertRecordsTable
                                    records={records}
                                    pageData={pageData}
                                    fetchData={handlePageChange}
                                    statusFilter={statusFilter}
                                    onFilterChange={handleFilterChange}
                                    openDetail={detail.open}
                                    formatDiopter={formatDiopter}
                                    canExport={false}
                                />
                            </div>
                        </>
                    )}

                    <ExamRecordDetailModal
                        isOpen={detail.isOpen}
                        onClose={detail.close}
                        record={detail.record}
                        formatDate={recordFormatters.formatDate}
                        formatVA={recordFormatters.formatVA}
                        formatDiopter={recordFormatters.formatDiopter}
                        formatAxis={recordFormatters.formatAxis}
                    />
                </div>
            </div>

            <div className={`transition-all duration-300 ease-in-out h-full bg-white shadow-xl flex-shrink-0 ${isAnalysisOpen ? 'w-1/3 border-l border-gray-200 opacity-100 visible' : 'w-0 opacity-0 invisible overflow-hidden'}`}>
                <AnalyticsDrawer
                    isOpen={isAnalysisOpen}
                    onClose={() => setIsAnalysisOpen(false)}
                    type="grade"
                    facilityId={facilityId}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>
        </div>
    );
};

export default FacilityDashboardView;
