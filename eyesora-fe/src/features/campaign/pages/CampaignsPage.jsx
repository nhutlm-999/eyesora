import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../shared/axios/axiosClient.js";
import CampaignActions from "../components/CampaignActions.jsx";
import CampaignTable from "../components/CampaignTable.jsx";
import DetailModal from "../components/DetailModal.jsx";
import ConfirmModal from "../../../shared/components/ConfirmModal.jsx";
import Pagination from "../../../shared/components/Pagination.jsx";

const CampaignsPage = () => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 0, totalElements: 0 });
    const [modals, setModals] = useState({ detail: false, confirm: false });
    const [selected, setSelected] = useState(null);
    const [pending, setPending] = useState(null);

    useEffect(() => { fetchCampaigns(0); }, []);

    const fetchCampaigns = async (page = 0) => {
        try {

            const res = await axiosClient.get(`/campaigns?page=${page}&size=10`);
            setCampaigns(res.data.content || []);
            setPageData({
                page: res.data.number ?? 0,
                totalPages: res.data.totalPages ?? 0,
                totalElements: res.data.totalElements ?? 0
            });
        } catch (error) {
            console.error("Lỗi tải chiến dịch:", error);
        }
    };

    const handleAction = async () => {
        if (!pending) return;
        try {
            if (pending.type === 'delete') await axiosClient.delete(`/campaigns/${pending.id}`);
            else await axiosClient.patch(`/campaigns/${pending.id}/status/${pending.newStatus}`);

            setModals({ ...modals, confirm: false });
            fetchCampaigns(pageData.page);
        } catch (error) {
            alert("Thao tác thất bại!");
        }
    };

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-l from-blue-500 to-[#004194] shadow-xs"></span>
                        Chiến dịch khám
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Tổng số: {pageData.totalElements} chiến dịch</p>
                </div>
                <CampaignActions onAdd={() => navigate('/campaigns/create')} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <CampaignTable
                    campaigns={campaigns}
                    page={pageData.page}
                    onOpenDetail={(c) => { setSelected(c); setModals({ ...modals, detail: true }); }}
                    onToggleStatus={(c) => {
                        setPending({type:'status', id: c.campaignId, newStatus: c.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED'});
                        setModals({ ...modals, confirm: true });
                    }}
                    onDelete={(id) => { setPending({type:'delete', id}); setModals({ ...modals, confirm: true }); }}
                    onEdit={(id) => navigate(`/campaigns/edit/${id}`)}
                />

                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-l from-gray-50/50 to-gray-100/80 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600">Trang <span className="text-blue-700 font-bold">{pageData.page + 1}</span> / {pageData.totalPages || 1}</span>
                    <Pagination
                        currentPage={pageData.page}
                        totalPages={pageData.totalPages}
                        onPageChange={fetchCampaigns}
                    />
                </div>
            </div>
            {modals.detail && <DetailModal campaign={selected} onClose={() => setModals({ ...modals, detail: false })} />}
            {modals.confirm && (
                <ConfirmModal
                    isOpen={modals.confirm}
                    title="Xác nhận thao tác"
                    message={pending?.type === 'delete' ? "Bạn có chắc chắn muốn xóa chiến dịch này?" : "Bạn có chắc chắn muốn thay đổi trạng thái chiến dịch?"}
                    onConfirm={handleAction}
                    onClose={() => setModals({ ...modals, confirm: false })}
                />
            )}
        </div>
    );
};

export default CampaignsPage;