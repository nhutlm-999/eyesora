import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from "../../../shared/components/SearchBar.jsx";
import Pagination from "../../../shared/components/Pagination.jsx";
import OverduePatientTable from "../components/OverduePatientTable.jsx";
import axiosClient from "../../../shared/axios/axiosClient.js";

const OverdueReExamPage = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [pageInfo, setPageInfo] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 1 });

    // State bộ lọc
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');
    const [overdueMonths, setOverdueMonths] = useState(6);
    const [facilities, setFacilities] = useState([]);

    const [loading, setLoading] = useState(true);

    // 1. Fetch danh sách cơ sở để làm bộ lọc dropdown
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await axiosClient.get('/master-data/facilities?page=0&size=999');
                setFacilities(res.data.content || []);
            } catch (error) {
                console.error("Lỗi khi fetch danh sách cơ sở:", error);
            }
        };
        fetchFacilities();
    }, []);

    // 2. Fetch danh sách học sinh quá hạn tái khám
    const fetchOverdueStudents = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            let url = `/patients/overdue-re-examination?page=${page}&size=${size}&overdueMonths=${overdueMonths}`;
            if (searchQuery.trim()) url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
            if (selectedFacility) url += `&facilityId=${selectedFacility}`;

            const res = await axiosClient.get(url);
            const data = res.data;

            setStudents(data.content || []);
            setPageInfo({
                pageNumber: data.pageable?.pageNumber || 0,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 1,
                pageSize: size
            });
        } catch (error) {
            console.error("Lỗi fetch danh sách học sinh quá hạn:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Gọi lại API khi thay đổi trang, từ khóa, cơ sở hoặc số tháng quá hạn
    useEffect(() => {
        fetchOverdueStudents(pageInfo.pageNumber, pageInfo.pageSize);
    }, [pageInfo.pageNumber, selectedFacility, overdueMonths, searchQuery]);

    const handleFacilityChange = (e) => {
        setSelectedFacility(e.target.value);
        setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleMonthsChange = (e) => {
        setOverdueMonths(Number(e.target.value));
        setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">

            {/* Header đồng bộ phong cách PatientPage */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-amber-500 to-red-600 shadow-xs"></span>
                        Danh sách học sinh quá hạn tái khám
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Học sinh có lần khám gần nhất từ {overdueMonths} tháng trở lên chưa ghi nhận tái khám mới (Tổng số: {pageInfo.totalElements})
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        Cần tái khám: {pageInfo.totalElements}
                    </span>
                </div>
            </div>

            {/* Toolbar: SearchBar (từ Shared) & Dropdown Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full mb-6">
                <div className="w-full md:w-80">
                    <SearchBar
                        searchQuery={searchQuery}
                        setSearchQuery={(val) => {
                            setSearchQuery(val);
                            setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
                        }}
                        placeholder="Tìm theo Tên học sinh..."
                    />
                </div>

                <div className="flex flex-row gap-3 w-full md:w-auto flex-shrink-0">
                    {/* Lọc theo trường học */}
                    <select
                        value={selectedFacility}
                        onChange={handleFacilityChange}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-800 px-4 py-2.5 rounded-xl shadow-xs outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[170px]"
                    >
                        <option value="">Tất cả trường học</option>
                        {facilities.map((fac, idx) => (
                            <option key={fac.id || fac.facilityId || idx} value={fac.id || fac.facilityId}>
                                {fac.facilityName || fac.name}
                            </option>
                        ))}
                    </select>

                    {/* Lọc theo mốc thời gian quá hạn */}
                    <select
                        value={overdueMonths}
                        onChange={handleMonthsChange}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-800 px-4 py-2.5 rounded-xl shadow-xs outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[160px]"
                    >
                        <option value={6}>Quá hạn từ 6 tháng</option>
                        <option value={9}>Quá hạn từ 9 tháng</option>
                        <option value={12}>Quá hạn từ 1 năm (12 tháng)</option>
                    </select>
                </div>
            </div>

            {/* Khối Bảng dữ liệu chính */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <OverduePatientTable
                    students={students}
                    loading={loading}
                    pageInfo={pageInfo}
                    formatDate={formatDate}
                    onDetail={(s) => navigate(`/patients/detail/${s.patientId}`)}
                    onNewExam={(s) => navigate(`/eye-exam-records/create`)}
                />

                {/* Phân trang (Pagination từ shared) */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-l from-gray-50/50 to-gray-100/80 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600">
                        Trang <span className="text-blue-700 font-bold">{pageInfo.pageNumber + 1}</span> / {pageInfo.totalPages || 1}
                    </span>
                    <Pagination
                        currentPage={pageInfo.pageNumber}
                        totalPages={pageInfo.totalPages}
                        onPageChange={(targetPage) => setPageInfo(prev => ({ ...prev, pageNumber: targetPage }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default OverdueReExamPage;