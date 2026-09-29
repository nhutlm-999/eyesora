import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from "../../../shared/components/SearchBar.jsx";
import PatientTable from "../components/PatientTable.jsx";
import ConfirmModal from "../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../shared/components/Pagination.jsx";
import axiosClient from "../../../shared/axios/axiosClient.js";
import {useAuthStore} from "../../auth/store/authStore.js";

const PatientPage = () => {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [pageInfo, setPageInfo] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 1 });

    // State quản lý bộ lọc
    const [selectedFacility, setSelectedFacility] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    // State lưu danh sách options cho Select
    const [facilities, setFacilities] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const {user} = useAuthStore();
    const isFacilityAdmin = user?.roles?.includes("ROLE_FACILITY_ADMIN");

    // 1. Fetch danh sách trường học và chiến dịch ban đầu (chỉ chạy 1 lần khi mount)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                // Thay đổi URL chính xác theo API Backend của bạn nhé
                const [facRes, camRes] = await Promise.all([
                    axiosClient.get('/master-data/facilities?page=0&size=999'),
                    axiosClient.get('/campaigns?page=0&size=999')
                ]);
                setFacilities(facRes.data.content || []);
                setCampaigns(camRes.data.content || []);
            } catch (error) {
                console.error("Lỗi khi fetch danh sách bộ lọc:", error);
            }
        };
        fetchFilterOptions();
    }, []);

    // 2. Hàm fetch danh sách bệnh nhân kèm theo các tham số bộ lọc
    const fetchPatients = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            // Xây dựng query string động dựa trên các bộ lọc đã chọn
            let url = `/patients?page=${page}&size=${size}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (selectedFacility) url += `&facilityId=${selectedFacility}`;
            if (selectedCampaign) url += `&campaignId=${selectedCampaign}`;

            const res = await axiosClient.get(url);
            const data = res.data;

            setPatients(data.content || []);
            setPageInfo({
                pageNumber: data.pageable?.pageNumber || 0,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 1,
                pageSize: size
            });
        } catch (error) {
            console.error("Lỗi fetch dữ liệu bệnh nhân:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Mỗi khi thay đổi trang, từ khóa tìm kiếm, trường học hoặc chiến dịch -> Gọi lại API
    useEffect(() => {
        fetchPatients(pageInfo.pageNumber, pageInfo.pageSize);
    }, [pageInfo.pageNumber, selectedFacility, selectedCampaign, searchQuery]);

    // Trình lắng nghe reset về trang đầu tiên nếu người dùng đổi bộ lọc mới
    const handleFacilityChange = (e) => {
        setSelectedFacility(e.target.value);
        setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleCampaignChange = (e) => {
        setSelectedCampaign(e.target.value);
        setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleDelete = async () => {
        if (!selectedPatient) return;
        setDeleteError(null);
        try {
            // Đồng bộ sử dụng axiosClient thay vì fetch thô nếu có base Auth config
            const res = await axiosClient.delete(`/patients/${selectedPatient.patientId}`);

            if (res.status === 200 || res.status === 204) {
                setIsDeleteModalOpen(false);
                fetchPatients(pageInfo.pageNumber, pageInfo.pageSize);
            }
        } catch (error) {
            setDeleteError(error.response?.data?.message || "Không thể kết nối tới máy chủ.");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        return dateStr;
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">

            {/* Header */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        Hồ sơ Học sinh / Bệnh nhân
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Tổng số: {pageInfo.totalElements} học sinh</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/patients/create')}
                        className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95 flex-shrink-0"
                    >
                        + Thêm bệnh nhân
                    </button>
                </div>
            </div>

            {/* Toolbar: Search & Select Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full mb-6">
                <div className="w-full md:w-80">
                    <SearchBar searchQuery={searchQuery} setSearchQuery={(val) => {
                        setSearchQuery(val);
                        setPageInfo(prev => ({ ...prev, pageNumber: 0 }));
                    }} />
                </div>

                {/* Bộ đôi select tích hợp gọn gàng bên phải */}
                {isFacilityAdmin ? '' : <div className="flex flex-row gap-3 w-full md:w-auto flex-shrink-0">
                    <select
                        value={selectedFacility}
                        onChange={handleFacilityChange}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-800 px-4 py-2.5 rounded-xl shadow-xs outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[160px] max-w-[200px]"
                    >
                        <option value="">Tất cả trường học</option>
                        {facilities?.map((fac, index) => (
                            <option key={fac.id || fac.facilityId || index} value={fac.id || fac.facilityId}>
                                {fac.facilityName || fac.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedCampaign}
                        onChange={handleCampaignChange}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-800 px-4 py-2.5 rounded-xl shadow-xs outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[160px] max-w-[200px]"
                    >
                        <option value="">Tất cả chiến dịch</option>
                        {campaigns.map((cam, index) => (
                            <option key={cam.campaignId || cam.id || index} value={cam.campaignId || cam.id}>
                                {cam.campaignTitle || cam.name}
                            </option>
                        ))}
                    </select>
                </div>}
            </div>

            {/* Bảng dữ liệu chính */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <PatientTable
                    patients={patients}
                    loading={loading}
                    pageInfo={pageInfo}
                    formatDate={formatDate}
                    onEdit={(p) => navigate(`/patients/edit/${p.patientId}`)}
                    onDetail={(p) => navigate(`/patients/detail/${p.patientId}`)}
                    onDelete={(p) => { setSelectedPatient(p); setIsDeleteModalOpen(true); }}
                />

                {/* Phân trang */}
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

            {/* Modal xác nhận xóa */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteError(null);
                }}
                onConfirm={handleDelete}
                error={deleteError}
                title="Xác nhận xóa"
                message={`Bạn có chắc chắn muốn xóa bệnh nhân ${selectedPatient?.patientName || selectedPatient?.name}? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

export default PatientPage;