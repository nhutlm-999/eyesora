import React, {useEffect, useState, useCallback} from 'react';
import axiosClient from "../../../shared/axios/axiosClient.js";
import FacilityCharts from "../components/FacilityCharts.jsx";
import FacilityStatsCards from "../components/FacilityStatsCards.jsx";
import FacilityAnalyticsDrawer from "../components/FacilityAnalyticsDrawer.jsx";
import AlertRecordsTable from "../../dashboard/components/AlertRecordsTable.jsx";
import ExamRecordDetailModal from "../../eye-exam-record/components/ExamRecordDetailModal.jsx";
import {useAuthStore} from "../../auth/store/authStore.js";

const FacilityDashboard = () => {
    const {user, fetchProfile} = useAuthStore();
    const [facilities, setFacilities] = useState([]);
    const [selectedFacilityId, setSelectedFacilityId] = useState("");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');

    const [summary, setSummary] = useState({
        totalExaminedStudents: 0,
        currentMyopiaRate: 0,
        totalAlertCases: 0
    });
    const [gradeStats, setGradeStats] = useState([]);

    const [allRecords, setAllRecords] = useState([]); // Store all for client-side filtering
    const [records, setRecords] = useState([]);
    const [pageData, setPageData] = useState({page: 0, totalPages: 1, totalElements: 0});
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [chartLoading, setChartLoading] = useState(true);
    const [animateBars, setAnimateBars] = useState(false);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    const isFacilityAdmin = user?.roles?.includes("ROLE_FACILITY_ADMIN");

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                let currentFacilityId = user?.facilityId;
                if (isFacilityAdmin && !currentFacilityId) {
                    currentFacilityId = await fetchProfile();
                }

                const res = await axiosClient.get('/dashboard/facility/list');
                const list = res.data || [];
                setFacilities(list);
                if (list.length > 0) {
                    if (isFacilityAdmin && currentFacilityId) {
                        const hasFacility = list.some(fac => String(fac.id) === String(currentFacilityId));
                        if (hasFacility) {
                            setSelectedFacilityId(currentFacilityId);
                            return;
                        }
                    }
                    setSelectedFacilityId(list[0].id);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách cơ sở trường học:", error);
            }
        };
        fetchFacilities();
    }, []);

    const fetchAlertRecords = useCallback(async (facilityId) => {
        if (!facilityId) return;
        try {
            const res = await axiosClient.get(`/dashboard/facility/alert-records`, {
                params: {facilityId}
            });

            const rawDataArray = res.data || [];
            const formattedRecords = rawDataArray.map(dto => ({
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
            
            setAllRecords(formattedRecords);
        } catch (error) {
            console.error("Lỗi khi tải danh sách ca cảnh báo của cơ sở:", error);
        }
    }, []);

    // Effect for client side filtering
    useEffect(() => {
        let filtered = allRecords;
        if (statusFilter !== 'ALL') {
            filtered = allRecords.filter(record => {
                const isSevereMyopiaLeft = record.sphLeft <= -6.0;
                const isHighAstigmatismLeft = Math.abs(record.cylLeft) >= 1.5;
                const isSevereMyopiaRight = record.sphRight <= -6.0;
                const isHighAstigmatismRight = Math.abs(record.cylRight) >= 1.5;

                const isSevereMyopia = isSevereMyopiaLeft || isSevereMyopiaRight;
                const isHighAstigmatism = isHighAstigmatismLeft || isHighAstigmatismRight;

                if (statusFilter === 'MYOPIA') return isSevereMyopia;
                if (statusFilter === 'ASTIGMATISM') return isHighAstigmatism;
                if (statusFilter === 'BOTH') return isSevereMyopia && isHighAstigmatism;
                return true;
            });
        }
        
        const size = 5;
        const offset = pageData.page * size;
        const paginatedRecords = filtered.slice(offset, offset + size);
        
        setRecords(paginatedRecords);
        setPageData(prev => ({
            ...prev,
            totalPages: Math.ceil(filtered.length / size) || 1,
            totalElements: filtered.length
        }));
    }, [allRecords, statusFilter, pageData.page]);


    const fetchChartData = useCallback(async (facilityId) => {
        if (!facilityId) return;
        try {
            setChartLoading(true);
            setAnimateBars(false);
            const params = {facilityId};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const [gradeRes, summaryRes] = await Promise.all([
                axiosClient.get('/dashboard/facility/grade-stats', {params}),
                axiosClient.get('/dashboard/facility/summary', {params})
            ]);

            setGradeStats(gradeRes.data || []);
            setSummary(summaryRes.data || {totalExaminedStudents: 0, currentMyopiaRate: 0, totalAlertCases: 0});
            setLastUpdated(new Date().toLocaleString('vi-VN'));
            setTimeout(() => setAnimateBars(true), 150);
        } catch (error) {
            console.error("Lỗi khi tải báo cáo thống kê cơ sở:", error);
        } finally {
            setChartLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (selectedFacilityId) {
            fetchChartData(selectedFacilityId);
            fetchAlertRecords(selectedFacilityId);
        }
    }, [selectedFacilityId, fetchChartData, fetchAlertRecords]);

    const handleFilterClick = () => {
        if (selectedFacilityId) {
            fetchChartData(selectedFacilityId);
            fetchAlertRecords(selectedFacilityId);
        }
    };

    const openDetail = async (record) => {
        try {
            const res = await axiosClient.get(`/eye-exam-records/${record.examId}`);
            setSelectedRecord(res.data);
            setIsDetailOpen(true);
        } catch (error) {
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

    const handlePageChange = (newPage) => {
        setPageData(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (newFilter) => {
        setStatusFilter(newFilter);
        setPageData(prev => ({ ...prev, page: 0 })); // reset page
    };

    if (chartLoading && !selectedFacilityId) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#004194] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-gray-500 font-semibold tracking-wide">Đang đồng bộ dữ liệu hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#f5f7fa] overflow-hidden text-gray-950">
            <div className={`transition-all duration-300 ease-in-out h-full overflow-y-auto scrollbar-thin ${isAnalysisOpen ? 'w-2/3' : 'w-full'}`}>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                            <div className="w-full sm:w-64">
                                <select
                                    className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] p-2 outline-none transition-all cursor-pointer shadow-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    value={selectedFacilityId}
                                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                                    disabled={isFacilityAdmin}
                                >
                                    {facilities.length === 0 && <option value="">Đang tải danh sách các cơ sở...</option>}
                                    {facilities.map((fac) => (
                                        <option key={fac.id} value={fac.id}>{fac.facilityName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Từ:</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-semibold text-gray-700">Đến:</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <button onClick={handleFilterClick} className="bg-[#004194] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-800 transition-colors font-medium cursor-pointer">Lọc</button>
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
                            <FacilityCharts 
                                gradeStats={gradeStats} 
                                animateBars={animateBars} 
                                onOpenAnalysis={() => setIsAnalysisOpen(true)}
                            />

                            <div className="mt-6">
                                <AlertRecordsTable
                                    records={records}
                                    pageData={pageData}
                                    fetchData={handlePageChange}
                                    statusFilter={statusFilter}
                                    onFilterChange={handleFilterChange}
                                    openDetail={openDetail}
                                    formatDiopter={formatDiopter}
                                />
                            </div>
                        </>
                    )}

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
            </div>

            <div className={`transition-all duration-300 ease-in-out h-full bg-white shadow-xl flex-shrink-0 ${isAnalysisOpen ? 'w-1/3 border-l border-gray-200 opacity-100 visible' : 'w-0 opacity-0 invisible overflow-hidden'}`}>
                <FacilityAnalyticsDrawer 
                    isOpen={isAnalysisOpen} 
                    onClose={() => setIsAnalysisOpen(false)} 
                    gradeStats={gradeStats}
                />
            </div>
        </div>
    );
};

export default FacilityDashboard;