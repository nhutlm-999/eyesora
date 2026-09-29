import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../shared/axios/axiosClient.js";
import ClassTable from "../components/ClassTable.jsx";
import ClassDetailModal from "../components/ClassDetailModal.jsx";
import ConfirmModal from "../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../shared/components/Pagination.jsx";

const ClassesPage = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async (page = 0) => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/master-data/classes?page=${page}&size=10`);
            setClasses(res.data.content || []);
            setPageData({
                page: res.data.number ?? 0,
                totalPages: res.data.totalPages ?? 0,
                totalElements: res.data.totalElements ?? 0
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openDetailModal = async (cls, page = 0) => {
        try {
            const res = await axiosClient.get(`/master-data/classes/${cls.id}/patients?page=${page}&size=10`);
            setDetailData({
                ...res.data,
                patients: res.data.patients?.content || [],
                classInfo: cls,
                number: res.data.patients?.number || 0,
                totalPages: res.data.patients?.totalPages || 0
            });
            setIsDetailOpen(true);
        } catch (error) { alert("Error loading details!"); }
    };

    const handleDelete = async () => {
        if (!selectedClass) return;
        setDeleteError(null);
        try {
            // Kiểm tra lại đường dẫn: nếu axiosClient đã có baseURL chứa /api thì dùng path dưới,
            // nếu chưa có thì phải thêm /api vào trước
            await axiosClient.delete(`/master-data/classes/${selectedClass.id}`);

            setIsDeleteOpen(false);
            fetchClasses(pageData.page);
        } catch (error) {
            const errData = error.response?.data;

            // Logic lấy thông báo: Ưu tiên lấy thuộc tính message, nếu không thì lấy trực tiếp chuỗi trả về
            const errorMessage = (errData && typeof errData === 'object')
                ? (errData.message || JSON.stringify(errData))
                : (errData || "Không thể xóa lớp học này!");

            setDeleteError(errorMessage);
        }
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        Quản lý lớp học
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Tổng số: {pageData.totalElements} lớp</p>
                </div>
                <button
                    onClick={() => navigate('/classes/create')}
                    className="bg-gradient-to-l from-blue-500 to-[#004194] text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:from-blue-600 hover:to-blue-900 transition-all cursor-pointer shadow-sm flex items-center gap-2 active:scale-95"
                >
                    + Thêm lớp học
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <ClassTable
                    classes={classes}
                    loading={loading}
                    page={pageData.page}
                    onOpenDetail={openDetailModal}
                    onEdit={(cls) => navigate(`/classes/edit/${cls.id}`)}
                    onDelete={(cls) => { setSelectedClass(cls); setIsDeleteOpen(true); }}
                />
                <div className="px-6 py-4 bg-gradient-to-l from-gray-50/50 to-gray-100/80 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Trang <span className="text-blue-700 font-bold">{pageData.page + 1}</span> / {pageData.totalPages || 1}</span>
                    <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={fetchClasses} />
                </div>
            </div>

            {isDetailOpen && detailData && (
                <ClassDetailModal
                    onClose={() => setIsDetailOpen(false)}
                    data={detailData}
                    onPageChange={(p) => openDetailModal(detailData.classInfo, p)}
                />
            )}

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => { setIsDeleteOpen(false); setDeleteError(null); }}
                onConfirm={handleDelete}
                error={deleteError}
                title="Xác nhận xóa lớp học"
                message={`Bạn có chắc chắn muốn xóa lớp ${selectedClass?.className}? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};
export default ClassesPage;