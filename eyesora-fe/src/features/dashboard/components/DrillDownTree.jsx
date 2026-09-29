import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Activity, User, Home, Book } from 'lucide-react';
import axiosClient from "../../../shared/axios/axiosClient.js";

const DrillDownTree = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await axiosClient.get('/dashboard/drilldown');
                setSchools(res.data || []);
            } catch (error) {
                console.error("Lỗi tải dữ liệu drilldown", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, []);

    const toggleNode = (nodeList, id, type) => {
        return nodeList.map(node => {
            if (node.id === id && node.type === type) {
                return { ...node, isOpen: !node.isOpen };
            }
            if (node.children) {
                return { ...node, children: toggleNode(node.children, id, type) };
            }
            return node;
        });
    };

    const handleToggle = (id, type) => {
        setSchools(toggleNode(schools, id, type));
    };

    const renderTree = (nodes) => {
        return (
            <ul className="pl-4 border-l border-gray-200 ml-2 mt-2 space-y-2">
                {nodes.map((node) => (
                    <li key={`${node.type}-${node.id}`}>
                        <div 
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${node.type === 'STUDENT' ? 'ml-4' : ''}`}
                            onClick={() => node.children && handleToggle(node.id, node.type)}
                        >
                            {node.children && (
                                node.isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            {!node.children && <div className="w-4" />}
                            
                            {node.type === 'SCHOOL' && <Home className="w-4 h-4 text-blue-600" />}
                            {node.type === 'CLASS' && <Book className="w-4 h-4 text-green-600" />}
                            {node.type === 'STUDENT' && <User className="w-4 h-4 text-purple-600" />}

                            <span className="text-sm font-medium text-gray-700">{node.name}</span>
                            
                            {node.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${node.status === 'Khám xong' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {node.status}
                                </span>
                            )}
                        </div>
                        {node.isOpen && node.children && renderTree(node.children)}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return <div className="p-4 text-sm text-gray-500 text-center">Đang tải dữ liệu...</div>;
    }

    if (!schools.length) {
        return <div className="p-4 text-sm text-gray-500 text-center italic">Không có dữ liệu Drill-down</div>;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-gray-700" />
                <h3 className="text-base font-bold text-gray-900">Drill-down Trạng thái khám</h3>
            </div>
            <div className="overflow-auto max-h-96">
                {renderTree(schools)}
            </div>
        </div>
    );
};

export default DrillDownTree;
