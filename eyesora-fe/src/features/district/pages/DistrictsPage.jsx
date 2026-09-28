import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../../shared/axios/axiosClient.js";
import { MapPin, SquarePen } from "lucide-react";
import AddressActions from "../../../shared/components/AddressActions.jsx";
import Pagination from "../../../shared/components/Pagination.jsx";

const DistrictsPage = () => {
    const navigate = useNavigate();
    const [districts, setDistricts] = useState([]);
    const [pageData, setPageData] = useState({ page: 0, totalPages: 0, totalElements: 0 });

    const fetchDistricts = async (page = 0) => {
        try {
            const res = await axiosClient.get(`/master-data/districts?page=${page}&size=10`);
            const data = res.data;

            setDistricts(data.content || []);
            setPageData({
                page: data.number ?? 0,
                totalPages: data.totalPages ?? 0,
                totalElements: data.totalElements ?? 0
            });
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    useEffect(() => { fetchDistricts(); }, []);

    return (
        <div className="p-6 bg-[#f5f7fa] h-full overflow-y-auto scrollbar-thin text-gray-950">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                        <MapPin className="text-[#004194]" size={20}/> Quản lý Quận/Huyện
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">Tổng số: {pageData.totalElements} quận/huyện</p>
                </div>
                <AddressActions onAdd={() => navigate('/districts/create')} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                        <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-4.5 py-4 text-center w-12">STT</th>
                            <th className="px-6 py-4">Tên Quận/Huyện</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {districts.map((d, index) => (
                            <tr key={d.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                <td className="px-4.5 py-4 text-center text-xs font-semibold text-gray-500">{(pageData.page * 10) + index + 1}</td>
                                <td className="px-6 py-4 font-bold text-gray-900 text-sm">{d.districtName}</td>
                                <td className="px-6 py-4 text-center align-middle">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/districts/edit/${d.id}`)}
                                        className="inline-flex p-2 bg-gradient-to-l from-white to-gray-50 border border-gray-200 text-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
                                        title="Chỉnh sửa"
                                    >
                                        <SquarePen size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-l from-gray-50/50 to-gray-100/80 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600">Trang <span className="text-blue-700 font-bold">{pageData.page + 1}</span> / {pageData.totalPages || 1}</span>
                    <Pagination currentPage={pageData.page} totalPages={pageData.totalPages} onPageChange={fetchDistricts} />
                </div>
            </div>
        </div>
    );
};
export default DistrictsPage;