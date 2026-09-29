import React, {useEffect, useState, useCallback} from 'react';
import axiosClient from "../../../shared/axios/axiosClient.js";
import FacilityCharts from "../components/FacilityCharts.jsx";
import FacilityStatsCards from "../components/FacilityStatsCards.jsx";
import AlertRecordsTable from "../../dashboard/components/AlertRecordsTable.jsx";
import ExamRecordDetailModal from "../../eye-exam-record/components/ExamRecordDetailModal.jsx";
import {useAuthStore} from "../../auth/store/authStore.js";

const FacilityDashboard = () => {
    const {user, fetchProfile} = useAuthStore();
    const [facilities, setFacilities] = useState([]);
    const [selectedFacilityId, setSelectedFacilityId] = useState("");

    const [summary, setSummary] = useState({
        totalExaminedStudents: 0,
        currentMyopiaRate: 0,
        totalAlertCases: 0
    });
    const [gradeStats, setGradeStats] = useState([]);

    const [records, setRecords] = useState([]);
    const [pageData, setPageData] = useState({page: 0, totalPages: 1, totalElements: 0});

    const [chartLoading, setChartLoading] = useState(false);
    const [animateBars, setAnimateBars] = useState(false);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

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
                        // Khớp ID tìm từ profile với danh sách để chắc chắn cơ sở đó có tồn tại
                        const hasFacility = list.some(fac => String(fac.id) === String(currentFacilityId));
                        if (hasFacility) {
                            setSelectedFacilityId(currentFacilityId);
                            return;
                        }
                    }

                    // Mặc định chọn trường đầu tiên nếu là SUPER_ADMIN hoặc không tìm thấy cơ sở tương ứng
                    setSelectedFacilityId(list[0].id);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách cơ sở trường học:", error);
            }
        };
        fetchFacilities();
    }, []);

    const fetchAlertRecords = useCallback(async (facilityId, page = 0) => {
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
                examDate: dto.examDate,

                patientName: dto.studentName,
                gender: dto.gender === "Nam" ? "MALE" : dto.gender === "Nữ" ? "FEMALE" : "OTHER", // Đồng bộ hóa Enum nếu bảng check MALE/FEMALE
                className: dto.className,
                facilityName: dto.facilityName
            }));

            const size = 5;
            const offset = page * size;
            const paginatedRecords = formattedRecords.slice(offset, offset + size);

            setRecords(paginatedRecords);
            setPageData({
                page: page,
                totalPages: Math.ceil(formattedRecords.length / size) || 1,
                totalElements: formattedRecords.length
            });
        } catch (error) {
            console.error("Lỗi khi tải danh sách ca cảnh báo của cơ sở:", error);
        }
    }, []);

    const fetchChartData = useCallback(async (facilityId) => {
        if (!facilityId) return;
        try {
            setChartLoading(true);
            setAnimateBars(false);
            const params = {facilityId};

            const [gradeRes, summaryRes] = await Promise.all([
                axiosClient.get('/dashboard/facility/grade-stats', {params}),
                axiosClient.get('/dashboard/facility/summary', {params})
            ]);

            setGradeStats(gradeRes.data || []);
            setSummary(summaryRes.data || {totalExaminedStudents: 0, currentMyopiaRate: 0, totalAlertCases: 0});
            setTimeout(() => setAnimateBars(true), 150);
        } catch (error) {
            console.error("Lỗi khi tải báo cáo thống kê cơ sở:", error);
        } finally {
            setChartLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedFacilityId) {
            fetchChartData(selectedFacilityId);
            fetchAlertRecords(selectedFacilityId, 0);
        }
    }, [selectedFacilityId, fetchChartData, fetchAlertRecords]);

    const openDetail = async (record) => {
        try {
            const res = await axiosClient.get(`/eye-exam-records/${record.examId}`);
            setSelectedRecord(res.data);
            setIsDetailOpen(true);
        } catch (error) {
            alert("Lỗi khi tải chi tiết hồ sơ khám mắt");
        }
    };

    const formatDiopter = (value) => {
        if (value === null || value === undefined || value === "") return "0.00";
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return "0.00";
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto text-gray-950 scrollbar-thin">
            {/* Bộ lọc Select Box chọn trường */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        Báo cáo Thống kê theo Cơ sở
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Dữ liệu tổng quan và chi tiết phân tích tật khúc xạ của trường học</p>
                </div>
                <div className="w-full sm:w-80">
                    <select
                        className="w-full bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] p-2.5 outline-none transition-all cursor-pointer shadow-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            </div>

            <FacilityStatsCards summary={summary}/>

            {chartLoading ? (
                <div
                    className="flex flex-col items-center justify-center h-72 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
                    <div
                        className="w-8 h-8 border-4 border-[#004194] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-gray-400 italic">Đang đồng bộ dữ liệu đồ thị...</p>
                </div>
            ) : (
                <>
                    <FacilityCharts gradeStats={gradeStats} animateBars={animateBars}/>

                    <div className="mt-6">
                        <AlertRecordsTable
                            records={records}
                            pageData={pageData}
                            fetchData={(p) => fetchAlertRecords(selectedFacilityId, p)}
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
                formatDate={(d) => d ? new Date(d).toLocaleDateString('vi-VN') : '---'}
                formatVA={(v) => v ? `${v}/10` : '-'}
                formatDiopter={formatDiopter}
                formatAxis={(a) => a ? `${a}°` : '0°'}
            />
        </div>
    );
};

export default FacilityDashboard;