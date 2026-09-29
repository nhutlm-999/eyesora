import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../shared/axios/axiosClient.js";

import SearchExamRecords from "../../../shared/components/SearchExamRecords.jsx";
import ExamRecordAction from "../components/ExamRecordAction.jsx";

import ExamRecordTable from '../components/ExamRecordTable.jsx';
import ExamRecordDetailModal from '../components/ExamRecordDetailModal.jsx';
import ConfirmModal from "../../../shared/components/ConfirmModal.jsx";
import {useAuthStore} from "../../auth/store/authStore.js";

const ExamRecordPage = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuthStore();

    const [searchQuery, setSearchQuery] = useState(
        () => sessionStorage.getItem('exam_searchQuery') || ''
    );
    const [selectedFacility, setSelectedFacility] = useState(
        () => sessionStorage.getItem('exam_selectedFacility') || ''
    );
    const [selectedCampaign, setSelectedCampaign] = useState(
        () => sessionStorage.getItem('exam_selectedCampaign') || ''
    );

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    const [facilities, setFacilities] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const isFacilityAdmin = user?.roles?.includes("ROLE_FACILITY_ADMIN");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        sessionStorage.setItem('exam_searchQuery', searchQuery);
        sessionStorage.setItem('exam_selectedFacility', selectedFacility);
        sessionStorage.setItem('exam_selectedCampaign', selectedCampaign);
    }, [searchQuery, selectedFacility, selectedCampaign]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [facilityRes, campaignRes] = await Promise.all([
                    axiosClient.get('/master-data/facilities', { params: { size: 1000 } }).catch(() => ({ data: {} })),
                    axiosClient.get('/campaigns', { params: { size: 1000 } }).catch(() => ({ data: {} }))
                ]);

                setFacilities(facilityRes.data?.content || facilityRes.data || []);
                setCampaigns(campaignRes.data?.content || campaignRes.data || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bộ lọc:", error);
            }
        };
        fetchFilterOptions();
    }, []);

    const fetchData = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/eye-exam-records`, {
                params: {
                    page: page,
                    size: 10,
                    keyword: debouncedSearchQuery || null,
                    facilityId: selectedFacility || null,
                    campaignId: selectedCampaign || null
                }
            });

            const data = res.data;
            const dataArray = data && data.content ? data.content : [];

            setRecords(dataArray);
            setPageData({
                page: data.number !== undefined ? data.number : page,
                totalPages: data.totalPages || 1,
                totalElements: data.totalElements || 0
            });
        } catch (error) {
            console.error("Lỗi khi truy xuất hồ sơ khám mắt:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchQuery, selectedFacility, selectedCampaign]);

    useEffect(() => {
        setPageData(prev => ({ ...prev, page: 0 }));
        fetchData(0);
    }, [debouncedSearchQuery, selectedFacility, selectedCampaign, fetchData]);

    const handlePageChange = (targetPage) => {
        setPageData(prev => ({ ...prev, page: targetPage }));
        fetchData(targetPage);
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

    const openUpdatePage = (record) => {
        navigate(`/eye-exam-records/edit/${record.examId}`);
    };

    const triggerDeleteModal = (record) => {
        setRecordToDelete(record);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!recordToDelete) return;
        try {
            await axiosClient.delete(`/eye-exam-records/${recordToDelete.examId}`);
            setIsDeleteOpen(false);
            setRecordToDelete(null);

            const isLastItemOnPage = records.length === 1 && pageData.page > 0;
            const targetPage = isLastItemOnPage ? pageData.page - 1 : pageData.page;

            handlePageChange(targetPage);
        } catch (error) {
            alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa hồ sơ.");
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteOpen(false);
        setRecordToDelete(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        try {
            const date = new Date(dateStr);
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        } catch (e) { return '---'; }
    };

    const formatVA = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const num = parseFloat(value);
        if (isNaN(num)) return "-";
        return num >= 1 ? `${Math.round(num)}/10` : `${Math.round(num * 10)}/10`;
    };

    const formatDiopter = (value) => {
        if (value === null || value === undefined || value === "") return "0.00";
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return "0.00";
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    };

    const formatAxis = (value) => (value === null || value === undefined || value === "") ? "0°" : `${value}°`;

    return (
        <div className="p-6 h-full overflow-y-auto bg-[#f5f7fa] text-gray-950 scrollbar-thin font-sans">

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">
                            Quản lý hồ sơ khám mắt
                        </h2>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mt-1">
                        Tổng số: <span className="text-[#004194] font-bold">{pageData.totalElements}</span> bản ghi
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <ExamRecordAction
                        onAddClick={() => navigate('/eye-exam-records/create')}
                        onBulkClick={() => navigate('/eye-exam-records/import')}
                    />
                </div>
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-3 items-center w-full">
                <div className="flex-1 w-full">
                    <SearchExamRecords
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        placeholder="Tìm kiếm theo tên học sinh, lớp..."
                    />
                </div>

                {isFacilityAdmin ? '' : <div className="flex flex-row gap-3 w-full md:w-auto flex-shrink-0">
                    <select
                        value={selectedFacility}
                        onChange={(e) => setSelectedFacility(e.target.value)}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-900 px-4 py-2.5 rounded-xl shadow-xs outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[160px] max-w-[200px]"
                    >
                        <option value="">Tất cả trường học</option>
                        {facilities.map((fac, index) => (
                            <option key={fac.id || fac.facilityId || index} value={fac.id || fac.facilityId}>
                                {fac.facilityName || fac.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="bg-white border border-gray-300 text-xs font-semibold text-gray-900 px-4 py-2.5 rounded-xl shadow-xs outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#004194] transition-all cursor-pointer min-w-[160px] max-w-[200px]"
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

            <ExamRecordTable
                records={records}
                loading={loading}
                pageData={pageData}
                fetchData={handlePageChange}
                openDetail={openDetail}
                openUpdateModal={openUpdatePage}
                triggerDeleteModal={triggerDeleteModal}
                formatDate={formatDate}
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

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa hồ sơ"
                message={
                    <>
                        Bạn có chắc chắn muốn xóa hồ sơ khám mắt của{" "}
                        <strong className="font-bold text-gray-900">
                            {recordToDelete?.patientName || "N/A"}
                        </strong>
                        ?
                    </>
                }
            />
        </div>
    );
};

export default ExamRecordPage;